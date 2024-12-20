"use client";

import { Button } from "@/components/ui/button";
import { useIsOwner } from "@/hooks/use-is-owner";
import { useQueryUserProfile } from "@/hooks/use-queries";
import { AtSign, Loader } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { ArtworkGrid } from "@/components/artwork-grid";

export default function ProfilePage({
  params: { id },
}: {
  params: { id: string };
}) {
  const { data, isLoading, error } = useQueryUserProfile({ id });
  const isOwner = useIsOwner(data?.id);

  if (isLoading) {
    return (
      <div className="h-80 justify-center items-center flex">
        {/* 旋转的图标 */}
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-80 justify-center items-center flex">
        <div>Error</div>
      </div>
    );
  }

  return (
    <div className="mt-20 px-8">
      <div className="flex justify-center items-center flex-col">
        <Avatar className="size-40 mb-4">
          <AvatarImage src={data?.avatar} alt={data?.display_name} />
          <AvatarFallback className="text-3xl">
            {data?.display_name?.[0]}
          </AvatarFallback>
        </Avatar>
        <h1 className="text-3xl font-bold mb-4">{data?.display_name}</h1>
        {data?.bio && <p className="mb-3 max-w-96 text-center">{data?.bio}</p>}
        <p className="mb-3 text-muted-foreground max-w-96 text-center flex items-center gap-1">
          <AtSign size={16} />
          {data?.username}
        </p>

        <div className="flex gap-3">
          <Button variant="secondary">Share</Button>
          {isOwner && (
            <Link href={"/settings/profile"}>
              <Button variant="secondary">Edit Profile</Button>
            </Link>
          )}
        </div>
      </div>

      <div className="mt-8">
        <Tabs defaultValue="artworks" className="w-full">
          <div className="flex justify-center items-center">
            <TabsList>
              <TabsTrigger value="artworks">Artworks</TabsTrigger>
              <TabsTrigger value="comments">Comment Generate</TabsTrigger>
              <TabsTrigger value="likes">Likes</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="artworks">
            <ArtworkGrid username={data?.username} />
          </TabsContent>
          <TabsContent value="comments">
            {/* Add Comments content here */}
          </TabsContent>
          <TabsContent value="likes">
            <ArtworkGrid username={data?.username} isLiked={true} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
