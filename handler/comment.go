package handler

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/MiaoMint/animaerd/dto"
	"github.com/MiaoMint/animaerd/ent"
	"github.com/MiaoMint/animaerd/ent/artwork"
	"github.com/MiaoMint/animaerd/ent/comment"
	"github.com/MiaoMint/animaerd/ent/tag"
	"github.com/MiaoMint/animaerd/ent/workflow"
	"github.com/MiaoMint/animaerd/ext"
	"github.com/MiaoMint/animaerd/pkg/result"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
)

func GetArtworkComments(c *fiber.Ctx) error {
	imageId, err := c.ParamsInt("id")
	if err != nil {
		return c.JSON(result.NewErrorResult("Invalid artwork id", 400))
	}

	entClient := ext.EntClient()
	// 按时间查询评论
	comments, err := entClient.Comment.Query().
		Where(comment.HasArtworkWith(artwork.IDEQ(imageId))).
		WithGeneratedArtwork(func(aq *ent.ArtworkQuery) {
			aq.WithMedia()
		}).
		WithAuthor().
		Order(ent.Desc(comment.FieldCreateTime)).
		Limit(10).
		All(c.Context())

	if err != nil {
		return err
	}

	var list []dto.CommentResponse

	for _, comment := range comments {
		var artwork dto.ArtworkResponse
		if comment.Edges.GeneratedArtwork != nil {
			artwork = dto.ArtworkResponse{
				ID:            comment.Edges.GeneratedArtwork.ID,
				URL:           comment.Edges.GeneratedArtwork.Edges.Media.URL,
				Description:   comment.Edges.GeneratedArtwork.Description,
				PrimaryCorlor: comment.Edges.GeneratedArtwork.Edges.Media.PrimaryCorlor,
				Title:         comment.Edges.GeneratedArtwork.Title,
				Width:         comment.Edges.GeneratedArtwork.Edges.Media.Width,
				Height:        comment.Edges.GeneratedArtwork.Edges.Media.Height,
				CreatedTime:   comment.Edges.GeneratedArtwork.CreateTime.String(),
				IsAI:          comment.Edges.GeneratedArtwork.IsAi,
			}
		}
		commentChildrenPreview := comment.QueryChildren().
			Order(ent.Asc("id")).
			WithAuthor().
			Limit(3).
			AllX(c.Context())
		var children []dto.CommentResponse
		for _, child := range commentChildrenPreview {
			children = append(children, dto.CommentResponse{
				ID:      child.ID,
				Content: child.Content,
				Author: dto.UserResponse{
					ID:                child.Edges.Author.ID,
					Username:          child.Edges.Author.Username,
					DisplayName:       child.Edges.Author.DisplayName,
					Avatar:            child.Edges.Author.Avatar,
					Bio:               child.Edges.Author.Bio,
					IsFavoritesPublic: child.Edges.Author.IsFavoritesPublic,
					IsLikesPublic:     child.Edges.Author.IsLikesPublic,
				},
				CreatedAt: child.CreateTime.String(),
			})
		}
		list = append(list, dto.CommentResponse{
			ID:      comment.ID,
			Content: comment.Content,
			Artwork: artwork,
			Author: dto.UserResponse{
				ID:                comment.Edges.Author.ID,
				Username:          comment.Edges.Author.Username,
				DisplayName:       comment.Edges.Author.DisplayName,
				Avatar:            comment.Edges.Author.Avatar,
				Bio:               comment.Edges.Author.Bio,
				IsFavoritesPublic: comment.Edges.Author.IsFavoritesPublic,
				IsLikesPublic:     comment.Edges.Author.IsLikesPublic,
			},
			Children:  children,
			CreatedAt: comment.CreateTime.String(),
		})
	}

	return c.JSON(result.NewSuccessResult(list))
}

func GetArtworkCommentsByChild(c *fiber.Ctx) error {
	commentId, err := c.ParamsInt("comment_id")
	if err != nil {
		return c.JSON(result.NewErrorResult("Invalid comment id", 400))
	}

	entClient := ext.EntClient()
	// 按时间查询评论
	comments, err := entClient.Comment.Query().
		Where(comment.HasParentWith(comment.IDEQ(commentId))).
		WithAuthor().
		WithGeneratedArtwork(func(aq *ent.ArtworkQuery) {
			aq.WithMedia()
		}).
		Order(ent.Desc(comment.FieldCreateTime)).
		Limit(10).
		All(c.Context())

	if err != nil {
		return err
	}

	var list []dto.CommentResponse

	for _, comment := range comments {
		var artwork dto.ArtworkResponse
		if comment.Edges.GeneratedArtwork != nil {
			artwork = dto.ArtworkResponse{
				ID:            comment.Edges.GeneratedArtwork.ID,
				URL:           comment.Edges.GeneratedArtwork.Edges.Media.URL,
				Description:   comment.Edges.GeneratedArtwork.Description,
				PrimaryCorlor: comment.Edges.GeneratedArtwork.Edges.Media.PrimaryCorlor,
				Title:         comment.Edges.GeneratedArtwork.Title,
				Width:         comment.Edges.GeneratedArtwork.Edges.Media.Width,
				Height:        comment.Edges.GeneratedArtwork.Edges.Media.Height,
				CreatedTime:   comment.Edges.GeneratedArtwork.CreateTime.String(),
				IsAI:          comment.Edges.GeneratedArtwork.IsAi,
			}
		}

		list = append(list, dto.CommentResponse{
			ID:      comment.ID,
			Content: comment.Content,
			Artwork: artwork,
			Author: dto.UserResponse{
				ID:                comment.Edges.Author.ID,
				Username:          comment.Edges.Author.Username,
				DisplayName:       comment.Edges.Author.DisplayName,
				Avatar:            comment.Edges.Author.Avatar,
				Bio:               comment.Edges.Author.Bio,
				IsFavoritesPublic: comment.Edges.Author.IsFavoritesPublic,
				IsLikesPublic:     comment.Edges.Author.IsLikesPublic,
			},
			CreatedAt: comment.CreateTime.String(),
		})
	}

	return c.JSON(result.NewSuccessResult(list))
}

func CreateArtworkComment(c *fiber.Ctx) error {
	entClient := ext.EntClient()
	userId := c.Locals("userId").(float64)
	artworkId, err := c.ParamsInt("id")
	if err != nil {
		return c.JSON(result.NewErrorResult("Invalid artwork id", 400))
	}

	request := dto.CreateCommentRequest{}
	if err := c.BodyParser(&request); err != nil {
		return c.JSON(result.NewErrorResult("Invalid request", 400))
	}

	comment, err := entClient.Comment.Create().
		SetAuthorID(int(userId)).
		SetContent(request.Content).
		Save(c.Context())

	if err != nil {
		return c.JSON(result.NewErrorResult("Failed to create comment", 500))
	}

	parentArtrotk, err := entClient.Artwork.UpdateOneID(artworkId).AddCommentIDs(comment.ID).Save(c.Context())
	if err != nil {
		return c.JSON(result.NewErrorResult("Failed to add comment to artwork", 500))
	}

	go func() {
		// 生成评论图片
		llmClient := ext.LLMClient()
		res, err := llmClient.GenerateCommentIs(comment.ID)
		if err != nil {
			return
		}

		if !res.CanGenerate || res.WorkflowID == 0 {
			log.Info("Can not generate comment")
			return
		}

		workflow, err := entClient.Workflow.Query().
			Where(workflow.IDEQ(res.WorkflowID)).
			First(context.Background())
		if err != nil {
			log.Error("Failed to get workflow", err)
			return
		}

		prompt := strings.ReplaceAll(workflow.JSON, "{prompt}", fmt.Sprintf("%s, %s", res.Prompt, parentArtrotk.Description))
		prompt = strings.ReplaceAll(prompt, "{width}", fmt.Sprint(res.Width))
		prompt = strings.ReplaceAll(prompt, "{imageInput}", fmt.Sprint(res.ArtworkImageUrl))
		prompt = strings.ReplaceAll(prompt, "{height}", fmt.Sprint(res.Height))

		log.Info("Prompt: ", prompt)

		comfy := ext.ComfyNodeManager()

		task, err := comfy.AddTask(prompt)
		if err != nil {
			log.Error("Failed to add task", err)
			return
		}

		timeout := time.After(5 * time.Minute)
		for {
			select {
			case <-timeout:
				log.Error("Task timeout after 1 minute")
				return
			default:
				taskData, err := comfy.GetTask(task)
				if err != nil {
					log.Error("Failed to get task data", err)
					return
				}
				if taskData[task.PromptID] == nil {
					time.Sleep(time.Second) // Wait 1 second before checking again
					continue
				}

				outputs := taskData[task.PromptID].(map[string]interface{})["outputs"].(map[string]interface{})
				_resultNode, ok := outputs[fmt.Sprint(workflow.ImageResultNode)]
				if !ok {
					log.Error("Result node not found")
					return
				}
				resultNode := _resultNode.(map[string]interface{})
				imageResult := resultNode["images"].([]interface{})[0].(map[string]interface{})
				imageFileName := imageResult["filename"].(string)
				buffer, contentType, err := comfy.GetImage(task.NodeID, imageFileName)
				if err != nil {
					log.Error("Failed to get image", err)
					return
				}
				media, err := UploadImage(buffer, contentType, imageFileName)
				if err != nil {
					log.Error("Failed to upload image", err)
					return
				}

				metadata, err := llmClient.GenerateMetadata(media.URL)
				if err != nil {
					log.Error("Failed to generate metadata", err)
					return
				}

				artwork, err := entClient.Artwork.Create().
					SetTitle(metadata.Title).
					SetDescription(metadata.Description).
					SetIsAi(true).
					SetOwnerID(int(userId)).
					SetMediaID(media.ID).
					Save(context.Background())
				if err != nil {
					log.Error("Failed to create artwork", err)
					return
				}

				_, err = entClient.Comment.
					UpdateOneID(comment.ID).
					SetGeneratedArtworkID(artwork.ID).
					Save(context.Background())
				if err != nil {
					log.Error("Failed to update comment", err)
					return
				}

				// Save AI tags
				tagIds := []int{}
				for _, t := range metadata.Tags {
					findTag, err := entClient.Tag.Query().
						Where(tag.And(tag.NameEQ(t), tag.TypeEQ(tag.TypeAi))).
						Only(context.Background())

					if err != nil {
						if ent.IsNotFound(err) {
							findTag, err = entClient.Tag.Create().
								SetName(t).
								SetType(tag.TypeUser).
								Save(context.Background())
						}
						if err != nil {
							log.Errorw("Failed to create tag", err)
							continue
						}
					}

					tagIds = append(tagIds, findTag.ID)
				}

				_, err = entClient.Artwork.UpdateOneID(artwork.ID).
					AddTagIDs(tagIds...).
					Save(context.Background())

				if err != nil {
					log.Errorw("Failed to save AI tags", err)
				}

				return // Exit after successful processing
			}
		}

	}()

	return c.JSON(result.NewSuccessResult(comment.ID))
}

func CreateReplyArtworkComment(c *fiber.Ctx) error {
	entClient := ext.EntClient()
	userId := c.Locals("userId").(float64)
	commentId, err := c.ParamsInt("comment_id")
	if err != nil {
		return c.JSON(result.NewErrorResult("Invalid comment id", 400))
	}

	request := dto.CreateCommentRequest{}
	if err := c.BodyParser(&request); err != nil {
		return c.JSON(result.NewErrorResult("Invalid request", 400))
	}

	var parentComment *ent.Comment

	parentComment, err = entClient.Comment.Query().
		Where(comment.IDEQ(commentId)).
		WithAuthor().
		WithParent().
		WithChildren().
		First(c.Context())

	if err != nil {
		return c.JSON(result.NewErrorResult("Comment not found", 404))
	}

	// 如果是回复的回复，找到最顶层的评论
	if parentComment.Edges.Parent != nil {
		parentComment = parentComment.Edges.Parent
	}

	comment, err := entClient.Comment.Create().
		SetContent("这是一个回复").
		SetParent(parentComment).
		SetDepth(1).
		SetAuthorID(int(userId)).
		SetContent(request.Content).
		Save(c.Context())

	if err != nil {
		return c.JSON(result.NewErrorResult("Failed to create comment", 500))
	}

	return c.JSON(result.NewSuccessResult(comment.ID))
}

// DeleteComment handles the deletion of a comment
func DeleteComment(c *fiber.Ctx) error {
	artworkId, err := c.ParamsInt("id")
	if err != nil {
		return c.JSON(result.NewErrorResult("Invalid artwork id", 400))
	}

	commentId, err := c.ParamsInt("comment_id")
	if err != nil {
		return c.JSON(result.NewErrorResult("Invalid comment id", 400))
	}

	userId := int(c.Locals("userId").(float64))
	isAdmin := c.Locals("isAdmin").(bool)
	entClient := ext.EntClient()

	// Get the comment
	comment, err := entClient.Comment.Query().
		Where(
			comment.ID(commentId),
			comment.HasArtworkWith(artwork.ID(artworkId)),
		).
		WithAuthor().
		Only(c.Context())

	if err != nil {
		if ent.IsNotFound(err) {
			return c.JSON(result.NewErrorResult("Comment not found", 404))
		}
		return err
	}

	// Check if user has permission to delete (either admin or comment author)
	if !isAdmin && comment.Edges.Author.ID != userId {
		return c.JSON(result.NewErrorResult("You don't have permission to delete this comment", 403))
	}

	// Delete the comment
	err = entClient.Comment.DeleteOne(comment).Exec(c.Context())
	if err != nil {
		return err
	}

	return c.JSON(result.NewSuccessResult("Comment deleted successfully"))
}
