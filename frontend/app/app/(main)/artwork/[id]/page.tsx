"use client";
import { Button } from "@/components/ui/button";
import {
  ArrowLeftIcon,
  Loader,
  HeartIcon,
  DownloadIcon,
  ShareIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { artworkApi } from "@/api/artwork";
import { ArtworkGrid } from "@/components/artwork-grid";
import { useToast } from "@/hooks/use-toast";

export default function ArtworkPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [artwork, setArtwork] = useState<ArtworkResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldShowExpandButton, setShouldShowExpandButton] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        const response = await artworkApi.getArtworkById(Number(params.id));
        setArtwork(response.data);
      } catch (error) {
        console.error("Failed to fetch artwork:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtwork();
  }, [params.id]);

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

  const handleLike = async () => {
    try {
      setIsLiked(!isLiked);
      toast({
        title: isLiked ? "Removed from favorites" : "Added to favorites",
      });
    } catch (error) {
      toast({
        title: "Failed to like artwork",
        description: `Unknown error: ${error}`,
      });
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
        title: "Download started",
        description: "success",
      });
    } catch (error) {
      toast({
        title: "Failed to download artwork",
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
          title: "Link copied to clipboard",
          description: "success",
        });
      }
    } catch (error) {
      toast({
        title: "Failed to share artwork",
        description: `Unknown error: ${error}`,
      });
    }
  };

  if (loading) {
    return (
      <div className="h-80 justify-center items-center flex">
        {/* 旋转的图标 */}
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="h-80 justify-center items-center flex">
        <div>Error</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <Button onClick={() => router.back()} className="mb-6">
        <ArrowLeftIcon className="w-5 h-5 mr-2" />
        Back
      </Button>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Left side - Artwork Image */}
        <div className="md:w-1/2">
          <div
            className={`bg-card rounded-lg ${
              isExpanded ? "" : "max-h-[90vh]"
            } overflow-hidden relative`}
          >
            <img
              ref={imageRef}
              src={artwork.url}
              alt={artwork.title}
              className="w-full h-full object-contain rounded-lg"
            />
            {!isExpanded && shouldShowExpandButton && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-4 flex justify-center">
                <Button variant="secondary" onClick={() => setIsExpanded(true)}>
                  Show Full Image
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right side - Details and Comments */}
        <div className="md:w-1/2 space-y-6">
          {/* Artwork Info Card */}
          <div className="bg-card p-6 rounded-xl shadow-sm border border-border/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden ring-2 ring-border/5">
                  {artwork.user.avatar && (
                    <img
                      src={artwork.user.avatar}
                      alt={artwork.user.username}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-bold">{artwork.title}</h1>
                  <p className="text-sm text-muted-foreground">
                    {artwork.user.username}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
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
                <Button variant="ghost" size="icon" onClick={handleDownload}>
                  <DownloadIcon className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleShare}>
                  <ShareIcon className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span className="flex items-center">
                <HeartIcon className="w-4 h-4 mr-1" />
                {artwork.likes || 0} likes
              </span>
              <span>•</span>
              <span>{new Date(artwork.created_time).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-card p-6 rounded-xl shadow-sm border border-border/50">
            <h2 className="text-lg font-semibold mb-6">Comments</h2>

            {/* Comment Input */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-8 h-8 rounded-full bg-gray-200" />
              <input
                type="text"
                placeholder="Add a comment..."
                className="flex-1 bg-background rounded-full px-4 py-2 text-sm border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Comment Placeholders */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex space-x-4 mb-6">
                <div className="w-8 h-8 rounded-full bg-gray-200" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm">User {i}</span>
                    <span className="text-xs text-muted-foreground">
                      2 hours ago
                    </span>
                  </div>
                  <p className="text-sm mt-1">
                    This is a placeholder comment...
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Collapsible Details Section */}
          <details className="bg-card p-6 rounded-xl shadow-sm border border-border/50">
            <summary className="font-medium cursor-pointer">
              View Artwork Details
            </summary>
            <div className="mt-4 space-y-4">
              <div className="prose max-w-none">
                <h3 className="text-md font-medium">About this artwork</h3>
                <p className="text-sm text-muted-foreground">
                  {artwork.description}
                </p>
              </div>

              <div>
                <h3 className="text-md font-medium mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {artwork.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-secondary/50 px-3 py-1 rounded-full text-sm hover:bg-secondary/70 transition-colors cursor-pointer"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </details>
        </div>
      </div>

      {/* Related Recommendations */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-6">Related Artworks</h2>
        <ArtworkGrid />
      </div>
    </div>
  );
}
