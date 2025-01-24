package llm

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/MiaoMint/animaerd/ent"
	"github.com/sashabaranov/go-openai"
)

type LLM struct {
	openAiClient *openai.Client
}

func NewLLM(openAiClient *openai.Client) *LLM {
	return &LLM{openAiClient: openAiClient}
}

type MediaMetadata struct {
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Tags        []string `json:"tags"`
}

func (l *LLM) GenerateMetadata(url string) (*MediaMetadata, error) {
	resp, err := l.openAiClient.CreateChatCompletion(context.Background(),
		openai.ChatCompletionRequest{
			Model: "gpt-4o",
			Messages: []openai.ChatCompletionMessage{
				{
					Role: "system",
					Content: `Generate relevant information based on the pictures provided by the user and finally output it in json format:
					{
					  "title": "The title of the artwork",
					  "description": "The description of the artwork",
					  "tags": ["tag1", "tag2", "tag3"],	
					}`,
				},
				{
					Role: "user",
					MultiContent: []openai.ChatMessagePart{
						{
							Type: openai.ChatMessagePartTypeImageURL,
							ImageURL: &openai.ChatMessageImageURL{
								URL: url,
							},
						},
					},
				},
			},
			ResponseFormat: &openai.ChatCompletionResponseFormat{
				Type: openai.ChatCompletionResponseFormatTypeJSONObject,
			},
		},
	)

	if err != nil {
		return nil, err
	}

	var metadata MediaMetadata

	err = json.Unmarshal([]byte(resp.Choices[0].Message.Content), &metadata)
	if err != nil {
		return nil, err
	}

	return &metadata, nil

}

func (l *LLM) GenerateArtworkAITag(artwork ent.Artwork) ([]string, error) {

	tags := []string{}

	for _, tag := range artwork.Edges.Tags {
		tags = append(tags, tag.Name)
	}

	resp, err := l.openAiClient.CreateChatCompletion(context.Background(),
		openai.ChatCompletionRequest{
			Model: "gpt-4o",
			Messages: []openai.ChatCompletionMessage{
				{
					Role: "system",
					Content: `Generate more detailed tags based on the pictures and metadata provided by the user. No less than 10 tags are generated and finally output in json format:
					{
					  "tags": ["tag1", "tag2", "tag3"],	
					}`,
				},
				{
					Role: "user",
					MultiContent: []openai.ChatMessagePart{
						{
							Type: openai.ChatMessagePartTypeImageURL,
							ImageURL: &openai.ChatMessageImageURL{
								URL: artwork.Edges.Media.URL,
							},
						},
						{
							Type: openai.ChatMessagePartTypeText,
							Text: fmt.Sprintf(`Title: %s, Description: %s, Tags: %s`, artwork.Title, artwork.Description, strings.Join(tags, ",")),
						},
					},
				},
			},
			ResponseFormat: &openai.ChatCompletionResponseFormat{
				Type: openai.ChatCompletionResponseFormatTypeJSONObject,
			},
		},
	)

	if err != nil {
		return nil, err
	}

	data := make(map[string]interface{})

	err = json.Unmarshal([]byte(resp.Choices[0].Message.Content), &data)
	if err != nil {
		return nil, err
	}

	resultTags, ok := data["tags"].([]string)
	if !ok {
		return nil, fmt.Errorf("tags not found")
	}

	return resultTags, nil
}
