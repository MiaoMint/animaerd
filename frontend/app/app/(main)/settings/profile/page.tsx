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
import { useTranslations } from "next-intl";

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
  const t = useTranslations("Settings.profile");

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
      <h2 className="text-2xl font-semibold mb-6">{t("title")}</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name={"username"}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.username.label")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("fields.username.placeholder")}
                    {...field}
                  />
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
                <FormLabel>{t("fields.displayName.label")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("fields.displayName.placeholder")}
                    {...field}
                  />
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
                <FormLabel>{t("fields.avatar.label")}</FormLabel>
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
                <FormDescription>
                  {t("fields.avatar.description")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.bio.label")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("fields.bio.placeholder")}
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>{t("fields.bio.description")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">{t("submit")}</Button>
        </form>
      </Form>
    </div>
  );
}
