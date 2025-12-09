import type { APIRoute } from "astro";
import { getService, Service } from "../../../../../server/factory";
import type { BlogService } from "../../../../../server/services/BlogService";
import type { AuthService } from "../../../../../server/services/AuthService";
import { error, json } from "../../../../../server/utils/http";
import { StatusCodes } from "http-status-codes";

export const prerender = false;
export const runtime = "node";

const blogService = getService(Service.blog) as BlogService;
const authService = getService(Service.auth) as AuthService;

export const POST: APIRoute = async ({ request }) => {
    try {
        // Require admin authentication
        await authService.requireAdminFromRequest(request);

        const body = (await request.json()) as { title?: string };

        if (!body.title) {
            return error("Title is required", StatusCodes.BAD_REQUEST);
        }

        const slug = await blogService.generateBlogSlug(body.title);

        return json({ slug }, { status: StatusCodes.OK });
    } catch (err: any) {
        console.error("Error generating slug: ", err);

        if (err.message === "Authentication required" || err.message === "Admin access required" || err.message === "Invalid or expired token" || err.message === "User not found") {
            return error(err.message, StatusCodes.FORBIDDEN);
        }

        return error("Internal Server Error", StatusCodes.INTERNAL_SERVER_ERROR);
    }
};
