"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, ImagePlus, Sparkles, Loader2 } from "lucide-react";
import { ChangeEvent, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import MD5 from "crypto-js/md5";
import CryptoJS from "crypto-js";
import { mediaApi } from "@/api/media";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { artworkApi } from "@/api/artwork";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  title: z.string(),
  description: z.string(),
  tags: z.string(),
});

export default function CreatePage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [style, setStyle] = useState("realistic");
  const [quality, setQuality] = useState("standard");
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [hash, setHash] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadError, setIsUploadError] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      tags: "",
    },
  });

  async function handleSelectImage(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    setSelectedImage(URL.createObjectURL(file));
    setIsUploading(true);
    setIsUploadError(false);

    try {
      const buffer = await file.arrayBuffer();
      const wordArray = CryptoJS.lib.WordArray.create(buffer);
      const hash = MD5(wordArray).toString();

      const response = await mediaApi.uploadImage(hash);
      if (response.code == 200) {
        setHash(hash);
        return;
      }

      const uploadResponse = await mediaApi.uploadImage(undefined, file);
      if (uploadResponse.code == 200) {
        setHash(hash);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setIsUploadError(true);
    } finally {
      setIsUploading(false);
    }
  }

  const handleRetry = () => {
    setIsUploadError(false);
    const input = document.getElementById("image-upload") as HTMLInputElement;
    if (input.files?.length) {
      handleSelectImage({ target: input } as ChangeEvent<HTMLInputElement>);
    }
  };

  async function handleCreateArtwork(values: z.infer<typeof formSchema>) {
    if (!hash) {
      toast({
        title: "Error",
        description: "Please upload an image first",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await artworkApi.createArtwork({
        title: values.title,
        description: values.description,
        tags: values.tags.split(",").map(tag => tag.trim()),
        media_hash: hash,
      });

      if (response.code === 200) {
        toast({
          title: "Success",
          description: "Artwork created successfully",
        });
        router.push(`/artwork/${response.data}`);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create artwork",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="container mx-auto">
      <div
        className={cn([
          "max-w-6xl mx-auto p-4 sm:p-6 gap-6",
          selectedImage && "flex flex-col lg:flex-row",
        ])}
      >
        <div className="w-full lg:max-w-2xl mx-auto flex-shrink-0">
          {/* Left Column: Image Upload/Preview */}
          <motion.div
            layout="position"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.4,
              ease: "easeOut",
              scale: {
                type: "spring",
                damping: 25,
                stiffness: 300,
              },
            }}
            className="space-y-4"
          >
            <h2 className="text-xl font-semibold">Upload or Generate</h2>
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg min-h-[300px] sm:min-h-[400px] bg-muted/50 relative hover:bg-muted/70 transition-colors overflow-hidden">
              {selectedImage ? (
                <div className="relative w-full h-full">
                  <motion.img
                    layout="preserve-aspect"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    src={selectedImage}
                    alt="Preview"
                    className="size-full"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute bottom-4 right-4 opacity-90 hover:opacity-100"
                    onClick={() => {
                      setSelectedImage(null);
                      setHash(null);
                      setIsUploading(false);
                    }}
                  >
                    <ImagePlus className="w-4 h-4 mr-2" />
                    Change Image
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-4 p-6">
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                  <div className="space-y-2">
                    <h3 className="font-medium">Drop your image here</h3>
                    <p className="text-sm text-muted-foreground">
                      Supports: JPG, PNG, WebP (Max 10MB)
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleSelectImage}
                      id="image-upload"
                    />
                    <Button
                      asChild
                      variant="secondary"
                      className="w-full sm:w-auto"
                    >
                      <Label htmlFor="image-upload">Upload Image</Label>
                    </Button>
                    <Button
                      className="w-full sm:w-auto"
                      onClick={() => setIsGenerateDialogOpen(true)}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate with AI
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* AI Generation Dialog */}
        <Dialog
          open={isGenerateDialogOpen}
          onOpenChange={setIsGenerateDialogOpen}
        >
          <DialogContent className="max-w-2xl mx-4">
            <DialogHeader>
              <DialogTitle>Generate Image with AI</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Describe the image you want to generate in detail..."
                className="min-h-[200px] resize-none"
              />
              <div className="space-y-4">
                {/* Aspect Ratio Selection */}
                <div className="space-y-2">
                  <Label>Aspect Ratio</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {["1:1", "4:3", "16:9", "3:4"].map((ratio) => (
                      <Button
                        key={ratio}
                        variant={aspectRatio === ratio ? "default" : "outline"}
                        size="sm"
                        className="w-full"
                        onClick={() => setAspectRatio(ratio)}
                      >
                        {ratio}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Style Selection */}
                <div className="space-y-2">
                  <Label>Style</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {["realistic", "artistic", "anime", "3d"].map(
                      (styleOption) => (
                        <Button
                          key={styleOption}
                          variant={
                            style === styleOption ? "default" : "outline"
                          }
                          size="sm"
                          className="w-full"
                          onClick={() => setStyle(styleOption)}
                        >
                          {styleOption.charAt(0).toUpperCase() +
                            styleOption.slice(1)}
                        </Button>
                      )
                    )}
                  </div>
                </div>

                {/* Quality Selection */}
                <div className="space-y-2">
                  <Label>Quality</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {["draft", "standard", "hd"].map((qualityOption) => (
                      <Button
                        key={qualityOption}
                        variant={
                          quality === qualityOption ? "default" : "outline"
                        }
                        size="sm"
                        className="w-full"
                        onClick={() => setQuality(qualityOption)}
                      >
                        {qualityOption.charAt(0).toUpperCase() +
                          qualityOption.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Button className="w-full">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Image
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  AI generation may take a few seconds
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="w-full space-y-4 mt-6 lg:mt-0 "
          >
            <h2 className="text-xl font-semibold">About this Artwork</h2>
            <Card className="p-6 relative">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreateArtwork)} className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter artwork title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your artwork..."
                              className="min-h-[150px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tags</FormLabel>
                          <FormControl>
                            <Input placeholder="Add tags (comma separated)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <motion.div
                    className="flex gap-4 mt-auto pt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                  >
                    <Button type="submit" className="w-full" size="lg">
                      Create Artwork
                    </Button>
                  </motion.div>
                </form>
              </Form>
              
              {(isUploading || isUploadError) && (
                <div className="flex flex-col items-center justify-center py-8 absolute inset-0 bg-background bg-opacity-15 z-10 rounded-lg">
                  {isUploading ? (
                    <>
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground mt-2">
                        Uploading image...
                      </p>
                    </>
                  ) : (
                    isUploadError && (
                      <>
                        <p className="text-sm text-red-500 mb-2">
                          Upload failed
                        </p>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleRetry}
                        >
                          Retry Upload
                        </Button>
                      </>
                    )
                  )}
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
