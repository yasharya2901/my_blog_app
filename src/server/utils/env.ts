
function requireEnv(name: string): string {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Environment variable ${name} is required`);
    }

    return value;
}

export const env = {
    JWT_SECRET: requireEnv("JWT_SECRET"),
    JWT_EXPIRY: process.env.JWT_EXPIRY ?? "7d",
}