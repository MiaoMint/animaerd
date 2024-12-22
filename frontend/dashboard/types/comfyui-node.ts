interface ComfyUINode {
  id: number;
  name: string;
  endpoint: string;
  enabled: boolean;
  createdTime: string;
}

interface CreateComfyUINodeRequest {
  name: string;
  endpoint: string;
}

interface UpdateComfyUINodeRequest {
  name?: string;
  endpoint?: string;
  enabled?: boolean;
}
