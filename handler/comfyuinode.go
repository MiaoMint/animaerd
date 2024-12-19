package handler

import "github.com/gofiber/fiber/v2"

func GetComfyUiNodeList(c *fiber.Ctx) error {
	return c.SendString("ComfyUiNodeList")
}
