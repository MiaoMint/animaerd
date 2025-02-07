/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { artworkApi } from "@/api/artwork";
import ArtworkGridTile from "@/components/artwork-grid-tile";
import { MasonryInfiniteGrid } from "@egjs/react-infinitegrid";
import { atom, useAtom } from "jotai";
import { Loader } from "lucide-react";
import { MotionConfig } from "motion/react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";

const homeArtworksAtom = atom<ArtworkResponse[]>([]);
const homePageAtom = atom(1);
const homeScrollOffsetAtom = atom(0);

export default function HomePage() {
  const [artworks, setArtworks] = useAtom(homeArtworksAtom);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [scrollOffset, setScrollOffset] = useAtom(homeScrollOffsetAtom);
  const pathname = usePathname();
  const t = useTranslations();

  const { ref, inView } = useInView({
    threshold: 0,
  });

  const fetchArtworks = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const response = await artworkApi.getRecommendArtworks({
        exclude: artworks.map((artwork) => artwork.id).join(","),
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
    } catch (error) {
      console.error("Error fetching artworks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (inView) {
      fetchArtworks();
    }
  }, [inView]);

  useEffect(() => {
    if (pathname === "/") {
      setTimeout(() => {
        window.scrollTo({
          top: scrollOffset,
          behavior: "instant",
        });
      }, 1);
    }
  }, [pathname]);

  // 监听滚动事件
  useEffect(() => {
    const handleScroll = () => {
      setScrollOffset(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [setScrollOffset]);

  return (
    <div className="px-2 md:px-4">
      <MasonryInfiniteGrid
        className="w-full"
        align={"center"}
        autoResize={true}
      >
        {artworks.map((artwork, index) => (
          <MotionConfig key={artwork.id}>
            <ArtworkGridTile artwork={artwork} index={index} />
          </MotionConfig>
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
