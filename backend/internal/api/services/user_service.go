package services

import (
	"backend/internal/api/config"
	"backend/internal/api/constants"
	"backend/internal/api/models"
	"backend/internal/api/repository"
	"backend/pkg/utils"
	"context"
	"errors"
)

type UserService interface {
	CreateUser(ctx context.Context, username, email, name, password, role string) (any, error)
	GetUserByEmail(ctx context.Context, email string) (*models.User, error)
	GetUserByUsername(ctx context.Context, username string) (*models.User, error)
	LoginUser(ctx context.Context, username, email, password string) (*models.User, error)
}

type userService struct {
	UserRepository repository.UserRepository
}

func NewUserService(userRepo repository.UserRepository) UserService {
	return &userService{
		UserRepository: userRepo,
	}
}

func (us *userService) CreateUser(ctx context.Context, username, email, name, password, role string) (any, error) {

	if !config.IsAdminCreationAllowed() && role == constants.ROLE_ADMIN {
		return nil, errors.New(constants.ErrAdminCreationNotAllowed)
	}

	user := &models.User{
		Username: username,
		Email:    email,
		Name:     name,
		Role:     role,
	}

	// Find if user already exists
	existingUserByEmail, err := us.UserRepository.GetUserByEmail(ctx, email)
	if err != nil {
		return nil, err
	}
	if existingUserByEmail != nil {
		return nil, errors.New(constants.ErrEmailAlreadyExists)
	}

	existingUserByUsername, err := us.UserRepository.GetUserByUsername(ctx, username)
	if err != nil {
		return nil, err
	}
	if existingUserByUsername != nil {
		return nil, errors.New(constants.ErrUsernameAlreadyExists)
	}

	passwordHash, err := utils.HashPassword(password)
	if err != nil {
		return nil, err
	}
	user.Password = passwordHash
	insertedId, err := us.UserRepository.CreateUser(ctx, user)
	if err != nil {
		return nil, err
	}

	return insertedId, nil
}

func (us *userService) GetUserByEmail(ctx context.Context, email string) (*models.User, error) {
	return us.UserRepository.GetUserByEmail(ctx, email)
}

func (us *userService) GetUserByUsername(ctx context.Context, username string) (*models.User, error) {
	return us.UserRepository.GetUserByUsername(ctx, username)
}

func (us *userService) LoginUser(ctx context.Context, username, email, password string) (*models.User, error) {
	// Check whether to login by username or email
	var user *models.User
	if username != "" {
		res, err := us.GetUserByUsername(ctx, username)
		if err != nil {
			return nil, err
		}
		user = res
	} else {
		res, err := us.GetUserByEmail(ctx, email)
		if err != nil {
			return nil, err
		}
		user = res
	}

	if user == nil {
		return nil, errors.New(constants.ErrUserNotFound)
	}

	if !utils.CheckPasswordHash(password, user.Password) {
		return nil, errors.New(constants.ErrInvalidCredentials)
	}

	return user, nil
}
