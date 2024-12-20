package dto

type CreateCommentRequest struct {
	Content string `json:"content"`
}

type CommentResponse struct {
	ID        int               `json:"id"`
	Content   string            `json:"content"`
	Artwork   ArtworkResponse   `json:"artwork,omitempty"`
	Author    UserResponse      `json:"author"`
	Children  []CommentResponse `json:"children,omitempty"`
	CreatedAt string            `json:"created_at"`
}
