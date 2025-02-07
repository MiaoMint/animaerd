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
import { useToast } from "@/hooks/use-toast";
import { Plus, Loader2, Trash, SquareArrowOutUpRight } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { artworkApi } from "@/api/artwork";
import { useRouter } from "next/navigation";

// API functions
const fetchArtworks = async () => {
  const response = await artworkApi.getArtworks({
    page: 1,
    pageSize: 100,
  });
  return response.data;
};

export default function ArtworksPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: artworks, isLoading: isLoadingArtworks } = useQuery<
    ArtworkResponse[]
  >({
    queryKey: ["artworks"],
    queryFn: fetchArtworks,
  });

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this artwork?")) return;

    try {
      await artworkApi.deleteArtwork(id);
      queryClient.invalidateQueries({ queryKey: ["artworks"] });
      toast({
        title: "Success",
        description: "Artwork deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete artwork",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Artworks Management</h1>
        <Button
          onClick={() =>
            window.open(
              `${process.env.NEXT_PUBLIC_HOME_PAGE_URL}/create`,
              "_brank"
            )
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Artwork
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingArtworks ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : (
              artworks?.map((artwork) => (
                <TableRow key={artwork.id}>
                  <TableCell>{artwork.id}</TableCell>
                  <TableCell>
                    <img
                      src={artwork.url}
                      alt={artwork.title}
                      className="h-10 w-10 object-cover rounded-lg"
                    />
                  </TableCell>
                  <TableCell>{artwork.title}</TableCell>
                  <TableCell>{artwork.description}</TableCell>

                  <TableCell className="text-right space-x-2 flex">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        window.open(
                          `${process.env.NEXT_PUBLIC_HOME_PAGE_URL}/artwork/${artwork.id}`,
                          "_blank"
                        )
                      }
                    >
                      <SquareArrowOutUpRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(artwork.id)}
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
    </div>
  );
}
