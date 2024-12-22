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

func ParseJwtToken(tokenString string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte(config.C.JwtSecret), nil
	})
	if err != nil {
		return nil, err
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, err
	}
	return claims, nil
}
