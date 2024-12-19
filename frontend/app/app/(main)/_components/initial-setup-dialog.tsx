"use client";

import { userApi } from "@/api/user";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { motion } from "motion/react";

const usernameSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, - and _"),
});

export function InitialSetupDialog() {
  const [open, setOpen] = useState(false);
  const { user, refetchUser } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<'intro' | 'username'>('intro');

  const form = useForm<z.infer<typeof usernameSchema>>({
    resolver: zodResolver(usernameSchema),
    defaultValues: {
      username: "",
    },
  });

  // Check if username needs to be set
  useEffect(() => {
    if (user && !user.username) {
      setOpen(true);
    }
  }, [user]);

  // Prevent closing if username is not set
  const handleOpenChange = (isOpen: boolean) => {
    if (user && !user.username) {
      return; // Prevent closing
    }
    setOpen(isOpen);
  };

  async function onSubmit(data: z.infer<typeof usernameSchema>) {
    try {
      const response = await userApi.updateUser({
        username: data.username,
      });
      
      if (response.code === 200) {
        toast({
          title: "Username set successfully",
          description: "Welcome to Animaerd!",
        });
        await refetchUser();
        setOpen(false);
      } else {
        throw new Error(response.message || "Failed to set username");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to set username",
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        {step === 'intro' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <DialogHeader>
              <DialogTitle className="text-2xl text-center">Welcome to Animaerd!</DialogTitle>
              <DialogDescription className="text-center">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Your creative space for AI art generation
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="mt-4"
                >
                  Create unique artworks, share your creations, and connect with fellow AI artists!
                </motion.div>
              </DialogDescription>
            </DialogHeader>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="mt-6"
            >
              <Button 
                onClick={() => setStep('username')} 
                className="w-full"
              >
                Get Started
              </Button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <DialogHeader>
              <DialogTitle>Create Your Identity</DialogTitle>
              <DialogDescription>
                Please set your username to continue. This will be your unique identifier on the platform.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your username" {...field} />
                      </FormControl>
                      <FormDescription>
                        This will be your public username. You can change it later.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Set Username
                </Button>
              </form>
            </Form>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
} 