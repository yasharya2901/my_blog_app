import type { APIRoute } from "astro";
import { getService, Service } from "../../server/factory";
import type { UserRegisterInput } from "../../server/types/User";
import { error, json } from "../../server/utils/http";
import { StatusCodes } from "http-status-codes";
import type { AuthService } from "../../server/services/AuthService";
import { withAuthCookie } from "../../server/utils/auth";
import { env } from "../../server/utils/env";

export const prerender = false;
export const runtime = "node";

const authservice = getService(Service.auth) as AuthService;

export const POST: APIRoute = async ({request}) => {
    try {
        if (!env.ALLOW_REGISTRATION) {
            return error("User registration is not allowed", StatusCodes.FORBIDDEN);
        }

        const body = (await request.json()) as UserRegisterInput;

        if (!body.username || !body.name || !body.email || !body.password) {
            return error("Username, name, email and password are required.", StatusCodes.BAD_REQUEST);
        }

        const {user, token} = await authservice.register(body.name, body.username, body.password, body.email);

        const res = json(user, {status: StatusCodes.CREATED});

        return withAuthCookie(res, token);
    } catch (err: any) {
        return error(err?.message ?? "Registration Failed", StatusCodes.BAD_REQUEST)
    }
}