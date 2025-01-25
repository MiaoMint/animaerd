package handler

import (
	"fmt"
	"strings"
	"time"

	"github.com/MiaoMint/animaerd/dto"
	"github.com/MiaoMint/animaerd/ent/media"
	"github.com/MiaoMint/animaerd/ent/style"
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

func GenerateTextToImage(c *fiber.Ctx) error {
	var req dto.GenerateTextToImageRequest
	if err := c.BodyParser(&req); err != nil {
		return c.JSON(result.NewErrorResult("Invalid request", 400))
	}

	// 获取比例得到高宽参数
	aspectRatio, err := ext.EntClient().AspectRatio.Get(c.Context(), req.AspectRatioID)
	if err != nil {
		return err
	}

	// 获取样式
	style, err := ext.EntClient().Style.Query().
		Where(style.IDEQ(req.StyleID)).
		WithWorkflows().
		Only(c.Context())
	if err != nil {
		return err
	}

	// 拼接 prompt
	workflow := style.Edges.Workflows.JSON

	prompt := strings.ReplaceAll(workflow, "{prompt}", req.Text)
	prompt = strings.ReplaceAll(prompt, "{width}", fmt.Sprint(aspectRatio.Width))
	prompt = strings.ReplaceAll(prompt, "{height}", fmt.Sprint(aspectRatio.Height))

	comfy := ext.ComfyNodeManager()

	task, err := comfy.AddTask(prompt)
	if err != nil {
		return err
	}

	for {
		taskData, err := comfy.GetTask(task)
		if err != nil {
			return err
		}
		if taskData[task.PromptID] == nil {
			time.Sleep(1 * time.Second)
			continue
		}

		outputs := taskData[task.PromptID].(map[string]interface{})["outputs"].(map[string]interface{})
		resultNode := outputs[fmt.Sprint(style.Edges.Workflows.ImageResultNode)].(map[string]interface{})
		imageResult := resultNode["images"].([]interface{})[0].(map[string]interface{})
		imageFileName := imageResult["filename"].(string)
		buffer, contentType, err := comfy.GetImage(task.NodeID, imageFileName)
		if err != nil {
			return err
		}
		resp, err := UploadImage(buffer, contentType, imageFileName)
		if err != nil {
			return err
		}
		return c.JSON(result.NewSuccessResult(resp))
	}
}
