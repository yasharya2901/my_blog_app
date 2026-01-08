import mongoose from "mongoose";
import type { Types } from "mongoose";
const { Types: MongooseTypes } = mongoose;
import { getCachedBlogBySlug, getCachedBlogList, invalidateCache, resetCachedBlogBySlug, setCachedBlogBySlug, setCachedBlogList, type ListKeyParams } from "../cache/blogCache";
import { BlogRepository } from "../repositories/BlogRepository";
import { TagRepository } from "../repositories/TagRepository";
import type { BlogUpdateInput, BlogWithTags, PublicBlogWithTags } from "../types/Blog";


export class BlogService {
    private blogRepo: BlogRepository;
    private tagRepo: TagRepository;
    
    constructor(blogRepo: BlogRepository, tagRepo: TagRepository) {
        this.blogRepo = blogRepo;
        this.tagRepo = tagRepo;
    }

    async getBlogCount(includePublished: boolean): Promise<number> {
        return await this.blogRepo.findBlogCount(includePublished);
    }

    async listPublicBlogs(limit: number, offset: number, published: boolean, includeContent: boolean = true): Promise<PublicBlogWithTags[]> {
        const cacheKeyParams: ListKeyParams = {
            limit: limit,
            offset
        }

        let cachedBlogs;
        if (published) {
            cachedBlogs = getCachedBlogList(cacheKeyParams);
            if (!cachedBlogs) {
                let blogs = await this.blogRepo.findPublicBlogs(limit, offset, true, includeContent);
                setCachedBlogList(cacheKeyParams, blogs as any);
                return blogs;
            }
            return cachedBlogs as PublicBlogWithTags[];
        }

        // Should not cache unpublished blogs for public view
        return await this.blogRepo.findPublicBlogs(limit, offset, false, includeContent);
    }

    async listAdminBlogs(limit: number, offset: number, published: boolean, includeContent: boolean = true): Promise<BlogWithTags[]> {
        // Never cache admin/private blogs
        return await this.blogRepo.findAdminBlogs(limit, offset, published, includeContent);
    }

    async getPublicBlogBySlug(slug: string): Promise<PublicBlogWithTags | null> {
        const cachedBlog = getCachedBlogBySlug(slug);

        if (!cachedBlog) {
            let blog = await this.blogRepo.findPublicBlogBySlug(slug);
            if (!blog) {
                return null;
            }
            setCachedBlogBySlug(slug, blog as any);
            return blog;
        }

        return cachedBlog as PublicBlogWithTags;
    }

    async getAdminBlogBySlug(slug: string): Promise<BlogWithTags | null> {
        // Don't use cache for admin views
        return await this.blogRepo.findAdminBlogBySlug(slug);
    }

    async getAdminBlogById(id: string): Promise<BlogWithTags | null> {
        // Don't use cache for admin views
        return await this.blogRepo.findAdminBlogById(id);
    }

    async filterPublicBlogsByTag(tagSlug: string, limit: number, offset: number, includeContent: boolean = true, published: boolean = true): Promise<PublicBlogWithTags[]> {
        // check if tag is correct
        let tag = await this.tagRepo.findBySlug(tagSlug);
        if (!tag) {
            return [];
        }

        // Only cache published blogs
        if (published) {
            const cacheKeyParams: ListKeyParams = {
                limit,
                offset,
                tagSlug
            }

            let cachedBlogList = getCachedBlogList(cacheKeyParams);
            if (!cachedBlogList) {
                let blogLists = await this.blogRepo.findPublicBlogs(limit, offset, published, includeContent, [tag._id]);
                setCachedBlogList(cacheKeyParams, blogLists as any);
                return blogLists;
            }
            return cachedBlogList as PublicBlogWithTags[];
        }

        // For unpublished/private blogs, don't use cache
        return await this.blogRepo.findPublicBlogs(limit, offset, published, includeContent, [tag._id]);
    }

    async filterAdminBlogsByTag(tagSlug: string, limit: number, offset: number, includeContent: boolean = true, published: boolean = true): Promise<BlogWithTags[]> {
        // check if tag is correct
        let tag = await this.tagRepo.findBySlug(tagSlug);
        if (!tag) {
            return [];
        }

        // Never cache admin blogs
        return await this.blogRepo.findAdminBlogs(limit, offset, published, includeContent, [tag._id]);
    }

    async generateBlogSlug(title: string): Promise<string> {
        // TODO: Verify if slug exists and also add numbers at last until the slug is avaiable
        return await this.blogRepo.slugify(title);
    }

    async verifySlug(slug: string): Promise<boolean> {
        let existingBlog = await this.blogRepo.findAdminBlogBySlug(slug);
        return existingBlog ? false : true;
    }
    
    async createBlog(authorId: string) {
        let title = "Untitled Blog";
        let mongofiedAuthorId = new MongooseTypes.ObjectId(authorId)
        return this.blogRepo.create({title: title, datePublished: null, authorId: mongofiedAuthorId, tagIds: []})
    }

    async updateBlog(id: string, fields: BlogUpdateInput) {
        const inputfields: Partial<Omit<BlogUpdateInput, "authorId" | "tagIds"> & { authorId: Types.ObjectId; tagIds: Types.ObjectId[] }> = {};

        // Only add fields that are actually provided
        if (fields.title !== undefined) inputfields.title = fields.title;
        if (fields.slug !== undefined) inputfields.slug = fields.slug;
        if (fields.content !== undefined) inputfields.content = fields.content;
        if (fields.shortDescription !== undefined) inputfields.shortDescription = fields.shortDescription;
        if (fields.datePublished !== undefined) inputfields.datePublished = fields.datePublished;
        
        if (fields.authorId !== undefined) {
            inputfields.authorId = new MongooseTypes.ObjectId(fields.authorId);
        }
        
        if (fields.tagIds !== undefined) {
            inputfields.tagIds = fields.tagIds.map((id) => new MongooseTypes.ObjectId(id));
        }

        return this.blogRepo.updateById(id, inputfields);
    }

    async deleteBlog(id: string): Promise<void> {
        const blog = await this.blogRepo.findById(id);
        if (blog) {
            // Invalidate caches before deletion
            invalidateCache.list();
            resetCachedBlogBySlug(blog.slug);
        }
        
        await this.blogRepo.softDeleteById(id);
    }
}