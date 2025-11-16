package api

import (
	"backend/pkg/env"
)

type ENV struct {
	SERVER_ENV SERVER_ENV
	DB_CONFIG  DB_CONFIG
}

type SERVER_ENV struct {
	PORT string
}

type DB_CONFIG struct {
	HOST string
	PORT string
	USER string
	PASS string
	NAME string
}

func (e *ENV) LoadEnv() {
	// Load server environment variables
	env := env.NewSimpleEnv()
	e.SERVER_ENV.PORT = env.GetOrDefault("PORT", "8080")
	// Load database configuration from environment variables
	e.DB_CONFIG.HOST = env.GetOrDefault("DB_HOST", "localhost")
	e.DB_CONFIG.PORT = env.GetOrDefault("DB_PORT", "5432")
	e.DB_CONFIG.USER = env.GetOrDefault("DB_USER", "user")
	e.DB_CONFIG.PASS = env.GetOrDefault("DB_PASS", "password")
	e.DB_CONFIG.NAME = env.GetOrDefault("DB_NAME", "mydb")
}
