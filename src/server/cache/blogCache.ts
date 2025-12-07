import type { BlogWithTags } from "../types/Blog"
import { env } from "../utils/env";
import { LruCache } from "./lru";


const EXPIRY_HOURS = env.CACHE_EXPIRY_HOURS;
const EXPIRY_HOURS_IN_MILLISECONDS = EXPIRY_HOURS * 60 * 60 * 1000;


const MAX_CACHE_SIZE = env.CACHE_MAX_SIZE;

const LIST_CACHE = new LruCache<BlogWithTags[]>(MAX_CACHE_SIZE);
const SLUG_CACHE = new LruCache<BlogWithTags>(MAX_CACHE_SIZE);

export type ListKeyParams = {
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
    SLUG_CACHE.delete(buildSlugKey(slug));
}

export const invalidateCache = {
    list: () => LIST_CACHE.clear(),
    slug: () => SLUG_CACHE.clear()  // The arrow function captures LIST_CACHE in its closure
}

