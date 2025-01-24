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
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { userApi } from "@/api/user";
import { useAuth } from "@/hooks/use-auth";
import { useTranslations } from "next-intl";

const visibilityFormSchema = z.object({
  isLikesPublic: z.boolean(),
});

type VisibilityFormValues = z.infer<typeof visibilityFormSchema>;

export default function SettingsProfileVisibilityPage() {
  const { toast } = useToast();
  const { user, refetchUser } = useAuth();
  const t = useTranslations("Settings.visibility");

  const form = useForm<VisibilityFormValues>({
    resolver: zodResolver(visibilityFormSchema),
    defaultValues: {
      isLikesPublic: true,
    },
  });

  useEffect(() => {
    form.reset({
      isLikesPublic: user?.is_likes_public,
    });
  }, [form, user]);

  async function onSubmit(data: VisibilityFormValues) {
    try {
      const updateVisibility = await userApi.updateUser({
        is_likes_public: data.isLikesPublic,
      });
      if (updateVisibility.code !== 200)
        throw new Error("Failed to update visibility settings");
      toast({
        title: "Visibility settings updated",
        description: "Your visibility settings have been successfully updated.",
      });
      refetchUser();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update visibility settings. Please try again.",
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
            name="isLikesPublic"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    {t("fields.like.label")}
                  </FormLabel>
                  <FormDescription>
                    {t("fields.like.description")}
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <Button type="submit">{t("submit")}</Button>
        </form>
      </Form>
    </div>
  );
}
