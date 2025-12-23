import mongoose from "mongoose";
import type { Types } from "mongoose";
const { Types: MongooseTypes } = mongoose;
import { getDbConnection } from "../db/connection";
import { BlogModel, type BlogDocument } from "../db/models/blog";
import type { Blog, BlogCreateInput, BlogUpdateInput, BlogWithTags, PublicBlogWithTags } from "../types/Blog";


function normalizeBlog(doc: BlogDocument): Blog {
    return {
        _id: doc._id.toString(),
        title: doc.title,
        slug: doc.slug,
        authorId: doc.authorId.toString(),
        content: doc.content,
        shortDescription: doc.shortDescription,
        datePublished: doc.datePublished ?? null,
        tagIds: doc.tagIds.map((id) => id.toString()),
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
        deletedAt: doc.deletedAt ? doc.deletedAt.toISOString() : null,
    }
}

export class BlogRepository {
    async ensureConnection(): Promise<void> {
        await getDbConnection();
    }

    async findById(id: string): Promise<Blog | null> {
        await this.ensureConnection();

        if (!MongooseTypes.ObjectId.isValid(id)) return null;

        const doc = await BlogModel.findOne({_id: id, deletedAt: null});

        return doc ? normalizeBlog(doc) : null;
    }

    async findPublicBlogBySlug(slug: Blog["slug"]): Promise<PublicBlogWithTags | null> {
        return this._findBySlug(slug, true) as Promise<PublicBlogWithTags | null>;
    }

    async findAdminBlogBySlug(slug: Blog["slug"]): Promise<BlogWithTags | null> {
        return this._findBySlug(slug, false) as Promise<BlogWithTags | null>;
    }

    private async _findBySlug(slug: Blog["slug"], excludeAdminFields: boolean): Promise<BlogWithTags | PublicBlogWithTags | null> {
        await this.ensureConnection();
        const match: any = {slug: slug, deletedAt: null}
        const docs = await BlogModel.aggregate([
            {$match: match},
            { $limit: 1 },
            // Conditionally exclude admin fields for public view
            ...(excludeAdminFields ? [{ $project: { createdAt: 0, deletedAt: 0 } }] : []),
            {
                $lookup: {
                    from: "tags",
                    localField: "tagIds",
                    foreignField: "_id",
                    as: "tags",
                    pipeline: [
                        { $match: {deletedAt: null}} // match only active tags
                    ]
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "authorId",
                    foreignField: "_id",
                    as: "author",
                    pipeline: [
                        { $match: { deletedAt: null }},
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                username: 1,
                            }
                        }
                    ]
                }
            }, 
            {
                $unwind: { 
                    path: "$author",
                    preserveNullAndEmptyArrays: true  // Keep blog even if author is deleted/missing
                }
            }
        ])

        if (docs.length == 0) {
            return null;
        }

        const doc = docs[0] as any;

        const blogWithTags = {
            _id: doc._id.toString(),
            title: doc.title,
            slug: doc.slug,
            content: doc.content,
            shortDescription: doc.shortDescription,
            datePublished: doc.datePublished ?? null,
            ...(!excludeAdminFields && {
                createdAt: doc.createdAt.toISOString(),
                updatedAt: doc.updatedAt.toISOString(),
                deletedAt: doc.deletedAt ? doc.deletedAt.toISOString() : null,
            }),
            ...(excludeAdminFields && {
                updatedAt: doc.updatedAt.toISOString(),
            }),
            tags: (doc.tags || []).map((t: any) => ({
                _id: t._id.toString(),
                name: t.name,
                slug: t.slug,
                ...(!excludeAdminFields && {
                    createdAt: t.createdAt.toISOString(),
                    updatedAt: t.updatedAt.toISOString(),
                    deletedAt: t.deletedAt ? t.deletedAt.toISOString() : null,
                }),
                ...(excludeAdminFields && {
                    updatedAt: t.updatedAt.toISOString(),
                }),
            })),
            author: doc.author ? {
                _id: doc.author._id.toString(),
                name: doc.author.name,
                username: doc.author.username,
            } : null
        } as BlogWithTags | PublicBlogWithTags;

        return blogWithTags;

    }

    async slugify(title: string): Promise<string> {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .trim()
    }

    async create(input: Pick<BlogCreateInput, "datePublished"> & { authorId: Types.ObjectId; tagIds: Types.ObjectId[]} & Partial<Pick<BlogCreateInput, "title" | "content" |"slug">>): Promise<Blog> {
        await this.ensureConnection();

        let {title, authorId, slug, content, datePublished, tagIds} = input

        const doc = new BlogModel({
            title,
            authorId,
            slug,
            content,
            datePublished,
            tagIds,
            deletedAt: null
        })
        await doc.save()

        return normalizeBlog(doc)
        
    }

    async updateById(id: string, input: Partial<Omit<BlogUpdateInput, "authorId" | "tagIds"> & { authorId: Types.ObjectId; tagIds: Types.ObjectId[]}> ): Promise<Blog | null> {
        await this.ensureConnection();

        if (!MongooseTypes.ObjectId.isValid(id)) return null;

        // Filter out undefined values to prevent overwriting existing data
        const updateFields = Object.fromEntries(
            Object.entries(input).filter(([_, value]) => value !== undefined)
        );

        if (Object.keys(updateFields).length === 0) {
            // No fields to update, just return the existing blog
            return this.findById(id);
        }

        const doc = await BlogModel.findOneAndUpdate(
            {_id: id, deletedAt: null},
            updateFields,
            {new: true}
        )

        return doc ? normalizeBlog(doc) : null;
    } 
    
    async findPublicBlogs(limit: number, offset: number, onlyPublished: boolean, includeContent: boolean = true, tagIds?: string[]): Promise<PublicBlogWithTags[]> {
        return this._findAll(limit, offset, onlyPublished, includeContent, true, tagIds) as Promise<PublicBlogWithTags[]>;
    }

    async findAdminBlogs(limit: number, offset: number, onlyPublished: boolean, includeContent: boolean = true, tagIds?: string[]): Promise<BlogWithTags[]> {
        return this._findAll(limit, offset, onlyPublished, includeContent, false, tagIds) as Promise<BlogWithTags[]>;
    }

    private async _findAll(limit: number, offset: number, onlyPublished: boolean, includeContent: boolean, excludeAdminFields: boolean, tagIds?: string[]): Promise<BlogWithTags[] | PublicBlogWithTags[]> {
        await this.ensureConnection();

        const match: any = { deletedAt: null};

        if (onlyPublished) {
            match.datePublished = { $ne: null};
        }

        if (tagIds && tagIds.length > 0) {
            match.tagIds = { $all: tagIds.map((id) => new MongooseTypes.ObjectId(id))}
        }

        const docs = await BlogModel.aggregate([
            { $match: match },
            { $sort: {createdAt: -1} },
            { $skip: offset },
            { $limit: limit },
            // Conditionally exclude content field for performance
            ...(includeContent ? [] : [{ $project: { content: 0 } }]),
            // Conditionally exclude admin fields for public view
            ...(excludeAdminFields ? [{ $project: { createdAt: 0, deletedAt: 0 } }] : []),
            {
                $lookup: {
                    from: "tags",
                    localField: "tagIds",
                    foreignField: "_id",
                    as: "tags",
                    pipeline: [
                        { $match: { deletedAt: null } }, // only active tags
                    ],
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "authorId",
                    foreignField: "_id",
                    as: "author",
                    pipeline: [
                        { $match: { deletedAt: null }},
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                username: 1,
                            }
                        }
                    ]
                }
            }, 
            {
                $unwind: { 
                    path: "$author",
                    preserveNullAndEmptyArrays: true  // Keep blog even if author is deleted/missing
                }
            }
        ])
        
        return docs.map((doc: any) => ({
            _id: doc._id.toString(),
            title: doc.title,
            slug: doc.slug,
            content: doc.content,
            shortDescription: doc.shortDescription,
            datePublished: doc.datePublished ?? null,
            ...(!excludeAdminFields && {
                createdAt: doc.createdAt.toISOString(),
                updatedAt: doc.updatedAt.toISOString(),
                deletedAt: doc.deletedAt ? doc.deletedAt.toISOString() : null,
            }),
            ...(excludeAdminFields && {
                updatedAt: doc.updatedAt.toISOString(),
            }),
            tags: (doc.tags || []).map((t: any) => ({
                _id: t._id.toString(),
                name: t.name,
                slug: t.slug,
                ...(!excludeAdminFields && {
                    createdAt: t.createdAt.toISOString(),
                    updatedAt: t.updatedAt.toISOString(),
                    deletedAt: t.deletedAt ? t.deletedAt.toISOString() : null,
                }),
                ...(excludeAdminFields && {
                    updatedAt: t.updatedAt.toISOString(),
                }),
            })),
            author: doc.author ? {
                _id: doc.author._id.toString(),
                name: doc.author.name,
                username: doc.author.username,
            } : null
        }) as BlogWithTags | PublicBlogWithTags)
    }

    async softDeleteById(id: string): Promise<void> {
        await this.ensureConnection();

        if(!MongooseTypes.ObjectId.isValid(id)) return;

        await BlogModel.updateOne(
            {_id: id, deletedAt: null},
            {deletedAt: new Date()}
        )
    }
}