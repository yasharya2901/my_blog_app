# Blog API Documentation

## Table of Contents

1. [Overview](#overview)
2. [Response Schemas](#response-schemas)
    - [Blog Object](#blog-object)
    - [Tag Object](#tag-object)
    - [User Object](#user-object)
3. [Auth Endpoints](#auth-endpoints)
    - [Login](#auth-login)
    - [Register](#auth-register)
    - [Logout](#auth-logout)
4. [Public Endpoints](#public-endpoints)
    - [Get All Blogs](#public-get-all-blogs)
    - [Get All Blogs with Tag](#public-get-all-blogs-with-tag)
    - [Get A Blog](#public-get-a-blog)
    - [Get All Tags](#public-get-all-tags)
5. [Private Endpoints (Authenticated)](#private-endpoints)
    - [Get All Blogs (Admin)](#private-get-all-blogs)
    - [Create A Blog](#private-create-a-blog)
    - [Update A Blog](#private-update-a-blog)
    - [Delete A Blog](#private-delete-a-blog)
    - [Search Tag](#private-search-tag)
    - [Create Tag](#private-create-tag)
    - [Slug Management](#slug-management)
6. [Caching Strategy](#caching-strategy)
7. [Error Responses](#error-responses)

---

## Overview

* **Base URL:** `/api`
* **Authentication:** Private routes require authentication via `auth_token` HTTP-only cookie.
* **Middleware:** All private routes are protected by `auth_middleware`.
* **Data Format:** JSON

---

## Response Schemas

### Blog Object <a id="blog-object"></a>

```json
{
  "_id": "string",
  "title": "string",
  "slug": "string",
  "content": "string (HTML/Markdown)",
  "datePublished": "string (ISO 8601) | null",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)",
  "deletedAt": "string (ISO 8601) | null",
  "tags": [
    {
      "_id": "string",
      "name": "string",
      "slug": "string",
      "createdAt": "string (ISO 8601)",
      "updatedAt": "string (ISO 8601)",
      "deletedAt": "string (ISO 8601) | null"
    }
  ],
  "author": {
    "_id": "string",
    "name": "string",
    "username": "string"
  }
}
```

### Tag Object <a id="tag-object"></a>

```json
{
  "_id": "string",
  "name": "string",
  "slug": "string",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)",
  "deletedAt": "string (ISO 8601) | null"
}
```

### User Object <a id="user-object"></a>

```json
{
  "_id": "string",
  "username": "string",
  "email": "string",
  "name": "string",
  "role": "user" | "admin",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)",
  "deletedAt": "string (ISO 8601) | null"
}
```

**Note:** The `passwordHash` field is never included in API responses.

---

## Auth Endpoints

### Login <a id="auth-login"></a>
Authenticate a user and receive an auth token.

* **Endpoint:** `/api/login`
* **Method:** `POST`
* **Authentication:** None

**Request Body:**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `password` | String | **Yes** | User's password. |
| `username` | String | No* | User's username (*either username or email required). |
| `email` | String | No* | User's email (*either username or email required). |

**Note:** At least one of `username` or `email` must be provided.

**Example Request:**
```json
{
  "username": "johndoe",
  "password": "securePassword123"
}
```

**Response:**
Sets `auth_token` HTTP-only cookie and returns a [User Object](#user-object).

**Example Response:**
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "username": "johndoe",
  "email": "john@example.com",
  "name": "John Doe",
  "role": "user",
  "createdAt": "2025-11-15T08:00:00.000Z",
  "updatedAt": "2025-11-15T08:00:00.000Z",
  "deletedAt": null
}
```

### Register <a id="auth-register"></a>
Create a new user account.

* **Endpoint:** `/api/register`
* **Method:** `POST`
* **Authentication:** None

**Request Body:**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `username` | String | **Yes** | Unique username for the account. |
| `name` | String | **Yes** | User's full name. |
| `password` | String | **Yes** | Password for the account. |
| `email` | String | No | User's email address. |

**Note:** 
- The `role` field is automatically set to `"user"` for security reasons.
- To create an admin user, use the `scripts/create-admin.ts` script in the root directory.

**Example Request:**
```json
{
  "username": "janedoe",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securePassword456"
}
```

**Response:**
Sets `auth_token` HTTP-only cookie and returns a [User Object](#user-object).

**Example Response:**
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "username": "janedoe",
  "email": "jane@example.com",
  "name": "Jane Doe",
  "role": "user",
  "createdAt": "2025-12-05T10:30:00.000Z",
  "updatedAt": "2025-12-05T10:30:00.000Z",
  "deletedAt": null
}
```

### Logout <a id="auth-logout"></a>
Invalidate the current user session.

* **Endpoint:** `/api/logout`
* **Method:** `POST`
* **Authentication:** Required
* **Middleware:** `auth_middleware`

**Response:**
Clears the `auth_token` HTTP-only cookie.

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Public Endpoints

### Get All Blogs <a id="public-get-all-blogs"></a>
Retrieve a paginated list of published blogs sorted by their date of publishing (most recent first).

* **Endpoint:** `/api/blogs`
* **Method:** `GET`
* **Authentication:** None

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `limit` | Integer | No | `6` | Number of items per page. |
| `offset` | Integer | No | `0` | Number of items to skip. |

**Response:**
Returns an array of [Blog Objects](#blog-object).

**Example Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Getting Started with Astro",
    "slug": "getting-started-with-astro",
    "content": "<p>Content here...</p>",
    "datePublished": "2025-12-01T10:00:00.000Z",
    "createdAt": "2025-11-30T08:00:00.000Z",
    "updatedAt": "2025-12-01T09:00:00.000Z",
    "deletedAt": null,
    "tags": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "name": "astro",
        "slug": "astro",
        "createdAt": "2025-11-20T08:00:00.000Z",
        "updatedAt": "2025-11-20T08:00:00.000Z",
        "deletedAt": null
      }
    ],
    "author": {
      "_id": "507f1f77bcf86cd799439013",
      "name": "John Doe",
      "username": "johndoe"
    }
  }
]
```

### Get All Blogs with Tag <a id="public-get-all-blogs-with-tag"></a>
Retrieve published blogs filtered by a specific tag sorted by their date of publishing (most recent first).

* **Endpoint:** `/api/blogs/tag/:tagSlug`
* **Method:** `GET`
* **Authentication:** None

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `tagSlug` | String | **Yes** | The unique slug of the tag to filter by. |

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `limit` | Integer | No | `6` | Number of items per page. |
| `offset` | Integer | No | `0` | Number of items to skip. |

**Response:**
Returns an array of [Blog Objects](#blog-object) matching the tag.

### Get A Blog <a id="public-get-a-blog"></a>
Retrieve a single blog post by its slug.

* **Endpoint:** `/api/blogs/:blogSlug`
* **Method:** `GET`
* **Authentication:** None

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `blogSlug` | String | **Yes** | The unique slug name of the blog. |

**Response:**
Returns a single [Blog Object](#blog-object).

### Get All Tags <a id="public-get-all-tags"></a>
Retrieve a list of available tags sorted by their name.

* **Endpoint:** `/api/tags`
* **Method:** `GET`
* **Authentication:** None

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `limit` | Integer | No | `6` | Number of tags to return. |
| `offset` | Integer | No | `0` | Number of tags to skip. |

**Response:**
Returns an array of [Tag Objects](#tag-object).

---

## Private Endpoints

**Note:** All endpoints below require Authentication. Authentication is done via `auth_token` from the HTTP-only cookie. All private routes are protected by `auth_middleware`.

### Get All Blogs (Admin) <a id="private-get-all-blogs"></a>
Retrieve a list of all blogs including unpublished drafts, sorted by creation date.

* **Endpoint:** `/api/private/blogs`
* **Method:** `GET`
* **Authentication:** Required (Admin only)
* **Middleware:** `auth_middleware`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `limit` | Integer | No | `10` | Number of items per page. |
| `offset` | Integer | No | `0` | Number of items to skip. |
| `published` | Boolean | No | `false` | Filter by publication status. |

**Response:**
Returns an array of [Blog Objects](#blog-object), including unpublished drafts.

### Create A Blog <a id="private-create-a-blog"></a>
Create a new blog post.

* **Endpoint:** `/api/private/blogs`
* **Method:** `POST`
* **Authentication:** Required (Admin only)
* **Middleware:** `auth_middleware`

**Request Body:**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `title` | String | **Yes** | The title of the blog post. |
| `content` | String | **Yes** | The content of the blog (HTML/Markdown). |
| `tagIds` | Array\<String\> | **Yes** | Array of tag IDs to associate with the blog. |
| `datePublished` | String (ISO 8601) \| null | **Yes** | Publication date (null for drafts). |
| `slug` | String | No | Custom slug (auto-generated from title if not provided). |

**Note:** The `authorId` is automatically derived from the authenticated user's token.

**Example Request:**
```json
{
  "title": "Getting Started with Astro",
  "content": "<p>This is a comprehensive guide...</p>",
  "tagIds": ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439014"],
  "datePublished": "2025-12-05T10:00:00.000Z",
  "slug": "getting-started-with-astro"
}
```

**Response:**
Returns the created [Blog Object](#blog-object).

### Update A Blog <a id="private-update-a-blog"></a>
Update an existing blog post. Only specified fields will be updated (partial update).

* **Endpoint:** `/api/private/blogs/:id`
* **Method:** `PATCH`
* **Authentication:** Required (Admin only)
* **Middleware:** `auth_middleware`

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | **Yes** | The unique ID of the blog to update. |

**Request Body:**
All fields are optional. Only include fields you want to update.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `title` | String | No | Updated title. |
| `content` | String | No | Updated content (HTML/Markdown). |
| `tagIds` | Array\<String\> | No | Updated array of tag IDs. |
| `datePublished` | String (ISO 8601) \| null | No | Updated publication date. |
| `slug` | String | No | Updated slug. |

**Example Request:**
```json
{
  "title": "Updated Title",
  "datePublished": null
}
```

**Response:**
Returns the updated [Blog Object](#blog-object).

### Delete A Blog <a id="private-delete-a-blog"></a>
Soft delete a blog post. The blog will be marked as deleted but not removed from the database.

* **Endpoint:** `/api/private/blogs/:id`
* **Method:** `DELETE`
* **Authentication:** Required (Admin only)
* **Middleware:** `auth_middleware`

**Path Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | **Yes** | The unique ID of the blog to delete. |

**Behavior:** 
This endpoint performs a **soft delete** by setting the `deletedAt` field to the current timestamp. The blog will no longer appear in queries but remains in the database.

**Response:**
```json
{
  "success": true,
  "message": "Blog deleted successfully"
}
```

### Search Tag <a id="private-search-tag"></a>
Search for tags by name prefix (autocomplete/search functionality).

* **Endpoint:** `/api/private/tags/search`
* **Method:** `GET`
* **Authentication:** Required (Admin only)
* **Middleware:** `auth_middleware`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `query` | String | **Yes** | - | Search query (matches tag names starting with this prefix). |
| `limit` | Integer | No | `10` | Number of tags to return. |
| `offset` | Integer | No | `0` | Number of tags to skip. |

**Response:**
Returns an array of [Tag Objects](#tag-object) matching the search query.

**Example Request:**
```
GET /api/private/tags/search?query=java&limit=5
```

**Example Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "name": "javascript",
    "slug": "javascript",
    "createdAt": "2025-11-20T08:00:00.000Z",
    "updatedAt": "2025-11-20T08:00:00.000Z",
    "deletedAt": null
  },
  {
    "_id": "507f1f77bcf86cd799439015",
    "name": "java",
    "slug": "java",
    "createdAt": "2025-11-21T08:00:00.000Z",
    "updatedAt": "2025-11-21T08:00:00.000Z",
    "deletedAt": null
  }
]
```

### Create Tag <a id="private-create-tag"></a>
Create a new tag.

* **Endpoint:** `/api/private/tags`
* **Method:** `POST`
* **Authentication:** Required (Admin only)
* **Middleware:** `auth_middleware`

**Request Body:**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | String | **Yes** | The name of the tag. |

**Note:** The `slug` is automatically generated from the tag name by the backend. If a slug conflict occurs, a numeric suffix is appended.

**Example Request:**
```json
{
  "name": "TypeScript"
}
```

**Response:**
Returns the created [Tag Object](#tag-object).

**Example Response:**
```json
{
  "_id": "507f1f77bcf86cd799439016",
  "name": "typescript",
  "slug": "typescript",
  "createdAt": "2025-12-05T10:00:00.000Z",
  "updatedAt": "2025-12-05T10:00:00.000Z",
  "deletedAt": null
}
```

### Slug Management <a id="slug-management"></a>

#### Generate Blog's Slug
Generate a URL-friendly slug from a blog title.

* **Endpoint:** `/api/private/blogs/slugs/generate`
* **Method:** `POST`
* **Authentication:** Required (Admin only)
* **Middleware:** `auth_middleware`

**Request Body:**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `title` | String | **Yes** | The blog title to generate a slug from. |

**Example Request:**
```json
{
  "title": "Getting Started with Astro Framework"
}
```

**Response:**
```json
{
  "slug": "getting-started-with-astro-framework"
}
```

#### Verify the Blog's Slug
Check if a slug is available (not already in use).

* **Endpoint:** `/api/private/blogs/slugs/verify`
* **Method:** `POST`
* **Authentication:** Required (Admin only)
* **Middleware:** `auth_middleware`

**Request Body:**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `slug` | String | **Yes** | The slug to verify. |

**Example Request:**
```json
{
  "slug": "my-awesome-blog"
}
```

**Response:**
```json
{
  "available": true
}
```

Or if slug is taken:
```json
{
  "available": false
}
```

---

## Caching Strategy <a id="caching-strategy"></a>

* **Scope:** Caching is applied **only** to Public Routes.
* **Mechanism:** LRU (Least Recently Used) Cache with TTL.
* **TTL:** 6 hours (configurable via `EXPIRY_HOURS` environment variable).
* **Max Cache Size:** 100 entries (configurable via `MAX_CACHE_SIZE` environment variable).

### Cache Keys

**1. List View (All Published Blogs):**
```text
blogs:list:all:limit=${limit}:offset=${offset}
```

**2. List View (Filtered by Tag):**
```text
blogs:list=${tagSlug}:limit=${limit}:offset=${offset}
```

**3. Single Blog View:**
```text
blogs:slug:${slug}
```

### Invalidation Rules

To ensure data consistency, the following actions trigger cache invalidation:

| Trigger | Action |
| :--- | :--- |
| Blog Created | Clear all list cache keys (`LIST_CACHE.clear()`). |
| Blog Updated | Clear all list cache keys + invalidate specific `blogs:slug:${slug}` key. |
| Blog Deleted | Clear all list cache keys + invalidate specific `blogs:slug:${slug}` key. |
| Tag Created/Updated/Deleted | Clear all list cache keys (tags affect blog responses). |

**Note:** The aggressive cache invalidation strategy ensures data consistency at the cost of cache efficiency. All list views are cleared on any write operation.

---

## Error Responses <a id="error-responses"></a>

<!-- TODO: Document standard error response formats (400, 401, 403, 404, 500, etc.) -->
