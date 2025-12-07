import mongoose from "mongoose";
const { Types: MongooseTypes } = mongoose;
import { getDbConnection } from "../db/connection";
import { TagModel, type TagDocument } from "../db/models/tags";
import type { Tag, TagCreateInput, TagUpdateInput } from "../types/Tag";


function normalizeTag(doc: TagDocument): Tag {
    return {
        _id: doc._id.toString(),
        name: doc.name,
        slug: doc.slug,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.createdAt.toISOString(),
        deletedAt: doc.deletedAt ? doc.deletedAt.toISOString() : null,
    }
}


function slugify(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
}

function escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export class TagRepository {
    async ensureConnection(): Promise<void> {
        await getDbConnection();
    }

    async findTagsByNameStartingWith(name: Tag["name"], limit: number, offset: number): Promise<Tag[] | []> {
        await this.ensureConnection();

        let safePrefix = escapeRegex(name);

        const tagDocs = await TagModel.find({
            name: { $regex: new RegExp(`^${safePrefix}`)},
            deletedAt: null
        })
        .sort({name: 1})
        .skip(offset)
        .limit(limit)

        let normalizedTags = tagDocs.map((tagDoc) => normalizeTag(tagDoc));

        return normalizedTags;
    }

    async createTag(input: TagCreateInput): Promise<Tag> {
        await this.ensureConnection();

        // Tag exists, now create a slug if not provided
        if (!input.slug) {
            input.slug = slugify(input.name);
        }
        let {name, slug} = input;

        // Check if slug already exists
        for (let i = 1; ; i++) {
            let existingSlugTag = await TagModel.findOne({slug: slug, deletedAt: null});
            if (existingSlugTag) {
                slug = `${slug}-${i + 1}`;
            } else {
                break;
            }
        }

        const tagDoc = await TagModel.create({
            name: name.toLowerCase(),
            slug: slug,
            deletedAt: null
        })

        return normalizeTag(tagDoc);
    }


    async findById(id: string): Promise<Tag | null> {
        await this.ensureConnection();
        
        if (!MongooseTypes.ObjectId.isValid(id)) return null;
        const doc = await TagModel.findOne({_id: id, deletedAt: null});

        return doc ? normalizeTag(doc) : null;
    }

    async findBySlug(slug: string): Promise<Tag | null> {
        await this.ensureConnection();

        const doc = await TagModel.findOne({slug: slug, deletedAt: null});
        return doc ? normalizeTag(doc) : null;
    }

    async updateById(id: string, input: TagUpdateInput): Promise<Tag | null> {
        await this.ensureConnection();

        if (!MongooseTypes.ObjectId.isValid(id)) return null;

        const doc = await TagModel.findOneAndUpdate(
            {_id: id, deletedAt: null},
            input,
            {new: true}
        )

        return doc ? normalizeTag(doc) : null;
    }

    async softDeleteById(id: string): Promise<void> {
        await this.ensureConnection();
        
        if(!MongooseTypes.ObjectId.isValid(id)) return;

        await TagModel.updateOne(
            {_id: id, deletedAt: null},
            {deletedAt: new Date()}
        );
    }

    async findAll(limit: number, offset: number): Promise<Tag[]> {
        await this.ensureConnection();

        let tagDocs = await TagModel
            .find({deletedAt: null})
            .sort({name: "asc"})
            .skip(offset)
            .limit(limit)

        return tagDocs.map(normalizeTag);
    }
}