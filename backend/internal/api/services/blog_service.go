package services

import (
	"backend/internal/api/models"
	"backend/internal/api/repository"
	"context"
)

type BlogService interface {
	GetAllBlogs(ctx context.Context) ([]models.Blog, error)
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

func (bs *blogService) CreateBlog(ctx context.Context, blog *models.Blog) (any, error) {
	return bs.BlogRepository.Create(ctx, blog)
}
