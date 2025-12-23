

export type Tag = {
    _id: string;
    name: string;
    slug: string;
    createdAt?: string;  // Optional - excluded in public endpoints
    updatedAt: string;
    deletedAt?: string;  // Optional - excluded in public endpoints
}

export type StrippedTag = Omit<Tag, "createdAt" | "updatedAt" | "deletedAt">


export type AllTagResponse = {
    tags: StrippedTag[];
    total: number;
}