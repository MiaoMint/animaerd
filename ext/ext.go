package ext

import (
	"context"
	"log"
	"runtime"

	"github.com/MiaoMint/animaerd/config"
	"github.com/MiaoMint/animaerd/ent"
	"github.com/MiaoMint/animaerd/pkg/storage"
	"github.com/gofiber/storage/redis/v3"
	_ "github.com/lib/pq"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/github"
	"golang.org/x/oauth2/google"
	"golang.org/x/oauth2/microsoft"
)

type oauthConfig struct {
	Google    *oauth2.Config
	GitHub    *oauth2.Config
	Microsoft *oauth2.Config
}

var (
	entClient     *ent.Client
	redisStore    *redis.Storage
	oauthConf     oauthConfig
	storageClient *storage.StorageClient
)

func EntClient() *ent.Client {
	if entClient != nil {
		return entClient
	}

	client, err := ent.Open("postgres", config.C.DatabaseSourceURL)
	if err != nil {
		log.Fatalf("failed opening connection to postgres: %v", err)
	}
	// Run the auto migration tool.
	if err := client.Schema.Create(context.Background()); err != nil {
		log.Fatalf("failed creating schema resources: %v", err)
	}

	entClient = client

	return client
}

func RedisStore() *redis.Storage {
	if redisStore != nil {
		return redisStore
	}

	store := redis.New(redis.Config{
		Host:      config.C.RedisHost,
		Port:      config.C.RedisPort,
		Database:  0,
		Reset:     false,
		TLSConfig: nil,
		Password:  config.C.RedisPassword,
		PoolSize:  10 * runtime.GOMAXPROCS(0),
	})

	redisStore = store

	return store
}

func StorageClient() *storage.StorageClient {
	if storageClient != nil {
		return storageClient
	}
	c := config.C
	client, err := storage.NewS3Client(c)
	if err != nil {
		log.Fatalf("failed creating s3 client: %v", err)
	}
	storageClient = client
	return client
}

func GoogleOauth() *oauth2.Config {
	if oauthConf.Google != nil {
		return oauthConf.Google
	}
	c := config.C
	conf := &oauth2.Config{
		ClientID:     c.OauthGoogleClientID,
		ClientSecret: c.OauthGoogleClientSecret,
		RedirectURL:  c.OauthGoogleRedirectURL,
		Scopes: []string{
			"https://www.googleapis.com/auth/userinfo.profile",
			"https://www.googleapis.com/auth/userinfo.email",
		},
		Endpoint: google.Endpoint,
	}
	oauthConf.Google = conf
	return conf
}

func GitHubOauth() *oauth2.Config {
	if oauthConf.GitHub != nil {
		return oauthConf.GitHub
	}
	c := config.C
	conf := &oauth2.Config{
		ClientID:     c.OauthGitHubClientID,
		ClientSecret: c.OauthGitHubClientSecret,
		RedirectURL:  c.OauthGitHubRedirectURL,
		Scopes:       []string{"user:email"},
		Endpoint:     github.Endpoint,
	}

	oauthConf.GitHub = conf
	return conf
}

func MicrosoftOauth() *oauth2.Config {
	if oauthConf.Microsoft != nil {
		return oauthConf.Microsoft
	}
	c := config.C
	conf := &oauth2.Config{
		ClientID:     c.OauthMicrosoftClientID,
		ClientSecret: c.OauthMicrosoftClientSecret,
		RedirectURL:  c.OauthMicrosoftRedirectURL,
		Scopes:       []string{"user.read"},
		Endpoint:     microsoft.AzureADEndpoint("common"),
	}

	oauthConf.Microsoft = conf
	return conf
}
