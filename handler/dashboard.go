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
	threeMonthsAgo := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location()).AddDate(0, -3, 0)

	// Get all user registrations in one query
	userRegistrations, err := entClient.User.Query().
		Where(user.CreateTimeGTE(threeMonthsAgo)).
		Select(user.FieldCreateTime).
		All(c.Context())
	if err != nil {
		return err
	}

	// Get all AI artworks in one query
	aiArtworks, err := entClient.Artwork.Query().
		Where(
			artwork.CreateTimeGTE(threeMonthsAgo),
			artwork.IsAi(true),
		).
		Select(artwork.FieldCreateTime).
		All(c.Context())
	if err != nil {
		return err
	}

	// Create a map to store daily counts
	dailyData := make(map[string]*MonthData)

	// Initialize all dates in the range
	for d := threeMonthsAgo; d.Before(now) || d.Equal(now); d = d.AddDate(0, 0, 1) {
		dateStr := d.Format("2006-01-02")
		dailyData[dateStr] = &MonthData{
			Date:     dateStr,
			User:     0,
			Generate: 0,
		}
	}

	// Count user registrations
	for _, u := range userRegistrations {
		dateStr := u.CreateTime.Format("2006-01-02")
		if data, exists := dailyData[dateStr]; exists {
			data.User++
		}
	}

	// Count AI artwork generations
	for _, a := range aiArtworks {
		dateStr := a.CreateTime.Format("2006-01-02")
		if data, exists := dailyData[dateStr]; exists {
			data.Generate++
		}
	}

	// Convert map to slice in chronological order
	var data []MonthData
	for d := threeMonthsAgo; d.Before(now) || d.Equal(now); d = d.AddDate(0, 0, 1) {
		dateStr := d.Format("2006-01-02")
		if dailyStats, exists := dailyData[dateStr]; exists {
			data = append(data, *dailyStats)
		}
	}

	return c.JSON(result.NewSuccessResult(data))
}
