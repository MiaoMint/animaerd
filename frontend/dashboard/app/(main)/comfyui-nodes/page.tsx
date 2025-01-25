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
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Plus, Loader2, Pencil, Trash } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { comfyuiNodeApi } from "@/api/comfyui-node";
import { ComfyUINode } from "@/types/comfyui-node";

// API functions
const fetchNodes = async () => {
  const response = await comfyuiNodeApi.getNodes();
  return response.data;
};

export default function ComfyUINodesPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<ComfyUINode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: nodes, isLoading: isLoadingNodes } = useQuery<ComfyUINode[]>({
    queryKey: ["comfyui-nodes"],
    queryFn: fetchNodes,
  });

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      await comfyuiNodeApi.createNode({
        name: formData.get("name") as string,
        endpoint: formData.get("endpoint") as string,
      });
      queryClient.invalidateQueries({ queryKey: ["comfyui-nodes"] });
      setIsCreateOpen(false);
      toast({
        title: "Success",
        description: "Node created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create node",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedNode) return;
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      await comfyuiNodeApi.updateNode(selectedNode.id, {
        name: formData.get("name") as string,
        endpoint: formData.get("endpoint") as string,
      });
      queryClient.invalidateQueries({ queryKey: ["comfyui-nodes"] });
      setIsEditOpen(false);
      toast({
        title: "Success",
        description: "Node updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update node",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleEnabled = async (node: ComfyUINode) => {
    try {
      await comfyuiNodeApi.updateNode(node.id, { enabled: !node.enabled });
      queryClient.invalidateQueries({ queryKey: ["comfyui-nodes"] });
      toast({
        title: "Success",
        description: `Node ${
          node.enabled ? "disabled" : "enabled"
        } successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update node status",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this node?")) return;

    try {
      await comfyuiNodeApi.deleteNode(id);
      queryClient.invalidateQueries({ queryKey: ["comfyui-nodes"] });
      toast({
        title: "Success",
        description: "Node deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete node",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">ComfyUI Server Nodes</h1>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Node
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Node</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-1"
                >
                  Name
                </label>
                <Input id="name" name="name" required />
              </div>
              <div>
                <label
                  htmlFor="endpoint"
                  className="block text-sm font-medium mb-1"
                >
                  Endpoint
                </label>
                <Input id="endpoint" name="endpoint" required />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Node
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
              <TableHead>Endpoint</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>IsAlive</TableHead>
              <TableHead>Last Check</TableHead>
              <TableHead>Queue</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingNodes ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : (
              nodes?.map((node) => (
                <TableRow key={node.id}>
                  <TableCell>{node.id}</TableCell>
                  <TableCell>{node.name}</TableCell>
                  <TableCell>{node.endpoint}</TableCell>
                  <TableCell>
                    <Switch
                      checked={node.enabled}
                      onCheckedChange={() => handleToggleEnabled(node)}
                    />
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        node.isAlive ? "bg-green-500 text-white" : "bg-red-500"
                      }`}
                    >
                      {node.isAlive ? "Online" : "Offline"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {/* 时间的显示不是日期 */}
                    {new Date(node.lastCheck).getHours()}:
                    {new Date(node.lastCheck).getMinutes()}:
                    {new Date(node.lastCheck).getSeconds()}
                  </TableCell>
                  <TableCell>{node.queue}</TableCell>
                  <TableCell>
                    {new Date(node.createdTime).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedNode(node);
                        setIsEditOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(node.id)}
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
            <DialogTitle>Edit Node</DialogTitle>
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
                defaultValue={selectedNode?.name}
                required
              />
            </div>
            <div>
              <label
                htmlFor="edit-endpoint"
                className="block text-sm font-medium mb-1"
              >
                Endpoint
              </label>
              <Input
                id="edit-endpoint"
                name="endpoint"
                defaultValue={selectedNode?.endpoint}
                required
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Node
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
