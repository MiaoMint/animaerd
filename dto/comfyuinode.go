package dto

type ComfyUiNodeResponse struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Endpoint    string `json:"endpoint"`
	Enabled     bool   `json:"enabled"`
	CreatedTime string `json:"createdTime"`
}

type CreateComfyUiNodeRequest struct {
	Name     string `json:"name"`
	Endpoint string `json:"endpoint"`
}

type UpdateComfyUiNodeRequest struct {
	Name     *string `json:"name"`
	Endpoint *string `json:"endpoint"`
	Enabled  *bool   `json:"enabled"`
}
