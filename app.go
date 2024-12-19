package main

import (
	"fmt"

	"github.com/MiaoMint/animaerd/config"
	"github.com/MiaoMint/animaerd/ent"
	"github.com/MiaoMint/animaerd/pkg/result"
	"github.com/MiaoMint/animaerd/router"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

var EntClient *ent.Client

func main() {
	config.InitConfig()
	app := fiber.New(fiber.Config{
		AppName: "Animaerd",
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			return c.Status(code).JSON(result.NewResult(
				false,
				err.Error(),
				nil,
				code,
			))
		},
	})
	app.Use(logger.New())
	app.Use(cors.New())

	router.InitRouter(app)
	app.Listen(fmt.Sprintf(":%s", config.C.Port))

}
