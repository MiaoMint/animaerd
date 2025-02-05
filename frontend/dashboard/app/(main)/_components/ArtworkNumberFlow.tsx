"use client";

import { dashboardApi } from "@/api/dashboard";
import { Card, CardContent } from "@/components/ui/card";
import NumberFlow from "@number-flow/react";
import { useQuery } from "@tanstack/react-query";

export default function ArtworkNumberFlow() {
  const { data: totalArtworks = 0 } = useQuery({
    queryKey: ["dashboard", "total-artworks"],
    queryFn: async () => {
      const response = await dashboardApi.getArtworks();
      return response.data;
    },
  });

  return (
    <Card className="h-full shadow-none">
      <CardContent className="flex flex-col justify-center h-full gap-2">
        <h3 className="text-lg font-medium text-muted-foreground">
          Total Artworks
        </h3>
        <NumberFlow
          value={totalArtworks}
          locales="en-US"
          className="text-4xl font-bold"
        />
      </CardContent>
    </Card>
  );
}
