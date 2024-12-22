interface StyleResponse {
  id: number;
  name: string;
  icon: string;
}

interface UpdateStyleRequest {
  name?: string;
  workflow_id?: number;
}
