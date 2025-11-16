package db_test

import (
	"backend/internal/api/db"
	"backend/pkg/env"
	"context"
	"testing"
	"time"

	"github.com/joho/godotenv"
)

func TestClientConnection(t *testing.T) {
	// Load URI from environment (load from project root)
	godotenv.Load("../../../.env")
	uri, err := env.NewSimpleEnv().GetRequired("MONGO_URI")
	if err != nil {
		t.Fatal("Error Loading MONGO_URI from environment variables:", err)
	}
	client, err := db.ConnectClient(uri)
	if err != nil {
		t.Fatal("Error connecting to MongoDB client:", err)
	}
	defer client.Disconnect(context.Background())
}

func TestDatabaseExistence(t *testing.T) {
	// Load URI and DB_NAME from environment (load from project root)
	godotenv.Load("../../../.env")
	e := env.NewSimpleEnv()
	uri, err := e.GetRequired("MONGO_URI")
	if err != nil {
		t.Fatal(err)
	}
	dbName := e.GetOrDefault("DB_NAME", "blog_db")
	client, err := db.ConnectClient(uri)
	if err != nil {
		t.Fatal(err)
	}
	defer client.Disconnect(context.Background())

	// Test database access and create a collection
	database := client.Database(dbName)
	if database == nil {
		t.Error("Failed to get database")
	}

	// Create a collection named "test_backend" and insert a test document
	collection := database.Collection("test_backend")
	testDoc := map[string]any{
		"test":      "This is a test document",
		"timestamp": time.Now(),
	}

	result, err := collection.InsertOne(context.Background(), testDoc)
	if err != nil {
		t.Fatal("Failed to insert test document:", err)
	}

	t.Log("Successfully created database: " + dbName)
	t.Log("Successfully created collection: test_backend")
	t.Log("Inserted document with ID:", result.InsertedID)
}
