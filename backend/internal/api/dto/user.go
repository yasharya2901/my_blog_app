package dto

type CreateUserRequest struct {
	Username string `json:"username" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Name     string `json:"name" binding:"required"`
	Role     string `json:"role" binding:"required,oneof=admin user"`
}

type CreateUserResponse struct {
	ID string `json:"id"`
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password" binding:"required"`
	Email    string `json:"email"`
}

type LoginResponse struct {
	Success bool `json:"success"`
	User    struct {
		Username string `json:"username"`
		Email    string `json:"email"`
		Name     string `json:"name"`
	} `json:"user"`
}
