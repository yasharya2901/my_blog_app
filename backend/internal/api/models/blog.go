package models

import (
	"time"

	"github.com/google/uuid"
)

type Blog struct {
	ID             uuid.UUID
	Title          string
	PublishingDate time.Time
	Author         string
	Content        string
	Tags           []Tag
	CreatedAt      time.Time
	UpdatedAt      time.Time
	DeletedAt      *time.Time
}

type Tag struct {
	ID        uuid.UUID
	Name      string
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt *time.Time
}
