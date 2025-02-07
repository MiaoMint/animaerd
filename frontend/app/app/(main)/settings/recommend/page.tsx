"use client";

import { userApi } from "@/api/user";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

export default function SettingsRecommendPage() {
  const t = useTranslations("Settings.recommend");

  const { data: persona, isLoading } = useQuery({
    queryKey: ["user-persona"],
    queryFn: userApi.getUserPersona,
  });

  if (isLoading) {
    return (
      <div className="rounded-lg border p-8">
        <h2 className="text-2xl font-semibold mb-1">{t("title")}</h2>
        <h2 className="text-muted-foreground mb-6">{t("subtitle")}</h2>
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-8">
      <h2 className="text-2xl font-semibold mb-1">{t("title")}</h2>
      <h2 className="text-muted-foreground mb-6">{t("subtitle")}</h2>

      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            {!persona?.data.preferred_tags && (
              <div className="text-muted-foreground text-center">
                {t("persona.empty")}
              </div>
            )}
            {persona?.data.preferred_tags && (
              <>
                <h3 className="text-lg font-semibold mb-4">
                  {t("persona.title")}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {persona?.data.description}
                </p>

                <div className="space-y-2">
                  <h4 className="font-medium">{t("persona.tags")}</h4>
                  <div className="flex flex-wrap gap-2">
                    {persona?.data.preferred_tags?.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="text-sm text-muted-foreground">{t("description")}</div>
      </div>
    </div>
  );
}
