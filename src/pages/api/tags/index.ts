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
        const [tags, totalTagCount] = await Promise.all([tagService.getAllTags(limit, offset), tagService.findTotalCountOfTags()]);
        
        let refinedTags = tags.map((tag) => ({
            _id: tag._id,
            name: tag.name,
            slug: tag.slug
        }))
        const response = {tags: refinedTags, total: totalTagCount};
        return json(response, { status: StatusCodes.OK });
    } catch (err: any) {
        console.error("Error fetching tags: ", err);
        return error(err?.message ?? "Internal Server Error", StatusCodes.INTERNAL_SERVER_ERROR);
    }
};
