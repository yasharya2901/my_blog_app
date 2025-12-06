import { Types } from "mongoose";
import { getDbConnection } from "../db/connection";
import { BlogModel, type BlogDocument } from "../db/models/blog";
import type { Blog, BlogCreateInput, BlogUpdateInput, BlogWithTags } from "../types/Blog";
import { TagRepository } from "./TagRepository";


function normalizeBlog(doc: BlogDocument): Blog {
    return {
        _id: doc._id.toString(),
        title: doc.title,
        slug: doc.slug,
        authorId: doc.authorId.toString(),
        content: doc.content,
        datePublished: doc.datePublished ?? null,
        tagIds: doc.tagIds.map((id) => id.toString()),
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
        deletedAt: doc.deletedAt ? doc.deletedAt.toISOString() : null,
    }
}

export class BlogRepository {
    private tagRepo = new TagRepository();

    async ensureConnection(): Promise<void> {
        await getDbConnection();
    }

    async findById(id: string): Promise<Blog | null> {
        await this.ensureConnection();

        const doc = await BlogModel.findOne({_id: id, deletedAt: null});

        return doc ? normalizeBlog(doc) : null;
    }

    async findBySlug(slug: Blog["slug"]): Promise<BlogWithTags | null> {
        await this.ensureConnection();
        const match: any = {slug: slug, deletedAt: null}
        // const doc = await BlogModel.findOne({slug: slug, deletedAt: null});
        const docs = await BlogModel.aggregate([
            {$match: match},
            { $limit: 1 },
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
                $unwind: "$author"  // changes the author array to single object
            }
        ])

        if (docs.length == 0) {
            return null;
        }

        const doc = docs[0] as any;

        const blogWithTags: BlogWithTags = {
            _id: doc._id.toString(),
            title: doc.title,
            slug: doc.slug,
            content: doc.content,
            datePublished: doc.datePublished ?? null,
            createdAt: doc.createdAt.toISOString(),
            updatedAt: doc.updatedAt.toISOString(),
            deletedAt: doc.deletedAt ? doc.deletedAt.toISOString() : null,
            tags: (doc.tags || []).map((t: any) => ({
                _id: t._id.toString(),
                name: t.name,
                slug: t.slug,
                createdAt: t.createdAt.toISOString(),
                updatedAt: t.updatedAt.toISOString(),
                deletedAt: t.deletedAt ? t.deletedAt.toISOString() : null,
            })),
            author: {
                _id: doc.author._id.toString(),
                name: doc.author.name,
                username: doc.author.username,
            },
        };

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

    async updateById(id: string, input: Omit<BlogUpdateInput, "authorId" | "tagIds"> & { authorId: Types.ObjectId; tagIds: Types.ObjectId[]} ): Promise<Blog | null> {
        await this.ensureConnection();

        if (!Types.ObjectId.isValid(id)) return null;

        const doc = await BlogModel.findOneAndUpdate(
            {_id: id},
            input,
            {new: true}
        )

        return doc ? normalizeBlog(doc) : null;
    } 
    
    async findAll(limit: number, offset: number, onlyPublished: boolean,  tagIds?: string[]): Promise<BlogWithTags[]> {
        await this.ensureConnection();

        const match: any = { deletedAt: null};

        if (onlyPublished) {
            match.datePublished = { $ne: null};
        }

        if (tagIds && tagIds.length > 0) {
            match.tagIds = { $all: tagIds.map((id) => new Types.ObjectId(id))}
        }

        const docs = await BlogModel.aggregate([
            { $match: match },
            { $sort: {createdAt: -1} },
            { $skip: offset },
            { $limit: limit },
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
                $unwind: "$author"  // changes the author array to single object
            }
        ])
        
        return docs.map((doc: any): BlogWithTags => ({
            _id: doc._id.toString(),
            title: doc.title,
            slug: doc.slug,
            content: doc.content,
            datePublished: doc.datePublished ?? null,
            createdAt: doc.createdAt.toISOString(),
            updatedAt: doc.updatedAt.toISOString(),
            deletedAt: doc.deletedAt ? doc.deletedAt.toISOString() : null,
            tags: (doc.tags || []).map((t: any) => ({
                _id: t._id.toString(),
                name: t.name,
                slug: t.slug,
                createdAt: t.createdAt.toISOString(),
                updatedAt: t.updatedAt.toISOString(),
                deletedAt: t.deletedAt ? t.deletedAt.toISOString() : null,
            })),
            author: {
                _id: doc.author._id.toString(),
                name: doc.author.name,
                username: doc.author.username,
            }
        }))
        
    }

    async softDeleteById(id: string): Promise<void> {
        await BlogModel.updateOne(
            {_id: id},
            {deletedAt: new Date()}
        )
    }
}