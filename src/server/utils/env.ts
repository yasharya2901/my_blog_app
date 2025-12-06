
function requireEnv(name: string): string {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Environment variable ${name} is required`);
    }

    return value;
}


const DEFAULT = {
    CACHE_EXPIRY_HOUR:6,
    JWT_EXPIRY: "7d",
    CACHE_MAX_SIZE: 100
}

export const env = {
    JWT_SECRET: requireEnv("JWT_SECRET"),
    JWT_EXPIRY: process.env.JWT_EXPIRY ?? DEFAULT.JWT_EXPIRY,
    CACHE_EXPIRY_HOURS: Number(process.env.CACHE_EXPIRY_HOURS) ?? DEFAULT.CACHE_EXPIRY_HOUR,
    CACHE_MAX_SIZE: Number(process.env.MAX_CACHE_SIZE) ?? DEFAULT.CACHE_MAX_SIZE,
    MONGODB_URI: requireEnv("MONGODB_URI")
}