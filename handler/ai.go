package handler

import "github.com/gofiber/fiber/v2"

func GetMediaDesc(c *fiber.Ctx) error {
	return c.SendString("GetMediaDesc")
}
