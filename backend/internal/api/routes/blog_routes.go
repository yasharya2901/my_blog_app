package routes

import (
	"backend/internal/api/handlers"

	"github.com/gin-gonic/gin"
)

func RegisterBlogRoutes(rg *gin.RouterGroup, blogHandler *handlers.BlogHandler) {
	blogGroup := rg.Group("/blogs")

	blogGroup.GET("/", blogHandler.GetAllBlogs)
	// blogGroup.POST("/", blogHandler.CreateBlog)
	// blogGroup.GET("/:id", blogHandler.GetBlogByID)
	// blogGroup.PUT("/:id", blogHandler.UpdateBlog)
	// blogGroup.DELETE("/:id", blogHandler.DeleteBlog)
}
