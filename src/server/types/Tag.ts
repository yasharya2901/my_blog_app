import type { BaseModel, CreateInput, UpdateInput } from "./Base";

export type TagBase = {
    name: string;
    slug: string;
};

export type Tag = BaseModel & TagBase;

export type TagCreateInput = CreateInput<Tag, never, "slug">;
export type TagUpdateInput = UpdateInput<TagCreateInput>;

