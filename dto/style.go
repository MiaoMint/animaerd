package dto

type StyleResponse struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
	Icon string `json:"icon"`
}

type CreateStyleRequest struct {
	Name string `json:"name"`
	Icon string `json:"icon"`
}

type UpdateStyleRequest struct {
	Name *string `json:"name,omitempty"`
	Icon *string `json:"icon,omitempty"`
} 