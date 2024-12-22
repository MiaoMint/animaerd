package handler

import (
	"github.com/MiaoMint/animaerd/dto"
	"github.com/MiaoMint/animaerd/ent"
	"github.com/MiaoMint/animaerd/ent/style"
	"github.com/MiaoMint/animaerd/ext"
	"github.com/MiaoMint/animaerd/pkg/result"
	"github.com/gofiber/fiber/v2"
)

// GetStyleList retrieves all styles
func GetStyleList(c *fiber.Ctx) error {
	entClient := ext.EntClient()
	styles, err := entClient.Style.Query().
		Order(ent.Asc(style.FieldName)).
		All(c.Context())

	if err != nil {
		return c.JSON(result.NewErrorResult("Failed to fetch styles", 500))
	}

	var list []dto.StyleResponse
	for _, style := range styles {
		list = append(list, dto.StyleResponse{
			ID:   style.ID,
			Name: style.Name,
			Icon: style.Icon,
		})
	}

	return c.JSON(result.NewSuccessResult(list))
}

// GetStyle retrieves a single style by ID
func GetStyle(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.JSON(result.NewErrorResult("Invalid style ID", 400))
	}

	entClient := ext.EntClient()
	style, err := entClient.Style.Get(c.Context(), id)
	if err != nil {
		if ent.IsNotFound(err) {
			return c.JSON(result.NewErrorResult("Style not found", 404))
		}
		return c.JSON(result.NewErrorResult("Failed to fetch style", 500))
	}

	return c.JSON(result.NewSuccessResult(dto.StyleResponse{
		ID:   style.ID,
		Name: style.Name,
		Icon: style.Icon,
	}))
}

// CreateStyle creates a new style
func CreateStyle(c *fiber.Ctx) error {
	var req dto.CreateStyleRequest
	if err := c.BodyParser(&req); err != nil {
		return c.JSON(result.NewErrorResult("Invalid request body", 400))
	}

	entClient := ext.EntClient()
	style, err := entClient.Style.Create().
		SetName(req.Name).
		SetIcon(req.Icon).
		Save(c.Context())

	if err != nil {
		return c.JSON(result.NewErrorResult("Failed to create style", 500))
	}

	return c.JSON(result.NewSuccessResult(dto.StyleResponse{
		ID:   style.ID,
		Name: style.Name,
		Icon: style.Icon,
	}))
}

// UpdateStyle updates an existing style
func UpdateStyle(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.JSON(result.NewErrorResult("Invalid style ID", 400))
	}

	var req dto.UpdateStyleRequest
	if err := c.BodyParser(&req); err != nil {
		return c.JSON(result.NewErrorResult("Invalid request body", 400))
	}

	entClient := ext.EntClient()
	style, err := entClient.Style.UpdateOneID(id).
		SetNillableName(req.Name).
		SetNillableIcon(req.Icon).
		Save(c.Context())

	if err != nil {
		if ent.IsNotFound(err) {
			return c.JSON(result.NewErrorResult("Style not found", 404))
		}
		return c.JSON(result.NewErrorResult("Failed to update style", 500))
	}

	return c.JSON(result.NewSuccessResult(dto.StyleResponse{
		ID:   style.ID,
		Name: style.Name,
		Icon: style.Icon,
	}))
}

// DeleteStyle deletes a style
func DeleteStyle(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.JSON(result.NewErrorResult("Invalid style ID", 400))
	}

	entClient := ext.EntClient()
	err = entClient.Style.DeleteOneID(id).Exec(c.Context())
	if err != nil {
		if ent.IsNotFound(err) {
			return c.JSON(result.NewErrorResult("Style not found", 404))
		}
		return c.JSON(result.NewErrorResult("Failed to delete style", 500))
	}

	return c.JSON(result.NewSuccessResult(nil))
}
