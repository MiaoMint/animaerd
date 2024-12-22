package dto

type AspectRatioResponse struct {
	ID     int    `json:"id"`
	Ratio  string `json:"ratio"`
	Width  int    `json:"width"`
	Height int    `json:"height"`
}

type CreateAspectRatioRequest struct {
	Ratio  string `json:"ratio"`
	Width  int    `json:"width"`
	Height int    `json:"height"`
}

type UpdateAspectRatioRequest struct {
	Ratio  *string `json:"ratio,omitempty"`
	Width  *int    `json:"width,omitempty"`
	Height *int    `json:"height,omitempty"`
}
