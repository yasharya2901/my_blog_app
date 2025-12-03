
import { model, type Model, type Document, models, Schema } from "mongoose";
import type { UserBase } from "../../types/User";

export type UserDocument = UserBase &
    Document & {
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }

const UserSchema = new Schema<UserDocument>(
    {
        username: {
            type: String,
            required: true,
            index: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            index: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        name: {
            type: String,
            required: false,
            trim: true
        },
        passwordHash: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ["admin", "user"],
            required: true,
            default: "user"
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


export const UserModel = (models.User as Model<UserDocument>) || model<UserDocument>("User", UserSchema)
