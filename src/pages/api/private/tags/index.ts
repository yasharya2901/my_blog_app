import type { APIRoute } from "astro";
import { getService, Service } from "../../../../server/factory";
import type { TagService } from "../../../../server/services/TagService";
import type { AuthService } from "../../../../server/services/AuthService";
import { error, json } from "../../../../server/utils/http";
import { StatusCodes } from "http-status-codes";
import { invalidateCache } from "../../../../server/cache/blogCache";

export const prerender = false;
export const runtime = "node";

const tagService = getService(Service.tag) as TagService;
const authService = getService(Service.auth) as AuthService;

export const POST: APIRoute = async ({ request }) => {
    try {
        // Require admin authentication
        await authService.requireAdminFromRequest(request);

        const body = (await request.json()) as { name?: string };

        if (!body.name) {
            return error("Tag name is required", StatusCodes.BAD_REQUEST);
        }

        const tag = await tagService.createTag(body.name);

        // Invalidate blog list cache since tags affect blog responses
        invalidateCache.list();

        return json(tag, { status: StatusCodes.CREATED });
    } catch (err: any) {
        console.error("Error creating tag: ", err);

        if (err.message === "Authentication required" || err.message === "Admin access required" || err.message === "Invalid or expired token" || err.message === "User not found") {
            return error(err.message, StatusCodes.FORBIDDEN);
        }

        return error("Internal Server Error", StatusCodes.INTERNAL_SERVER_ERROR);
    }
};
