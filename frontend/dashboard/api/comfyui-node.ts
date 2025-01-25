import { BaseResponse } from "@/types/base";
import {
  ComfyUINode,
  CreateComfyUINodeRequest,
  UpdateComfyUINodeRequest,
} from "@/types/comfyui-node";
import { http } from "@/utils/request";

export const comfyuiNodeApi = {
  // Get all nodes
  getNodes: () => http.get<BaseResponse<ComfyUINode[]>>("/comfyui/node"),

  // Get single node
  getNode: (id: number) =>
    http.get<BaseResponse<ComfyUINode>>(`/comfyui/node/${id}`),

  // Create node
  createNode: (data: CreateComfyUINodeRequest) =>
    http.post<BaseResponse<ComfyUINode>>("/comfyui/node", data),

  // Update node
  updateNode: (id: number, data: UpdateComfyUINodeRequest) =>
    http.put<BaseResponse<ComfyUINode>>(`/comfyui/node/${id}`, data),

  // Delete node
  deleteNode: (id: number) =>
    http.delete<BaseResponse<null>>(`/comfyui/node/${id}`),
};
