package config

import (
	"github.com/gofiber/fiber/v2/log"
	"github.com/ilyakaznacheev/cleanenv"
)

var C Config

type Config struct {
	Port                       string `yaml:"port" env:"PORT"`
	JwtSecret                  string `yaml:"jwt_secret" env:"JWT_SECRET"`
	JwtAccessExpire            int64  `yaml:"jwt_access_expire" env:"JWT_ACCESS_EXPIRE"`
	DatabaseSourceURL          string `yaml:"database_source_url" env:"DATABASE_SOURCE_URL"`
	RedisHost                  string `yaml:"redis_host" env:"REDIS_HOST"`
	RedisPort                  int    `yaml:"redis_port" env:"REDIS_PORT"`
	R2S3AccountID              string `yaml:"r2s3_account_id" env:"R2S3_ACCOUNT_ID"`
	R2S3AccessKeyID            string `yaml:"r2s3_access_key_id" env:"R2S3_ACCESS_KEY_ID"`
	R2S3AccessSecretKey        string `yaml:"r2s3_access_secret_key" env:"R2S3_ACCESS_SECRET_KEY"`
	R2S3Bucket                 string `yaml:"r2s3_bucket" env:"R2S3_BUCKET"`
	R2S3Host                   string `yaml:"r2s3_host" env:"R2S3_HOST"`
	OauthGoogleClientID        string `yaml:"oauth_google_client_id" env:"OAUTH_GOOGLE_CLIENT_ID"`
	OauthGoogleClientSecret    string `yaml:"oauth_google_client_secret" env:"OAUTH_GOOGLE_CLIENT_SECRET"`
	OauthGoogleRedirectURL     string `yaml:"oauth_google_redirect_url" env:"OAUTH_GOOGLE_REDIRECT_URL"`
	OauthGitHubClientID        string `yaml:"oauth_github_client_id" env:"OAUTH_GITHUB_CLIENT_ID"`
	OauthGitHubClientSecret    string `yaml:"oauth_github_client_secret" env:"OAUTH_GITHUB_CLIENT_SECRET"`
	OauthGitHubRedirectURL     string `yaml:"oauth_github_redirect_url" env:"OAUTH_GITHUB_REDIRECT_URL"`
	OauthMicrosoftClientID     string `yaml:"oauth_microsoft_client_id" env:"OAUTH_MICROSOFT_CLIENT_ID"`
	OauthMicrosoftClientSecret string `yaml:"oauth_microsoft_client_secret" env:"OAUTH_MICROSOFT_CLIENT_SECRET"`
	OauthMicrosoftRedirectURL  string `yaml:"oauth_microsoft_redirect_url" env:"OAUTH_MICROSOFT_REDIRECT_URL"`
}

func InitConfig() {
	err := cleanenv.ReadConfig("config.yml", &C)
	if err == nil {
		return
	}
	if err = cleanenv.ReadEnv(&C); err != nil {
		log.Fatal("Error loading config", err)
	}
}
