import mongoose from 'mongoose';
import { g as getEnv$1, s as setOnSetGetEnv } from './runtime_1tkDUGik.mjs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';

/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-check

// @ts-expect-error
/** @returns {string} */
// used while generating the virtual module
// biome-ignore lint/correctness/noUnusedFunctionParameters: `key` is used by the generated code
const getEnv = (key) => {
	return getEnv$1(key);
};

const getSecret = (key) => {
	return getEnv(key);
};

setOnSetGetEnv(() => {
	
});

function requireEnv(name) {
  const value = getSecret(name);
  if (!value) {
    throw new Error(`Environment variable ${name} is required`);
  }
  return value;
}
const DEFAULT = {
  CACHE_EXPIRY_HOUR: 6,
  JWT_EXPIRY: "7d",
  CACHE_MAX_SIZE: 100,
  SALT_ROUNDS: 10
};
const env = {
  JWT_SECRET: requireEnv("JWT_SECRET"),
  JWT_EXPIRY: getSecret("JWT_EXPIRY") ?? DEFAULT.JWT_EXPIRY,
  CACHE_EXPIRY_HOURS: Number(getSecret("CACHE_EXPIRY_HOURS")) ?? DEFAULT.CACHE_EXPIRY_HOUR,
  CACHE_MAX_SIZE: Number(getSecret("MAX_CACHE_SIZE")) ?? DEFAULT.CACHE_MAX_SIZE,
  MONGODB_URI: requireEnv("MONGODB_URI"),
  SALT_ROUNDS: Number(getSecret("SALT_ROUNDS")) || DEFAULT.SALT_ROUNDS,
  ALLOW_REGISTRATION: getSecret("ALLOW_REGISTRATION") == "true"
};

const MONGODB_URI = env.MONGODB_URI;
const cached = global._mongooseCache || {
  conn: null,
  promise: null
};
if (!global._mongooseCache) {
  global._mongooseCache = cached;
}
async function getDbConnection() {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false
    }).then((mongooseInstance) => mongooseInstance);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

const { model: model$2, models: models$2, Schema: Schema$2 } = mongoose;
const BlogSchema = new Schema$2(
  {
    title: {
      type: String,
      required: false,
      trim: true
    },
    slug: {
      type: String,
      required: false,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    content: {
      type: String,
      required: false
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    datePublished: {
      type: Date,
      required: false
    },
    tagIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
        index: true
      }
    ],
    deletedAt: {
      type: Date,
      required: false,
      default: null,
      index: true
    }
  },
  {
    timestamps: true
  }
);
const BlogModel = models$2.Blog || model$2("Blog", BlogSchema);

const { model: model$1, models: models$1, Schema: Schema$1 } = mongoose;
const TagSchema = new Schema$1(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    deletedAt: {
      type: Date,
      required: false,
      default: null,
      index: true
    }
  },
  {
    timestamps: true
  }
);
const TagModel = models$1.Tag || model$1("Tag", TagSchema);

const { Types: MongooseTypes$3 } = mongoose;
function normalizeTag(doc) {
  return {
    _id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
    deletedAt: doc.deletedAt ? doc.deletedAt.toISOString() : null
  };
}
function slugify(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
class TagRepository {
  async ensureConnection() {
    await getDbConnection();
  }
  async findTagsByNameStartingWith(name, limit, offset) {
    await this.ensureConnection();
    let safePrefix = escapeRegex(name);
    const tagDocs = await TagModel.find({
      name: { $regex: new RegExp(`^${safePrefix}`) },
      deletedAt: null
    }).sort({ name: 1 }).skip(offset).limit(limit);
    let normalizedTags = tagDocs.map((tagDoc) => normalizeTag(tagDoc));
    return normalizedTags;
  }
  async createTag(input) {
    await this.ensureConnection();
    if (!input.slug) {
      input.slug = slugify(input.name);
    }
    let { name, slug } = input;
    const originalSlug = slug;
    for (let i = 1; ; i++) {
      let existingSlugTag = await TagModel.findOne({ slug, deletedAt: null });
      if (existingSlugTag) {
        slug = `${originalSlug}-${i + 1}`;
      } else {
        break;
      }
    }
    const tagDoc = await TagModel.create({
      name: name.toLowerCase(),
      slug,
      deletedAt: null
    });
    return normalizeTag(tagDoc);
  }
  async findById(id) {
    await this.ensureConnection();
    if (!MongooseTypes$3.ObjectId.isValid(id)) return null;
    const doc = await TagModel.findOne({ _id: id, deletedAt: null });
    return doc ? normalizeTag(doc) : null;
  }
  async findBySlug(slug) {
    await this.ensureConnection();
    const doc = await TagModel.findOne({ slug, deletedAt: null });
    return doc ? normalizeTag(doc) : null;
  }
  async updateById(id, input) {
    await this.ensureConnection();
    if (!MongooseTypes$3.ObjectId.isValid(id)) return null;
    const doc = await TagModel.findOneAndUpdate(
      { _id: id, deletedAt: null },
      input,
      { new: true }
    );
    return doc ? normalizeTag(doc) : null;
  }
  async softDeleteById(id) {
    await this.ensureConnection();
    if (!MongooseTypes$3.ObjectId.isValid(id)) return;
    await TagModel.updateOne(
      { _id: id, deletedAt: null },
      { deletedAt: /* @__PURE__ */ new Date() }
    );
  }
  async findAll(limit, offset) {
    await this.ensureConnection();
    let tagDocs = await TagModel.find({ deletedAt: null }).sort({ name: "asc" }).skip(offset).limit(limit);
    return tagDocs.map(normalizeTag);
  }
}

const { Types: MongooseTypes$2 } = mongoose;
function normalizeBlog(doc) {
  return {
    _id: doc._id.toString(),
    title: doc.title,
    slug: doc.slug,
    authorId: doc.authorId.toString(),
    content: doc.content,
    datePublished: doc.datePublished ?? null,
    tagIds: doc.tagIds.map((id) => id.toString()),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
    deletedAt: doc.deletedAt ? doc.deletedAt.toISOString() : null
  };
}
class BlogRepository {
  tagRepo = new TagRepository();
  async ensureConnection() {
    await getDbConnection();
  }
  async findById(id) {
    await this.ensureConnection();
    const doc = await BlogModel.findOne({ _id: id, deletedAt: null });
    return doc ? normalizeBlog(doc) : null;
  }
  async findBySlug(slug) {
    await this.ensureConnection();
    const match = { slug, deletedAt: null };
    const docs = await BlogModel.aggregate([
      { $match: match },
      { $limit: 1 },
      {
        $lookup: {
          from: "tags",
          localField: "tagIds",
          foreignField: "_id",
          as: "tags",
          pipeline: [
            { $match: { deletedAt: null } }
            // match only active tags
          ]
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "authorId",
          foreignField: "_id",
          as: "author",
          pipeline: [
            { $match: { deletedAt: null } },
            {
              $project: {
                _id: 1,
                name: 1,
                username: 1
              }
            }
          ]
        }
      },
      {
        $unwind: "$author"
        // changes the author array to single object
      }
    ]);
    if (docs.length == 0) {
      return null;
    }
    const doc = docs[0];
    const blogWithTags = {
      _id: doc._id.toString(),
      title: doc.title,
      slug: doc.slug,
      content: doc.content,
      datePublished: doc.datePublished ?? null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
      deletedAt: doc.deletedAt ? doc.deletedAt.toISOString() : null,
      tags: (doc.tags || []).map((t) => ({
        _id: t._id.toString(),
        name: t.name,
        slug: t.slug,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
        deletedAt: t.deletedAt ? t.deletedAt.toISOString() : null
      })),
      author: {
        _id: doc.author._id.toString(),
        name: doc.author.name,
        username: doc.author.username
      }
    };
    return blogWithTags;
  }
  async slugify(title) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").trim();
  }
  async create(input) {
    await this.ensureConnection();
    let { title, authorId, slug, content, datePublished, tagIds } = input;
    const doc = new BlogModel({
      title,
      authorId,
      slug,
      content,
      datePublished,
      tagIds,
      deletedAt: null
    });
    await doc.save();
    return normalizeBlog(doc);
  }
  async updateById(id, input) {
    await this.ensureConnection();
    if (!MongooseTypes$2.ObjectId.isValid(id)) return null;
    const doc = await BlogModel.findOneAndUpdate(
      { _id: id },
      input,
      { new: true }
    );
    return doc ? normalizeBlog(doc) : null;
  }
  async findAll(limit, offset, onlyPublished, tagIds) {
    await this.ensureConnection();
    const match = { deletedAt: null };
    if (onlyPublished) {
      match.datePublished = { $ne: null };
    }
    if (tagIds && tagIds.length > 0) {
      match.tagIds = { $all: tagIds.map((id) => new MongooseTypes$2.ObjectId(id)) };
    }
    const docs = await BlogModel.aggregate([
      { $match: match },
      { $sort: { createdAt: -1 } },
      { $skip: offset },
      { $limit: limit },
      {
        $lookup: {
          from: "tags",
          localField: "tagIds",
          foreignField: "_id",
          as: "tags",
          pipeline: [
            { $match: { deletedAt: null } }
            // only active tags
          ]
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "authorId",
          foreignField: "_id",
          as: "author",
          pipeline: [
            { $match: { deletedAt: null } },
            {
              $project: {
                _id: 1,
                name: 1,
                username: 1
              }
            }
          ]
        }
      },
      {
        $unwind: "$author"
        // changes the author array to single object
      }
    ]);
    return docs.map((doc) => ({
      _id: doc._id.toString(),
      title: doc.title,
      slug: doc.slug,
      content: doc.content,
      datePublished: doc.datePublished ?? null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
      deletedAt: doc.deletedAt ? doc.deletedAt.toISOString() : null,
      tags: (doc.tags || []).map((t) => ({
        _id: t._id.toString(),
        name: t.name,
        slug: t.slug,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
        deletedAt: t.deletedAt ? t.deletedAt.toISOString() : null
      })),
      author: {
        _id: doc.author._id.toString(),
        name: doc.author.name,
        username: doc.author.username
      }
    }));
  }
  async softDeleteById(id) {
    await this.ensureConnection();
    await BlogModel.updateOne(
      { _id: id },
      { deletedAt: /* @__PURE__ */ new Date() }
    );
  }
}

const { model, models, Schema } = mongoose;
const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      index: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      index: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    name: {
      type: String,
      required: false,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      required: true,
      default: "user"
    },
    deletedAt: {
      type: Date,
      required: false,
      default: null,
      index: true
    }
  },
  {
    timestamps: true
  }
);
const UserModel = models.User || model("User", UserSchema);

const { Types: MongooseTypes$1 } = mongoose;
function normalizeUser(doc) {
  return {
    _id: doc._id.toString(),
    username: doc.username,
    name: doc.name,
    email: doc.email,
    passwordHash: doc.passwordHash,
    role: doc.role,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
    deletedAt: doc.deletedAt ? doc.deletedAt.toISOString() : null
  };
}
class UserRepository {
  async ensureConnection() {
    await getDbConnection();
  }
  async create(input) {
    await this.ensureConnection();
    const userDoc = await UserModel.create({
      username: input.username,
      email: input?.email,
      name: input.name,
      passwordHash: input.passwordHash,
      role: input?.role || "user",
      deletedAt: null
    });
    return normalizeUser(userDoc);
  }
  async findByEmail(email) {
    await this.ensureConnection();
    const doc = await UserModel.findOne({ email, deletedAt: null });
    return doc ? normalizeUser(doc) : null;
  }
  async findById(id) {
    await this.ensureConnection();
    if (!MongooseTypes$1.ObjectId.isValid(id)) return null;
    const doc = await UserModel.findOne({ _id: id, deletedAt: null });
    return doc ? normalizeUser(doc) : null;
  }
  async findByUsername(username) {
    await this.ensureConnection();
    const doc = await UserModel.findOne({ username, deletedAt: null });
    return doc ? normalizeUser(doc) : null;
  }
  async updateById(id, update) {
    await this.ensureConnection();
    if (!MongooseTypes$1.ObjectId.isValid(id)) return null;
    const doc = await UserModel.findOneAndUpdate(
      { _id: id, deletedAt: null },
      update,
      { new: true }
    );
    return doc ? normalizeUser(doc) : null;
  }
  async softDeleteById(id) {
    await this.ensureConnection();
    if (!MongooseTypes$1.ObjectId.isValid(id)) return;
    await UserModel.updateOne(
      { _id: id, deletedAt: null },
      { deletedAt: /* @__PURE__ */ new Date() }
    );
  }
}

const TOKEN_COOKIE_NAME = "auth_token";
async function hashPassword(password) {
  const saltRounds = env.SALT_ROUNDS;
  return bcrypt.hash(password, saltRounds);
}
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}
function signAuthToken(user) {
  const payload = {
    sub: user._id,
    role: user.role
  };
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRY
  });
}
function withAuthCookie(response, token) {
  const cookie = [
    `${TOKEN_COOKIE_NAME}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Strict",
    "Max-Age=604800"
    // 7 days
  ].join("; ");
  response.headers.append("Set-Cookie", cookie);
  return response;
}

class AuthService {
  userRepo;
  constructor(userRepo) {
    this.userRepo = userRepo;
  }
  async login(password, username, email) {
    let user;
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
    let isPasswordCorrect = await verifyPassword(password, user.passwordHash);
    if (!isPasswordCorrect) {
      throw new Error("Invalid Credentials");
    }
    const token = signAuthToken(user);
    let { passwordHash, ...userExceptPasswordHash } = user;
    return { user: userExceptPasswordHash, token };
  }
  async register(name, username, password, email, role) {
    let userByUsername = await this.userRepo.findByUsername(username);
    if (userByUsername) {
      throw new Error("Username already exists");
    }
    let userByEmail = await this.userRepo.findByEmail(email);
    if (userByEmail) {
      throw new Error("Email already exists");
    }
    const hashedPassword = await hashPassword(password);
    const newUser = await this.userRepo.create({
      name,
      username,
      email,
      passwordHash: hashedPassword,
      role: role ?? "user"
    });
    const token = signAuthToken(newUser);
    const { passwordHash, ...userWithPasswordHash } = newUser;
    return { user: userWithPasswordHash, token };
  }
}

class LruCache {
  maxSize;
  map;
  constructor(maxSize) {
    this.maxSize = maxSize;
    this.map = /* @__PURE__ */ new Map();
  }
  get(key) {
    const entry = this.map.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.map.delete(key);
      return null;
    }
    this.map.delete(key);
    this.map.set(key, entry);
    return entry.value;
  }
  set(key, value, ttlMs) {
    const expiresAt = Date.now() + ttlMs;
    if (this.map.has(key)) {
      this.map.delete(key);
    }
    this.map.set(key, { value, expiresAt });
    if (this.map.size > this.maxSize) {
      const lruKey = this.map.keys().next().value;
      if (lruKey !== void 0) {
        this.map.delete(lruKey);
      }
    }
  }
  delete(key) {
    this.map.delete(key);
  }
  clear() {
    this.map.clear();
  }
}

const EXPIRY_HOURS = env.CACHE_EXPIRY_HOURS;
const EXPIRY_HOURS_IN_MILLISECONDS = EXPIRY_HOURS * 60 * 60 * 1e3;
const MAX_CACHE_SIZE = env.CACHE_MAX_SIZE;
const LIST_CACHE = new LruCache(MAX_CACHE_SIZE);
const SLUG_CACHE = new LruCache(MAX_CACHE_SIZE);
function buildListKey(params) {
  return `blogs:list:${params.tagSlug ?? "all"}:limit=${params.limit}:offset=${params.offset}`;
}
function buildSlugKey(slug) {
  return `blogs:slug:${slug}`;
}
function getCachedBlogList(params) {
  const key = buildListKey(params);
  return LIST_CACHE.get(key);
}
function setCachedBlogList(params, blogs) {
  const key = buildListKey(params);
  LIST_CACHE.set(key, blogs, EXPIRY_HOURS_IN_MILLISECONDS);
}
function getCachedBlogBySlug(slug) {
  return SLUG_CACHE.get(buildSlugKey(slug));
}
function setCachedBlogBySlug(slug, blog) {
  SLUG_CACHE.set(buildSlugKey(slug), blog, EXPIRY_HOURS_IN_MILLISECONDS);
}
({
  list: LIST_CACHE.clear,
  slug: SLUG_CACHE.clear
});

const { Types: MongooseTypes } = mongoose;
class BlogService {
  blogRepo;
  tagRepo;
  constructor(blogRepo, tagRepo) {
    this.blogRepo = blogRepo;
    this.tagRepo = tagRepo;
  }
  async listBlogs(limit, offset, published) {
    const cacheKeyParams = {
      limit,
      offset
    };
    let cachedBlogs;
    if (published) {
      cachedBlogs = getCachedBlogList(cacheKeyParams);
      if (!cachedBlogs) {
        let blogs = await this.blogRepo.findAll(limit, offset, true);
        setCachedBlogList(cacheKeyParams, blogs);
        return blogs;
      }
      return cachedBlogs;
    }
    let allBlogs = await this.blogRepo.findAll(limit, offset, false);
    return allBlogs;
  }
  async getBlogBySlug(slug) {
    const cachedBlog = getCachedBlogBySlug(slug);
    if (!cachedBlog) {
      let blog = await this.blogRepo.findBySlug(slug);
      if (!blog) {
        return null;
      }
      setCachedBlogBySlug(slug, blog);
      return blog;
    }
    return cachedBlog;
  }
  async filterBlogsByTag(tagSlug, limit, offset) {
    const cacheKeyParams = {
      limit,
      offset,
      tagSlug
    };
    let cachedBlogList = getCachedBlogList(cacheKeyParams);
    if (!cachedBlogList) {
      let tag = await this.tagRepo.findBySlug(tagSlug);
      if (!tag) {
        return [];
      }
      let blogLists = await this.blogRepo.findAll(limit, offset, true, [tag._id]);
      setCachedBlogList(cacheKeyParams, blogLists);
      return blogLists;
    }
    return cachedBlogList ?? [];
  }
  async generateBlogSlug(title) {
    return await this.blogRepo.slugify(title);
  }
  async verifySlug(slug) {
    let existingBlog = await this.blogRepo.findBySlug(slug);
    return existingBlog ? false : true;
  }
  async createBlog(authorId) {
    let title = "New Blog";
    let mongofiedAuthorId = new MongooseTypes.ObjectId(authorId);
    return this.blogRepo.create({ title, datePublished: null, authorId: mongofiedAuthorId, tagIds: [] });
  }
  async updateBlog(id, fields) {
    let inputfields = {
      title: fields.title,
      slug: fields.slug,
      content: fields.content,
      datePublished: fields.datePublished,
      authorId: new MongooseTypes.ObjectId(fields.authorId),
      tagIds: fields.tagIds?.map((id2) => new MongooseTypes.ObjectId(id2)) ?? []
    };
    return this.blogRepo.updateById(id, inputfields);
  }
}

class TagService {
  tagRepo;
  constructor(tagRepo) {
    this.tagRepo = tagRepo;
  }
  async getAllTags(limit, offset) {
    return await this.tagRepo.findAll(limit, offset);
  }
  async searchTag(tagName, limit, offset) {
    return await this.tagRepo.findTagsByNameStartingWith(tagName, limit, offset);
  }
}

let blogServiceInstance = null;
let authServiceInstance = null;
let tagServiceInstance = null;
var Service = /* @__PURE__ */ ((Service2) => {
  Service2[Service2["blog"] = 0] = "blog";
  Service2[Service2["auth"] = 1] = "auth";
  Service2[Service2["tag"] = 2] = "tag";
  return Service2;
})(Service || {});
function getService(serviceName) {
  switch (serviceName) {
    case 0 /* blog */:
      if (!blogServiceInstance) {
        const blogRepo = new BlogRepository();
        const tagRepo = new TagRepository();
        blogServiceInstance = new BlogService(blogRepo, tagRepo);
      }
      return blogServiceInstance;
    case 1 /* auth */:
      if (!authServiceInstance) {
        const userRepo = new UserRepository();
        authServiceInstance = new AuthService(userRepo);
      }
      return authServiceInstance;
    case 2 /* tag */:
      if (!tagServiceInstance) {
        const tagRepo = new TagRepository();
        tagServiceInstance = new TagService(tagRepo);
      }
      return tagServiceInstance;
    default:
      throw new Error("Unknown Service Requested");
  }
}

function json(data, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("Content-Type", "application/json");
  return new Response(JSON.stringify(data), {
    ...init,
    headers
  });
}
function error(message, status = StatusCodes.BAD_REQUEST) {
  return json({ error: message }, { status });
}

export { Service as S, env as a, error as e, getService as g, json as j, withAuthCookie as w };
