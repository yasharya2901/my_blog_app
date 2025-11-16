package logger

type Logger interface {
	Info(message string)
	Error(message string)
	Debug(message string)
	Warn(message string)
}
