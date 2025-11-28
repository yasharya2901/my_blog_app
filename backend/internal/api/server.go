package api

import (
	"backend/internal/api/config"
	"backend/internal/api/db"
	"backend/internal/api/handlers"
	"backend/internal/api/repository"
	"backend/internal/api/routes"
	"backend/internal/api/services"
	"backend/pkg/logger"
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

var Log logger.Logger

func StartServer() {
	Log = logger.NewSimpleLogger()

	Log.Info("Starting server...")

	// Load environment variables
	envVars := config.GetEnvVars(Log)

	// Initialize database connection
	client, err := db.ConnectClient(envVars.DB_CONFIG.MONGO_URI)
	if err != nil {
		Log.Error("Failed to connect to database: " + err.Error())
		panic(err)
	}
	defer client.Disconnect(context.Background())

	// Create a default gin router
	router := gin.Default()

	server := http.Server{
		Addr:    ":" + envVars.SERVER_ENV.PORT,
		Handler: router,
	}

	// Implement graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	go func() {
		<-quit
		Log.Info("Shutting Down Server...")
		if err := server.Shutdown(context.Background()); err != nil {
			Log.Error("Server Shutdown Failed: " + err.Error())
		}
	}()

	apiGroup := router.Group("/api")

	v1Group := apiGroup.Group("/v1")

	blogHandler := initializeBlogService(client, envVars.DB_CONFIG.DB_NAME)
	userHandler := initializeUserService(client, envVars.DB_CONFIG.DB_NAME)

	// Register routes
	routes.RegisterBlogRoutes(v1Group, blogHandler)
	routes.RegisterUserRoutes(v1Group, userHandler)

	// Ping Endpoint
	router.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})

	Log.Info("Listening on port: " + envVars.SERVER_ENV.PORT)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		Log.Error("Server Failed to Start: " + err.Error())
	}

}

func initializeBlogService(client *mongo.Client, dbName string) *handlers.BlogHandler {
	blogRepo := repository.NewBlogRepository(client, dbName)
	blogService := services.NewBlogService(blogRepo)
	return handlers.NewBlogHandler(blogService)
}

func initializeUserService(client *mongo.Client, dbName string) *handlers.UserHandler {
	userRepo := repository.NewUserRepository(client, dbName)
	userService := services.NewUserService(userRepo)
	return handlers.NewUserHandler(userService)
}
