package logger

import (
	"log"
	"time"
)

type SimpleLogger struct{}

func (l *SimpleLogger) Info(message string) {
	log.Println("INFO: " + time.Now().Format(time.RFC3339) + " - " + message)
}

func (l *SimpleLogger) Error(message string) {
	log.Println("ERROR: " + time.Now().Format(time.RFC3339) + " - " + message)
}

func (l *SimpleLogger) Debug(message string) {
	log.Println("DEBUG: " + time.Now().Format(time.RFC3339) + " - " + message)
}

func NewSimpleLogger() Logger {
	return &SimpleLogger{}
}
