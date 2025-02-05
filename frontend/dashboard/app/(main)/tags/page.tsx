"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Plus, Loader2, Pencil, Trash } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { tagApi } from "@/api/tag";
import { TagResponse } from "@/types/tag";

// API functions
const fetchTags = async () => {
  const response = await tagApi.getTagList();
  return response.data;
};

export default function TagsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<TagResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tags, isLoading: isLoadingTags } = useQuery<TagResponse[]>({
    queryKey: ["tags"],
    queryFn: fetchTags,
  });

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      await tagApi.createTag({
        name: formData.get("name") as string,
        type: formData.get("type") as string,
      });
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      setIsCreateOpen(false);
      toast({
        title: "Success",
        description: "Tag created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create tag",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTag) return;
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      await tagApi.updateTag(selectedTag.id, {
        name: formData.get("name") as string,
        type: formData.get("type") as string,
      });
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      setIsEditOpen(false);
      toast({
        title: "Success",
        description: "Tag updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update tag",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this tag?")) return;

    try {
      await tagApi.deleteTag(id);
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      toast({
        title: "Success",
        description: "Tag deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete tag",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tags Management</h1>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Tag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Tag</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Name
                </label>
                <Input id="name" name="name" required />
              </div>
              <div>
                <label htmlFor="type" className="block text-sm font-medium mb-1">
                  Type
                </label>
                <Select name="type" required defaultValue="user">
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="ai">AI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Tag
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingTags ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : (
              tags?.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell>{tag.id}</TableCell>
                  <TableCell>{tag.name}</TableCell>
                  <TableCell className="capitalize">{tag.type}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedTag(tag);
                        setIsEditOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(tag.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tag</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label
                htmlFor="edit-name"
                className="block text-sm font-medium mb-1"
              >
                Name
              </label>
              <Input
                id="edit-name"
                name="name"
                defaultValue={selectedTag?.name}
                required
              />
            </div>
            <div>
              <label
                htmlFor="edit-type"
                className="block text-sm font-medium mb-1"
              >
                Type
              </label>
              <Select name="type" required defaultValue={selectedTag?.type}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="ai">AI</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Tag
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
