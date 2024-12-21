"use client";
import { Download } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function ArtworkGridTile({
  artwork,
  onAnimationComplete,
}: {
  artwork: ArtworkResponse;
  index: number;
  onAnimationComplete?: () => void;
}) {
  const router = useRouter();
  const [height, setHeight] = useState(0);

  useEffect(() => {
    function getTileHeight(artworkHight: number) {
      const width = window.innerWidth;
      let w = 0;
      if (width > 1536) {
        w = artwork.width - width / 6;
      } else if (width > 1280) {
        w = artwork.width - width / 5;
      } else if (width > 1024) {
        w = artwork.width - width / 4;
      } else if (width > 768) {
        w = artwork.width - width / 3;
      } else {
        w = artwork.width - width / 2;
      }
      let h = artworkHight - w;
      if (h < 200) {
        h = 200;
      }

      if (h > 500) {
        h = 500;
      }

      return h;
    }
    setHeight(getTileHeight(artwork.height));
    // 监听屏幕resize事件
    const handleResize = () => {
      setHeight(getTileHeight(artwork.height));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [artwork, height]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      className="w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 2xl:w-1/6 p-2 relative group cursor-pointer"
      style={{ height: height }}
      onAnimationComplete={onAnimationComplete}
      onClick={() => router.push(`/artwork/${artwork.id}`)}
    >
      <Image
        className="size-full object-cover rounded-lg"
        style={{backgroundColor: `#${artwork.primary_color}`}}
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
