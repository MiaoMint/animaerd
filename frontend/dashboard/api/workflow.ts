import { BaseResponse } from "@/types/base";
import { http } from "@/utils/request";

export const workflowApi = {
  getWorkflows: () => 
    http.get<BaseResponse<WorkflowResponse[] | null>>("/workflow"),

  getWorkflow: (id: number) =>
    http.get<BaseResponse<WorkflowResponse>>(`/workflow/${id}`),

  createWorkflow: (data: CreateWorkflowRequest) =>
    http.post<BaseResponse<WorkflowResponse>>("/workflow", data),

  updateWorkflow: (id: number, data: UpdateWorkflowRequest) =>
    http.put<BaseResponse<WorkflowResponse>>(`/workflow/${id}`, data),

  deleteWorkflow: (id: number) =>
    http.delete<BaseResponse<null>>(`/workflow/${id}`),
}; 