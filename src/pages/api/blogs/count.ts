import type { APIRoute } from "astro";
import { getService, Service } from "../../../server/factory";
import type { BlogService } from "../../../server/services/BlogService";
import { StatusCodes } from "http-status-codes";
import { error, json } from "../../../server/utils/http";



export const prerender = false;
export const runtime = "node";

const blogService = getService(Service.blog) as BlogService;
export const GET: APIRoute = async ({request}) => {
    try {
        const count = await blogService.getBlogCount(true);
        return json({totalCount: count}, {status: StatusCodes.OK});
    } catch (err) {
        console.error("Error fetching blogs: ", err);
        return error("Internal Server Error", StatusCodes.INTERNAL_SERVER_ERROR);
    }
}