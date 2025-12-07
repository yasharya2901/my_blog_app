import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import ms from "ms";
import type { User } from "../types/User";
import { env } from "./env";
import type { StringValue } from "ms";


const TOKEN_COOKIE_NAME = "auth_token";

type AuthTokenPayload = {
    sub: string; // user Id
    role: string;
}

export async function hashPassword(password: string): Promise<string> {
    const saltRounds = env.SALT_ROUNDS;
    return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export function signAuthToken(user: User): string {
    const payload: AuthTokenPayload = {
        sub: user._id,
        role: user.role,
    };

    return jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRY as StringValue
    });

}

export function verifyAuthToken(token: string): AuthTokenPayload | null {
    try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
        return decoded;
    } catch (error) {
        // TODO: Implement a logger and log the error
        console.error(error);
        return null;
    }
}


export function getAuthTokenFromRequest(request: Request): string | null {
    const cookieHeader = request.headers.get("cookie");
    if (!cookieHeader) return null;

    const cookies = cookieHeader.split(";").map((c) => c.trim());
    for (const cookie of cookies) {
        if (cookie.startsWith(`${TOKEN_COOKIE_NAME}=`)) {
            return decodeURIComponent(cookie.substring(TOKEN_COOKIE_NAME.length + 1));
        }
    }
    return null;
}

export function withAuthCookie(response: Response, token: string): Response {
    // Calculate Max-Age dynamically from JWT_EXPIRY to keep them synchronized
    const maxAgeSeconds = Math.floor(ms(env.JWT_EXPIRY as StringValue) / 1000);
    
    // Only use Secure flag in production (requires HTTPS)
    const isProduction = import.meta.env.PROD;
    
    const cookieParts = [
        `${TOKEN_COOKIE_NAME}=${encodeURIComponent(token)}`,
        "Path=/",
        "HttpOnly",
        "SameSite=Strict",
        `Max-Age=${maxAgeSeconds}`,
    ];
    
    if (isProduction) {
        cookieParts.push("Secure");
    }
    
    const cookie = cookieParts.join("; ");

    response.headers.append("Set-Cookie", cookie);
    return response;
}

export function clearAuthCookie(response: Response): Response {
    // Only use Secure flag in production (requires HTTPS)
    const isProduction = import.meta.env.PROD;
    
    const cookieParts = [
        `${TOKEN_COOKIE_NAME}=`,
        "Path=/",
        "HttpOnly",
        "SameSite=Strict",
        "Max-Age=0",
    ];
    
    if (isProduction) {
        cookieParts.push("Secure");
    }
    
    const cookie = cookieParts.join("; ");

    response.headers.append("Set-Cookie", cookie);
    return response;
}

export async function getUserFromRequest(request: Request): Promise<{ userId: string; role: string } | null> {
    const token = getAuthTokenFromRequest(request);
    if (!token) return null;

    const payload = verifyAuthToken(token);
    if (!payload) return null;

    return {
        userId: payload.sub,
        role: payload.role,
    };
}
