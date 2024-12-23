package dto

type UserResponse struct {
	ID                int    `json:"id"`
	Username          string `json:"username"`
	DisplayName       string `json:"display_name"`
	Avatar            string `json:"avatar"`
	Bio               string `json:"bio"`
	Role              string `json:"role,omitempty"`
	CreateTime        string `json:"create_time,omitempty"`
	IsAdmin           bool   `json:"is_admin,omitempty"`
	IsFavoritesPublic bool   `json:"is_favorites_public"`
	IsLikesPublic     bool   `json:"is_likes_public"`
}

// UpdateUserRequest 更新用户信息请求
type UpdateUserRequest struct {
	Username          *string `json:"username,omitempty"`
	DisplayName       *string `json:"display_name,omitempty"`
	Bio               *string `json:"bio,omitempty"`
	IsFavoritesPublic *bool   `json:"is_favorites_public,omitempty"`
	IsLikesPublic     *bool   `json:"is_likes_public,omitempty"`
}
