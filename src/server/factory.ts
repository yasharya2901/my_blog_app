import { BlogRepository } from "./repositories/BlogRepository";
import { TagRepository } from "./repositories/TagRepository";
import { UserRepository } from "./repositories/UserRepository";
import { AuthService } from "./services/AuthService";
import { BlogService } from "./services/BlogService";
import { TagService } from "./services/TagService";


let blogServiceInstance: BlogService | null = null;
let authServiceInstance: AuthService | null = null;
let tagServiceInstance: TagService | null = null;

export enum Service {
    "blog", 
    "auth", 
    "tag"
};

export function getService(serviceName: Service): AuthService | BlogService | TagService {
    switch (serviceName) {
        case Service.blog:
            if (!blogServiceInstance) {
                const blogRepo = new BlogRepository();
                const tagRepo = new TagRepository();
                blogServiceInstance = new BlogService(blogRepo, tagRepo);
            }
            return blogServiceInstance;

        case Service.auth:
            if (!authServiceInstance) {
                const userRepo = new UserRepository();
                authServiceInstance = new AuthService(userRepo);
            }
            return authServiceInstance;
        case Service.tag:
            if (!tagServiceInstance) {
                const tagRepo = new TagRepository();
                tagServiceInstance = new TagService(tagRepo);
            }
            return tagServiceInstance;

        default:
            throw new Error("Unknown Service Requested");
    }
}

