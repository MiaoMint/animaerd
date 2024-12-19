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
	"github.com/MiaoMint/animaerd/ent/user"
	"github.com/MiaoMint/animaerd/ext"
	"github.com/MiaoMint/animaerd/pkg/result"
	"github.com/MiaoMint/animaerd/pkg/storage"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

func GetUser(c *fiber.Ctx) error {
	userId := c.Locals("userId").(float64)
	entClient := ext.EntClient()
	user, err := entClient.User.Get(c.Context(), int(userId))

	if err != nil {
		return err
	}

	return c.JSON(result.NewSuccessResult(dto.UserResponse{
		ID:                user.ID,
		Username:          user.Username,
		DisplayName:       user.DisplayName,
		Avatar:            user.Avatar,
		Bio:               user.Bio,
		IsFavoritesPublic: user.IsFavoritesPublic,
		IsLikesPublic:     user.IsLikesPublic,
	}))
}

// GetUserById 获取用户信息如果传入的是数字则按照 ID 查询，否则按照用户名查询
func GetUserById(c *fiber.Ctx) error {
	id := c.Params("id")
	userIdInt, err := strconv.Atoi(id)
	if err != nil {
		userIdInt = 0
	}
	entClient := ext.EntClient()
	user, err := entClient.User.Query().Where(user.Or(user.Username(id), user.IDEQ(userIdInt))).
		Only(c.Context())

	if err != nil {
		return err
	}

	return c.JSON(result.NewSuccessResult(dto.UserResponse{
		ID:                user.ID,
		Username:          user.Username,
		DisplayName:       user.DisplayName,
		Avatar:            user.Avatar,
		Bio:               user.Bio,
		IsFavoritesPublic: user.IsFavoritesPublic,
		IsLikesPublic:     user.IsLikesPublic,
	}))
}

func UpdateUser(c *fiber.Ctx) error {
	userId := c.Locals("userId").(float64)
	entClient := ext.EntClient()
	var req dto.UpdateUserRequest
	if err := c.BodyParser(&req); err != nil {
		return err
	}

	// 判断用户名是否已存在
	if req.Username != nil {
		_, err := entClient.User.Query().Where(user.UsernameEQ(*req.Username)).Only(c.Context())
		if err == nil {
			return c.JSON(result.NewErrorResult("username already exists", 400))
		}
	}

	_, err := entClient.User.UpdateOneID(int(userId)).
		SetNillableUsername(req.Username).
		SetNillableDisplayName(req.DisplayName).
		SetNillableBio(req.Bio).
		SetNillableIsFavoritesPublic(&req.IsFavoritesPublic).
		SetNillableIsLikesPublic(&req.IsLikesPublic).
		Save(c.Context())
	if err != nil {
		return err
	}

	return c.JSON(result.NewSuccessResult(nil))
}

func UpdateUserAvatar(c *fiber.Ctx) error {
	userId := c.Locals("userId").(float64)
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

	_, err = entClient.User.UpdateOneID(int(userId)).
		SetNillableAvatar(&url).
		Save(c.Context())
	if err != nil {
		return err
	}

	return c.JSON(result.NewSuccessResult(nil))
}
