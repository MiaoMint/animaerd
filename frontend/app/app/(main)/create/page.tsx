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
import { ChangeEvent, useEffect, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import MD5 from "crypto-js/md5";
import CryptoJS from "crypto-js";
import { mediaApi } from "@/api/media";
import { zodResolver } from "@hookform/resolvers/zod";
import { set, useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { artworkApi } from "@/api/artwork";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { CreateMediaResponse } from "@/types/media";
import { aspectRatioApi } from "@/api/aspect-ratio";
import { styleApi } from "@/api/style";
import { aiApi } from "@/api/ai";

const formSchema = z.object({
  title: z.string(),
  description: z.string(),
  tags: z.string(),
});

export default function CreatePage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [hash, setHash] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadError, setIsUploadError] = useState(false);
  const [isGenerateMetadata, setIsGenerateMetadata] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const t = useTranslations("Create");
  const showLoading = isUploading || isGenerateMetadata;

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

  useEffect(() => {
    async function getMetadata() {
      setIsGenerateMetadata(true);
      // 获取 metadata
      try {
        const metadataResponse = await mediaApi.getMediaMetadata(hash!);
        if (metadataResponse.code == 200) {
          form.setValue("title", metadataResponse.data.title);
          form.setValue("description", metadataResponse.data.description);
          form.setValue("tags", metadataResponse.data.tags.join(","));
        }
      } catch (error) {
        console.error("Error getting metadata:", error);
      } finally {
        setIsGenerateMetadata(false);
      }
    }

    if (hash) {
      getMetadata();
    }
  }, [hash]);

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
        title: t("toast.uploadRequired.title"),
        description: t("toast.uploadRequired.description"),
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await artworkApi.createArtwork({
        title: values.title,
        description: values.description,
        tags: values.tags.split(",").map((tag) => tag.trim()),
        media_hash: hash,
      });

      if (response.code === 200) {
        toast({
          title: t("toast.success.title"),
          description: t("toast.success.description"),
        });
        router.push(`/artwork/${response.data}`);
      }
    } catch (error) {
      toast({
        title: t("toast.error.title"),
        description: t("toast.error.description"),
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
            <h2 className="text-xl font-semibold">{t("title")}</h2>
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
                    {t("upload.dropzone.changeButton")}
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-4 p-6">
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                  <div className="space-y-2">
                    <h3 className="font-medium">
                      {t("upload.dropzone.title")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t("upload.dropzone.description")}
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
                      <Label htmlFor="image-upload">
                        {t("upload.dropzone.uploadButton")}
                      </Label>
                    </Button>
                    <Button
                      className="w-full sm:w-auto"
                      onClick={() => setIsGenerateDialogOpen(true)}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      {t("upload.dropzone.generateButton")}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* generate dialog */}
        <GenerateDialog
          isGenerateDialogOpen={isGenerateDialogOpen}
          setIsGenerateDialogOpen={setIsGenerateDialogOpen}
          onGenerate={(data) => {
            setHash(data.hash);
            setSelectedImage(data.url);
          }}
        />

        {selectedImage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="w-full space-y-4 mt-6 lg:mt-0 "
          >
            <h2 className="text-xl font-semibold">{t("form.title")}</h2>
            <Card className="p-6 relative">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleCreateArtwork)}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("form.fields.title.label")}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t("form.fields.title.placeholder")}
                              {...field}
                            />
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
                          <FormLabel>
                            {t("form.fields.description.label")}
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={t(
                                "form.fields.description.placeholder"
                              )}
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
                          <FormLabel>{t("form.fields.tags.label")}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t("form.fields.tags.placeholder")}
                              {...field}
                            />
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
                      {t("form.submit")}
                    </Button>
                  </motion.div>
                </form>
              </Form>

              {(showLoading || isUploadError) && (
                <div className="flex flex-col items-center justify-center py-8 absolute inset-0 bg-background bg-opacity-15 z-10 rounded-lg">
                  {showLoading ? (
                    <>
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground mt-2">
                        {isUploading && t("upload.status.uploading")}
                        {isGenerateMetadata && t("upload.status.metadata")}
                      </p>
                    </>
                  ) : (
                    isUploadError && (
                      <>
                        <p className="text-sm text-red-500 mb-2">
                          {t("upload.status.failed")}
                        </p>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleRetry}
                        >
                          {t("upload.status.retry")}
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

function GenerateDialog({
  isGenerateDialogOpen,
  setIsGenerateDialogOpen,
  onGenerate,
}: {
  isGenerateDialogOpen: boolean;
  setIsGenerateDialogOpen: (open: boolean) => void;
  onGenerate: (data: CreateMediaResponse) => void;
}) {
  const t = useTranslations("Create");
  const [aspectRatioList, setAspectRatioList] = useState<
    AspectRatio[] | null
  >();
  const [styleList, setStyleList] = useState<StyleResponse[] | null>();
  const [aspectRatio, setAspectRatio] = useState<number>();
  const [style, setStyle] = useState<number>();
  const [isGenerating, setIsGenerating] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    (async () => {
      const aspectRatioResponse = await aspectRatioApi.getAspectRatios();
      const styleResponse = await styleApi.getStyles();
      setAspectRatioList(aspectRatioResponse.data);
      setStyleList(styleResponse.data);
    })();
  }, []);
  async function handleGenerate() {
    if (!aspectRatio || !style) {
      setIsGenerating(false);
      return;
    }
    setIsGenerating(true);

    try {
      const response = await aiApi.text2image({
        text,
        aspect_ratio_id: aspectRatio,
        style_id: style,
      });
      if (response.code === 200) {
        onGenerate(response.data!);
        setIsGenerateDialogOpen(false);
      }
    } catch (error) {
      console.error("Error generating media:", error);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
      <DialogContent className="max-w-2xl mx-4">
        <DialogHeader>
          <DialogTitle>{t("generate.title")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            placeholder={t("generate.prompt")}
            className="min-h-[200px] resize-none"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("generate.aspectRatio")}</Label>
              <div className="grid grid-cols-4 gap-2">
                {aspectRatioList?.map((ratio) => (
                  <Button
                    key={ratio.id}
                    variant={aspectRatio === ratio.id ? "default" : "outline"}
                    size="sm"
                    className="w-full"
                    onClick={() => setAspectRatio(ratio.id)}
                  >
                    {ratio.ratio}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("generate.style")}</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {styleList?.map((styleOption) => (
                  <Button
                    key={styleOption.id}
                    variant={style === styleOption.id ? "default" : "outline"}
                    className="w-full flex flex-col justify-center h-24 rounded-md"
                    onClick={() => setStyle(styleOption.id)}
                  >
                    <img
                      src={styleOption.icon}
                      className="size-14 rounded-lg"
                      alt={styleOption.name}
                    />
                    {styleOption.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Button className="w-full" disabled={isGenerating} onClick={handleGenerate}>
              <Sparkles className="mr-2 h-4 w-4" />
              {t("generate.generateButton")}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              {t("generate.note")}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
