"use client";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { commentApi } from "@/api/comment";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import EmojiPicker, { SkinTonePickerLocation, Theme } from "emoji-picker-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Laugh } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";
import Link from "next/link";

interface CommentsProps {
  artworkId: number;
}

export function Comments({ artworkId }: CommentsProps) {
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: number; author: string } | null>(
    null
  );
  const { toast } = useToast();
  const { user } = useAuth();
  const t = useTranslations("Comments");
  const commonT = useTranslations("Common");

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artworkId]);

  const fetchComments = async () => {
    try {
      const response = await commentApi.getComments(artworkId);
      setComments(response.data);
    } catch (error) {
      toast({
        title: "Failed to load comments",
        variant: "destructive",
      });
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      if (replyTo) {
        await commentApi.replyComment(artworkId, replyTo.id, {
          content: newComment,
        });
      } else {
        await commentApi.createComment(artworkId, { content: newComment });
      }
      await fetchComments();
      setNewComment("");
      setReplyTo(null);
      toast({ title: "Comment posted successfully" });
    } catch (error) {
      toast({
        title: "Failed to post comment",
        variant: "destructive",
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  return (
    <div className="bg-card p-6 rounded-xl shadow-sm border border-border/50 ">
      <h2 className="text-lg font-semibold mb-6">{t("title")}</h2>

      {user ? (
        <div className="flex items-center space-x-4 mb-6">
          <Avatar className="w-8 h-8">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback>{user?.display_name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 flex space-x-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                replyTo
                  ? t("reply-to", { username: replyTo.author })
                  : t("placeholder")
              }
              className="flex-1 min-h-[40px] max-h-[120px] rounded-full px-4 py-2 text-sm border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              rows={1}
            />
            <div className="flex space-x-2">
              {replyTo && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyTo(null)}
                >
                  {commonT("cancel")}
                </Button>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="ghost" size="icon">
                  <Laugh />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="p-0">
                <EmojiPicker
                  theme={Theme.AUTO}
                  skinTonePickerLocation={SkinTonePickerLocation.PREVIEW}
                  onEmojiClick={(e, emoji) =>
                    setNewComment(newComment + e.emoji)
                  }
                />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground mb-6">
          {t("sign-in-to-comment")}
        </div>
      )}
      <div className="max-h-[calc(50vh)] overflow-auto">
        {comments?.map((comment) => (
          <div key={comment.id} className="mb-6">
            <div className="flex space-x-4">
              <Avatar className="w-8 h-8">
                <AvatarImage src={comment.author.avatar} />
                <AvatarFallback>
                  {comment.author.display_name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm">
                    {comment.author.display_name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm mt-1">{comment.content}</p>
                {/* preview Artowkr */}
                {comment.artwork?.url && (
                  <Link href={`/artwork/${comment.artwork.id}`} className="flex items-center space-x-2 mt-2">
                    <img
                      src={comment.artwork.url}
                      alt={comment.artwork.title}
                      className="size-20 rounded-md"
                    />
                    <div>
                      <p className="text-sm font-medium">
                        {comment.artwork.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Preview Artwork
                      </p>
                    </div>
                  </Link>
                )}
                {user && (
                  <button
                    onClick={() =>
                      setReplyTo({
                        id: comment.id,
                        author: comment.author.display_name,
                      })
                    }
                    className="text-xs text-primary hover:text-primary/80 mt-2"
                  >
                    {t("reply")}
                  </button>
                )}
              </div>
            </div>

            {comment.children && comment.children.length > 0 && (
              <div className="ml-12 mt-4 space-y-4">
                {comment.children.map((reply) => (
                  <div key={reply.id} className="flex space-x-4">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={reply.author.avatar} />
                      <AvatarFallback>
                        {reply.author.display_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">
                          {reply.author.display_name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(reply.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{reply.content}</p>
                      {user && (
                        <button
                          onClick={() =>
                            setReplyTo({
                              id: comment.id,
                              author: reply.author.display_name,
                            })
                          }
                          className="text-xs text-primary hover:text-primary/80 mt-2"
                        >
                          {t("reply")}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
