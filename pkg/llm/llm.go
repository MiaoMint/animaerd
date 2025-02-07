package llm

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"sync"
	"time"

	"github.com/MiaoMint/animaerd/ent"
	"github.com/MiaoMint/animaerd/ent/artwork"
	"github.com/MiaoMint/animaerd/ent/comment"
	"github.com/MiaoMint/animaerd/ent/user"
	"github.com/MiaoMint/animaerd/ent/workflow"
	"github.com/gofiber/fiber/v2/log"
	"github.com/sashabaranov/go-openai"
)

type LLM struct {
	openAiClient *openai.Client
	entClient    *ent.Client
}

func NewLLM(openAiClient *openai.Client, entClient *ent.Client) *LLM {
	return &LLM{
		openAiClient: openAiClient,
		entClient:    entClient,
	}
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

type GenerateCommentResult struct {
	CanGenerate     bool   `json:"canGenerate"`
	WorkflowID      int    `json:"workflowID"`
	Prompt          string `json:"prompt"`
	ArtworkImageUrl string
	Height          int
	Width           int
}

// 评论生成的图片
func (l *LLM) GenerateCommentIs(commentId int) (*GenerateCommentResult, error) {

	dbComment, err := l.entClient.Comment.Query().
		Where(comment.IDEQ(commentId)).
		WithArtwork(func(aq *ent.ArtworkQuery) {
			aq.WithMedia()
		}).
		Only(context.Background())
	if err != nil {
		return nil, err
	}

	workflows, err := l.entClient.Workflow.Query().
		Select(workflow.FieldID,
			workflow.FieldName,
		).
		Where(workflow.TypeEQ(workflow.TypeCommentToImage), workflow.Enabled(true)).
		All(context.Background())
	if err != nil {
		return nil, err
	}

	workflowsByte, err := json.Marshal(workflows)
	if err != nil {
		return nil, err
	}

	systemPrompt := fmt.Sprintf(`
Please perform the following operations based on user comments:

1. **Intent analysis**: Determine whether the comment contains clear image modification requirements (such as negative comments/specific modification requirements)
- Positive keywords: blur/too dark/adjust/add/delete/color/style, etc.
- Reverse keywords: satisfied/good/very good/maintain, etc.

2. **Prompt generation rules** (only when canGenerate=true):
- Extract descriptive phrases (nouns/adjectives/verbs), separated by Chinese commas
- Filter non-visual related words (such as "expensive")
- Keep core modification requirements (such as "change red to blue" → "blue")

3. **Workflow matching logic**:
According to the following list, match the corresponding workflowID according to the requirements
%s
4. **Strict output requirements**:
- The complete JSON structure must be output, and the empty value field retains the key
- Make sure the Boolean value is lowercase and the ID is a numeric type

Example:
User comment: The background is too messy and the color is not coordinated. I hope to simplify the color tone
Output:
{
"canGenerate": true,
"prompt": "Simple background, harmonious tones, simple style",
"workflowID": 2
}`, string(workflowsByte))

	log.Info("GenerateCommentIs", systemPrompt)

	resp, err := l.openAiClient.CreateChatCompletion(context.Background(),
		openai.ChatCompletionRequest{
			Model: "gpt-4o",
			Messages: []openai.ChatCompletionMessage{
				{
					Role:    "system",
					Content: systemPrompt,
				},
				{
					Role:    "user",
					Content: dbComment.Content,
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

	var generationResult GenerateCommentResult

	jsonStr := strings.ReplaceAll(strings.ReplaceAll(resp.Choices[0].Message.Content, "```json", ""), "```", "")

	log.Info("GenerateCommentIs", jsonStr)

	err = json.Unmarshal([]byte(jsonStr), &generationResult)
	if err != nil {
		return nil, err
	}

	generationResult.Height = dbComment.Edges.Artwork[0].Edges.Media.Height
	generationResult.Width = dbComment.Edges.Artwork[0].Edges.Media.Width
	generationResult.ArtworkImageUrl = dbComment.Edges.Artwork[0].Edges.Media.URL

	return &generationResult, nil
}

type UserPersona struct {
	PreferredTags []string `json:"preferredTags"`
	Description   string   `json:"description"`
}

// GenerateUserPersona analyzes user's recent liked artworks and comments to generate their persona
func (l *LLM) GenerateUserPersona(ctx context.Context, userId int) (*UserPersona, error) {
	// Get user with their liked artworks and comments
	user, err := l.entClient.User.Query().
		Where(user.IDEQ(userId)).
		WithLikedArtworks(func(aq *ent.ArtworkQuery) {
			aq.WithTags().
				Order(ent.Desc(artwork.FieldCreateTime)).
				Limit(20)
		}).
		WithComments(func(cq *ent.CommentQuery) {
			cq.Order(ent.Desc(comment.FieldCreateTime)).
				Limit(20)
		}).
		Only(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch user data: %w", err)
	}

	// Collect artwork tags
	var artworkTags []string
	for _, artwork := range user.Edges.LikedArtworks {
		for _, tag := range artwork.Edges.Tags {
			artworkTags = append(artworkTags, tag.Name)
		}
	}

	// Collect comments
	var comments []string
	for _, comment := range user.Edges.Comments {
		comments = append(comments, comment.Content)
	}

	// Format data for analysis
	artworksStr := strings.Join(artworkTags, ", ")
	commentsStr := strings.Join(comments, "\n")

	resp, err := l.openAiClient.CreateChatCompletion(ctx,
		openai.ChatCompletionRequest{
			Model: "gpt-4",
			Messages: []openai.ChatCompletionMessage{
				{
					Role: openai.ChatMessageRoleSystem,
					Content: `Analyze the user's liked artworks and comments to generate a persona with their preferred tags and a brief description. Output in JSON format:
					{
						"preferredTags": ["tag1", "tag2", "tag3"],
						"description": "A brief description of user's art preferences and interests"
					}
					Generate at least 5 but no more than 10 specific tags that represent the user's art preferences.
					The description should be concise but informative about their taste in artwork.
					Please note that you only need to output the json fragment and do not need to output any other irrelevant content.`,
				},
				{
					Role: openai.ChatMessageRoleUser,
					Content: fmt.Sprintf(`Recent Liked Artwork Tags:
%s

Recent Comments:
%s`, artworksStr, commentsStr),
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

	var persona UserPersona

	jsonStr := strings.ReplaceAll(strings.ReplaceAll(resp.Choices[0].Message.Content, "```json", ""), "```", "")

	log.Info("Generate user persona: ", jsonStr)

	err = json.Unmarshal([]byte(jsonStr), &persona)
	if err != nil {
		return nil, err
	}

	return &persona, nil
}

type userDebounceKey struct {
	userId int
}

var userDebounceTimers = make(map[userDebounceKey]*time.Timer)
var userDebounceMutex sync.RWMutex

// TriggerUserPersonaGeneration triggers the generation of user persona with a debounce mechanism
// It will wait for 20 seconds after the last trigger before actually generating the persona
func (l *LLM) TriggerUserPersonaGeneration(userId int) {
	key := userDebounceKey{userId: userId}
	userDebounceMutex.Lock()
	defer userDebounceMutex.Unlock()

	// If there's an existing timer, stop it
	if timer, exists := userDebounceTimers[key]; exists {
		timer.Stop()
	}

	// Create a new timer
	userDebounceTimers[key] = time.AfterFunc(20*time.Second, func() {
		// Remove the timer from the map
		userDebounceMutex.Lock()
		delete(userDebounceTimers, key)
		userDebounceMutex.Unlock()

		// Generate the persona
		persona, err := l.GenerateUserPersona(context.Background(), userId)
		if err != nil {
			log.Errorw("failed to generate user persona", "userId", userId, "error", err)
			return
		}

		// Update user's recent tags in the database
		_, err = l.entClient.User.UpdateOneID(userId).
			SetPreferredTags(persona.PreferredTags).
			SetPreferredTagsDescription(persona.Description).
			Save(context.Background())
		if err != nil {
			log.Errorw("failed to update user recent tags", "userId", userId, "error", err)
			return
		}

		log.Infow("successfully updated user persona",
			"userId", userId,
			"preferredTags", persona.PreferredTags,
			"description", persona.Description)
	})
}
