import type { APIRoute } from "astro";
import { error, json } from "../../../../server/utils/http";
import { StatusCodes } from "http-status-codes";
import { getService, Service } from "../../../../server/factory";
import type { BlogService } from "../../../../server/services/BlogService";
import { parsePagination } from "../../../../server/utils/params";

export const prerender = false;
export const runtime = 'node';

const blogService = getService(Service.blog) as BlogService;

export const GET: APIRoute = async ({request, params}) => {
    try {
        const slug = params.tagSlug;
        if (!slug) {
            return error("tagSlug is required", StatusCodes.BAD_REQUEST);
        }

        const {limit, offset} = parsePagination(new URL(request.url));

        // Pass includeContent=false to exclude content field at DB layer
        const blogs = await blogService.filterPublicBlogsByTag(slug, limit, offset, false);
        
        return json(blogs, {status: StatusCodes.OK});
    } catch (err) {
        console.error(err);
        return error("Internal Server Error", StatusCodes.INTERNAL_SERVER_ERROR);
    }


}