import mongoose from 'mongoose';
import { env } from '../utils/env';


const MONGODB_URI = env.MONGODB_URI;


type MongooseCache = {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

declare global {
    var _mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global._mongooseCache || {
  conn: null,
  promise: null,
};

if (!global._mongooseCache) {
    global._mongooseCache = cached
}

export async function getDbConnection(): Promise<typeof mongoose> {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = mongoose
            .connect(MONGODB_URI as string, {
                bufferCommands: false
            })
            .then((mongooseInstance) => mongooseInstance)
    }
    cached.conn = await cached.promise
    return cached.conn
}
