package logger

import (
	"fmt"
	"time"
)

const (
	colorReset  = "\033[0m"
	colorRed    = "\033[31m"
	colorGreen  = "\033[32m"
	colorYellow = "\033[33m"
	colorBlue   = "\033[34m"
	timeFormat  = "2006-01-02 15:04:05"
)

type SimpleLogger struct{}

func (l *SimpleLogger) Info(message string) {
	fmt.Println(colorGreen + time.Now().Format(timeFormat) + " INFO - " + message + colorReset)
}

func (l *SimpleLogger) Error(message string) {
	fmt.Println(colorRed + time.Now().Format(timeFormat) + " ERROR - " + message + colorReset)
}

func (l *SimpleLogger) Debug(message string) {
	fmt.Println(colorBlue + time.Now().Format(timeFormat) + " DEBUG - " + message + colorReset)
}

func (l *SimpleLogger) Warn(message string) {
	fmt.Println(colorYellow + time.Now().Format(timeFormat) + " WARN - " + message + colorReset)
}

func NewSimpleLogger() Logger {
	offset := time.Now().Format("-07:00")
	fmt.Println("Logger initialized with timezone: UTC" + offset)
	return &SimpleLogger{}
}
