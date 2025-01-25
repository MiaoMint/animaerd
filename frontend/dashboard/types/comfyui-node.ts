export interface ComfyUINode {
  id: number;
  name: string;
  endpoint: string;
  enabled: boolean;
  createdTime: string;
  isAlive: boolean;
  lastCheck: string;
  queue: number;
}

export interface CreateComfyUINodeRequest {
  name: string;
  endpoint: string;
}

export interface UpdateComfyUINodeRequest {
  name?: string;
  endpoint?: string;
  enabled?: boolean;
}
