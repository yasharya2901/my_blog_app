import mongoose from "mongoose";
import type { Types } from "mongoose";
const { Types: MongooseTypes } = mongoose;
import { getCachedBlogBySlug, getCachedBlogList, setCachedBlogBySlug, setCachedBlogList, type ListKeyParams } from "../cache/blogCache";
import { BlogRepository } from "../repositories/BlogRepository";
import { TagRepository } from "../repositories/TagRepository";
import type { BlogUpdateInput, BlogWithTags } from "../types/Blog";


export class BlogService {
    private blogRepo: BlogRepository;
    private tagRepo: TagRepository;
    
    constructor(blogRepo: BlogRepository, tagRepo: TagRepository) {
        this.blogRepo = blogRepo;
        this.tagRepo = tagRepo;
    }

    async listBlogs(limit: number, offset: number, published: boolean): Promise<BlogWithTags[]> {

        const cacheKeyParams: ListKeyParams = {
            limit: limit,
            offset
        }

        let cachedBlogs;
        if (published) {
            cachedBlogs = getCachedBlogList(cacheKeyParams);
            if (!cachedBlogs) {
                let blogs = await this.blogRepo.findAll(limit, offset, true);
                setCachedBlogList(cacheKeyParams, blogs);
                return blogs;
            }
            return cachedBlogs;
        }

        let allBlogs = await this.blogRepo.findAll(limit, offset, false);

        return allBlogs;
    }

    async getBlogBySlug(slug: string): Promise<BlogWithTags | null> {
        const cachedBlog = getCachedBlogBySlug(slug);

        if (!cachedBlog) {
            let blog = await this.blogRepo.findBySlug(slug);
            if (!blog) {
                return null;
            }
            setCachedBlogBySlug(slug, blog);
            return blog;
        }

        return cachedBlog;
    }

    async filterBlogsByTag(tagSlug: string, limit: number, offset: number): Promise<BlogWithTags[]> {
        const cacheKeyParams: ListKeyParams = {
            limit,
            offset,
            tagSlug
        }

        let cachedBlogList = getCachedBlogList(cacheKeyParams);
        if (!cachedBlogList) {
            // check if tag is correct
            let tag = await this.tagRepo.findBySlug(tagSlug);
            if (!tag) {
                return [];
            }

            let blogLists = await this.blogRepo.findAll(limit, offset, true, [tag._id]);
            setCachedBlogList(cacheKeyParams, blogLists);
            return blogLists;
        }


        
        return cachedBlogList;
    }

    async generateBlogSlug(title: string): Promise<string> {
        return await this.blogRepo.slugify(title);
    }

    async verifySlug(slug: string): Promise<boolean> {
        let existingBlog = await this.blogRepo.findBySlug(slug);
        return existingBlog ? false : true;
    }
    
    async createBlog(authorId: string) {
        let title = "New Blog";
        let mongofiedAuthorId = new MongooseTypes.ObjectId(authorId)
        return this.blogRepo.create({title: title, datePublished: null, authorId: mongofiedAuthorId, tagIds: []})
    }

    async updateBlog(id: string, fields: BlogUpdateInput) {
        const inputfields: Partial<Omit<BlogUpdateInput, "authorId" | "tagIds"> & { authorId: Types.ObjectId; tagIds: Types.ObjectId[] }> = {};

        // Only add fields that are actually provided
        if (fields.title !== undefined) inputfields.title = fields.title;
        if (fields.slug !== undefined) inputfields.slug = fields.slug;
        if (fields.content !== undefined) inputfields.content = fields.content;
        if (fields.datePublished !== undefined) inputfields.datePublished = fields.datePublished;
        
        if (fields.authorId !== undefined) {
            inputfields.authorId = new MongooseTypes.ObjectId(fields.authorId);
        }
        
        if (fields.tagIds !== undefined) {
            inputfields.tagIds = fields.tagIds.map((id) => new MongooseTypes.ObjectId(id));
        }

        return this.blogRepo.updateById(id, inputfields);
    }
}