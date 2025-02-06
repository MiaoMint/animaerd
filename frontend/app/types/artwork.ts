interface CreateArtworkRequest {
  title?: string;
  description?: string;
  tags?: string[];
  media_hash?: string;
  is_ai?: boolean;
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
  is_liked: boolean;
  created_time: string;
}

interface UpdateArtworkRequest {
  title?: string;
  tags?: string[];
  status?: number;
}
