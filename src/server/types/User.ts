import type { BaseModel, CreateInput } from "./Base";

export type UserRole = "admin" | "user";


export type UserBase = {
    username: string;
    email: string;
    passwordHash: string;
    name: string;
    role: UserRole;
}

export type User = BaseModel & UserBase;

export type UserCreateInput = CreateInput<User, "passwordHash", "role"> & {password : string} // makes role an optional key because it defaults to "user" unless specified
export type UserUpdateInput = Partial<Omit<UserCreateInput, "username">>;
export type UserLoginInput = Partial<Pick<User, "email" | "username">> & {password: string}

