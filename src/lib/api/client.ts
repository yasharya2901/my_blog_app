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
        const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new ApiError(response.status, errorData.error || errorData.message || 'Request failed');
    }

    return response.json();
}

export { apiClient, ApiError };