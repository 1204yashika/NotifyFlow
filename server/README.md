# NotifyFlow — Server

A REST + WebSocket backend for NotifyFlow, a real-time task and workspace management platform. Built with **Node.js**, **Express**, **MongoDB**, **Redis**, **Socket.io**, and **BullMQ**.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Architecture](#architecture)
  - [Module Pattern](#module-pattern)
  - [Authentication & Authorization](#authentication--authorization)
  - [Real-time Notifications (Socket.io)](#real-time-notifications-socketio)
  - [Background Jobs (BullMQ)](#background-jobs-bullmq)
  - [Caching (Redis)](#caching-redis)
  - [File Uploads (S3)](#file-uploads-s3)
  - [Event System](#event-system)
  - [Rate Limiting](#rate-limiting)
  - [Validation](#validation)
  - [Logging](#logging)
  - [Error Handling](#error-handling)
- [Database Models](#database-models)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (ESM, TypeScript) |
| HTTP Framework | Express 5 |
| Database | MongoDB via Mongoose |
| Cache / Queue broker | Redis via ioredis |
| Real-time | Socket.io |
| Background jobs | BullMQ |
| Authentication | JWT (access + refresh tokens) |
| File storage | AWS S3 + presigned URLs |
| Email | Nodemailer (SMTP) |
| Validation | Zod |
| Logging | Pino + pino-http |
| API docs | Swagger UI (swagger-ui-express) |
| Password hashing | bcryptjs |
| Security headers | Helmet |

---

## Project Structure

```
server/src/
├── app.ts                        # Express app — middleware + route mounting
├── server.ts                     # HTTP server entry point, graceful shutdown
│
├── config/
│   ├── env.ts                    # Zod-validated environment variables
│   ├── db.ts                     # MongoDB connection
│   ├── redis.ts                  # ioredis client + connection status flag
│   ├── logger.ts                 # Pino logger (pretty in dev, JSON in prod)
│   ├── mailer.ts                 # Nodemailer SMTP transport
│   ├── s3.ts                     # AWS S3 client
│   └── socket.ts                 # Socket.io initialisation
│
├── modules/                      # Feature modules (MVC + repository layer)
│   ├── auth/
│   ├── workspace/
│   ├── task/
│   ├── user/
│   ├── attachment/
│   └── health/
│
├── middlewares/
│   ├── authenticate.ts           # JWT verification → req.user
│   ├── authorize.ts              # Role-based access (owner / member / viewer)
│   ├── rateLimiter.ts            # IP-based Redis rate limiter
│   ├── errorHandler.ts           # Global error handler
│   ├── requestLogger.ts          # Pino HTTP request logging
│   ├── upload.ts                 # Multer (memory storage, 5 MB limit)
│   ├── validateBody.ts           # Zod body validation
│   └── validateQuery.ts          # Zod query param validation
│
├── events/
│   ├── eventEmitter.ts           # Typed Node.js EventEmitter
│   ├── events.ts                 # Event name constants
│   └── handlers/
│       ├── task.events.ts        # Task event → socket + email queue
│       └── workspace.events.ts   # Workspace event → socket
│
├── sockets/
│   └── handlers/
│       └── notification.handler.ts  # Socket.io room join + auth
│
├── queues/
│   ├── email.queue.ts            # BullMQ email queue definition
│   ├── email.worker.ts           # Worker that processes email jobs
│   └── jobs/
│       └── sendTaskAssigned.ts   # Sends "task assigned" email via Nodemailer
│
├── utils/
│   ├── ApiError.ts               # Custom operational error class
│   ├── ApiResponse.ts            # Standard response envelope
│   ├── notify.ts                 # Socket.io broadcast helpers
│   └── cache.ts                  # Redis get/set/del with TTL
│
├── types/
│   └── express.d.ts              # Augments Express Request with `user`
│
└── docs/
    └── swagger.ts                # Swagger/OpenAPI setup
```

Each module under `modules/` follows the same internal layout:

```
<module>/
├── <module>.router.ts       # Express router — declares routes + middleware
├── <module>.controller.ts   # Request/response handling
├── <module>.service.ts      # Business logic
├── <module>.repository.ts   # Database queries (Mongoose)
├── <module>.model.ts        # Mongoose model + schema
└── <module>.schema.ts       # Zod validation schemas
```

---

## Environment Variables

All variables are validated at startup with Zod. The server exits immediately if any required variable is missing or invalid.

```env
# App
NODE_ENV=development          # development | production | test
PORT=5000

# Database
MONGO_CONNECTION_STRING=mongodb+srv://...

# JWT
JWT_SECRET=<min 32 chars>
JWT_REFRESH_SECRET=<min 32 chars>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Redis (Upstash or any Redis URL)
REDIS_URL=rediss://...

# CORS
CLIENT_URL=http://localhost:5173

# Email (SMTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=you@example.com
SMTP_PASS=yourpassword
EMAIL_FROM=no-reply@example.com

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_BUCKET_NAME=notifyflow-uploads
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Development (auto-reload with tsx + nodemon)
npm run dev

# Production build
npm run build
npm start
```

The server runs on `PORT` (default `5000`).
API docs are available at `http://localhost:5000/api/docs`.
Health check: `GET http://localhost:5000/api/v1/health`
Server ping: `GET http://localhost:5000/`

---

## API Reference

All endpoints are prefixed with `/api/v1`. Auth-protected routes require:

```
Authorization: Bearer <access_token>
```

### Health

| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/health` | MongoDB + Redis connectivity status |

### Root

| Method | Path | Description |
|---|---|---|
| GET | `/` | Server uptime ping |

### Auth

| Method | Path | Auth | Rate limit |
|---|---|---|---|
| POST | `/api/v1/auth/register` | No | Rate limited |
| POST | `/api/v1/auth/login` | No | Rate limited |
| POST | `/api/v1/auth/refresh` | No | — |
| POST | `/api/v1/auth/logout` | Yes | — |

### Users

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/users/me` | Yes | Get current user profile |

### Workspaces

| Method | Path | Auth | Role |
|---|---|---|---|
| POST | `/api/v1/workspaces` | Yes | — |
| GET | `/api/v1/workspaces` | Yes | — |
| GET | `/api/v1/workspaces/:workspaceId` | Yes | owner, member, viewer |
| POST | `/api/v1/workspaces/:workspaceId/members` | Yes | owner |
| DELETE | `/api/v1/workspaces/:workspaceId/members/:userId` | Yes | owner |

### Tasks

| Method | Path | Auth | Role |
|---|---|---|---|
| POST | `/api/v1/workspaces/:workspaceId/tasks` | Yes | owner, member |
| GET | `/api/v1/workspaces/:workspaceId/tasks` | Yes | owner, member, viewer |
| GET | `/api/v1/workspaces/:workspaceId/tasks/:taskId` | Yes | owner, member, viewer |
| PATCH | `/api/v1/workspaces/:workspaceId/tasks/:taskId` | Yes | owner, member |
| DELETE | `/api/v1/workspaces/:workspaceId/tasks/:taskId` | Yes | owner, member |

Task listing supports cursor-based pagination and filters: `status`, `priority`, `assignedTo`.

### Attachments

| Method | Path | Auth | Role |
|---|---|---|---|
| POST | `/api/v1/workspaces/:workspaceId/attachments` | Yes | owner, member |
| GET | `/api/v1/workspaces/:workspaceId/attachments` | Yes | owner, member, viewer |
| GET | `/api/v1/workspaces/:workspaceId/attachments/:attachmentId/url` | Yes | owner, member, viewer |
| DELETE | `/api/v1/workspaces/:workspaceId/attachments/:attachmentId` | Yes | owner, member |

---

## Architecture

### Module Pattern

Each feature is a self-contained module under `src/modules/`. The layers are:

- **Router** — declares HTTP routes, applies middleware (auth, validate, rate limit)
- **Controller** — reads from `req`, calls service, writes to `res`
- **Service** — business logic, emits internal events, enqueues jobs
- **Repository** — all Mongoose queries live here (no raw DB calls in service)
- **Model** — Mongoose schema and model
- **Schema** — Zod schemas for request validation

### Authentication & Authorization

**Access tokens** are short-lived JWTs (15 min default) signed with `JWT_SECRET`. **Refresh tokens** are long-lived (7 days), stored in the user's DB document, and rotated on every refresh call.

The `authenticate` middleware verifies the Bearer token and attaches `req.user` (`userId`).

The `authorize(...roles)` middleware loads the workspace and checks that the current user's membership role is in the allowed set. Roles are: `owner > member > viewer`.

### Real-time Notifications (Socket.io)

Socket.io shares the same HTTP server as Express. On connection the client passes a JWT in `socket.handshake.auth.token`. The server verifies it, extracts `userId`, and automatically:

- Joins the socket to the `user:{userId}` room
- Joins the socket to `workspace:{workspaceId}` for every workspace the user belongs to

Internal events (task created, member invited, etc.) are caught by event handlers that call Socket.io broadcast helpers in `utils/notify.ts`. The client receives events on the `notification` channel with a typed payload.

**Notification event types:**
- `task_created`
- `task_updated`
- `task_deleted`
- `member_invited`
- `member_removed`

### Background Jobs (BullMQ)

BullMQ uses Redis as its broker. The **email queue** processes jobs asynchronously so HTTP responses are never delayed by email sending.

**Flow for task assignment email:**
1. Task is created/updated with an `assignedTo` field
2. Task service emits a `TASK_CREATED` / `TASK_UPDATED` internal event
3. Task event handler enqueues an `email` job of type `task_assigned`
4. The email worker picks up the job, calls `sendTaskAssigned`, and sends the email via Nodemailer
5. Worker retries failed jobs automatically with exponential backoff

If Redis is unavailable the worker logs a warning and the server continues without email functionality — the HTTP API is unaffected.

### Caching (Redis)

`utils/cache.ts` wraps ioredis with `get`, `set` (with TTL), and `del` helpers.

Cached resources:

| Resource | Invalidated on |
|---|---|
| Workspace by ID | Workspace update, member change |
| Workspaces by user | Workspace create, member change |
| Task by ID | Task update, delete |

Rate limiting also uses Redis (see below). If Redis is down, caching and rate limiting degrade gracefully and the app continues with direct DB reads.

### File Uploads (S3)

Attachments are uploaded via `multipart/form-data`. Multer stores the file in memory (Buffer), then the attachment service streams it to S3.

- **Max file size:** 5 MB
- **Allowed MIME types:** `image/jpeg`, `image/png`, `image/webp`, `application/pdf`, `text/plain`
- **Download:** a presigned S3 URL is generated on demand (short TTL) — files are never proxied through the server

File metadata (name, S3 key, size, MIME type) is saved in MongoDB.

### Event System

A typed `EventEmitter` in `events/eventEmitter.ts` decouples services from side effects. Services emit events; handlers in `events/handlers/` register listeners at startup and trigger socket broadcasts or email jobs.

Events defined in `events/events.ts`:
- `TASK_CREATED`
- `TASK_UPDATED`
- `TASK_DELETED`
- `MEMBER_INVITED`
- `MEMBER_REMOVED`

Handlers never throw — errors are caught and logged so a failed notification never affects the HTTP response.

### Rate Limiting

The `rateLimiter(maxRequests, windowSeconds)` middleware is IP-based and backed by Redis. It sets three response headers:

```
X-RateLimit-Limit      total requests allowed in the window
X-RateLimit-Remaining  requests left for this IP
X-RateLimit-Reset      unix timestamp when the window resets
```

Currently applied on sensitive auth routes (`/auth/register`, `/auth/login`).

If Redis is unavailable, rate limiting degrades gracefully so the API remains available.

### Validation

Every route that accepts a request body or query parameters uses a Zod schema and one of:

- `validateBody(schema)` — validates `req.body`, returns 422 on failure
- `validateQuery(schema)` — validates `req.query`, returns 422 on failure

Schemas live in `<module>/<module>.schema.ts` and double as TypeScript types via `z.infer<>`.

Environment variables are also Zod-validated in `config/env.ts` — the process exits on startup if anything is missing or wrong-typed.

### Logging

Pino is used throughout for structured JSON logging.

- In `development` the output is pretty-printed via `pino-pretty`
- In `production` it outputs JSON (compatible with log aggregators)
- Every HTTP request is logged by `pino-http` with method, URL, status, response time
- Log levels: `error` (5xx), `warn` (4xx), `info` (all others)
- Errors include the full error object under the `err` key for stack traces

### Error Handling

`utils/ApiError.ts` is a custom error class:

```ts
throw new ApiError(404, 'Task not found');
```

The global `errorHandler` middleware (last in the middleware chain) catches all errors:
- `ApiError` → returns the exact status code and message
- Unknown errors → returns `500` with a generic message (details are logged, not exposed)

---

## Database Models

### User

```
_id            ObjectId
name           String   required, trimmed
email          String   required, unique, lowercase
password       String   bcrypt hash
refresh_token  String | null
createdAt      Date
updatedAt      Date
```

### Workspace

```
_id          ObjectId
name         String   required, 2–50 chars
description  String   max 200 chars
owner        ObjectId → User
members      [{ userId: ObjectId → User, role: 'owner' | 'member' | 'viewer' }]
createdAt    Date
updatedAt    Date

Indexes: members.userId, owner
```

### Task

```
_id          ObjectId
title        String   required, 2–100 chars
description  String   max 500 chars
status       'todo' | 'in_progress' | 'done'   default: 'todo'
priority     'low' | 'medium' | 'high'          default: 'medium'
workspaceId  ObjectId → Workspace
assignedTo   ObjectId → User | null
createdBy    ObjectId → User
dueDate      Date | null
createdAt    Date
updatedAt    Date

Indexes: (workspaceId, createdAt DESC), assignedTo, (workspaceId, status)
```

### Attachment

```
_id          ObjectId
taskId       ObjectId → Task
workspaceId  ObjectId → Workspace
uploadedBy   ObjectId → User
fileName     String
fileKey      String   (S3 object key)
fileSize     Number   (bytes)
mimeType     String
createdAt    Date
updatedAt    Date

Indexes: taskId, workspaceId
```
