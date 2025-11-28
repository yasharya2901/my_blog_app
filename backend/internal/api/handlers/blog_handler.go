package handlers

import (
	"backend/internal/api/dto"
	"backend/internal/api/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

type BlogHandler struct {
	blogService services.BlogService
}

func NewBlogHandler(blogService services.BlogService) *BlogHandler {
	return &BlogHandler{blogService: blogService}
}

func (bh *BlogHandler) GetAllBlogs(c *gin.Context) {
	blogs, err := bh.blogService.GetAllBlogs(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve blogs"})
		return
	}

	if len(blogs) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "No blogs found"})
		return
	}
	c.JSON(http.StatusOK, blogs)
}

func (bh *BlogHandler) CreateBlog(c *gin.Context) {
	// Get Blog data from request body
	var blogInput dto.CreateBlogRequest
	if err := c.ShouldBindJSON(&blogInput); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	blogID, err := bh.blogService.CreateBlog(c.Request.Context(), &blogInput)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create blog"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": blogID})
}
