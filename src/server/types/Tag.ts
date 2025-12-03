import type { BaseModel, CreateInput, UpdateInput } from "./Base";

export type TagBase = {
    name: string;
};

export type Tag = BaseModel & TagBase;

export type TagCreateInput = CreateInput<Tag, never, never>;
export type TagUpdateInput = UpdateInput<TagCreateInput>;

