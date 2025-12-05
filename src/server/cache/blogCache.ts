import type { BlogWithTags } from "../types/Blog"
import { LruCache } from "./lru";

const DEFAULT_EXPIRY_HOUR = 6;
const EXPIRY_HOURS = Number(process.env.EXPIRY_HOURS) || DEFAULT_EXPIRY_HOUR;
const EXPIRY_HOURS_IN_MILLISECONDS = EXPIRY_HOURS * 60 * 60 * 1000;

const DEFAULT_MAX_CACHE_SIZE = 100
const MAX_CACHE_SIZE = Number(process.env.MAX_CACHE_SIZE) || DEFAULT_MAX_CACHE_SIZE;

const LIST_CACHE = new LruCache<BlogWithTags[]>(MAX_CACHE_SIZE);
const SLUG_CACHE = new LruCache<BlogWithTags>(MAX_CACHE_SIZE);

type ListKeyParams = {
    tagSlug?: string;
    limit: number;
    offset: number;
}

export function buildListKey(params: ListKeyParams): string {
    
    return `blogs:list:${params.tagSlug ?? "all"}:limit=${params.limit}:offset=${params.offset}`;
}

export function buildSlugKey(slug: string): string {
    return `blogs:slug:${slug}`;
}


export function getCachedBlogList(params: ListKeyParams): BlogWithTags[] | null {
    const key = buildListKey(params);
    return LIST_CACHE.get(key);
}


export function setCachedBlogList(params: ListKeyParams, blogs: BlogWithTags[]): void {
    const key = buildListKey(params);
    LIST_CACHE.set(key, blogs, EXPIRY_HOURS_IN_MILLISECONDS);
}


export function getCachedBlogBySlug(slug: string): BlogWithTags | null {
    return SLUG_CACHE.get(buildSlugKey(slug));
}

export function setCachedBlogBySlug(slug: string, blog: BlogWithTags): void {
    SLUG_CACHE.set(buildSlugKey(slug), blog, EXPIRY_HOURS_IN_MILLISECONDS);
}

export function resetCachedBlogBySlug(slug: string): void {
    SLUG_CACHE.delete(slug);
}

export const invalidateCache = {
    list: LIST_CACHE.clear,
    slug: SLUG_CACHE.clear
}

