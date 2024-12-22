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
import { useState } from "react";
import { AspectRatioDialog } from "./_components/aspect-ratio-dialog";
import { useToast } from "@/hooks/use-toast";
import { deleteAspectRatio, getAspectRatios } from "@/api/aspect-ratio";
import { Card } from "@/components/ui/card";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2, Pencil, Trash } from "lucide-react";

export default function AspectRatioPage() {
  const [open, setOpen] = useState(false);
  const [editingRatio, setEditingRatio] = useState<AspectRatio | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: aspectRatios, isLoading } = useQuery<AspectRatio[]>({
    queryKey: ["aspect-ratios"],
    queryFn: async () => {
      const response = await getAspectRatios();
      return response.data || [];
    },
  });

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this aspect ratio?")) return;
    
    try {
      await deleteAspectRatio(id);
      queryClient.invalidateQueries({ queryKey: ["aspect-ratios"] });
      toast({
        title: "Success",
        description: "Aspect ratio deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete aspect ratio",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Aspect Ratios</h1>
        <Button
          onClick={() => {
            setEditingRatio(null);
            setOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Ratio</TableHead>
              <TableHead>Width</TableHead>
              <TableHead>Height</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : aspectRatios?.map((ratio) => (
              <TableRow key={ratio.id}>
                <TableCell>{ratio.id}</TableCell>
                <TableCell>{ratio.ratio}</TableCell>
                <TableCell>{ratio.width}</TableCell>
                <TableCell>{ratio.height}</TableCell>
                <TableCell className="flex justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingRatio(ratio);
                      setOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(ratio.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <AspectRatioDialog
        open={open}
        onOpenChange={setOpen}
        aspectRatio={editingRatio}
        onSuccess={() => {
          setOpen(false);
          queryClient.invalidateQueries({ queryKey: ["aspect-ratios"] });
        }}
      />
    </div>
  );
}
