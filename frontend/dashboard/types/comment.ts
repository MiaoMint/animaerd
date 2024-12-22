interface CreateCommentRequest {
  content: string;
}

interface CommentResponse {
  id: number;
  content: string;
  artwork?: ArtworkResponse;
  author: UserResponse;
  children?: CommentResponse[];
  created_at: string;
}
