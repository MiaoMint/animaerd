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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Plus, Loader2, Pencil, Trash } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/api/user";
import Image from "next/image";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";

export default function UsersPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: userApi.getUserList,
  });

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedUser) return;
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      await userApi.updateUser({
        display_name: formData.get("display_name") as string,
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsEditOpen(false);
      toast({
        title: "Success",
        description: "User updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    setIsLoading(true);
    try {
      await userApi.deleteUser(id);
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleToggle = async (userId: number, currentRole: string) => {
    setIsLoading(true);
    try {
      const newRole = currentRole === "admin" ? "user" : "admin";
      await userApi.updateUserRole(userId, newRole);
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="max-w-14">Avatar</TableHead>
              <TableHead>Display Name</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Create time</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingUsers ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : (
              users?.data?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="max-w-14">
                    {user.avatar && (
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="size-10 rounded-md object-cover"
                      />
                    )}
                  </TableCell>
                  <TableCell>{user.display_name}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={user.role === "admin"}
                        onCheckedChange={() =>
                          handleRoleToggle(user.id, user.role)
                        }
                        disabled={isLoading || user.id === currentUser?.id}
                      />
                      <span>{user.role}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(user.create_time).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedUser(user);
                        setIsEditOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(user.id)}
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
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label
                htmlFor="display_name"
                className="block text-sm font-medium mb-1"
              >
                Display Name
              </label>
              <Input
                id="display_name"
                name="display_name"
                defaultValue={selectedUser?.display_name}
                required
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update User
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
