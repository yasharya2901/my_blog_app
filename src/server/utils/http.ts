import { StatusCodes } from "http-status-codes";

export function json(data: unknown, init: ResponseInit = {}): Response {
    const headers = new Headers(init.headers || {});
    headers.set("Content-Type", "application/json");

    return new Response(JSON.stringify(data), {
        ...init,
        headers,
    });
}

export function error(message: string, status = StatusCodes.BAD_REQUEST): Response {
    return json({ error: message }, { status });
}

