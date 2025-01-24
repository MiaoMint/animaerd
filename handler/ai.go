package handler

import (
	"strconv"

	"github.com/MiaoMint/animaerd/ent/media"
	"github.com/MiaoMint/animaerd/ext"
	"github.com/MiaoMint/animaerd/pkg/result"
	"github.com/gofiber/fiber/v2"
)

func GenerateMediaMetadata(c *fiber.Ctx) error {
	_id := c.Params("id")
	id, err := strconv.Atoi(_id)
	if err != nil {
		return c.JSON(result.NewErrorResult("invalid id", fiber.StatusBadRequest))
	}

	entClient := ext.EntClient()
	media, err := entClient.Media.
		Query().
		Where(media.ID(id)).
		Only(c.Context())

	if err != nil {
		return c.JSON(result.NewErrorResult("media not found", fiber.StatusNotFound))
	}

	llmClient := ext.LLMClient()

	resp, err := llmClient.GenerateMetadata(media.URL)
	if err != nil {
		return c.JSON(result.NewErrorResult(err.Error(), fiber.StatusInternalServerError))
	}

	return c.JSON(result.NewSuccessResult(resp))
}
