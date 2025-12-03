import mongoose from 'mongoose';


const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error("Please mention the MONGODB_URI environment variable");
}

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

export async function connectionToDatabase(): Promise<typeof mongoose> {
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
