package token

import (
	"math/rand/v2"
	"time"

	"github.com/MiaoMint/animaerd/config"
	"github.com/golang-jwt/jwt/v5"
)

func RandomNumber(n int) string {
	var letters = []rune("0123456789")
	b := make([]rune, n)
	for i := range b {
		b[i] = letters[rand.IntN(len(letters))]
	}
	return string(b)
}

func RandomString(n int) string {
	var letters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")
	b := make([]rune, n)
	for i := range b {
		b[i] = letters[rand.IntN(len(letters))]
	}
	return string(b)
}

func GetJwtToken(userId int, role string) (string, error) {
	iat := time.Now().Unix()
	claims := jwt.MapClaims{
		"exp":    iat + config.C.JwtAccessExpire,
		"iat":    iat,
		"userId": userId,
		"role":   role,
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(config.C.JwtSecret))
}
