import type { BaseModel, CreateInput, UpdateInput } from "./Base";
import type { Tag } from "./Tag";
import type { User } from "./User";

export type BlogBase = {
    title: string;
    authorId: string;
    slug: string;
    content: string;
    datePublished: Date | null;
    tagIds: string[];
}

export type Blog = BaseModel & BlogBase;

export type BlogCreateInput = CreateInput<Blog, never, "slug" | "title" | "content" | "tagIds"> 
export type BlogUpdateInput = UpdateInput<BlogCreateInput>
export type BlogQueryFilters = {
    author?: string;
    tag?: string | string[];
    publishedBefore?: string;
    publishedAfter?: string;
    slug?: string;
}

export type BlogWithTags = Omit<Blog, "tagIds"| "authorId"> & {tags: Tag[]; author: Pick<User, "_id" | "name" | "username"> | null}
