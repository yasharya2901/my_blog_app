import type { Blog, BlogSlugGenerateResponse, BlogSlugVerifyResponse, DeleteResponse } from "../types/blog";
import { apiClient } from "./client";


export const blogApi = {
    async getAllBlogs(limit: number, offset: number): Promise<Blog[]> {
        return apiClient<Blog[]>("/blogs", {method: "GET"}, {limit, offset});
    },

    async getAllBlogsOfTag(tagSlug: string, limit: number, offset: number): Promise<Blog[]> {
        return apiClient<Blog[]>(`/blogs/tag/${tagSlug}`, {method: "GET"}, {limit, offset});
    },

    async getABlogUsingSlug(blogSlug: string): Promise<Blog> {
        return apiClient<Blog>(`/blogs/${blogSlug}`, {method: "GET"});
    },
}

export const privateBlogApi = {
    async getAllBlogs(limit: number, offset: number, published: boolean): Promise<Blog[]> {
        return apiClient<Blog[]>("/private/blogs", {method: "GET"}, {limit, offset, published});
    },


    async createABlog(): Promise<Blog> {
        return apiClient<Blog>(`/private/blogs`, {method: "POST"});
    },

    async updateABlog(id: string, data: Partial<Omit<Blog, "_id" | "createdAt" | "deletedAt" | "updatedAt" | "author">>): Promise<Blog> {
        return apiClient<Blog>(`/private/blogs/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data)
        });
    },

    async deleteABlog(id: string): Promise<DeleteResponse> {
        return apiClient<DeleteResponse>(`/private/blogs/${id}`, {method: "DELETE"});
    },

    async generateSlug(title: string): Promise<BlogSlugGenerateResponse> {
        return apiClient<BlogSlugGenerateResponse>(`/private/blogs/slugs/generate`, {
            method: "POST",
            body: JSON.stringify({title})
        });
    },

    async verifySlug(slug: string): Promise<BlogSlugVerifyResponse> {
        return apiClient<BlogSlugVerifyResponse>(`/private/blogs/slugs/verify`, {
            method: "POST",
            body: JSON.stringify({slug})
        });
    },
}

