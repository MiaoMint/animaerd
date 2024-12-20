package router

import (
	"github.com/MiaoMint/animaerd/config"
	"github.com/MiaoMint/animaerd/handler"
	"github.com/MiaoMint/animaerd/pkg/result"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"

	jwtware "github.com/gofiber/contrib/jwt"
)

func InitRouter(app *fiber.App) {
	authGroup := app.Group("/auth")
	authGroup.Get("/:provider", handler.GetProviderAuthUrl)
	authGroup.Get("/:provider/callback", handler.ProviderCallback)

	artworkGroup := app.Group("/artwork")
	artworkGroup.Get("/", handler.GetArtworkList)

	// 以下需要普通用户鉴权的路由
	app.Use(jwtware.New(jwtware.Config{
		ContextKey: "token",
		SigningKey: jwtware.SigningKey{Key: []byte(config.C.JwtSecret)},
		SuccessHandler: func(c *fiber.Ctx) error {
			token := c.Locals("token").(*jwt.Token)
			claims := token.Claims.(jwt.MapClaims)
			c.Locals("userId", claims["userId"])
			c.Locals("isAdmin", claims["role"] == "admin")
			return c.Next()
		},
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			return c.Status(fiber.StatusUnauthorized).
				JSON(result.NewErrorResult("Unauthorized",
					fiber.StatusUnauthorized,
				))
		},
	}))

	// 用户相关路由
	userGroup := app.Group("/user")
	userGroup.Get("/", handler.GetUser)
	userGroup.Get("/:id", handler.GetUserById)
	userGroup.Put("/", handler.UpdateUser)
	userGroup.Put("/avatar", handler.UpdateUserAvatar)

	// artwork 相关路由
	artworkGroup.Get("/:id", handler.GetArtwork)
	artworkGroup.Get("/:id/comments", handler.GetArtworkComments)
	artworkGroup.Post("/media", handler.UploadMedia)
	artworkGroup.Post("/", handler.CreateArtwork)
	// 评论
	artworkGroup.Post("/:id/comment", handler.CreateArtworkComment)
	artworkGroup.Post("/:id/comment/:comment_id", handler.CreateReplyArtworkComment)
	artworkGroup.Get("/:id/comment/:comment_id", handler.GetArtworkCommentsByChild)
	artworkGroup.Post("/:id/like", handler.LikeArtwork)
	artworkGroup.Delete("/:id/like", handler.UnlikeArtwork)
	artworkGroup.Get("/:id/like", handler.GetArtworkLikeStatus)

	// 以下需要管理员鉴权的路由
	app.Use(func(c *fiber.Ctx) error {
		isAdmin := c.Locals("isAdmin").(bool)
		if !isAdmin {
			return c.Status(fiber.StatusUnauthorized).
				JSON(result.NewErrorResult("Unauthorized",
					fiber.StatusUnauthorized,
				))
		}
		return c.Next()
	})

	adminGroup := app.Group("/admin")
	adminGroup.Get("/comfyuinode", handler.GetComfyUiNodeList)
}
