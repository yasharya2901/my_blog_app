

export type Tag = {
    _id: string;
    name: string;
    slug: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
}

export type StrippedTag = Omit<Tag, "createdAt" | "updatedAt" | "deletedAt">


export type AllTagResponse = {
    tags: StrippedTag[];
    total: number;
}