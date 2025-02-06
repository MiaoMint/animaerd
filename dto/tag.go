package dto

// CreateTagRequest represents the request body for creating a tag
type CreateTagRequest struct {
	Name string `json:"name"`
	Type string `json:"type"` // "user" or "ai"
}

// UpdateTagRequest represents the request body for updating a tag
type UpdateTagRequest struct {
	Name *string `json:"name,omitempty"`
	Type *string `json:"type,omitempty"` // "user" or "ai"
}

// TagResponse represents the response body for tag operations
type TagResponse struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
	Type string `json:"type"` // "user" or "ai"
}

// PopularTagResponse represents the response body for popular tag operations
type PopularTagResponse struct {
	ID             int             `json:"id"`
	Name           string          `json:"name"`
	Type           string          `json:"type"` // "user" or "ai"
	ArtworkCount   int             `json:"artwork_count"`
	ExampleArtwork ArtworkResponse `json:"example_artwork,omitempty"`
}
