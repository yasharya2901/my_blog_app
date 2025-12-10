import type { APIRoute } from "astro";
import { getService, Service } from "../../server/factory";
import type { AuthService } from "../../server/services/AuthService";
import { getAuthTokenFromRequest } from "../../server/utils/auth";
import { error, json } from "../../server/utils/http";
import { StatusCodes } from "http-status-codes";
import type { User } from "../../server/types/User";

export const prerender = false;
export const runtime = "node";

const authService = getService(Service.auth) as AuthService;

export const GET: APIRoute = async ({request}) => {
    try {
        const token = getAuthTokenFromRequest(request);
    
        if (!token) {
            return error("Token not found", StatusCodes.FORBIDDEN);
        }
    
        const user = await authService.getUserFromToken(token);
        return json(user, {status: StatusCodes.OK});
    } catch (err: any) {
        return error("Token not found", StatusCodes.FORBIDDEN);
    }
}