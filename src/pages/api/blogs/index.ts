import type { APIRoute } from "astro";
import { getService, Service } from "../../../server/factory";
import type { BlogService } from "../../../server/services/BlogService";
import { error, json } from "../../../server/utils/http";
import { StatusCodes } from "http-status-codes";
import { parsePagination } from "../../../server/utils/params";


export const prerender = false;
export const runtime = "node";

const blogService = getService(Service.blog) as BlogService;
export const GET: APIRoute = async ({request}) => {
    try {
        const {limit, offset} = parsePagination(new URL(request.url));
        const blogs = await blogService.listBlogs(limit, offset, true);
        return json(blogs, {status: StatusCodes.OK});
    } catch (err) {
        console.error("Error fetching blogs: ", err);

        return error("Internal Server Error", StatusCodes.INTERNAL_SERVER_ERROR);
    }
}