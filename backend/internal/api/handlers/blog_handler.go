package handlers

import (
	"backend/internal/api/services"

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
		c.JSON(500, gin.H{"error": "Failed to retrieve blogs"})
		return
	}

	if len(blogs) == 0 {
		c.JSON(404, gin.H{"message": "No blogs found"})
		return
	}
	c.JSON(200, blogs)
}
