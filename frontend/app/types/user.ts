interface UserResponse {
  id: number;
  username: string;
  display_name: string;
  avatar: string;
  bio: string;
  is_favorites_public: boolean;
  is_likes_public: boolean;
}

// UpdateUserRequest 更新用户信息请求
interface UpdateUserRequest {
  username?: string;
  display_name?: string;
  bio?: string;
  is_favorites_public?: boolean;
  is_likes_public?: boolean;
}

// UserListResponse 用户列表响应
interface UserListResponse {
  users: UserResponse[];
  total: number;
  page: number;
  size: number;
}

interface UserPersonaResponse {
  preferred_tags: string[] | null;
  description: string;
}
