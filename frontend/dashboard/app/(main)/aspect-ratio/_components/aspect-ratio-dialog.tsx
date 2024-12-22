import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createAspectRatio, updateAspectRatio } from "@/api/aspect-ratio";
import { useEffect, useState } from "react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aspectRatio?: AspectRatio | null;
  onSuccess: () => void;
}

export function AspectRatioDialog({
  open,
  onOpenChange,
  aspectRatio,
  onSuccess,
}: Props) {
  const [ratio, setRatio] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (aspectRatio) {
      setRatio(aspectRatio.ratio);
      setWidth(aspectRatio.width.toString());
      setHeight(aspectRatio.height.toString());
    }
  }, [aspectRatio]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (aspectRatio) {
        await updateAspectRatio(aspectRatio.id, {
          ratio,
          width: Number(width),
          height: Number(height),
        });
      } else {
        await createAspectRatio({
          ratio,
          width: Number(width),
          height: Number(height),
        });
      }
      onSuccess();
      toast({
        title: "Success",
        description: `Aspect ratio ${
          aspectRatio ? "updated" : "created"
        } successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${
          aspectRatio ? "update" : "create"
        } aspect ratio`,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{aspectRatio ? "Edit" : "Add"} Aspect Ratio</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="ratio">Ratio</Label>
            <Input
              id="ratio"
              value={ratio}
              onChange={(e) => setRatio(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="width">Width</Label>
            <Input
              id="width"
              type="number"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="height">Height</Label>
            <Input
              id="height"
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            {aspectRatio ? "Update" : "Create"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
