
export function parsePagination(url: URL): {limit: number, offset: number} {
    const limitStr = url.searchParams.get("limit") || '6';
    const offsetStr = url.searchParams.get("offset") || '0';

    const limit = parseInt(limitStr);
    const offset = parseInt(offsetStr);

    if (isNaN(limit) || isNaN(offset)) {
        throw new Error("Invalid limit or offset");
    }

    if (limit > 50) {
        throw new Error("Limit cannot be more than 50");
    }

    return {limit, offset};
}