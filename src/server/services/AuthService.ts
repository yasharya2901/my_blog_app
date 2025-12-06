import { UserModel } from "../db/models/user";
import type { UserRepository } from "../repositories/UserRepository";
import type { User } from "../types/User";
import { hashPassword, signAuthToken, verifyPassword } from "../utils/auth";

export class AuthService {
    private userRepo: UserRepository

    constructor(userRepo: UserRepository) {
        this.userRepo = userRepo
    }


    async login(password: string, username?: string, email?: string): Promise<{user: Omit<User, "passwordHash">, token: string}> {
        let user: User |  null;
        
        if (username) {
            user = await this.userRepo.findByUsername(username);
            if (!user) {
                throw new Error("Invalid Credentials");
            }
        } else if (email) {
            user = await this.userRepo.findByEmail(email);
            if (!user) {
                throw new Error("Invalid Credentials");
            }
        } else {
            throw new Error("Invalid Credentials");
        }

        let isPasswordCorrect: boolean = await verifyPassword(password, user.passwordHash);

        if (!isPasswordCorrect) {
            throw new Error("Invalid Credentials");
        }

        const token = signAuthToken(user);

        let {passwordHash, ...userExceptPasswordHash} = user

        return {user: userExceptPasswordHash, token};
    }

    async register(name: string, username: string, password: string, email: string): Promise<{user: Omit<User, "passwordHash">, token: string}> {
        let userByUsername = await this.userRepo.findByUsername(username);

        if (userByUsername) {
            throw new Error("Username already exists");
        }

        let userByEmail = await this.userRepo.findByEmail(email);

        if (userByEmail) {
            throw new Error("Email already exists")
        }

        const hashedPassword = await hashPassword(password);

        const newUser = await this.userRepo.create({
            name: name,
            username: username,
            email: email,
            passwordHash: hashedPassword,
            role: "user"
        })

        const token = signAuthToken(newUser);

        const { passwordHash, ...userWithPasswordHash } = newUser;

        return { user: userWithPasswordHash, token: token};
    }
}