package dto

type WorkflowCreateRequest struct {
	Name            string `json:"name"`
	Type            string `json:"type"`
	JSON            string `json:"json"`
	ImageResultNode string `json:"image_result_node"`
}

type WorkflowUpdateRequest struct {
	Name            *string `json:"name,omitempty"`
	Type            *string `json:"type,omitempty"`
	JSON            *string `json:"json,omitempty"`
	ImageResultNode *string `json:"image_result_node,omitempty"`
	Enabled         *bool   `json:"enabled,omitempty"`
}

type WorkflowResponse struct {
	ID              int    `json:"id"`
	Name            string `json:"name"`
	Type            string `json:"type"`
	JSON            string `json:"json"`
	ImageResultNode string `json:"image_result_node"`
	Enabled         bool   `json:"enabled"`
	CreateTime      string `json:"create_time"`
}
