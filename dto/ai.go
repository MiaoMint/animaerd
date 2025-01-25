package dto

type GenerateTextToImageRequest struct {
	Text          string `json:"text"`
	AspectRatioID int    `json:"aspect_ratio_id"`
	StyleID       int    `json:"style_id"`
}
