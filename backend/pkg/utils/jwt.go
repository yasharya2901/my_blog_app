package utils

import (
	"backend/internal/api/config"
	"backend/internal/api/constants"
	"errors"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

func HashPassword(password string) (string, error) {
	hashedBytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashedBytes), nil
}
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func CreateJWTToken(data any, exp string) (string, error) {

	expiryDuration, err := calculateExpiryDuration(exp)
	if err != nil {
		return "", err
	}
	dataMap := map[string]any{
		"data": data,
		"exp":  time.Now().Add(expiryDuration).Unix(),
		"iat":  time.Now().Unix(),
		"iss":  constants.APP_NAME,
	}
	token := generateToken(dataMap, expiryDuration)
	return token, nil
}

func calculateExpiryDuration(value string) (time.Duration, error) {

	if len(value) < 2 {
		return 0, errors.New(constants.InvalidJWTExpiryFormat)
	}

	numPart := value[:len(value)-1]
	unit := value[len(value)-1:]

	num, err := strconv.Atoi(numPart)
	if err != nil {
		return 0, errors.New(constants.InvalidNumberFormat)
	}

	switch unit {
	case "s":
		return time.Duration(num) * time.Second, nil
	case "m":
		return time.Duration(num) * time.Minute, nil
	case "h":
		return time.Duration(num) * time.Hour, nil
	case "d":
		return time.Duration(num) * 24 * time.Hour, nil
	case "w":
		return time.Duration(num) * 7 * 24 * time.Hour, nil
	case "M":
		return time.Duration(num) * 30 * 24 * time.Hour, nil // Approximate month duration
	case "y":
		return time.Duration(num) * 365 * 24 * time.Hour, nil // Approximate year duration
	default:
		return 0, errors.New(constants.InvalidTimeUnit)
	}
}

func generateToken(data map[string]any, expiryDuration time.Duration) string {
	jwtConf := config.GetJWTConfig()
	claims := jwt.MapClaims{
		"data": data["data"],
		"iss":  data["iss"],
		"exp":  data["exp"],
		"iat":  data["iat"],
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, _ := token.SignedString([]byte(jwtConf.SECRET))
	return signedToken
}
