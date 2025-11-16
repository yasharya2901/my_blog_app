package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Blog struct {
	ID             primitive.ObjectID `bson:"_id,omitempty"`
	Title          string             `bson:"title"`
	PublishingDate time.Time          `bson:"publishing_date"`
	Author         string             `bson:"author"`
	Content        string             `bson:"content"`
	Tags           []Tag              `bson:"tags"`
	CreatedAt      time.Time          `bson:"created_at"`
	UpdatedAt      time.Time          `bson:"updated_at"`
	DeletedAt      *time.Time         `bson:"deleted_at,omitempty"`
}

type Tag struct {
	ID        primitive.ObjectID `bson:"_id,omitempty"`
	Name      string             `bson:"name"`
	CreatedAt time.Time          `bson:"created_at"`
	UpdatedAt time.Time          `bson:"updated_at"`
	DeletedAt *time.Time         `bson:"deleted_at,omitempty"`
}
