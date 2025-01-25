package handler

import (
	"github.com/MiaoMint/animaerd/ent/media"
	"github.com/MiaoMint/animaerd/ext"
	"github.com/MiaoMint/animaerd/pkg/result"
	"github.com/gofiber/fiber/v2"
)

func GenerateMediaMetadata(c *fiber.Ctx) error {
	hash := c.Params("hash")

	entClient := ext.EntClient()
	media, err := entClient.Media.
		Query().
		Where(media.HashEQ(hash)).
		Only(c.Context())

	if err != nil {
		return err
	}

	llmClient := ext.LLMClient()

	resp, err := llmClient.GenerateMetadata(media.URL)
	if err != nil {
		return err
	}

	return c.JSON(result.NewSuccessResult(resp))
}
