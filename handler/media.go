package handler

import (
	"bytes"
	"fmt"
	"image"
	_ "image/jpeg"
	_ "image/png"
	"net/http"
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

	obj, err := ext.StorageClient().UploadFile(&storage.StorageFile{
		Key:           key,
		FileBytes:     fileBytes,
		ContentType:   fileType,
		ContentLength: size,
	})

	if err != nil {
		return err
	}

	md5 := strings.Trim(aws.ToString(obj.ETag), "\"")

	url := ext.StorageClient().GetPublicFileURL(key)

	img, _, err := image.Decode(bytes.NewBuffer(buffer))
	if err != nil {
		return err
	}

	bounds := img.Bounds()
	width := bounds.Max.X - bounds.Min.X
	height := bounds.Max.Y - bounds.Min.Y

	colours, err := prominentcolor.Kmeans(img)
	if err != nil {
		return err
	}

	_, err = ext.EntClient().Media.Create().
		SetKey(key).
		SetSize(int(size)).
		SetWidth(width).
		SetHeight(height).
		SetPrimaryCorlor(colours[0].AsString()).
		SetURL(url).
		SetHash(md5).
		Save(c.Context())

	if err != nil {
		return err
	}

	return c.JSON(result.NewSuccessResult(dto.CreateMediaResponse{
		Url:  url,
		Hash: md5,
	}))
}
