package config

import (
	"backend/pkg/env"
	"backend/pkg/logger"

	"github.com/joho/godotenv"
)

type ENV struct {
	SERVER_ENV           SERVER_ENV
	DB_CONFIG            DB_CONFIG
	JWT_CONFIG           JWT_CONFIG
	ALLOW_ADMIN_CREATION bool
}

type SERVER_ENV struct {
	PORT string
}

type DB_CONFIG struct {
	MONGO_URI string
	DB_NAME   string
}

type JWT_CONFIG struct {
	SECRET                   string
	REFRESH_TOKEN_EXPIRES_IN string
	ACCESS_TOKEN_EXPIRES_IN  string
}

func (e *ENV) LoadEnv(Log logger.Logger) {
	// Load .env file
	godotenv.Load()

	// Load server environment variables
	env := env.NewSimpleEnv()
	e.SERVER_ENV.PORT = env.GetOrDefault("PORT", "8080")
	// Load database configuration from environment variables
	val, err := env.GetRequired("MONGO_URI")
	if err != nil {
		Log.Error("ENV Var MONGO_URI not set")
		panic(err)
	}
	e.DB_CONFIG.MONGO_URI = val
	e.DB_CONFIG.DB_NAME = env.GetOrDefault("DB_NAME", "blog_db")

	// Load JWT configuration from environment variables
	jwtSecret, err := env.GetRequired("JWT_SECRET")
	if err != nil {
		Log.Error("ENV Var JWT_SECRET not set")
		panic(err)
	}
	e.JWT_CONFIG.SECRET = jwtSecret
	e.JWT_CONFIG.REFRESH_TOKEN_EXPIRES_IN = env.GetOrDefault("REFRESH_TOKEN_EXPIRES_IN", "7d")
	e.JWT_CONFIG.ACCESS_TOKEN_EXPIRES_IN = env.GetOrDefault("ACCESS_TOKEN_EXPIRES_IN", "15m")

	// Check ALLOW_ADMIN_CREATION env var
	e.ALLOW_ADMIN_CREATION = env.GetOrDefault("ALLOW_ADMIN_CREATION", "false") == "true"
}
