package handler

import (
	"context"
	"strings"

	"github.com/MiaoMint/animaerd/dto"
	"github.com/MiaoMint/animaerd/ent"
	"github.com/MiaoMint/animaerd/ent/artwork"
	"github.com/MiaoMint/animaerd/ent/media"
	"github.com/MiaoMint/animaerd/ent/tag"
	"github.com/MiaoMint/animaerd/ent/user"
	"github.com/MiaoMint/animaerd/ext"
	"github.com/MiaoMint/animaerd/pkg/llm"
	"github.com/MiaoMint/animaerd/pkg/result"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
)

func GetArtworkList(c *fiber.Ctx) error {
	entClient := ext.EntClient()

	// Get pagination parameters
	page := c.QueryInt("page", 1)
	pageSize := c.QueryInt("pageSize", 20)
	username := c.Query("username")
	commentGenerate := c.Query("commentGenerate")
	isLiked := c.Query("isLiked")

	// Calculate offset
	offset := (page - 1) * pageSize

	// Query images with pagination
	query := entClient.Artwork.Query().
		Offset(offset).
		Limit(pageSize).
		Order(ent.Desc(artwork.FieldCreateTime)).
		WithMedia().
		WithTags()

	if username != "" {
		if isLiked == "true" {
			query = query.Where(artwork.HasLikesWith(
				user.UsernameEQ(username),
			))
		} else {
			query = query.Where(artwork.HasOwnerWith(
				user.UsernameEQ(username),
			))
		}
	}

	if commentGenerate == "true" {
		query = query.Where(artwork.HasCommentGenerate())
	}

	if commentGenerate == "false" {
		query = query.Where(artwork.Not(artwork.HasCommentGenerate()))
	}

	artworks, err := query.All(c.Context())

	if err != nil {
		return err
	}

	var list []dto.ArtworkResponse

	for _, artwork := range artworks {
		var tags []string

		for _, tag := range artwork.Edges.Tags {
			tags = append(tags, tag.Name)
		}

		list = append(list, dto.ArtworkResponse{
			ID:            artwork.ID,
			Title:         artwork.Title,
			Description:   artwork.Description,
			URL:           artwork.Edges.Media.URL,
			Width:         artwork.Edges.Media.Width,
			Height:        artwork.Edges.Media.Height,
			PrimaryCorlor: artwork.Edges.Media.PrimaryCorlor,
			IsAI:          artwork.IsAi,
			Tags:          tags,
		})
	}

	return c.JSON(result.NewSuccessResult(list))
}

func GetArtwork(c *fiber.Ctx) error {
	artworkId, err := c.ParamsInt("id")
	userId := c.Locals("userId")

	if err != nil {
		return c.JSON(result.NewErrorResult("Invalid artwork id", 400))
	}

	entClient := ext.EntClient()

	// Get artwork by ID
	artwork, err := entClient.Artwork.Query().
		Where(artwork.IDEQ(artworkId)).
		WithMedia().
		WithTags(func(tq *ent.TagQuery) {
			tq.Where(tag.TypeEQ(tag.TypeUser))
		}).
		WithOwner().
		First(c.Context())

	if err != nil {
		return c.JSON(result.NewErrorResult("Artwork not found", 404))
	}

	var tags = []string{}

	for _, tag := range artwork.Edges.Tags {
		tags = append(tags, tag.Name)
	}

	return c.JSON(result.NewSuccessResult(dto.ArtworkResponse{
		ID:            artwork.ID,
		Title:         artwork.Title,
		Description:   artwork.Description,
		URL:           artwork.Edges.Media.URL,
		Width:         artwork.Edges.Media.Width,
		Height:        artwork.Edges.Media.Height,
		PrimaryCorlor: artwork.Edges.Media.PrimaryCorlor,
		IsAI:          artwork.IsAi,
		Tags:          tags,
		User: dto.UserResponse{
			ID:                artwork.Edges.Owner.ID,
			Username:          artwork.Edges.Owner.Username,
			Avatar:            artwork.Edges.Owner.Avatar,
			DisplayName:       artwork.Edges.Owner.DisplayName,
			Bio:               artwork.Edges.Owner.Bio,
			IsFavoritesPublic: artwork.Edges.Owner.IsFavoritesPublic,
			IsLikesPublic:     artwork.Edges.Owner.IsLikesPublic,
		},
		Likes:       artwork.QueryLikes().CountX(c.Context()),
		CreatedTime: artwork.CreateTime.Format("2006-01-02 15:04:05"),
		IsLiked: artwork.QueryLikes().
			Where(user.IDEQ(int(userId.(float64)))).
			ExistX(c.Context()),
	}))
}

func CreateArtwork(c *fiber.Ctx) error {
	entClient := ext.EntClient()
	userId := c.Locals("userId").(float64)

	// Parse request body
	var req dto.CreateArtworkRequest
	if err := c.BodyParser(&req); err != nil {
		return err
	}

	// find media
	media, err := entClient.Media.Query().
		Where(media.HashEQ(*req.MediaHash)).
		Only(c.Context())

	if err != nil {
		return c.JSON(result.NewErrorResult("Media not found", 404))
	}

	// 获取 tag
	tagIds := []int{}
	for _, t := range *req.Tags {
		findTag, err := entClient.Tag.Query().
			Where(tag.And(tag.NameEQ(t), tag.TypeEQ(tag.TypeUser))).
			Only(c.Context())

		if err != nil {
			if ent.IsNotFound(err) {
				findTag, err = entClient.Tag.Create().
					SetName(t).
					SetType(tag.TypeUser).
					Save(c.Context())
			}
			if err != nil {
				return err
			}
		}

		tagIds = append(tagIds, findTag.ID)
	}

	artwork, err := entClient.Artwork.Create().
		SetNillableTitle(req.Title).
		SetNillableDescription(req.Description).
		SetOwnerID(int(userId)).
		SetMediaID(media.ID).
		AddTagIDs(tagIds...).
		Save(c.Context())

	if err != nil {
		return c.JSON(result.NewErrorResult("Failed to create image", 500))
	}

	go func() {
		// Generate AI tags
		l := ext.LLMClient()
		tags, err := l.GenerateArtworkAITag(media.URL, llm.MediaMetadata{
			Title:       artwork.Title,
			Description: artwork.Description,
			Tags:        *req.Tags,
		})
		if err != nil {
			log.Errorw("Failed to generate AI tags", err)
			return
		}

		// Save AI tags
		tagIds := []int{}
		for _, t := range tags {
			findTag, err := entClient.Tag.Query().
				Where(tag.And(tag.NameEQ(t), tag.TypeEQ(tag.TypeAi))).
				Only(context.Background())

			if err != nil {
				if ent.IsNotFound(err) {
					findTag, err = entClient.Tag.Create().
						SetName(t).
						SetType(tag.TypeAi).
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

	}()

	return c.JSON(result.NewSuccessResult(artwork.ID))
}

func LikeArtwork(c *fiber.Ctx) error {
	entClient := ext.EntClient()
	userId := c.Locals("userId").(float64)
	artworkId, err := c.ParamsInt("id")
	if err != nil {
		return c.JSON(result.NewErrorResult("Invalid artwork id", 400))
	}

	artwork, err := entClient.Artwork.Query().
		Where(artwork.IDEQ(artworkId)).
		WithMedia().
		WithTags().
		WithOwner().
		First(c.Context())

	if err != nil {
		return c.JSON(result.NewErrorResult("Artwork not found", 404))
	}

	like, err := entClient.Artwork.UpdateOneID(artwork.ID).
		AddLikeIDs(int(userId)).
		Save(c.Context())

	if err != nil {
		return err
	}

	return c.JSON(result.NewSuccessResult(like.ID))
}

func UnlikeArtwork(c *fiber.Ctx) error {
	entClient := ext.EntClient()
	userId := c.Locals("userId").(float64)
	artworkId, err := c.ParamsInt("id")
	if err != nil {
		return c.JSON(result.NewErrorResult("Invalid artwork id", 400))
	}

	artwork, err := entClient.Artwork.UpdateOneID(artworkId).
		RemoveLikeIDs(int(userId)).
		Save(c.Context())

	if err != nil {
		return c.JSON(result.NewErrorResult("Failed to unlike artwork", 500))
	}

	return c.JSON(result.NewSuccessResult(artwork.ID))
}

func GetArtworkLikeStatus(c *fiber.Ctx) error {
	entClient := ext.EntClient()
	userId := c.Locals("userId").(float64)
	artworkId, err := c.ParamsInt("id")
	if err != nil {
		return c.JSON(result.NewErrorResult("Invalid artwork id", 400))
	}

	like, err := entClient.Artwork.Query().
		Where(
			artwork.And(
				artwork.IDEQ(artworkId),
				artwork.HasLikesWith(user.IDEQ(int(userId))),
			),
		).Exist(c.Context())

	if err != nil {
		return c.JSON(result.NewErrorResult("Failed to get artwork like status", 500))
	}

	return c.JSON(result.NewSuccessResult(like))
}

// SearchArtworks handles searching artworks with multiple tags and fuzzy search on title/description
func SearchArtworks(c *fiber.Ctx) error {
	entClient := ext.EntClient()

	// Get pagination parameters
	page := c.QueryInt("page", 1)
	pageSize := c.QueryInt("pageSize", 20)

	// Get search parameters
	query := c.Query("q", "")   // For title and description search
	tags := c.Query("tags", "") // Comma-separated tags

	// Calculate offset
	offset := (page - 1) * pageSize

	// Start building the query
	artworkQuery := entClient.Artwork.Query().
		WithMedia().
		WithTags().
		WithOwner()

	// Add title and description search if query is not empty
	if query != "" {
		artworkQuery = artworkQuery.Where(
			artwork.Or(
				artwork.TitleContains(query),
				artwork.DescriptionContains(query),
			),
		)
	}

	// Add tags filter if tags are provided
	if tags != "" {
		tagsList := strings.Split(tags, ",")
		if len(tagsList) > 0 {
			artworkQuery = artworkQuery.Where(
				artwork.HasTagsWith(
					tag.NameIn(tagsList...),
				),
			)
		}
	}

	// Apply pagination and ordering
	artworkQuery = artworkQuery.
		Offset(offset).
		Limit(pageSize).
		Order(ent.Desc(artwork.FieldCreateTime))

	// Execute the query
	artworks, err := artworkQuery.All(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).
			JSON(result.NewErrorResult("Failed to search artworks", fiber.StatusInternalServerError))
	}

	// Transform the results
	var list []dto.ArtworkResponse
	for _, artwork := range artworks {
		var tags []string
		for _, tag := range artwork.Edges.Tags {
			tags = append(tags, tag.Name)
		}

		list = append(list, dto.ArtworkResponse{
			ID:            artwork.ID,
			Title:         artwork.Title,
			Description:   artwork.Description,
			URL:           artwork.Edges.Media.URL,
			Width:         artwork.Edges.Media.Width,
			Height:        artwork.Edges.Media.Height,
			PrimaryCorlor: artwork.Edges.Media.PrimaryCorlor,
			IsAI:          artwork.IsAi,
			Tags:          tags,
			User: dto.UserResponse{
				ID:                artwork.Edges.Owner.ID,
				Username:          artwork.Edges.Owner.Username,
				Avatar:            artwork.Edges.Owner.Avatar,
				DisplayName:       artwork.Edges.Owner.DisplayName,
				Bio:               artwork.Edges.Owner.Bio,
				IsFavoritesPublic: artwork.Edges.Owner.IsFavoritesPublic,
				IsLikesPublic:     artwork.Edges.Owner.IsLikesPublic,
			},
			CreatedTime: artwork.CreateTime.Format("2006-01-02 15:04:05"),
		})
	}

	return c.JSON(result.NewSuccessResult(list))
}
