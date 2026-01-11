import mongoose from "mongoose";  // mongoose is a commonJS module, not an ESM module
const { model, models, Schema } = mongoose;
import type { Document, Model } from "mongoose";
import type { TagBase } from "../../types/Tag";

export type TagDocument = TagBase & 
    Document & {
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }

const TagSchema = new Schema<TagDocument>(
    {
        name: {
            type: String,
            required: true,
            unique: false,
            trim: true,
            index: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
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

export const TagModel = (models.Tag as Model<TagDocument>) || model<TagDocument>("Tag", TagSchema)
