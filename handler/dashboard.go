package handler

import (
	"time"

	"github.com/MiaoMint/animaerd/ent/artwork"
	"github.com/MiaoMint/animaerd/ent/comment"
	"github.com/MiaoMint/animaerd/ent/user"
	"github.com/MiaoMint/animaerd/ext"
	"github.com/MiaoMint/animaerd/pkg/result"
	"github.com/gofiber/fiber/v2"
)

// GetTotalUsers returns the total number of registered users
func GetTotalUsers(c *fiber.Ctx) error {
	entClient := ext.EntClient()
	count, err := entClient.User.Query().Count(c.Context())
	if err != nil {
		return err
	}
	return c.JSON(result.NewSuccessResult(count))
}

// GetTotalCommentGenerates returns the total number of artworks generated from comments
func GetTotalCommentGenerates(c *fiber.Ctx) error {
	entClient := ext.EntClient()
	count, err := entClient.Comment.Query().
		Where(comment.HasGeneratedArtwork()).
		Count(c.Context())
	if err != nil {
		return err
	}
	return c.JSON(result.NewSuccessResult(count))
}

// GetTotalArtworks returns the total number of artworks
func GetTotalArtworks(c *fiber.Ctx) error {
	entClient := ext.EntClient()
	count, err := entClient.Artwork.Query().Count(c.Context())
	if err != nil {
		return err
	}
	return c.JSON(result.NewSuccessResult(count))
}

type MonthData struct {
	Date     string `json:"date"`
	User     int    `json:"user"`
	Generate int    `json:"generate"`
}

// GetRecentThreeMonthData returns user registration and AI artwork generation data for the last three months
func GetRecentThreeMonthData(c *fiber.Ctx) error {
	entClient := ext.EntClient()
	// Get current time
	now := time.Now()
	// Get date 3 months ago
	threeMonthsAgo := now.AddDate(0, -3, 0)

	var data []MonthData

	// Query data day by day for the last 3 months
	for d := threeMonthsAgo; d.Before(now) || d.Equal(now); d = d.AddDate(0, 0, 1) {
		dayStart := time.Date(d.Year(), d.Month(), d.Day(), 0, 0, 0, 0, d.Location())
		dayEnd := dayStart.AddDate(0, 0, 1)

		// Count users registered on this day
		userCount, err := entClient.User.Query().
			Where(user.CreateTimeGTE(dayStart), user.CreateTimeLT(dayEnd)).
			Count(c.Context())
		if err != nil {
			return err
		}

		// Count artworks generated on this day
		generateCount, err := entClient.Artwork.Query().
			Where(artwork.CreateTimeGTE(dayStart), artwork.CreateTimeLT(dayEnd), artwork.IsAi(true)).
			Count(c.Context())
		if err != nil {
			return err
		}

		// Add data for every day, even if there's no activity
		data = append(data, MonthData{
			Date:     dayStart.Format("2006-01-02"),
			User:     userCount,
			Generate: generateCount,
		})
	}

	return c.JSON(result.NewSuccessResult(data))
}
