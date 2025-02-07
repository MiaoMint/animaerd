import { artworkApi } from "@/api/artwork";
import ArtworkGridTile from "@/components/artwork-grid-tile";
import { MasonryInfiniteGrid } from "@egjs/react-infinitegrid";
import { Loader } from "lucide-react";
import { MotionConfig } from "motion/react";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";

export function SearchArtworksGrid({ q }: { q: string }) {
  const [artworks, setArtworks] = useState<ArtworkResponse[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const t = useTranslations();

  const { ref, inView } = useInView({
    threshold: 0,
  });

  const fetchArtworks = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const query = q.replace(/tag\((.*?)\)/g, "").trim();
      const tagMatches = q.match(/tag\((.*?)\)/g);
      const tags = tagMatches?.map((match) => match.slice(4, -1)).join(",");

      // url 解码
      const decodedQuery = query ? decodeURIComponent(query) : undefined;
      const decodedTags = tags ? decodeURIComponent(tags) : undefined;

      const response = await artworkApi.searchArtworks({
        page,
        pageSize: 20,
        q: decodedQuery,
        tags: decodedTags,
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

  useEffect(() => {
    setArtworks([]);
    setPage(1);
    setHasMore(true);
    fetchArtworks();
  }, [q]);

  useEffect(() => {
    if (inView) {
      fetchArtworks();
    }
  }, [inView]);

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
