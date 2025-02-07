"use client";
import { Button } from "@/components/ui/button";
import {
  ArrowLeftIcon,
  Loader,
  HeartIcon,
  DownloadIcon,
  ShareIcon,
  PanelRightClose,
  PanelRightOpen,
  TrashIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { artworkApi } from "@/api/artwork";
import { ArtworkGrid } from "@/components/artwork-grid";
import { useToast } from "@/hooks/use-toast";
import { motion } from "motion/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Comments } from "@/components/comments";
import ArtworkLoading from "./_components/artwok-loading";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { SearchArtworksGrid } from "@/components/search-artworks-grid";
import { useAuth } from "@/hooks/use-auth";

export default function ArtworkPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldShowExpandButton, setShouldShowExpandButton] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const { toast } = useToast();
  const [isPanelVisible, setIsPanelVisible] = useState(true);
  const [bgColor, setBgColor] = useState("");
  const t = useTranslations();

  const {
    data: artwork,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["artwork", params.id],
    queryFn: async () => {
      const response = await artworkApi.getArtworkById(Number(params.id));
      return response.data;
    },
  });

  useEffect(() => {
    if (artwork?.primary_color) {
      setBgColor(artwork.primary_color);
    }
  }, [artwork?.primary_color]);

  useEffect(() => {
    const checkImageHeight = () => {
      if (imageRef.current) {
        const viewportHeight = window.innerHeight;
        setShouldShowExpandButton(
          imageRef.current.clientHeight > viewportHeight * 0.9
        );
      }
    };

    const imageElement = imageRef.current;
    if (imageElement) {
      imageElement.addEventListener("load", checkImageHeight);
    }

    return () => {
      if (imageElement) {
        imageElement.removeEventListener("load", checkImageHeight);
      }
    };
  }, [artwork]);

  useEffect(() => {
    const checkLikeStatus = async () => {
      try {
        const response = await artworkApi.getArtworkLikeStatus(
          Number(params.id)
        );
        setIsLiked(response.data);
      } catch (error) {
        console.error("Failed to check like status:", error);
      }
    };

    if (artwork) {
      checkLikeStatus();
    }
  }, [artwork, params.id]);

  const handleLike = async () => {
    try {
      if (isLiked) {
        await artworkApi.unlikeArtwork(Number(params.id));
      } else {
        await artworkApi.likeArtwork(Number(params.id));
      }

      setIsLiked(!isLiked);
      refetch();
      toast({
        title: isLiked ? t("Artwork.toast.unlike") : t("Artwork.toast.like"),
      });
    } catch (error) {
      toast({
        title: t("Common.error"),
      });
      setIsLiked(!isLiked);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(artwork!.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${artwork!.title}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast({
        title: t("Artwork.toast.download"),
      });
    } catch (error) {
      toast({
        title: t("Common.error"),
        description: `Unknown error: ${error}`,
      });
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: artwork!.title,
          text: artwork!.description,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: t("Artwork.toast.share"),
        });
      }
    } catch (error) {
      toast({
        title: t("Common.error"),
        description: `Unknown error: ${error}`,
      });
    }
  };

  const handleDelete = async () => {
    if (!confirm(t("Artwork.confirm-delete"))) return;
    
    try {
      await artworkApi.deleteArtwork(Number(params.id));
      toast({
        title: t("Artwork.toast.delete-success"),
      });
      router.push("/");
    } catch (error) {
      toast({
        title: t("Common.error"),
        description: `Unknown error: ${error}`,
      });
    }
  };

  if (isLoading) {
    return <ArtworkLoading />;
  }

  if (!artwork) {
    return (
      <div className="h-80 justify-center items-center flex">
        <div>{t("Common.error")}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-700">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between">
          <Button onClick={() => router.back()} className="mb-6">
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            {t("Common.back")}
          </Button>

          <Button
            variant={"ghost"}
            size={"icon"}
            onClick={() => setIsPanelVisible(!isPanelVisible)}
            className="mb-6"
          >
            {isPanelVisible ? <PanelRightClose /> : <PanelRightOpen />}
          </Button>
        </div>

        <div
          className={`flex flex-col md:flex-row gap-8 ${
            !isPanelVisible ? "justify-center" : ""
          }`}
        >
          <div
            className={`${
              isPanelVisible ? "md:w-1/2" : "md:w-3/5"
            } transition-all duration-300`}
          >
            <motion.div
              className={`bg-card rounded-lg ${
                isExpanded ? "" : "max-h-[90vh]"
              } overflow-hidden relative transition-all duration-1000`}
              initial={{ boxShadow: "0 0 1px 1px transparent" }}
              animate={{
                boxShadow: `0 0 100px 2px #${bgColor}AB`,
              }}
              transition={{
                duration: 1,
                delay: 0.2,
              }}
            >
              <img
                ref={imageRef}
                src={artwork.url}
                alt={artwork.title}
                className="w-full h-full object-contain rounded-lg"
              />
              {!isExpanded && shouldShowExpandButton && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-4 flex justify-center">
                  <Button
                    variant="secondary"
                    onClick={() => setIsExpanded(true)}
                  >
                    {t("Artwork.show-full-image")}
                  </Button>
                </div>
              )}
            </motion.div>
          </div>

          {isPanelVisible && (
            <div className="md:w-1/2 space-y-6 sticky">
              <div className="bg-card p-6 rounded-xl shadow-sm border border-border/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden ring-2 ring-border/5 flex-shrink-0">
                      <Link href={`/profile/${artwork.user.username}`}>
                        {artwork.user.avatar && (
                          <Avatar className="size-10">
                            <AvatarImage
                              src={artwork.user.avatar}
                              alt={artwork.user.display_name}
                            />
                            <AvatarFallback>
                              {artwork.user.display_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </Link>
                    </div>
                    <div>
                      <h1 className="text-xl font-bold line-clamp-2">
                        {artwork.title}
                      </h1>
                      <Link href={`/profile/${artwork.user.username}`}>
                        <p className="text-sm text-muted-foreground">
                          {artwork.user.username}
                        </p>
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Button
                      variant={isLiked ? "default" : "ghost"}
                      size="icon"
                      onClick={handleLike}
                    >
                      <HeartIcon
                        className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleDownload}
                    >
                      <DownloadIcon className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleShare}>
                      <ShareIcon className="w-5 h-5" />
                    </Button>
                    {user && artwork.user.id === user.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDelete}
                        className="text-destructive hover:text-destructive/90"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center">
                    <HeartIcon className="w-4 h-4 mr-1" />
                    {artwork.likes || 0} {t("Artwork.likes")}
                  </span>
                  <span>•</span>
                  <span>
                    {new Date(artwork.created_time).toLocaleDateString()}
                  </span>
                </div>
                <details>
                  <summary className="font-medium cursor-pointer">
                    {t("Artwork.details")}
                  </summary>
                  <div className="mt-4 space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {artwork.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {artwork.tags.map((tag) => (
                        <Link
                          key={tag}
                          href={`/search/tag(${tag})`}
                          className="bg-secondary/50 px-3 py-1 rounded-full text-sm hover:bg-secondary/70 transition-colors cursor-pointer"
                        >
                          {tag}
                        </Link>
                      ))}
                    </div>
                  </div>
                </details>
              </div>

              <Comments artworkId={Number(params.id)} />
            </div>
          )}
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-6">{t("Artwork.related")}</h2>
          <SearchArtworksGrid
            q={artwork.tags.length == 0 ? "" : `tag(${artwork.tags[0]})`}
          />
        </div>
      </div>
    </div>
  );
}
