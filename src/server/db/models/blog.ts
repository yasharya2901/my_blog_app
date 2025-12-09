import mongoose from "mongoose";  // mongoose is a commonJS module, not an ESM module
const { model, models, Schema } = mongoose;
import type { Document, Model } from "mongoose";
import type { BlogBase } from "../../types/Blog";


export type BlogDocument = Omit<BlogBase, "authorId" | "tagIds" | "datePublished"> & 
    {
        authorId: mongoose.Schema.Types.ObjectId;
        tagIds: mongoose.Schema.Types.ObjectId[];
        datePublished: Date | null;
    } & Document & {
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }

const BlogSchema = new Schema<BlogDocument>(
    {
        title: {
            type: String,
            required: false,
            trim: true,
        },
        slug: {
            type: String,
            required: false,
            unique: true,
            sparse: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        content: {
            type: String,
            required: false,
        },
        authorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        datePublished: {
            type: Date,
            required: false
        },
        tagIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Tag",
                index: true,
            }
        ],
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