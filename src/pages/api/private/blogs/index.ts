import type { APIRoute } from "astro";
import { getService, Service } from "../../../../server/factory";
import type { BlogService } from "../../../../server/services/BlogService";
import type { AuthService } from "../../../../server/services/AuthService";
import { error, json } from "../../../../server/utils/http";
import { StatusCodes } from "http-status-codes";
import { parsePagination } from "../../../../server/utils/params";
import { invalidateCache } from "../../../../server/cache/blogCache";

export const prerender = false;
export const runtime = "node";

const blogService = getService(Service.blog) as BlogService;
const authService = getService(Service.auth) as AuthService;

export const GET: APIRoute = async ({ request }) => {
    try {
        // Require admin authentication
        await authService.requireAdminFromRequest(request);

        const url = new URL(request.url);
        const { limit, offset } = parsePagination(url);
        const publishedParam = url.searchParams.get("published");
        const published = publishedParam === "true";

        const blogs = await blogService.listBlogs(limit, offset, published);
        return json(blogs, { status: StatusCodes.OK });
    } catch (err: any) {
        console.error("Error fetching blogs (admin): ", err);

        if (err.message === "Authentication required" || err.message === "Admin access required" || err.message === "Invalid or expired token" || err.message === "User not found") {
            return error(err.message, StatusCodes.FORBIDDEN);
        }

        return error("Internal Server Error", StatusCodes.INTERNAL_SERVER_ERROR);
    }
};

export const POST: APIRoute = async ({ request }) => {
    try {
        // Require admin authentication and get user
        const user = await authService.requireAdminFromRequest(request);

        // Create blog with default title and user as author
        const blog = await blogService.createBlog(user._id);

        // Invalidate list cache
        invalidateCache.list();

        return json(blog, { status: StatusCodes.CREATED });
    } catch (err: any) {
        console.error("Error creating blog: ", err);

        if (err.message === "Authentication required" || err.message === "Admin access required" || err.message === "Invalid or expired token" || err.message === "User not found") {
            return error(err.message, StatusCodes.FORBIDDEN);
        }

        return error("Internal Server Error", StatusCodes.INTERNAL_SERVER_ERROR);
    }
};
