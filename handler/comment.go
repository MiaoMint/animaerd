package handler

import (
	"github.com/MiaoMint/animaerd/dto"
	"github.com/MiaoMint/animaerd/ent"
	"github.com/MiaoMint/animaerd/ent/artwork"
	"github.com/MiaoMint/animaerd/ent/comment"
	"github.com/MiaoMint/animaerd/ext"
	"github.com/MiaoMint/animaerd/pkg/result"
	"github.com/gofiber/fiber/v2"
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

	_, err = entClient.Artwork.UpdateOneID(artworkId).AddCommentIDs(comment.ID).Save(c.Context())
	if err != nil {
		return c.JSON(result.NewErrorResult("Failed to add comment to artwork", 500))
	}

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
