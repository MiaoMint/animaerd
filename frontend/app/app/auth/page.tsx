/* eslint-disable jsx-a11y/alt-text */
"use client";
import { artworkApi } from "@/api/artwork";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

export default function AuthPage() {
  const { handleLogin } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <Background />

      {/* Left info section */}
      <div className="flex-1" />

      {/* Right login section */}
      <motion.div
        className="lg:w-[500px] flex-shrink-0 flex flex-col items-center justify-center p-6 lg:p-0 bg-white/80 dark:bg-black/80 backdrop-blur-md backdrop:opacity-25"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 ,delay: 1}}
      >
        <motion.div
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div className="space-y-1 mb-8" variants={itemVariants}>
            <h2 className="text-2xl font-bold text-center">
              Welcome to Animaerd
            </h2>
            <p className="text-sm text-muted-foreground text-center">
              Sign in to start your AI art journey
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Button
              className="w-full flex items-center justify-center gap-2 h-11 lg:h-12 text-base"
              onClick={() => handleLogin("microsoft")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth={0}
                viewBox="0 0 448 512"
              >
                <path
                  stroke="none"
                  d="M0 32h214.6v214.6H0V32zm233.4 0H448v214.6H233.4V32zM0 265.4h214.6V480H0V265.4zm233.4 0H448V480H233.4V265.4z"
                />
              </svg>
              <span className="text-sm lg:text-base">
                Continue with Microsoft
              </span>
            </Button>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Button
              className="w-full flex items-center justify-center gap-2 h-11 lg:h-12 text-base"
              variant="secondary"
              onClick={() => handleLogin("google")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth={0}
                viewBox="0 0 48 48"
              >
                <path
                  fill="#FFC107"
                  stroke="none"
                  d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
                />
                <path
                  fill="#FF3D00"
                  stroke="none"
                  d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
                />
                <path
                  fill="#4CAF50"
                  stroke="none"
                  d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
                />
                <path
                  fill="#1976D2"
                  stroke="none"
                  d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
                />
              </svg>
              <span className="text-sm lg:text-base">Continue with Google</span>
            </Button>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Button
              className="w-full flex items-center justify-center gap-2 h-11 lg:h-12 text-base"
              variant="secondary"
              onClick={() => handleLogin("github")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth={0}
                viewBox="0 0 496 512"
              >
                <path
                  stroke="none"
                  d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"
                />
              </svg>
              <span className="text-sm lg:text-base">Continue with GitHub</span>
            </Button>
          </motion.div>

          <motion.p
            className="text-xs text-center text-muted-foreground px-2"
            variants={itemVariants}
          >
            By signing in, you agree to our Terms of Service and Privacy Policy
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export function Background() {
  const [artworks, setArtworks] = useState<ArtworkResponse[]>([]);

  const fetchArtworks = async () => {
    try {
      const response = await artworkApi.getArtworks(1, 30);
      if (response.data === null) {
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
    }
  };

  useEffect(() => {
    fetchArtworks();
  }, []);

  return (
    <div className="absolute top-0 -z-10 w-full h-screen bg-background overflow-hidden">
      <div className="absolute w-full flex flex-col animate-scroll">
        <div className="px-4 gap-4 columns-xs">
          {artworks.map((artwork) => (
            <img
              key={artwork.id}
              className="w-full object-cover rounded-lg mb-4"
              src={artwork.url}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
