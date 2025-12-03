export type BaseModel = {
    _id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};

export type CreateInput<T, ExtraOmit extends keyof T = never, MakeOptional extends keyof T = never> = Omit<T, keyof BaseModel | ExtraOmit> & {
    [K in MakeOptional]?: T[K]
}

export type UpdateInput<T> = Partial<T>
