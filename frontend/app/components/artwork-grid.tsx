"use client";

import { ComponentProps, ReactNode, useState, useEffect } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import { Download, Loader } from "lucide-react";
import { artworkApi } from "@/api/artwork";
import { MasonryInfiniteGrid } from "@egjs/react-infinitegrid";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useInView } from "react-intersection-observer";
import ArtworkGridTile from "./artwork-grid-tile";
import { useTranslations } from "next-intl";

interface ArtworkGridProps {
  username?: string;
  isLiked?: boolean;
  commentGenerate?: boolean;
}

export function ArtworkGrid({
  username,
  isLiked,
  commentGenerate,
}: ArtworkGridProps) {
  const [artworks, setArtworks] = useState<ArtworkResponse[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const t = useTranslations();

  const { ref, inView } = useInView({
    threshold: 0,
  });

  useEffect(() => {
    if (inView) {
      fetchArtworks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  const fetchArtworks = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const response = await artworkApi.getArtworks({
        page,
        pageSize: 20,
        username,
        isLiked,
        commentGenerate,
      });
      if (response.data === null) {
        setHasMore(false);
        return;
      }
      setArtworks((prev) => [
        ...prev,
        ...response.data.filter(
          (artwork) =>
            !prev.some((prevArtwork) => prevArtwork.id === artwork.id)
        ),
      ]);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error("Error fetching artworks:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <MasonryInfiniteGrid
        className="w-full"
        align={"center"}
        autoResize={true}
      >
        {artworks.map((artwork, index) => (
          <ArtworkGridTile key={artwork.id} artwork={artwork} index={index} />
        ))}
      </MasonryInfiniteGrid>

      <div className="h-12" ref={ref}>
        {loading && (
          <div className="flex justify-center py-4">
            <Loader className="animate-spin" />
          </div>
        )}
        {!hasMore && !loading && (
          <div className="flex justify-center py-4">
            <p className="text-gray-500">{t("Common.no-more")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
