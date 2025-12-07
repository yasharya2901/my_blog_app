import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { UserModel } from "../src/server/db/models/user.js";

dotenv.config();

async function createAdmin() {
    try {
        const requiredEnvVars = [
            "MONGODB_URI",
            "ADMIN_USERNAME",
            "ADMIN_NAME",
            "ADMIN_EMAIL",
            "ADMIN_PASSWORD",
        ] as const;

        const missing = requiredEnvVars.filter((name) => !process.env[name]);

        if (missing.length > 0) {
            throw new Error(
                `Missing required environment variables: ${missing.join(", ")}`
            );
        }

        const { MONGODB_URI, ADMIN_USERNAME, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = 
            process.env as Record<string, string>;

        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB\n");

        // Check if username already exists
        const existingUserByUsername = await UserModel.findOne({ 
            username: ADMIN_USERNAME,
            deletedAt: null 
        });

        if (existingUserByUsername) {
            console.error(`❌ User with username "${ADMIN_USERNAME}" already exists`);
            process.exit(1);
        }

        // Check if email already exists
        const existingUserByEmail = await UserModel.findOne({ 
            email: ADMIN_EMAIL,
            deletedAt: null 
        });

        if (existingUserByEmail) {
            console.error(`❌ User with email "${ADMIN_EMAIL}" already exists`);
            process.exit(1);
        }

        // Hash password
        console.log("Creating admin user...");
        const saltRounds = process.env.SALT_ROUNDS || 10;
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, saltRounds);

        // NOTE: Not using the auth service because it indirectly depends on src/utils/env.ts that uses getSecret which is not possible with the astro runtime
        const adminUser = await UserModel.create({
            username: ADMIN_USERNAME,
            name: ADMIN_NAME,
            email: ADMIN_EMAIL,
            passwordHash: hashedPassword,
            role: "admin",
        });

        console.log("☑️ Admin user created successfully!\n");
        console.log("Username:", adminUser.username);
        console.log("Name:", adminUser.name);
        console.log("Email:", adminUser.email);
        console.log("Role:", adminUser.role);

    } catch (error) {
        console.error("\n❌ Error creating admin user:");
        console.error(error instanceof Error ? error.message : error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log("\nDatabase connection closed");
    }
}

createAdmin();