package env

type Env interface {
	GetOrDefault(key, defaultValue string) string
	GetOrDefaultInt(key string, defaultValue int) int
	GetRequired(key string) (string, error)
	GetRequiredInt(key string) (int, error)
}
