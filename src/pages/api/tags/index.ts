import type { APIRoute } from "astro";
import { getService, Service } from "../../../server/factory";
import type { TagService } from "../../../server/services/TagService";
import { error, json } from "../../../server/utils/http";
import { StatusCodes } from "http-status-codes";
import { parsePagination } from "../../../server/utils/params";

export const prerender = false;
export const runtime = "node";

const tagService = getService(Service.tag) as TagService;

export const GET: APIRoute = async ({ request }) => {
    try {
        const { limit, offset } = parsePagination(new URL(request.url));
        const tags = await tagService.getAllTags(limit, offset);
        return json(tags, { status: StatusCodes.OK });
    } catch (err) {
        console.error("Error fetching tags: ", err);
        return error("Internal Server Error", StatusCodes.INTERNAL_SERVER_ERROR);
    }
};
