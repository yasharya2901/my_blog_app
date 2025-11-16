package repository

import (
	"backend/internal/api/models"
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type BlogRepository interface {
	FindAll(ctx context.Context) ([]models.Blog, error)
	Create(ctx context.Context, blog *models.Blog) (any, error)
}

type blogRepository struct {
	client *mongo.Client
	dbName string
}

func NewBlogRepository(client *mongo.Client, dbName string) BlogRepository {
	return &blogRepository{
		client: client,
		dbName: dbName,
	}
}

func (br *blogRepository) FindAll(ctx context.Context) ([]models.Blog, error) {
	collection := br.client.Database(br.dbName).Collection("blogs")
	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var blogs []models.Blog
	if err = cursor.All(ctx, &blogs); err != nil {
		return nil, err
	}
	return blogs, nil
}

func (br *blogRepository) Create(ctx context.Context, blog *models.Blog) (any, error) {
	collection := br.client.Database(br.dbName).Collection("blogs")
	result, err := collection.InsertOne(ctx, blog)
	if err != nil {
		return nil, err
	}
	return result.InsertedID, nil
}
