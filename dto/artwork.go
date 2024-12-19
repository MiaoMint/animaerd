package dto

type CreateArtworkRequest struct {
	Title       *string   `json:"title,omitempty"`
	Description *string   `json:"description,omitempty"`
	Tags        *[]string `json:"tags,omitempty"`
	MediaHash   *string   `json:"media_hash"`
}

type ArtworkResponse struct {
	ID            int          `json:"id"`
	URL           string       `json:"url"`
	Description   string       `json:"description"`
	PrimaryCorlor string       `json:"primary_color"`
	Title         string       `json:"title"`
	Width         int          `json:"width"`
	Height        int          `json:"height"`
	IsAI          bool         `json:"is_ai"`
	Tags          []string     `json:"tags"`
	User          UserResponse `json:"user"`
	Likes         int          `json:"likes"`
	CreatedTime   string       `json:"created_time"`
}

// UpdateArtworkRequest 更新图片请求
type UpdateArtworkRequest struct {
	Title  string   `json:"title,omitempty"`
	Tags   []string `json:"tags,omitempty"`
	Status int      `json:"status,omitempty"`
}
