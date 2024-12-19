"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useInView } from "react-intersection-observer";
import { artworkApi } from "@/api/artwork";
import { Loader } from "lucide-react";
import Image from "next/image";
import { MasonryInfiniteGrid } from "@egjs/react-infinitegrid";

export default function HomePage() {
  const [artworks, setArtworks] = useState<ArtworkResponse[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchArtworks = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await artworkApi.getArtworks(page, 20);
      if (response.data === null) {
        return;
      }
      setArtworks((prev) => [...prev, ...response.data]);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error("Error fetching artworks:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <MasonryInfiniteGrid
        className="w-full h-screen"
        onRequestAppend={fetchArtworks}
        align={"center"}
        useFit={true}
        autoResize={true}
      >
        {artworks.map((artwork, index) => (
          <motion.div
            key={artwork.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="w-1/6 h-auto p-1"
          >
            <Image
              className="w-full h-full object-cover rounded-lg"
              src={artwork.url}
              alt={artwork.title}
              loading="lazy"
              width={600}
              height={400}
              quality={70}
            />
          </motion.div>
        ))}
      </MasonryInfiniteGrid>

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center py-4">
          <Loader className="animate-spin" />
        </div>
      )}
    </div>
  );
}
