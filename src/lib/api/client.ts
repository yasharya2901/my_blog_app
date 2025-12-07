class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
    }
}


async function apiClient<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`/api${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
        credentials: 'include',
        ...options,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new ApiError(response.status, error.message);
    }

    return response.json();
}

export { apiClient, ApiError };