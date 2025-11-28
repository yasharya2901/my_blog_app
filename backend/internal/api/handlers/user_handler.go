package handlers

import (
	"backend/internal/api/constants"
	"backend/internal/api/dto"
	"backend/internal/api/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	userService services.UserService
}

func NewUserHandler(userService services.UserService) *UserHandler {
	return &UserHandler{
		userService: userService,
	}
}

func (uh *UserHandler) CreateUser(c *gin.Context) {
	var userInput dto.CreateUserRequest
	if err := c.ShouldBindJSON(&userInput); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	userId, err := uh.userService.CreateUser(c.Request.Context(), userInput.Username, userInput.Email, userInput.Name, userInput.Password, userInput.Role)
	if err != nil {
		if err.Error() == constants.ErrAdminCreationNotAllowed {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}

		if err.Error() == constants.ErrEmailAlreadyExists || err.Error() == constants.ErrUsernameAlreadyExists {
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": userId})
}

func (uh *UserHandler) LoginUser(c *gin.Context) {
	var loginInput dto.LoginRequest
	if err := c.ShouldBindJSON(&loginInput); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	user, err := uh.userService.LoginUser(c.Request.Context(), loginInput.Username, loginInput.Email, loginInput.Password)
	if err != nil {
		if err.Error() == constants.ErrUserNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}

		if err.Error() == constants.ErrInvalidCredentials {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var loginResponse dto.LoginResponse
	loginResponse.Success = true
	loginResponse.User.Username = user.Username
	loginResponse.User.Email = user.Email
	loginResponse.User.Name = user.Name
	c.JSON(http.StatusOK, loginResponse)
}
