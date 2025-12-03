import type { BaseModel, CreateInput, UpdateInput } from "./Base";
import type { Tag } from "./Tag";

export type BlogBase = {
    title: string;
    authorId: string;
    slug: string;
    content: string;
    datePublished: Date | null;
    tagIds: Tag[] | [];
}

export type Blog = BaseModel & BlogBase;

export type BlogCreateInput = CreateInput<Blog, "slug" | "datePublished", "tagIds" | "datePublished"> & {
    published?: boolean;  // if true, datePublished will be set to current date if not provided, else it will be null
    tagNames?: string[];  // names of tags to be associated with the blog
}
export type BlogUpdateInput = UpdateInput<BlogCreateInput>
export type BlogQueryFilters = {
    author?: string;
    tag?: string | string[];
    publishedBefore?: string;
    publishedAfter?: string;
    slug?: string;
}

export type BlogWithTags = Omit<Blog, "tagIds"> & {tags: Tag[]}
