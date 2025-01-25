"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { workflowApi } from "@/api/workflow";
import { useEffect } from "react";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  json: z.string().min(1, "Workflow JSON is required"),
  image_result_node: z.string().min(1, "Image result node is required"),
});

interface WorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  workflow?: any; // Add type definition based on your workflow model
  mode: "create" | "edit";
}

export function WorkflowDialog({
  open,
  onOpenChange,
  onSuccess,
  workflow,
  mode,
}: WorkflowDialogProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: workflow?.name || "",
      type: workflow?.type || "",
      json: workflow?.json || "",
      image_result_node: workflow?.image_result_node || "",
    },
  });

  // Reset form when workflow changes
  useEffect(() => {
    if (workflow) {
      form.reset({
        name: workflow.name,
        type: workflow.type,
        json: workflow.json,
        image_result_node: workflow.image_result_node,
      });
    }
  }, [workflow, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      console.log("Submitting form with values:", values);

      if (mode === "create") {
        console.log("Creating workflow...");
        await workflowApi.createWorkflow(values);
        toast({
          title: "Success",
          description: "Workflow created successfully",
        });
      } else {
        await workflowApi.updateWorkflow(workflow.id, values);
        toast({
          title: "Success",
          description: "Workflow updated successfully",
        });
      }

      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : `Failed to ${mode} workflow`,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Workflow" : "Edit Workflow"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter workflow name"
                      {...field}
                      className={
                        form.formState.errors.name ? "border-red-500" : ""
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select workflow type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="image_to_image">
                        Image to Image
                      </SelectItem>
                      <SelectItem value="text_to_image">
                        Text to Image
                      </SelectItem>
                      <SelectItem value="comment_to_image">
                        Comment to Image
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="json"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workflow JSON</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Enter workflow JSON; {text} will be replaced with input text, {width} and {height} will be replaced with image width and height"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image_result_node"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image Result Node</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {mode === "create" ? "Create" : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
