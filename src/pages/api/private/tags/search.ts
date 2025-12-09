import type { APIRoute } from "astro";
import { getService, Service } from "../../../../server/factory";
import type { TagService } from "../../../../server/services/TagService";
import type { AuthService } from "../../../../server/services/AuthService";
import { error, json } from "../../../../server/utils/http";
import { StatusCodes } from "http-status-codes";
import { parsePagination } from "../../../../server/utils/params";

export const prerender = false;
export const runtime = "node";

const tagService = getService(Service.tag) as TagService;
const authService = getService(Service.auth) as AuthService;

export const GET: APIRoute = async ({ request }) => {
    try {
        // Require admin authentication
        await authService.requireAdminFromRequest(request);

        const url = new URL(request.url);
        const query = url.searchParams.get("query");

        if (!query) {
            return error("Query parameter is required", StatusCodes.BAD_REQUEST);
        }

        const { limit, offset } = parsePagination(url);

        const tags = await tagService.searchTag(query, limit, offset);

        return json(tags, { status: StatusCodes.OK });
    } catch (err: any) {
        console.error("Error searching tags: ", err);

        if (err.message === "Authentication required" || err.message === "Admin access required" || err.message === "Invalid or expired token" || err.message === "User not found") {
            return error(err.message, StatusCodes.FORBIDDEN);
        }

        return error("Internal Server Error", StatusCodes.INTERNAL_SERVER_ERROR);
    }
};
