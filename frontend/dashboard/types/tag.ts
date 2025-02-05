// CreateTagRequest represents the request body for creating a tag
export interface CreateTagRequest {
  name: string;
  type: string; // "user" or "ai"
}

// UpdateTagRequest represents the request body for updating a tag
export interface UpdateTagRequest {
  name?: string | null; // optional and can be null
  type?: string | null; // optional and can be null, "user" or "ai"
}

// TagResponse represents the response body for tag operations
export interface TagResponse {
  id: number;
  name: string;
  type: string; // "user" or "ai"
}
