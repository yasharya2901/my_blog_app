import type { APIRoute } from "astro";
import { getService, Service } from "../../../../server/factory";
import type { BlogService } from "../../../../server/services/BlogService";
import type { AuthService } from "../../../../server/services/AuthService";
import { error, json } from "../../../../server/utils/http";
import { StatusCodes } from "http-status-codes";
import type { BlogUpdateInput } from "../../../../server/types/Blog";
import { invalidateCache, resetCachedBlogBySlug } from "../../../../server/cache/blogCache";
import { BlogRepository } from "../../../../server/repositories/BlogRepository";

export const prerender = false;
export const runtime = "node";

const blogService = getService(Service.blog) as BlogService;
const authService = getService(Service.auth) as AuthService;
const blogRepo = new BlogRepository();

export const PATCH: APIRoute = async ({ request, params }) => {
    try {
        // Require admin authentication
        await authService.requireAdminFromRequest(request);

        const id = params.id;
        if (!id) {
            return error("Blog ID is required", StatusCodes.BAD_REQUEST);
        }

        const body = (await request.json()) as Partial<BlogUpdateInput>;

        // Explicitly prevent authorId from being updated
        if ("authorId" in body) {
            delete body.authorId;
        }

        // Get the blog before update to get its slug for cache invalidation
        const existingBlog = await blogRepo.findById(id);
        const oldSlug = existingBlog?.slug;
        
        const updatedBlog = await blogService.updateBlog(id, body);

        if (!updatedBlog) {
            return error("Blog not found", StatusCodes.NOT_FOUND);
        }

        // Invalidate caches
        invalidateCache.list();
        if (oldSlug) {
            resetCachedBlogBySlug(oldSlug);
        }
        resetCachedBlogBySlug(updatedBlog.slug);

        return json(updatedBlog, { status: StatusCodes.OK });
    } catch (err: any) {
        console.error("Error updating blog: ", err);

        if (err.message === "Authentication required" || err.message === "Admin access required" || err.message === "Invalid or expired token" || err.message === "User not found") {
            return error(err.message, StatusCodes.FORBIDDEN);
        }

        return error("Internal Server Error", StatusCodes.INTERNAL_SERVER_ERROR);
    }
};

export const DELETE: APIRoute = async ({ request, params }) => {
    try {
        // Require admin authentication
        await authService.requireAdminFromRequest(request);

        const id = params.id;
        if (!id) {
            return error("Blog ID is required", StatusCodes.BAD_REQUEST);
        }

        await blogService.deleteBlog(id);

        return json({ success: true, message: "Blog deleted successfully" }, { status: StatusCodes.OK });
    } catch (err: any) {
        console.error("Error deleting blog: ", err);

        if (err.message === "Authentication required" || err.message === "Admin access required" || err.message === "Invalid or expired token" || err.message === "User not found") {
            return error(err.message, StatusCodes.FORBIDDEN);
        }

        return error("Internal Server Error", StatusCodes.INTERNAL_SERVER_ERROR);
    }
};
