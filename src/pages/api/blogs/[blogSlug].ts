import type { APIRoute } from "astro";
import { getService, Service } from "../../../server/factory";
import type { BlogService } from "../../../server/services/BlogService";
import { error, json } from "../../../server/utils/http";
import { StatusCodes } from "http-status-codes";

export const prerender = false;
export const runtime = 'node';

const blogService = getService(Service.blog) as BlogService;

export const GET: APIRoute = async ({params}) => {
    try {
        const slug = params.blogSlug;
        if (!slug) {
            return error("blogSlug is required", StatusCodes.BAD_REQUEST);
        }

        const blog = await blogService.getPublicBlogBySlug(slug);
        return json(blog, {status: StatusCodes.OK});
    } catch (err) {
        console.error(err);
        return error("Internal Server Error", StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

