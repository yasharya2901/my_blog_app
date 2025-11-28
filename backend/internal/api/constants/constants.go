package constants

const (
	APP_NAME   = "my_blog_app"
	ROLE_ADMIN = "admin"
	ROLE_USER  = "user"
)

const (
	ErrUserNotFound            = "user not found"
	ErrInvalidCredentials      = "invalid credentials"
	ErrUsernameAlreadyExists   = "username already exists"
	ErrEmailAlreadyExists      = "email already exists"
	ErrAdminCreationNotAllowed = "admin creation is not allowed"
	ErrUnauthorized            = "unauthorized access"
)

const (
	InvalidJWTExpiryFormat = "invalid JWT expiry format"
	InvalidNumberFormat    = "invalid number format"
	InvalidTimeUnit        = "invalid time unit"
)
