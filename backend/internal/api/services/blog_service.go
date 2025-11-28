package services

import (
	"backend/internal/api/dto"
	"backend/internal/api/models"
	"backend/internal/api/repository"
	"context"
	"time"
)

type BlogService interface {
	GetAllBlogs(ctx context.Context) ([]models.Blog, error)
	CreateBlog(ctx context.Context, blogInput *dto.CreateBlogRequest) (any, error)
}

type blogService struct {
	BlogRepository repository.BlogRepository
}

func NewBlogService(blogRepo repository.BlogRepository) BlogService {
	return &blogService{
		BlogRepository: blogRepo,
	}
}

func (bs *blogService) GetAllBlogs(ctx context.Context) ([]models.Blog, error) {
	return bs.BlogRepository.FindAll(ctx)
}

func (bs *blogService) CreateBlog(ctx context.Context, blogInput *dto.CreateBlogRequest) (any, error) {
	// Convert string tags to Tag models
	tags := make([]models.Tag, len(blogInput.Tags))
	now := time.Now()
	for i, tagName := range blogInput.Tags {
		tags[i] = models.Tag{
			Name:      tagName,
			CreatedAt: now,
			UpdatedAt: now,
		}
	}

	blog := &models.Blog{
		Title:     blogInput.Title,
		Content:   blogInput.Content,
		Tags:      tags,
		CreatedAt: now,
		UpdatedAt: now,
	}
	return bs.BlogRepository.Create(ctx, blog)
}
