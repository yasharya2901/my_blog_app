import { getSecret } from "astro:env/server";

function requireEnv(name: string): string {
    const value = getSecret(name);

    if (!value) {
        throw new Error(`Environment variable ${name} is required`);
    }

    return value;
}


const DEFAULT = {
    CACHE_EXPIRY_HOUR:6,
    JWT_EXPIRY: "7d",
    CACHE_MAX_SIZE: 100,
    SALT_ROUNDS: 10
}

export const env = {
    JWT_SECRET: requireEnv("JWT_SECRET"),
    JWT_EXPIRY: (getSecret("JWT_EXPIRY") ?? DEFAULT.JWT_EXPIRY) as string,
    CACHE_EXPIRY_HOURS: Number(getSecret("CACHE_EXPIRY_HOURS")) ?? DEFAULT.CACHE_EXPIRY_HOUR,
    CACHE_MAX_SIZE: Number(getSecret("MAX_CACHE_SIZE")) ?? DEFAULT.CACHE_MAX_SIZE,
    MONGODB_URI: requireEnv("MONGODB_URI"),
    SALT_ROUNDS: Number(getSecret("SALT_ROUNDS")) || DEFAULT.SALT_ROUNDS,
    ALLOW_REGISTRATION: getSecret("ALLOW_REGISTRATION") == 'true'
}