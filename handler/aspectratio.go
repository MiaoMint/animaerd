package handler

import (
	"github.com/MiaoMint/animaerd/dto"
	"github.com/MiaoMint/animaerd/ent"
	"github.com/MiaoMint/animaerd/ent/aspectratio"
	"github.com/MiaoMint/animaerd/ext"
	"github.com/MiaoMint/animaerd/pkg/result"
	"github.com/gofiber/fiber/v2"
)

// GetAspectRatioList retrieves all aspect ratios
func GetAspectRatioList(c *fiber.Ctx) error {
	entClient := ext.EntClient()
	ratios, err := entClient.AspectRatio.Query().
		Order(ent.Asc(aspectratio.FieldRatio)).
		All(c.Context())

	if err != nil {
		return c.JSON(result.NewErrorResult("Failed to fetch aspect ratios", 500))
	}

	var list []dto.AspectRatioResponse
	for _, ratio := range ratios {
		list = append(list, dto.AspectRatioResponse{
			ID:     ratio.ID,
			Ratio:  ratio.Ratio,
			Width:  ratio.Width,
			Height: ratio.Height,
		})
	}

	return c.JSON(result.NewSuccessResult(list))
}

// GetAspectRatio retrieves a single aspect ratio by ID
func GetAspectRatio(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.JSON(result.NewErrorResult("Invalid aspect ratio ID", 400))
	}

	entClient := ext.EntClient()
	ratio, err := entClient.AspectRatio.Get(c.Context(), id)
	if err != nil {
		if ent.IsNotFound(err) {
			return c.JSON(result.NewErrorResult("Aspect ratio not found", 404))
		}
		return c.JSON(result.NewErrorResult("Failed to fetch aspect ratio", 500))
	}

	return c.JSON(result.NewSuccessResult(dto.AspectRatioResponse{
		ID:     ratio.ID,
		Ratio:  ratio.Ratio,
		Width:  ratio.Width,
		Height: ratio.Height,
	}))
}

// CreateAspectRatio creates a new aspect ratio
func CreateAspectRatio(c *fiber.Ctx) error {
	var req dto.CreateAspectRatioRequest

	if err := c.BodyParser(&req); err != nil {
		return c.JSON(result.NewErrorResult("Invalid request body", 400))
	}

	entClient := ext.EntClient()
	created, err := entClient.AspectRatio.Create().
		SetRatio(req.Ratio).
		SetWidth(req.Width).
		SetHeight(req.Height).
		Save(c.Context())

	if err != nil {
		return c.JSON(result.NewErrorResult("Failed to create aspect ratio", 500))
	}

	return c.JSON(result.NewSuccessResult(dto.AspectRatioResponse{
		ID:     created.ID,
		Ratio:  created.Ratio,
		Width:  created.Width,
		Height: created.Height,
	}))
}

// UpdateAspectRatio updates an existing aspect ratio
func UpdateAspectRatio(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.JSON(result.NewErrorResult("Invalid aspect ratio ID", 400))
	}

	var req dto.UpdateAspectRatioRequest
	if err := c.BodyParser(&req); err != nil {
		return c.JSON(result.NewErrorResult("Invalid request body", 400))
	}

	entClient := ext.EntClient()
	ratio, err := entClient.AspectRatio.UpdateOneID(id).
		SetNillableRatio(req.Ratio).
		SetNillableWidth(req.Width).
		SetNillableHeight(req.Height).
		Save(c.Context())

	if err != nil {
		if ent.IsNotFound(err) {
			return c.JSON(result.NewErrorResult("Aspect ratio not found", 404))
		}
		return c.JSON(result.NewErrorResult("Failed to update aspect ratio", 500))
	}

	return c.JSON(result.NewSuccessResult(dto.AspectRatioResponse{
		ID:     ratio.ID,
		Ratio:  ratio.Ratio,
		Width:  ratio.Width,
		Height: ratio.Height,
	}))
}

// DeleteAspectRatio deletes an aspect ratio
func DeleteAspectRatio(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.JSON(result.NewErrorResult("Invalid aspect ratio ID", 400))
	}

	entClient := ext.EntClient()
	err = entClient.AspectRatio.DeleteOneID(id).Exec(c.Context())
	if err != nil {
		if ent.IsNotFound(err) {
			return c.JSON(result.NewErrorResult("Aspect ratio not found", 404))
		}
		return c.JSON(result.NewErrorResult("Failed to delete aspect ratio", 500))
	}

	return c.JSON(result.NewSuccessResult(nil))
}
