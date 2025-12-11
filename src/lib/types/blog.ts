import type { Tag } from "./tags";
import type { User } from "./user";

export type Blog = {
  _id: string;
  title: string;
  slug: string;
  content: string;
  datePublished: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  author: Pick<User, "_id" | "name" | "username">;
  tags: Tag[];
};

export type DeleteResponse = { 
    success: boolean; 
    message?: string 
};

export type BlogSlugGenerateResponse = {
    slug: string;
}

export type BlogSlugVerifyResponse = {
    available: boolean;
}