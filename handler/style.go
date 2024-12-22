package handler

import (
	"bytes"
	"fmt"
	"net/http"
	"path"
	"strconv"
	"strings"
	"time"

	"github.com/MiaoMint/animaerd/dto"
	"github.com/MiaoMint/animaerd/ent"
	"github.com/MiaoMint/animaerd/ent/style"
	"github.com/MiaoMint/animaerd/ext"
	"github.com/MiaoMint/animaerd/pkg/result"
	"github.com/MiaoMint/animaerd/pkg/storage"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
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
	name := c.FormValue("name")
	_workflowID := c.FormValue("workflow_id")
	workflowID, err := strconv.Atoi(_workflowID)
	if err != nil {
		return c.JSON(result.NewErrorResult("Invalid workflow ID", 400))
	}
	fileHeader, err := c.FormFile("icon")
	if err != nil {
		return c.JSON(result.NewErrorResult("Invalid icon", 400))
	}

	file, err := fileHeader.Open()
	if err != nil {
		return err
	}

	size := fileHeader.Size
	buffer := make([]byte, size)
	file.Read(buffer)
	fileBytes := bytes.NewReader(buffer)
	fileType := http.DetectContentType(buffer)

	if !strings.HasPrefix(fileType, "image/") {
		return c.JSON(result.NewErrorResult("file type not allowed", 400))
	}

	fileExt := path.Ext(fileHeader.Filename)

	date := time.Now().Format("2006-01-02")
	randomID, err := uuid.NewRandom()
	if err != nil {
		return err
	}

	key := fmt.Sprintf("%s/%s%s", date, randomID.String(), fileExt)

	if _, err := ext.StorageClient().UploadFile(&storage.StorageFile{
		Key:           key,
		FileBytes:     fileBytes,
		ContentType:   fileType,
		ContentLength: size,
	}); err != nil {
		return err
	}

	url := ext.StorageClient().GetPublicFileURL(key)

	entClient := ext.EntClient()
	style, err := entClient.Style.Create().
		SetName(name).
		SetIcon(url).
		SetWorkflowsID(workflowID).
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

func UpdateStyleIcon(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.JSON(result.NewErrorResult("Invalid user ID", 400))
	}
	entClient := ext.EntClient()
	fileHeader, err := c.FormFile("file")
	if err != nil {
		return err
	}

	file, err := fileHeader.Open()
	if err != nil {
		return err
	}

	size := fileHeader.Size
	buffer := make([]byte, size)
	file.Read(buffer)
	fileBytes := bytes.NewReader(buffer)
	fileType := http.DetectContentType(buffer)

	if !strings.HasPrefix(fileType, "image/") {
		return c.JSON(result.NewErrorResult("file type not allowed", 400))
	}

	fileExt := path.Ext(fileHeader.Filename)

	date := time.Now().Format("2006-01-02")
	randomID, err := uuid.NewRandom()
	if err != nil {
		return err
	}

	key := fmt.Sprintf("%s/%s%s", date, randomID.String(), fileExt)

	if _, err := ext.StorageClient().UploadFile(&storage.StorageFile{
		Key:           key,
		FileBytes:     fileBytes,
		ContentType:   fileType,
		ContentLength: size,
	}); err != nil {
		return err
	}

	url := ext.StorageClient().GetPublicFileURL(key)

	_, err = entClient.Style.UpdateOneID(id).
		SetNillableIcon(&url).
		Save(c.Context())
	if err != nil {
		return err
	}

	return c.JSON(result.NewSuccessResult(nil))
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
