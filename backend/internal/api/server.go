package api

import (
	"backend/pkg/logger"

	"github.com/gin-gonic/gin"
)

func StartServer() {
	log := logger.NewSimpleLogger()

	log.Info("Server Starting")

	// Create a default gin router
	r := gin.Default()

	env := &ENV{}
	env.LoadEnv()

	log.Info("Listening on port: " + env.SERVER_ENV.PORT)
	r.Run(":" + env.SERVER_ENV.PORT)

}
