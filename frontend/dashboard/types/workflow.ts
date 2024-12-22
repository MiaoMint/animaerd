interface WorkflowResponse {
  id: number;
  name: string;
  type: "image_to_image" | "text_to_image" | "comment_to_image";
  json: string;
  image_result_node: string;
  enabled: boolean;
  create_time: string;
}

interface CreateWorkflowRequest {
  name: string;
  type: string;
  json: string;
  image_result_node: string;
}

interface UpdateWorkflowRequest {
  name?: string;
  type?: string;
  json?: string;
  image_result_node?: string;
  enabled?: boolean;
}
