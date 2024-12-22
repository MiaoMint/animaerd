package handler

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/MiaoMint/animaerd/config"
	"github.com/MiaoMint/animaerd/ent/user"
	"github.com/MiaoMint/animaerd/ext"
	"github.com/MiaoMint/animaerd/pkg/result"
	"github.com/MiaoMint/animaerd/pkg/token"
	"github.com/gofiber/fiber/v2"
)

func GetProviderAuthUrl(c *fiber.Ctx) error {
	provider := c.Params("provider")
	switch provider {
	case "github":
		url := ext.GitHubOauth().AuthCodeURL(token.RandomString(16))
		return c.JSON(result.NewSuccessResult(url))
	case "google":
		url := ext.GoogleOauth().AuthCodeURL(token.RandomString(16))
		return c.JSON(result.NewSuccessResult(url))
	case "microsoft":
		url := ext.MicrosoftOauth().AuthCodeURL(token.RandomString(16))
		return c.JSON(result.NewSuccessResult(url))
	}
	return c.JSON(result.NewErrorResult("provider not found", 404))
}

func ProviderCallback(c *fiber.Ctx) error {
	provider := c.Params("provider")
	code := c.Query("code")

	switch provider {
	case "github":
		providerToken, err := ext.GitHubOauth().Exchange(c.UserContext(), code)
		if err != nil {
			return err
		}

		githubUser, err := ext.GitHubOauth().Client(c.UserContext(), providerToken).
			Get("https://api.github.com/user")
		if err != nil {
			return err
		}

		userInfo, err := parseHttpResponse(githubUser)
		if err != nil {
			return err
		}

		providerAccountId := fmt.Sprintf("%d", int(userInfo["id"].(float64)))
		displayName := fmt.Sprintf("%v", userInfo["login"])
		avatar := fmt.Sprint(userInfo["avatar_url"])

		return getUserLoginResp(c, user.ProviderGithub, providerAccountId, displayName, &avatar)

	case "google":
		token, err := ext.GoogleOauth().Exchange(c.Context(), code)
		if err != nil {
			return err
		}

		googleUser, err := ext.GoogleOauth().Client(c.UserContext(), token).
			Get("https://www.googleapis.com/oauth2/v1/userinfo")
		if err != nil {
			return err
		}

		userInfo, err := parseHttpResponse(googleUser)
		if err != nil {
			return err
		}

		providerAccountId := fmt.Sprintf("%s", userInfo["id"])
		displayName := fmt.Sprintf("%s", userInfo["name"])
		avatar := fmt.Sprintf("%s", userInfo["picture"])

		return getUserLoginResp(c, user.ProviderGoogle, providerAccountId, displayName, &avatar)
	case "microsoft":
		token, err := ext.MicrosoftOauth().Exchange(c.Context(), code)
		if err != nil {
			return err
		}

		microsoftUser, err := ext.MicrosoftOauth().Client(c.UserContext(), token).
			Get("https://graph.microsoft.com/v1.0/me")
		if err != nil {
			return err
		}

		userInfo, err := parseHttpResponse(microsoftUser)
		if err != nil {
			return err
		}

		providerAccountId := fmt.Sprintf("%s", userInfo["id"])
		displayName := fmt.Sprintf("%s", userInfo["displayName"])

		return getUserLoginResp(c, user.ProviderMicrosoft, providerAccountId, displayName, nil)
	}

	return c.JSON(result.NewErrorResult("provider not found", 404))
}

func parseHttpResponse(userInfo *http.Response) (map[string]interface{}, error) {
	data := make(map[string]interface{})
	err := json.NewDecoder(userInfo.Body).Decode(&data)
	return data, err
}

func getUserLoginResp(c *fiber.Ctx, provider user.Provider, providerAccountId string, displayName string, avatar *string) error {
	entClient := ext.EntClient()
	existUser, err := entClient.User.Query().
		Where(
			user.ProviderAccountID(providerAccountId),
			user.ProviderEQ(provider),
		).
		Only(c.UserContext())

	if err != nil {
		user, err := entClient.User.Create().
			SetDisplayName(displayName).
			SetProviderAccountID(providerAccountId).
			SetProvider(provider).
			SetNillableAvatar(avatar).
			Save(c.UserContext())
		if err != nil {
			return err
		}

		token, err := token.GetJwtToken(user.ID, user.Role.String())
		if err != nil {
			return err
		}

		return c.JSON(result.NewSuccessResult(token))
	}

	token, err := token.GetJwtToken(existUser.ID, existUser.Role.String())
	if err != nil {
		return err
	}

	return c.JSON(result.NewSuccessResult(token))
}

func LoginToDashboard(c *fiber.Ctx) error {
	tokenStr := c.Query("token")
	if tokenStr == "" {
		return c.JSON(result.NewErrorResult("Unauthorized", 401))
	}

	claims, err := token.ParseJwtToken(tokenStr)
	if err != nil {
		return c.JSON(result.NewErrorResult("token invalid", 401))
	}

	isAdmin := claims["role"] == "admin"

	if !isAdmin {
		return c.JSON(result.NewErrorResult("permission denied", 403))
	}

	// 跳转到 dashboard
	return c.Redirect(fmt.Sprintf("%s/login?token=%s", config.C.DashboardURL, tokenStr))
}
