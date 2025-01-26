package handler

import (
	"bytes"
	"context"
	"fmt"
	"image"
	_ "image/jpeg"
	_ "image/png"
	"io"
	"path"
	"strings"
	"time"

	"github.com/EdlinOrg/prominentcolor"
	"github.com/MiaoMint/animaerd/dto"
	"github.com/MiaoMint/animaerd/ent/media"
	"github.com/MiaoMint/animaerd/ext"
	"github.com/MiaoMint/animaerd/pkg/result"
	"github.com/MiaoMint/animaerd/pkg/storage"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

func UploadMedia(c *fiber.Ctx) error {
	// 检查 hash
	hash := c.FormValue("hash", "")

	// 如果 hash 不为空, 则检查是否已经上传过
	if hash != "" {
		exist, err := ext.EntClient().Media.Query().
			Where(media.HashEQ(hash)).
			Exist(c.Context())
		if err != nil {
			return err
		}
		if exist {
			return c.JSON(result.NewSuccessResult("Media already exists"))
		}

		return c.JSON(result.NewErrorResult("Media not exists", 1))
	}

	// 获取文件
	fileHeader, err := c.FormFile("file")
	if err != nil {
		return err
	}

	file, err := fileHeader.Open()

	if err != nil {
		return err
	}

	fileBytes, err := io.ReadAll(file)
	if err != nil {
		return err
	}
	// 上传文件
	resp, err := UploadImage(fileBytes, fileHeader.Header.Get("Content-Type"), fileHeader.Filename)
	if err != nil {
		return err
	}
	return c.JSON(result.NewSuccessResult(resp))
}

func UploadImage(buffer []byte, contentType string, fileName string) (*dto.CreateMediaResponse, error) {
	if !strings.HasPrefix(contentType, "image/") {
		return nil, fmt.Errorf("file type not allowed")
	}

	fileExt := path.Ext(fileName)

	date := time.Now().Format("2006-01-02")
	randomID, err := uuid.NewRandom()
	if err != nil {
		return nil, fmt.Errorf("failed to generate UUID: %v", err)
	}

	key := fmt.Sprintf("%s/%s%s", date, randomID.String(), fileExt)

	fileBytes := bytes.NewReader(buffer)
	size := int64(len(buffer))

	obj, err := ext.StorageClient().UploadFile(&storage.StorageFile{
		Key:           key,
		FileBytes:     fileBytes,
		ContentType:   contentType,
		ContentLength: size,
	})

	if err != nil {
		return nil, fmt.Errorf("failed to upload file: %v", err)
	}

	md5 := strings.Trim(aws.ToString(obj.ETag), "\"")

	url := ext.StorageClient().GetPublicFileURL(key)

	// Decode image to get width, height, and prominent color
	img, _, err := image.Decode(bytes.NewBuffer(buffer))
	if err != nil {
		return nil, fmt.Errorf("failed to decode image: %v", err)
	}

	bounds := img.Bounds()
	width := bounds.Dx()
	height := bounds.Dy()

	colours, err := prominentcolor.Kmeans(img)
	if err != nil {
		return nil, fmt.Errorf("failed to get prominent colors: %v", err)
	}

	_, err = ext.EntClient().Media.Create().
		SetKey(key).
		SetSize(int(size)).
		SetWidth(width).
		SetHeight(height).
		SetPrimaryCorlor(colours[0].AsString()).
		SetURL(url).
		SetHash(md5).
		Save(context.Background())

	if err != nil {
		return nil, err
	}

	return &dto.CreateMediaResponse{
		Url:  url,
		Hash: md5,
	}, nil
}
