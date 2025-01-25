package llm

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/gofiber/fiber/v2/log"
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
					Role: openai.ChatMessageRoleSystem,
					Content: `Generate relevant information based on the pictures provided by the user and finally output it in json format:
						{
						  "title": "The title of the artwork",
						  "description": "The description of the artwork",
						  "tags": ["tag1", "tag2", "tag3"],	
						}
						Please note that you only need to output the json fragment and do not need to output any other irrelevant content.  
						`,
				},
				{
					Role: openai.ChatMessageRoleUser,
					MultiContent: []openai.ChatMessagePart{
						{
							Type: openai.ChatMessagePartTypeImageURL,
							ImageURL: &openai.ChatMessageImageURL{
								URL: url,
							},
						},
						{
							Type: openai.ChatMessagePartTypeText,
							Text: "Please generate the title, description and tags of the artwork.",
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
		log.Errorw("openai", "err", err)
		return nil, err
	}

	var metadata MediaMetadata

	jsonStr := strings.ReplaceAll(strings.ReplaceAll(resp.Choices[0].Message.Content, "```json", ""), "```", "")

	log.Info("Generate image metadata", jsonStr)

	err = json.Unmarshal([]byte(jsonStr), &metadata)
	if err != nil {
		return nil, err
	}

	return &metadata, nil

}

func (l *LLM) GenerateArtworkAITag(url string, metadata MediaMetadata) ([]string, error) {
	resp, err := l.openAiClient.CreateChatCompletion(context.Background(),
		openai.ChatCompletionRequest{
			Model: "gpt-4o",
			Messages: []openai.ChatCompletionMessage{
				{
					Role: "system",
					Content: `Generate more detailed tags based on the pictures and metadata provided by the user. No less than 10 tags are generated and finally output in json format:
					{
					  "tags": ["tag1", "tag2", "tag3"],	
					}
					Please note that you only need to output the json fragment and do not need to output any other irrelevant content.  
					`,
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
						{
							Type: openai.ChatMessagePartTypeText,
							Text: fmt.Sprintf(`Title: %s, Description: %s, Tags: %s`, metadata.Title, metadata.Description, strings.Join(metadata.Tags, ",")),
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
		log.Errorw("openai", "err", err)
		return nil, err
	}

	data := make(map[string]interface{})

	jsonStr := strings.ReplaceAll(strings.ReplaceAll(resp.Choices[0].Message.Content, "```json", ""), "```", "")

	log.Info("Generate AI tags: ", jsonStr)

	err = json.Unmarshal([]byte(jsonStr), &data)
	if err != nil {
		log.Errorw("json.Unmarshal", "err", err)
		return nil, err
	}

	resultTags, ok := data["tags"].([]interface{})
	if !ok {
		return nil, fmt.Errorf("tags not found")
	}

	var tags []string

	for _, t := range resultTags {
		tag, ok := t.(string)
		if !ok {
			continue
		}
		tags = append(tags, tag)
	}

	return tags, nil
}
