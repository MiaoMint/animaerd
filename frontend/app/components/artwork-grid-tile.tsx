"use client";
import { Download } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import Image from "next/image";
import { useEffect, useState } from "react";

const calculateTileHeight = (
  artworkWidth: number,
  artworkHeight: number,
  windowWidth: number
): number => {
  const breakpoints = {
    "2xl": { width: 1536, fraction: 6 },
    xl: { width: 1280, fraction: 5 },
    lg: { width: 1024, fraction: 4 },
    md: { width: 768, fraction: 3 },
    sm: { width: 0, fraction: 2 },
  };

  const { fraction } =
    Object.values(breakpoints).find(
      (breakpoint) => windowWidth > breakpoint.width
    ) || breakpoints.sm;

  const adjustedWidth = artworkWidth - windowWidth / fraction;
  const height = Math.max(200, Math.min(500, artworkHeight - adjustedWidth));

  return height;
};

export default function ArtworkGridTile({
  artwork,
  onAnimationComplete,
}: {
  artwork: ArtworkResponse;
  index?: number;
  onAnimationComplete?: () => void;
}) {
  const router = useRouter();
  const [height, setHeight] = useState(() =>
    calculateTileHeight(artwork.width, artwork.height, window.innerWidth)
  );

  useEffect(() => {
    const handleResize = () => {
      setHeight(
        calculateTileHeight(artwork.width, artwork.height, window.innerWidth)
      );
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [artwork.width, artwork.height]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      className="w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 2xl:w-1/6 p-2 relative group cursor-pointer"
      style={{ height }}
      onAnimationComplete={onAnimationComplete}
      onClick={() => router.push(`/artwork/${artwork.id}`)}
    >
      <Image
        className="size-full object-cover rounded-lg"
        style={{ backgroundColor: `#${artwork.primary_color}` }}
        src={artwork.url}
        alt={artwork.title}
        loading="lazy"
        width={600}
        height={400}
        quality={70}
      />

      <div className="absolute inset-2 rounded-lg bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 transition-opacity p-2">
        <Button size="icon">
          <Download className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
