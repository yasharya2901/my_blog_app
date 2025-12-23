import type { APIRoute } from "astro";
import { error, json } from "../../../../../server/utils/http";
import { StatusCodes } from "http-status-codes";
import { getService, Service } from "../../../../../server/factory";
import type { BlogService } from "../../../../../server/services/BlogService";
import type { AuthService } from "../../../../../server/services/AuthService";
import { parsePagination } from "../../../../../server/utils/params";

export const prerender = false;
export const runtime = 'node';

const blogService = getService(Service.blog) as BlogService;
const authService = getService(Service.auth) as AuthService;

export const GET: APIRoute = async ({request, params}) => {
    try {
        // Require admin authentication
        await authService.requireAdminFromRequest(request);

        const slug = params.tagSlug;
        if (!slug) {
            return error("tagSlug is required", StatusCodes.BAD_REQUEST);
        }

        const url = new URL(request.url);
        const {limit, offset} = parsePagination(url);
        const publishedParam = url.searchParams.get("published");
        const published = publishedParam === "true";

        // Get blogs by tag with published filter (includeContent=false for admin)
        const blogs = await blogService.filterAdminBlogsByTag(slug, limit, offset, false, published);
        
        return json(blogs, {status: StatusCodes.OK});
    } catch (err: any) {
        console.error("Error fetching blogs by tag (admin): ", err);

        if (err.message === "Authentication required" || err.message === "Admin access required" || err.message === "Invalid or expired token" || err.message === "User not found") {
            return error(err.message, StatusCodes.FORBIDDEN);
        }

        return error("Internal Server Error", StatusCodes.INTERNAL_SERVER_ERROR);
    }
}
