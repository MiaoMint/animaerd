interface CreateArtworkRequest {
  title?: string;
  description?: string;
  tags?: string[];
  media_hash?: string;
}

interface ArtworkResponse {
  id: number;
  url: string;
  description: string;
  primary_color: string;
  title: string;
  width: number;
  height: number;
  is_ai: boolean;
  tags: string[];
  user: UserResponse;
  likes: number;
  created_time: string;
}

interface UpdateArtworkRequest {
  title?: string;
  tags?: string[];
  status?: number;
}
