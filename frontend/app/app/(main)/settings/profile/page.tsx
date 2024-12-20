"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { userApi } from "@/api/user";
import { useAuth } from "@/hooks/use-auth";

const profileFormSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, - and _"
    ),
  displayName: z.string().min(2).max(30),
  avatar: z
    .unknown()
    .transform((value) => value as File)
    .optional(),
  bio: z.string().max(160).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function SettingsProfilePage() {
  const { toast } = useToast();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const { user, refetchUser } = useAuth();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: "",
      displayName: "",
      bio: "",
    },
  });

  useEffect(() => {
    form.reset({
      username: user?.username,
      displayName: user?.display_name,
      bio: user?.bio,
    });
    if (user?.avatar) {
      setAvatarPreview(user.avatar);
    }
  }, [form, user]);

  async function onSubmit(data: ProfileFormValues) {
    try {
      if (data.avatar) {
        const uploadAvatar = await userApi.uploadAvatar(data.avatar);
        if (uploadAvatar.code !== 200)
          throw new Error("Failed to upload avatar");
      }

      const updateProfile = await userApi.updateUser({
        username: user?.username === data.username ? undefined : data.username,
        display_name: data.displayName,
        bio: data.bio,
      });
      if (updateProfile.code !== 200)
        throw new Error("Failed to update profile");

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      refetchUser();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="rounded-lg border p-8">
      <h2 className="text-2xl font-semibold mb-6">Edit Profile</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your display name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="avatar"
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem>
                <FormLabel>Avatar</FormLabel>
                <FormControl>
                  <div className="flex flex-col gap-4">
                    {avatarPreview && (
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          onChange(file);
                          setAvatarPreview(URL.createObjectURL(file));
                        }
                      }}
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormDescription>Upload your avatar image</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us about yourself"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  You can write up to 160 characters about yourself
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Update profile</Button>
        </form>
      </Form>
    </div>
  );
}
