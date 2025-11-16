package dto

type CreateBlogRequest struct {
	Title   string   `json:"title" binding:"required"`
	Content string   `json:"content" binding:"required"`
	Tags    []string `json:"tags"`
}

type CreateBlogResponse struct {
	ID string `json:"id"`
}
