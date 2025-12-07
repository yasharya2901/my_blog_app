import mongoose from "mongoose";
const { Types: MongooseTypes } = mongoose;
import { getDbConnection } from "../db/connection";
import { UserModel, type UserDocument } from "../db/models/user";
import type { User, UserCreateInput, UserUpdateInput } from "../types/User";


function normalizeUser(doc: UserDocument): User {
    return {
        _id: doc._id.toString(),
        username: doc.username,
        name: doc.name,
        email: doc.email,
        passwordHash: doc.passwordHash,
        role: doc.role,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
        deletedAt: doc.deletedAt ? doc.deletedAt.toISOString() : null,
    };
}

export class UserRepository {
    async ensureConnection(): Promise<void> {
        await getDbConnection();
    }

    async create(input: Omit<UserCreateInput, "password"> & {passwordHash: string}): Promise<User> {
        await this.ensureConnection();

        const userDoc = await UserModel.create({
            username: input.username,
            email: input?.email,
            name: input.name,
            passwordHash: input.passwordHash,
            role: input?.role || 'user',
            deletedAt: null
        });

        return normalizeUser(userDoc);
    }

    async findByEmail(email: User["email"]): Promise<User | null> {
        await this.ensureConnection();

        const doc = await UserModel.findOne({email, deletedAt: null});
        return doc ? normalizeUser(doc) : null;
    }

    async findById(id: string): Promise<User | null> {
        await this.ensureConnection();

        if (!MongooseTypes.ObjectId.isValid(id)) return null;

        const doc = await UserModel.findOne({_id: id, deletedAt: null});
        return doc ? normalizeUser(doc) : null;
    }

    async findByUsername(username: string): Promise<User | null> {
        await this.ensureConnection();

        const doc = await UserModel.findOne({username: username, deleteAt: null});
        return doc ? normalizeUser(doc) : null;
    }

    async updateById(id: string, update: UserUpdateInput): Promise<User | null> {
        await this.ensureConnection();

        if (!MongooseTypes.ObjectId.isValid(id)) return null;

        // TODO: create password hash if password is being updated
        const doc = await UserModel.findOneAndUpdate(
            {_id: id, deletedAt: null},
            update,
            { new: true}
        );

        return doc ? normalizeUser(doc): null;
    }

    async softDeleteById(id: string): Promise<void> {
        await this.ensureConnection();

        if(!MongooseTypes.ObjectId.isValid(id)) return;

        await UserModel.updateOne(
            {_id: id, deletedAt: null},
            {deletedAt: new Date()}
        );
    }
}

