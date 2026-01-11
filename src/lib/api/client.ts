class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
    }
}


function buildQueryParams(params?: Record<string, any>): string {
    if (!params) return "";

    const entries = Object.entries(params)
        .filter(([k, v]) => v !== undefined && v !== null)
        .map(([k, v]) => {
            if (Array.isArray(v)) {
                return v.map((item) => `${encodeURIComponent(k)}=${encodeURIComponent(String(item))}`);
            }
            return `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`;
        })

    return entries.length ? `${entries.join("&")}`: "";
}

async function apiClient<T>(endpoint: string, options?: RequestInit, queryParams?: Record<string, any>): Promise<T> {
    const qs = buildQueryParams(queryParams);
    let url = `/api${endpoint}${qs ? `?${qs}`: ""}`

    if (import.meta.env.SSR) {
        // In production (Vercel), use the deployment URL from env or request
        // Fallback to localhost only for local development
        const baseUrl = import.meta.env.PUBLIC_API_URL || 
                       (typeof process !== 'undefined' && process.env.VERCEL_URL 
                           ? `https://${process.env.VERCEL_URL}` 
                           : "http://localhost:4321");
        url = new URL(url, baseUrl).toString();
    }

    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
        credentials: 'include',
        ...options,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new ApiError(response.status, errorData.error || errorData.message || 'Request failed');
    }

    return response.json();
}

export { apiClient, ApiError };