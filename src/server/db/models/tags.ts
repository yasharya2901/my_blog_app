import { model, Model, models, Schema } from "mongoose";
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
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
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
