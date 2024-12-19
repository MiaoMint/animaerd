"use client";

import { ComponentProps, ReactNode, useState } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import { Download, Loader } from "lucide-react";
import { artworkApi } from "@/api/artwork";
import { MasonryInfiniteGrid } from "@egjs/react-infinitegrid";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface ArtworkGridProps {
  username?: string;
}


export function ArtworkGrid({ username }: ArtworkGridProps) {
  const [artworks, setArtworks] = useState<ArtworkResponse[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchArtworks = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await artworkApi.getArtworks(page, 10, username);
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
        onRequestAppend={fetchArtworks}
        align={"center"}
        autoResize={true}
      >
        {artworks.map((artwork, index) => (
          <Item key={index} artwork={artwork} index={index} />
        ))}
      </MasonryInfiniteGrid>

      {hasMore && (
        <div className="flex justify-center py-4">
          <Loader className="animate-spin" />
        </div>
      )}
      {!hasMore && (
        <div className="flex justify-center py-4">
          <p className="text-gray-500">No more artworks to show</p>
        </div>
      )}
    </div>
  );
}

function Item({ artwork, index }: { artwork: ArtworkResponse; index: number }) {
  const router = useRouter();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 2xl:w-1/6 p-2 relative group cursor-pointer"
      onClick={() => router.push(`/artwork/${artwork.id}`)}
    >
      <Image
        className="w-full min-h-[200px] max-h-[600px] object-cover rounded-lg"
        src={artwork.url}
        alt={artwork.title}
        loading="lazy"
        width={600}
        height={400}
        quality={70}
      />

      <div className="absolute inset-2 rounded-lg bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 transition-opacity p-2">
        <Button size={"icon"}>
          <Download className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
