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
)

var Log logger.Logger
var EnvVars config.ENV

func StartServer() {
	Log = logger.NewSimpleLogger()

	Log.Info("Starting server...")

	// Load environment variables
	EnvVars.LoadEnv(Log)

	// Initialize database connection
	client, err := db.ConnectClient(EnvVars.DB_CONFIG.MONGO_URI)
	if err != nil {
		Log.Error("Failed to connect to database: " + err.Error())
		panic(err)
	}
	defer client.Disconnect(context.Background())

	// Create a default gin router
	router := gin.Default()

	server := http.Server{
		Addr:    ":" + EnvVars.SERVER_ENV.PORT,
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

	blogRepo := repository.NewBlogRepository(client, EnvVars.DB_CONFIG.DB_NAME)
	blogService := services.NewBlogService(blogRepo)
	blogHandler := handlers.NewBlogHandler(blogService)

	// Register blog routes
	routes.RegisterBlogRoutes(v1Group, blogHandler)

	// Ping Endpoint
	router.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})

	Log.Info("Listening on port: " + EnvVars.SERVER_ENV.PORT)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		Log.Error("Server Failed to Start: " + err.Error())
	}

}

func IsAdminCreationAllowed() bool {
	return EnvVars.ALLOW_ADMIN_CREATION
}
