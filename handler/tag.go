package handler

import (
	"sort"

	"github.com/MiaoMint/animaerd/dto"
	"github.com/MiaoMint/animaerd/ent"
	"github.com/MiaoMint/animaerd/ent/tag"
	"github.com/MiaoMint/animaerd/ext"
	"github.com/MiaoMint/animaerd/pkg/result"
	"github.com/gofiber/fiber/v2"
)

// CreateTag creates a new tag
func CreateTag(c *fiber.Ctx) error {
	var req dto.CreateTagRequest
	if err := c.BodyParser(&req); err != nil {
		return err
	}

	entClient := ext.EntClient()

	t, err := entClient.Tag.Create().
		SetName(req.Name).
		SetType(tag.Type(req.Type)).
		Save(c.Context())

	if err != nil {
		if ent.IsConstraintError(err) {
			return c.JSON(result.NewErrorResult("Tag already exists", 400))
		}
		return err
	}

	return c.JSON(result.NewSuccessResult(dto.TagResponse{
		ID:   t.ID,
		Name: t.Name,
		Type: string(t.Type),
	}))
}

// GetTags returns all tags
func GetTags(c *fiber.Ctx) error {
	entClient := ext.EntClient()

	tags, err := entClient.Tag.Query().All(c.Context())
	if err != nil {
		return err
	}

	var resp []dto.TagResponse
	for _, t := range tags {
		resp = append(resp, dto.TagResponse{
			ID:   t.ID,
			Name: t.Name,
			Type: string(t.Type),
		})
	}

	return c.JSON(result.NewSuccessResult(resp))
}

// UpdateTag updates a tag
func UpdateTag(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return err
	}

	var req dto.UpdateTagRequest
	if err := c.BodyParser(&req); err != nil {
		return err
	}

	entClient := ext.EntClient()

	update := entClient.Tag.UpdateOneID(id)
	if req.Name != nil {
		update.SetName(*req.Name)
	}
	if req.Type != nil {
		update.SetType(tag.Type(*req.Type))
	}

	t, err := update.Save(c.Context())
	if err != nil {
		if ent.IsNotFound(err) {
			return c.JSON(result.NewErrorResult("Tag not found", 404))
		}
		if ent.IsConstraintError(err) {
			return c.JSON(result.NewErrorResult("Tag already exists", 400))
		}
		return err
	}

	return c.JSON(result.NewSuccessResult(dto.TagResponse{
		ID:   t.ID,
		Name: t.Name,
		Type: string(t.Type),
	}))
}

// DeleteTag deletes a tag
func DeleteTag(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return err
	}

	entClient := ext.EntClient()

	err = entClient.Tag.DeleteOneID(id).Exec(c.Context())
	if err != nil {
		if ent.IsNotFound(err) {
			return c.JSON(result.NewErrorResult("Tag not found", 404))
		}
		return err
	}

	return c.JSON(result.NewSuccessResult(nil))
}

// GetPopularTags returns tags sorted by artwork count with example artworks
func GetPopularTags(c *fiber.Ctx) error {
	entClient := ext.EntClient()

	// Get all tags with their artworks, ordered by artwork count
	tags, err := entClient.Tag.Query().
		WithArtworks(func(aq *ent.ArtworkQuery) {
			aq.WithMedia().
				WithLikes()
		}).
		Limit(10).
		All(c.Context())

	if err != nil {
		return c.JSON(result.NewErrorResult("Failed to fetch tags", 500))
	}

	// Convert to response format and sort by artwork count
	var popularTags []dto.PopularTagResponse
	for _, t := range tags {
		artworkCount := len(t.Edges.Artworks)
		if artworkCount == 0 {
			continue // Skip tags with no artworks
		}

		// Find the artwork with most likes for this tag
		var mostLikedArtwork *ent.Artwork
		maxLikes := -1
		for _, a := range t.Edges.Artworks {
			likesCount := len(a.Edges.Likes)
			if likesCount > maxLikes {
				maxLikes = likesCount
				mostLikedArtwork = a
			}
		}

		// Create response with example artwork
		tagResp := dto.PopularTagResponse{
			ID:           t.ID,
			Name:         t.Name,
			Type:         string(t.Type),
			ArtworkCount: artworkCount,
		}

		if mostLikedArtwork != nil && mostLikedArtwork.Edges.Media != nil {
			tagResp.ExampleArtwork = dto.ArtworkResponse{
				ID:            mostLikedArtwork.ID,
				URL:           mostLikedArtwork.Edges.Media.URL,
				Width:         mostLikedArtwork.Edges.Media.Width,
				Height:        mostLikedArtwork.Edges.Media.Height,
				PrimaryCorlor: mostLikedArtwork.Edges.Media.PrimaryCorlor,
				IsAI:          mostLikedArtwork.IsAi,
			}
		}

		popularTags = append(popularTags, tagResp)
	}

	// Sort tags by artwork count in descending order
	sort.Slice(popularTags, func(i, j int) bool {
		return popularTags[i].ArtworkCount > popularTags[j].ArtworkCount
	})

	return c.JSON(result.NewSuccessResult(popularTags))
}
