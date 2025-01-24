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
import { useTranslations } from "next-intl";

export function InitialSetupDialog() {
  const { user, refetchUser } = useAuth();
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const t = useTranslations("Auth.initialSetup");

  const usernameSchema = z.object({
    username: z
      .string()
      .min(3, t("username.validation.minLength"))
      .max(20, t("username.validation.maxLength"))
      .regex(/^[a-zA-Z0-9_-]+$/, t("username.validation.format")),
  });

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
          title: t("toast.success.title"),
          description: t("toast.success.description"),
        });
        await refetchUser();
        setOpen(false);
      } else {
        throw new Error(response.message || "Failed to set username");
      }
    } catch (error) {
      toast({
        title: t("toast.error.title"),
        description: error instanceof Error ? error.message : t("toast.error.description"),
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("username.label")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("username.placeholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>{t("username.description")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              {t("submit")}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 