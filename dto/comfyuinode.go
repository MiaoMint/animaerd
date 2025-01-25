package dto

type ComfyUiNodeResponse struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Endpoint    string `json:"endpoint"`
	Enabled     bool   `json:"enabled"`
	CreatedTime string `json:"createdTime"`
	IsAlive     bool   `json:"isAlive"`
	LastCheck   string `json:"lastCheck"`
	Queue       int    `json:"queue"`
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
