type LruEntry<V> = {
    value: V;
    expiresAt: number;
}


export class LruCache<V> {
    private maxSize: number;
    private map: Map<string, LruEntry<V>>;


    constructor(maxSize: number) {
        this.maxSize = maxSize;
        this.map = new Map();
    }

    get(key: string): V | null {
        const entry = this.map.get(key);

        if (!entry) return null;

        if (Date.now() > entry.expiresAt) {
            this.map.delete(key);
            return null;
        }

        // We should mark it as a recently used by reinserting
        this.map.delete(key);
        this.map.set(key, entry);

        return entry.value;
    }

    set(key: string, value: V, ttlMs: number): void {
        const expiresAt = Date.now() + ttlMs;

        if (this.map.has(key)) {
            this.map.delete(key);
        }

        this.map.set(key, {value, expiresAt});

        if (this.map.size > this.maxSize) {
            const lruKey = this.map.keys().next().value;
            if (lruKey !== undefined) {
                this.map.delete(lruKey);
            }
        }

    }


    delete(key: string): void {
        this.map.delete(key);
    }


    clear(): void {
        this.map.clear();
    }
}