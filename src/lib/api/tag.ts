import type { Tag } from "../types/tags";
import { apiClient } from "./client";


export const tagApi = {
    async getAllTags(limit: number, offset: number): Promise<Tag[]> {
        return apiClient<Tag[]>("/tags", {method: "GET"}, {limit, offset});
    },
}


export const privateTagApi = {
    async searchTag(tagName: string, limit: number, offset: number): Promise<Tag[]> {
        return apiClient<Tag[]>("/private/tags/search", {
            method: "GET"
        }, 
        {
            query: tagName,
            limit,
            offset
        });
    },

    async createTag(name: string): Promise<Tag> {
        return apiClient<Tag>("/private/tags", {
            method: "POST",
            body: JSON.stringify({name})
        });
    },
}

