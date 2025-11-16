package env

import (
	"errors"
	"os"
	"strconv"
)

type SimpleEnv struct{}

func (e *SimpleEnv) GetOrDefault(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

func (e *SimpleEnv) GetOrDefaultInt(key string, defaultValue int) int {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	var intValue int
	_, err := strconv.Atoi(value)
	if err != nil {
		return defaultValue
	}
	return intValue
}

func (e *SimpleEnv) GetRequired(key string) (string, error) {
	value := os.Getenv(key)
	if value == "" {
		return "", errors.New("required environment variable " + key + " is not set")
	}
	return value, nil
}

func (e *SimpleEnv) GetRequiredInt(key string) (int, error) {
	value := os.Getenv(key)
	if value == "" {
		return 0, errors.New("required environment variable " + key + " is not set")
	}
	intValue, err := strconv.Atoi(value)
	if err != nil {
		return 0, errors.New("environment variable " + key + " is not a valid integer")
	}
	return intValue, nil
}

func NewSimpleEnv() Env {
	return &SimpleEnv{}
}
