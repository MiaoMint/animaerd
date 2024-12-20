"use client";
import { Download } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import Image from "next/image";

export default function ArtworkGridTile({
  artwork,
  index,
  onAnimationComplete,
}: {
  artwork: ArtworkResponse;
  index: number;
  onAnimationComplete?: () => void;
}) {
  const router = useRouter();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      whileInView={{ opacity: 1, y: 0,scale: 1 }}
      className="w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 2xl:w-1/6 p-2 relative group cursor-pointer"
      onAnimationComplete={onAnimationComplete}
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
