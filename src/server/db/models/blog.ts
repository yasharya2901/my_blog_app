import { model, models, Schema, type Document, type Model } from "mongoose";
import type { BlogBase } from "../../types/Blog";


export type BlogDocument = BlogBase & 
    Document & {
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }

const BlogSchema = new Schema<BlogDocument>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        content: {
            type: String,
            required: true,
        },
        authorId: {
            type: String,
            required: true,
            trim: true,
        },
        datePublished: {
            type: Date,
            required: false
        },
        tagIds: {
            type: [String],
            required: true,
            default: []
        },
        deletedAt: {
            type: Date,
            required: false,
            default: null,
            index: true,
        }
    },
    {
        timestamps: true
    }
)


export const BlogModel = (models.Blog as Model<BlogDocument>) || model<BlogDocument>("Blog", BlogSchema);