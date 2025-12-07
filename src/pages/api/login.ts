import type { APIRoute } from "astro";
import { getService, Service } from "../../server/factory";
import { AuthService } from "../../server/services/AuthService";
import type { UserLoginInput } from "../../server/types/User";
import { error, json } from "../../server/utils/http";
import { StatusCodes } from "http-status-codes";
import { withAuthCookie } from "../../server/utils/auth";


export const prerender = false;
export const runtime = "node";

const authService = getService(Service.auth) as AuthService;

export const POST: APIRoute = async ({request}) => {
    try {
        const body = (await request.json()) as UserLoginInput;

        if (!body.password || !(body.email || body.username)) {
            return error("Email or Username, and Password is required");
        }

        let {user, token} = await authService.login(body.password, body.username, body.email);
        const res = json(user, { status: StatusCodes.OK});

        return withAuthCookie(res, token);
    } catch (err: any) {
        return error(err?.message ?? "Invalid Credentials", StatusCodes.UNAUTHORIZED);
    }
}