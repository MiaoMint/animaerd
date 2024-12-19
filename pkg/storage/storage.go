package storage

import (
	"bytes"
	"context"
	"fmt"
	"log"
	"net/url"
	"time"

	"github.com/MiaoMint/animaerd/config"

	"github.com/aws/aws-sdk-go-v2/aws"
	s3config "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type StorageFile struct {
	FileBytes     *bytes.Reader
	Key           string
	ContentType   string
	ContentLength int64
}

type StorageClient struct {
	s3Client     *s3.Client
	bucket       string
	publicDomain string
}

func NewS3Client(c config.Config) (*StorageClient, error) {
	cfg, err := s3config.LoadDefaultConfig(context.TODO(),
		s3config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(c.R2S3AccessKeyID, c.R2S3AccessSecretKey, "")),
		s3config.WithRegion("auto"),
	)
	if err != nil {
		log.Fatal(err)
	}

	client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(fmt.Sprintf("https://%s.r2.cloudflarestorage.com", c.R2S3AccountID))
	})
	return &StorageClient{
		s3Client:     client,
		bucket:       c.R2S3Bucket,
		publicDomain: c.R2S3Host,
	}, nil
}

func (s *StorageClient) UploadFile(file *StorageFile) (obj *s3.PutObjectOutput, err error) {
	obj, err = s.s3Client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket:        aws.String(s.bucket),
		Key:           aws.String(file.Key),
		Body:          file.FileBytes,
		ContentType:   aws.String(file.ContentType),
		ContentLength: aws.Int64(file.ContentLength),
	})
	if err != nil {
		return nil, fmt.Errorf("unable to upload file to S3, %v", err)
	}

	return
}

func (s *StorageClient) GetFileURL(key string, expiry time.Duration) (string, error) {
	presigner := s3.NewPresignClient(s.s3Client)

	presignParams := &s3.GetObjectInput{
		Bucket: &s.bucket,
		Key:    &key,
	}

	presignedURL, err := presigner.PresignGetObject(context.TODO(), presignParams, s3.WithPresignExpires(expiry))
	if err != nil {
		return "", fmt.Errorf("unable to generate pre-signed URL, %v", err)
	}

	return presignedURL.URL, nil
}

func (s *StorageClient) GetPublicFileURL(key string) string {
	u := url.URL{
		Scheme: "https",
		Host:   s.publicDomain,
		Path:   key,
	}
	return u.String()
}
