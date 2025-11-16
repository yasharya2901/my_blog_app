package repository

import (
	"backend/internal/api/models"
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type UserRepository interface {
	CreateUser(ctx context.Context, user *models.User) (any, error)
	GetUserByEmail(ctx context.Context, email string) (*models.User, error)
	GetUserByUsername(ctx context.Context, username string) (*models.User, error)
}

type userRepository struct {
	client *mongo.Client
	dbName string
}

func NewUserRepository(client *mongo.Client, dbName string) UserRepository {
	return &userRepository{
		client: client,
		dbName: dbName,
	}
}

func (ur *userRepository) CreateUser(ctx context.Context, user *models.User) (any, error) {
	collection := ur.client.Database(ur.dbName).Collection("users")
	result, err := collection.InsertOne(ctx, user)
	if err != nil {
		return nil, err
	}
	return result.InsertedID, nil
}

func (ur *userRepository) GetUserByEmail(ctx context.Context, email string) (*models.User, error) {
	collection := ur.client.Database(ur.dbName).Collection("users")
	var user models.User
	err := collection.FindOne(ctx, bson.M{"email": email}).Decode(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (ur *userRepository) GetUserByUsername(ctx context.Context, username string) (*models.User, error) {
	collection := ur.client.Database(ur.dbName).Collection("users")
	var user models.User
	err := collection.FindOne(ctx, bson.M{"username": username}).Decode(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}
