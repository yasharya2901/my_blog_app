import type { APIRoute } from "astro";
import { json } from "../../server/utils/http";
import { StatusCodes } from "http-status-codes";
import { clearAuthCookie } from "../../server/utils/auth";

export const prerender = false;
export const runtime = "node";

export const POST: APIRoute = async () => {
    const res = json({success: true, message: "Logged out successfully"}, {status: StatusCodes.OK});
    return clearAuthCookie(res);
}