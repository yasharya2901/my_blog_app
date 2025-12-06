import { TagRepository } from "../repositories/TagRepository";
import type { Tag } from "../types/Tag";

export class TagService {
    private tagRepo: TagRepository;

    constructor(tagRepo: TagRepository) {
        this.tagRepo = tagRepo;
    }

    async getAllTags(limit: number, offset: number): Promise<Tag[]> {
        return await this.tagRepo.findAll(limit, offset);
    }

    async searchTag(tagName: string, limit: number, offset: number): Promise<Tag[]> {
        return await this.tagRepo.findTagsByNameStartingWith(tagName, limit, offset);
    }
}