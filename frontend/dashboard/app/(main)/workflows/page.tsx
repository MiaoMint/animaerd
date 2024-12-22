"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Plus, Loader2, Pencil } from "lucide-react";
import { workflowApi } from "@/api/workflow";
import { WorkflowDialog } from "./workflow-dialog";
// import { EditWorkflowDialog } from "./edit-dialog";

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<WorkflowResponse[] | undefined>(
    []
  );
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editWorkflow, setEditWorkflow] = useState<WorkflowResponse | null>(
    null
  );
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const fetchWorkflows = async () => {
    setIsLoading(true);
    try {
      const res = await workflowApi.getWorkflows();
      setWorkflows(res.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch workflows",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleEnabled = async (id: number, enabled: boolean) => {
    try {
      await workflowApi.updateWorkflow(id, { enabled });
      fetchWorkflows();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update workflow status",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Workflows</h1>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : workflows?.map((workflow) => (
              <TableRow key={workflow.id}>
                <TableCell>{workflow.name}</TableCell>
                <TableCell>{workflow.type}</TableCell>
                <TableCell>
                  <Switch
                    checked={workflow.enabled}
                    onCheckedChange={(checked) =>
                      handleToggleEnabled(workflow.id, checked)
                    }
                  />
                </TableCell>
                <TableCell className="flex justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditWorkflow(workflow)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <WorkflowDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={fetchWorkflows}
        mode="create"
      />

      <WorkflowDialog
        open={!!editWorkflow}
        workflow={editWorkflow}
        onOpenChange={() => setEditWorkflow(null)}
        onSuccess={fetchWorkflows}
        mode="edit"
      />
    </div>
  );
}
