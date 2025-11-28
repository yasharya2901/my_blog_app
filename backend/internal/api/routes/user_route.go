package routes

import (
	"backend/internal/api/handlers"

	"github.com/gin-gonic/gin"
)

func RegisterUserRoutes(rg *gin.RouterGroup, userHandler *handlers.UserHandler) {
	userGroup := rg.Group("/users")

	userGroup.POST("", userHandler.CreateUser)
	userGroup.POST("/login", userHandler.LoginUser)
}
