package services

import (
	"backend/internal/api/constants"
	"backend/internal/api/models"
	"backend/internal/api/repository"
	"backend/pkg/utils"
	"context"
	"errors"
)

type UserService interface {
	CreateUser(ctx context.Context, username, email, name, password string) (any, error)
	GetUserByEmail(ctx context.Context, email string) (*models.User, error)
	GetUserByUsername(ctx context.Context, username string) (*models.User, error)
}

type userService struct {
	UserRepository repository.UserRepository
}

func NewUserService(userRepo repository.UserRepository) UserService {
	return &userService{
		UserRepository: userRepo,
	}
}

func (us *userService) CreateUser(ctx context.Context, username, email, name, password string) (any, error) {

	if !IsAdminCreationAllowed() {
		return nil, errors.New("admin creation is not allowed")
	}

	user := &models.User{
		Username: username,
		Email:    email,
		Name:     name,
		Role:     constants.ROLE_ADMIN,
	}

	passwordHash, err := utils.HashPassword(password)
	if err != nil {
		return nil, err
	}
	user.Password = passwordHash
	return us.UserRepository.CreateUser(ctx, user)
}

func (us *userService) GetUserByEmail(ctx context.Context, email string) (*models.User, error) {
	return us.UserRepository.GetUserByEmail(ctx, email)
}

func (us *userService) GetUserByUsername(ctx context.Context, username string) (*models.User, error) {
	return us.UserRepository.GetUserByUsername(ctx, username)
}
