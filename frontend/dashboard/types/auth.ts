export interface User {
  id: number;
  username: string;
  display_name: string;
  avatar: string;
  bio: string;
  is_admin?: boolean;
  is_favorites_public: boolean;
  is_likes_public: boolean;
}

export type Provider = "github" | "google" | "microsoft";
