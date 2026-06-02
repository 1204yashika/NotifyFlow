# NotifyFlow

A full-stack, real-time task and workspace management platform. Teams can create shared workspaces, manage tasks on a Kanban board or list view, assign work to members, attach files, and receive live notifications the moment anything changes — all in a single-page app backed by a typed REST + WebSocket API.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Monorepo Structure](#monorepo-structure)
- [How It All Fits Together](#how-it-all-fits-together)
  - [Request Flow](#request-flow)
  - [Real-time Flow](#real-time-flow)
  - [Email Notification Flow](#email-notification-flow)
  - [Auth Flow](#auth-flow)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [1 — Clone & Install](#1--clone--install)
  - [2 — Configure Environment](#2--configure-environment)
  - [3 — Run in Development](#3--run-in-development)
- [Environment Variables](#environment-variables)
  - [Server](#server)
  - [Client](#client)
- [API Overview](#api-overview)
- [Role & Permission Model](#role--permission-model)
- [Database Models](#database-models)
- [Testing](#testing)
- [Further Reading](#further-reading)

---

## Features

- **Workspaces** — create isolated project spaces, invite teammates by email, assign roles
- **Tasks** — full CRUD with status (`todo / in_progress / done`), priority (`low / medium / high`), assignee, and due date
- **Kanban board** — drag-and-drop columns with optimistic UI updates
- **List view** — cursor-paginated task list with status and priority filters
- **Real-time sync** — any change made by one user instantly appears for all workspace members via Socket.io, with toast notifications
- **File attachments** — drag-drop upload to AWS S3; presigned URLs for download
- **Email notifications** — async email sent when a task is assigned, via BullMQ + Nodemailer
- **JWT auth** — short-lived access tokens + long-lived refresh tokens, auto-rotated on expiry
- **Role-based access** — owner / member / viewer permissions enforced on every route
- **Swagger docs** — interactive API documentation at `/api/docs`

---

## Tech Stack

### Backend

| Layer | Technology |
|---|---|
| Runtime | Node.js (ESM, TypeScript) |
| HTTP Framework | Express 5 |
| Database | MongoDB via Mongoose |
| Cache / Queue broker | Redis (ioredis) |
| Real-time | Socket.io |
| Background jobs | BullMQ |
| Authentication | JWT — access + refresh tokens |
| File storage | AWS S3 + presigned URLs |
| Email | Nodemailer (SMTP) |
| Validation | Zod |
| Logging | Pino + pino-http |
| Security | Helmet, bcryptjs, IP rate limiting |
| API docs | Swagger UI |

### Frontend

| Layer | Technology |
|---|---|
| UI Framework | React 19 |
| Routing | React Router v7 |
| State Management | Redux Toolkit |
| Server State / Caching | RTK Query |
| Real-time | Socket.io Client |
| Forms | react-hook-form + Zod |
| Styling | Tailwind CSS (no UI library — all custom) |
| Drag & Drop | @hello-pangea/dnd |
| Notifications | react-hot-toast |
| Build Tool | Vite |
| Unit Tests | Vitest + Testing Library + MSW |
| E2E Tests | Playwright (Chromium, Firefox, Mobile) |

---

## Monorepo Structure

```
NotifyFlow/
├── client/          # React SPA (Vite)
│   ├── src/
│   │   ├── features/        # Feature modules: auth, task, workspace, notification, attachment, user
│   │   ├── components/      # Layout + shared UI primitives
│   │   ├── pages/           # Route-level page components
│   │   ├── routes/          # React Router config + ProtectedRoute guard
│   │   ├── services/        # RTK Query base API + Socket.io client
│   │   ├── hooks/           # useSocket, typed Redux hooks
│   │   └── utils/           # Token storage, UUID helpers
│   ├── e2e/                 # Playwright E2E tests + page objects + fixtures
│   └── README.md            # Full client documentation
│
├── server/          # Express API + Socket.io
│   ├── src/
│   │   ├── modules/         # Feature modules: auth, task, workspace, user, attachment, health
│   │   ├── config/          # DB, Redis, S3, Mailer, Socket.io, Logger, Env
│   │   ├── middlewares/     # Auth, authorize, rate limit, validate, upload, error handler
│   │   ├── events/          # Typed EventEmitter + task/workspace event handlers
│   │   ├── sockets/         # Socket.io room management + auth
│   │   ├── queues/          # BullMQ email queue + worker
│   │   └── utils/           # ApiError, ApiResponse, notify, cache
│   └── README.md            # Full server documentation
│
└── README.md        # This file
```

Each `features/` module on the client and each `modules/` folder on the server is self-contained — routing, data layer, and UI/controllers all co-located per domain.

---

## How It All Fits Together

### Request Flow

```
Browser
  → HTTPS request to Vite dev proxy (or production CDN)
  → Express middleware chain:
       Helmet (security headers)
       CORS
       Request logger (Pino)
       JSON body parser
       authenticate (JWT verification)
       authorize (role check)
       validateBody / validateQuery (Zod)
       rateLimiter (Redis, auth routes only)
  → Controller → Service → Repository → MongoDB
  → ApiResponse JSON envelope back to client
  → RTK Query updates local cache
```

### Real-time Flow

```
User action (e.g. create task)
  → HTTP POST → Task service
  → Service emits internal TASK_CREATED event (typed EventEmitter)
  → Task event handler broadcasts via Socket.io to workspace:{id} room
  → All connected clients in that room receive 'notification' event
  → useSocket hook updates RTK Query cache (filters-aware)
  → react-hot-toast fires + notification added to Redux slice
```

### Email Notification Flow

```
Task assigned to a user
  → Task event handler enqueues BullMQ job: { type: 'task_assigned', ... }
  → Email worker picks up job asynchronously (Redis-backed queue)
  → sendTaskAssigned sends HTML email via Nodemailer (SMTP)
  → Worker retries automatically on failure with exponential backoff
  → HTTP response already returned — email never blocks the API
```

### Auth Flow

```
Login / Register
  → POST /api/v1/auth/login (or /register)
  → Server returns { accessToken, refreshToken }
  → Client: dispatch(setCredentials({ accessToken }))
            tokenStorage.setRefresh(refreshToken) → localStorage
  → All subsequent requests: Authorization: Bearer <accessToken>

Token expiry (401)
  → RTK Query base query intercepts automatically
  → POST /api/v1/auth/refresh with refreshToken
  → New tokens issued, original request retried transparently
  → If refresh fails → dispatch(logout()) → redirect to /login

Socket auth
  → socket.handshake.auth.token = accessToken
  → Server verifies JWT, joins socket to user + workspace rooms
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- A MongoDB instance (Atlas or local)
- A Redis instance (Upstash or local)
- AWS S3 bucket (for file attachments)
- SMTP credentials (for email)

### 1 — Clone & Install

```bash
git clone https://github.com/your-username/notifyflow.git
cd notifyflow

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2 — Configure Environment

Copy and fill in the environment files:

```bash
# Server
cp server/.env.example server/.env

# Client
cp client/.env.example client/.env.development
```

See [Environment Variables](#environment-variables) below for all required values.

### 3 — Run in Development

Open two terminals:

```bash
# Terminal 1 — server (http://localhost:5000)
cd server && npm run dev

# Terminal 2 — client (http://localhost:5173)
cd client && npm run dev
```

The Vite dev server proxies all `/api/*` and `/socket.io/*` requests to `localhost:5000`, so no CORS configuration is needed locally.

**Useful URLs in development:**

| URL | Purpose |
|---|---|
| `http://localhost:5173` | React app |
| `http://localhost:5000/` | Server uptime ping |
| `http://localhost:5000/api/v1/health` | MongoDB + Redis health check |
| `http://localhost:5000/api/docs` | Swagger interactive API docs |

---

## Environment Variables

### Server

All variables are Zod-validated at startup — the server exits immediately if anything is missing or wrong-typed.

```env
# App
NODE_ENV=development
PORT=5000

# MongoDB
MONGO_CONNECTION_STRING=mongodb+srv://...

# JWT
JWT_SECRET=<min 32 chars>
JWT_REFRESH_SECRET=<min 32 chars>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Redis
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

If Redis is unavailable the server starts and continues running — caching and rate limiting degrade gracefully, email jobs are skipped with a warning, and all core API functionality remains available.

### Client

```env
# Leave empty in dev (Vite proxy handles it)
VITE_API_URL=

# Set to your deployed backend URL in production
# VITE_API_URL=https://your-backend.com
```

---

## API Overview

All endpoints are prefixed with `/api/v1`. Protected routes require `Authorization: Bearer <access_token>`.

| Group | Endpoints |
|---|---|
| **Health** | `GET /health` |
| **Auth** | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout` |
| **Users** | `GET /users/me` |
| **Workspaces** | `GET /workspaces`, `POST /workspaces`, `GET /workspaces/:id`, `POST /workspaces/:id/members`, `DELETE /workspaces/:id/members/:userId` |
| **Tasks** | `GET /workspaces/:id/tasks`, `POST /workspaces/:id/tasks`, `GET /workspaces/:id/tasks/:taskId`, `PATCH /workspaces/:id/tasks/:taskId`, `DELETE /workspaces/:id/tasks/:taskId` |
| **Attachments** | `GET /workspaces/:id/attachments`, `POST /workspaces/:id/attachments`, `GET /workspaces/:id/attachments/:aid/url`, `DELETE /workspaces/:id/attachments/:aid` |

Task listing supports cursor-based pagination and filters: `status`, `priority`, `assignedTo`.

Full interactive documentation: **`GET /api/docs`**

---

## Role & Permission Model

Every workspace member has one of three roles. All routes enforce the role check via the `authorize` middleware before reaching the controller.

| Action | owner | member | viewer |
|---|---|---|---|
| View workspace & tasks | Yes | Yes | Yes |
| Create / edit / delete tasks | Yes | Yes | No |
| Upload / delete attachments | Yes | Yes | No |
| Invite members | Yes | No | No |
| Remove members | Yes | No | No |

---

## Database Models

| Model | Key Fields |
|---|---|
| **User** | `name`, `email` (unique), `password` (bcrypt), `refresh_token` |
| **Workspace** | `name`, `description`, `owner` → User, `members[]` `{ userId, role }` |
| **Task** | `title`, `description`, `status`, `priority`, `workspaceId`, `assignedTo`, `createdBy`, `dueDate` |
| **Attachment** | `fileName`, `fileKey` (S3), `fileSize`, `mimeType`, `taskId`, `workspaceId`, `uploadedBy` |

Full schema definitions with field constraints and indexes: see [server/README.md](server/README.md#database-models).

---

## Testing

### Client — Unit Tests (Vitest)

```bash
cd client
npm run test
```

Uses `@testing-library/react` with MSW (Mock Service Worker) for API mocking.

### Client — E2E Tests (Playwright)

```bash
cd client

# Headless (all browsers)
npx playwright test

# Interactive UI mode
npx playwright test --ui

# View last report
npx playwright show-report
```

**Browsers:** Chromium, Firefox, iPhone 13 (mobile)

**Coverage:** auth flows, task CRUD, workspace management, real-time two-browser sync, navigation

> Requires both the server and client dev servers to be running before running E2E tests.

---

## Further Reading

- [client/README.md](client/README.md) — full frontend documentation: state management, RTK Query, Socket.io hook, component reference, form patterns, styling tokens
- [server/README.md](server/README.md) — full backend documentation: module pattern, middleware chain, BullMQ job flow, caching strategy, event system, logging, error handling
