# NotifyFlow — Client

A real-time task and workspace management frontend built with **React 19**, **Redux Toolkit**, **RTK Query**, **Socket.io**, and **Tailwind CSS**.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Pages & Routes](#pages--routes)
- [Architecture](#architecture)
  - [State Management](#state-management)
  - [API Layer (RTK Query)](#api-layer-rtk-query)
  - [Auth Flow](#auth-flow)
  - [Real-time (Socket.io)](#real-time-socketio)
  - [Form Handling](#form-handling)
  - [Styling](#styling)
  - [Error Handling](#error-handling)
- [Components](#components)
- [Testing](#testing)
  - [Unit Tests (Vitest)](#unit-tests-vitest)
  - [E2E Tests (Playwright)](#e2e-tests-playwright)

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 19 |
| Routing | React Router v7 |
| State Management | Redux Toolkit |
| Server State / Caching | RTK Query |
| Real-time | Socket.io Client |
| HTTP Client | Axios |
| Forms | react-hook-form + Zod |
| Styling | Tailwind CSS (utility-first, no UI library) |
| Drag & Drop | @hello-pangea/dnd |
| Notifications | react-hot-toast |
| Build Tool | Vite |
| Unit Tests | Vitest + Testing Library |
| E2E Tests | Playwright |
| API Mocking | MSW (Mock Service Worker) |

---

## Project Structure

```
client/
├── src/
│   ├── app/
│   │   └── store.ts                  # Redux store configuration
│   │
│   ├── features/                     # Feature-based modules (co-located slice + API + components)
│   │   ├── auth/
│   │   │   ├── authSlice.ts          # Auth state (user, accessToken, isAuthenticated)
│   │   │   ├── authApi.ts            # RTK Query: register, login, logout
│   │   │   └── components/
│   │   │       ├── LoginForm.tsx
│   │   │       └── RegisterForm.tsx
│   │   ├── task/
│   │   │   ├── taskApi.ts            # RTK Query: getTasks, createTask, updateTask, deleteTask
│   │   │   └── components/
│   │   │       ├── TaskBoard.tsx     # Kanban board with drag-drop
│   │   │       ├── TaskCard.tsx      # Single task card
│   │   │       ├── TaskFilters.tsx   # Status/priority filters + view toggle
│   │   │       ├── TaskList.tsx      # List view with load-more pagination
│   │   │       └── TaskModal.tsx     # Create/edit task form
│   │   ├── workspace/
│   │   │   ├── workspaceSlice.ts     # Active workspace state
│   │   │   ├── workspaceApi.ts       # RTK Query: workspace CRUD + member management
│   │   │   └── components/
│   │   │       ├── CreateWorkspaceModal.tsx
│   │   │       ├── InviteMemberModal.tsx
│   │   │       ├── MemberList.tsx
│   │   │       └── WorkspaceSwitcher.tsx
│   │   ├── notification/
│   │   │   ├── notificationSlice.ts  # In-memory notification list + unread count
│   │   │   └── components/
│   │   │       └── NotificationBell.tsx
│   │   ├── attachment/
│   │   │   ├── attachmentApi.ts      # RTK Query: list, download URL, delete
│   │   │   └── components/
│   │   │       ├── AttachmentList.tsx
│   │   │       └── FileUpload.tsx    # Drag-drop file upload
│   │   └── user/
│   │       └── userApi.ts            # RTK Query: getMe
│   │
│   ├── components/
│   │   ├── ErrorBoundary.tsx         # Top-level error boundary
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx         # Main shell (sidebar + topbar + outlet)
│   │   │   ├── Sidebar.tsx           # Navigation + workspace switcher
│   │   │   ├── Topbar.tsx            # Header with notification bell
│   │   │   ├── AuthLayout.tsx        # Centred layout for login/register
│   │   │   └── UserMenu.tsx          # User dropdown with logout
│   │   └── ui/                       # Shared primitive components
│   │       ├── Badge.tsx             # Role / status badge
│   │       ├── Button.tsx            # Button with variants + loading spinner
│   │       ├── EmptyState.tsx        # Empty state with optional action
│   │       ├── FormError.tsx         # Red error alert
│   │       ├── Input.tsx             # Labelled input with error state
│   │       ├── Modal.tsx             # Dialog (Escape + backdrop to close)
│   │       └── Skeleton.tsx          # Loading skeleton variants
│   │
│   ├── hooks/
│   │   ├── useAppDispatch.ts         # Typed Redux dispatch
│   │   ├── useAppSelector.ts         # Typed Redux selector
│   │   └── useSocket.ts              # Socket.io event listener hook
│   │
│   ├── pages/
│   │   ├── DashboardPage.tsx         # Workspace cards overview
│   │   ├── WorkspacePage.tsx         # Task board/list + member management
│   │   ├── MyTaskPage.tsx            # Tasks assigned to current user
│   │   ├── NotificationsPage.tsx     # Activity feed
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   └── NotFoundPage.tsx
│   │
│   ├── routes/
│   │   ├── AppRouter.tsx             # Route definitions with lazy loading
│   │   └── ProtectedRoute.tsx        # Auth guard (redirects to /login)
│   │
│   ├── services/
│   │   ├── baseApi.ts                # RTK Query base config + token refresh
│   │   └── socket.ts                 # Socket.io client factory
│   │
│   ├── types/
│   │   └── index.ts                  # Shared TypeScript interfaces
│   │
│   └── utils/
│       ├── tokenStorage.ts           # localStorage token helpers
│       └── uuid.ts                   # UUID generation
│
├── e2e/
│   ├── tests/                        # Playwright test suites
│   ├── pages/                        # Page Object Models
│   └── fixtures/                     # Playwright fixtures (authenticated context)
│
├── playwright.config.ts
├── vite.config.ts
└── tailwind.config.js
```

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Backend base URL (leave empty in dev to use Vite proxy) |

**Vite dev proxy** — requests to `/api/*` and `/socket.io/*` are proxied to the backend so you never need CORS config locally.

`.env.development`:
```env
VITE_API_URL=
```

`.env.production`:
```env
VITE_API_URL=https://your-backend-url.com
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Type check
npm run typecheck

# Lint
npm run lint

# Run unit tests
npm run test

# Run E2E tests (headless)
npx playwright test

# Run E2E tests in UI mode (interactive)
npx playwright test --ui
```

> Make sure the backend server is running before starting the client in development mode.

---

## Pages & Routes

| Route | Page | Auth | Description |
|---|---|---|---|
| `/login` | LoginPage | Public | Email + password login |
| `/register` | RegisterPage | Public | New user registration |
| `/` | Redirect | Protected | Redirects to `/dashboard` |
| `/dashboard` | DashboardPage | Protected | All workspaces overview |
| `/workspace/:workspaceId` | WorkspacePage | Protected | Tasks board/list + members |
| `/my-tasks` | MyTaskPage | Protected | Tasks assigned to current user |
| `/notifications` | NotificationsPage | Protected | Activity feed |
| `/*` | NotFoundPage | Any | 404 |

All pages are **lazy-loaded** via `React.lazy()` with a Suspense spinner fallback. The `ProtectedRoute` component wraps all authenticated routes and redirects unauthenticated users to `/login`.

---

## Architecture

### State Management

The app uses **Redux Toolkit** for global client state and **RTK Query** for all server state (fetching, caching, mutations).

#### `authSlice`

Manages authentication state.

```typescript
{
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
}
```

Actions: `setCredentials({ accessToken, user? })`, `logout()`

#### `workspaceSlice`

Tracks the currently active workspace (persisted to `localStorage`).

```typescript
{ activeWorkspaceId: string | null }
```

Actions: `setActiveWorkspace(id)`, `clearActiveWorkspace()`

#### `notificationSlice`

Holds in-memory real-time notifications received via Socket.io. Max 50 stored at a time, newest first.

```typescript
{
  notifications: AppNotification[]
  unreadCount: number
}
```

Actions: `addNotification(notification)`, `markAllRead()`, `clearNotifications()`

Notification types: `task_created`, `task_updated`, `task_deleted`, `member_invited`, `member_removed`

---

### API Layer (RTK Query)

All API calls go through RTK Query, configured in `services/baseApi.ts`.

**Base config:**
- Base URL: `VITE_API_URL/api/v1`
- Auto-injects `Authorization: Bearer {token}` header from Redux state
- On **401** response: automatically calls `POST /auth/refresh`, updates tokens, and retries the original request. If refresh fails, dispatches `logout()`

**Tag types for cache invalidation:** `Workspace`, `Task`, `Attachment`, `User`

#### API endpoints summary

| API | Endpoints |
|---|---|
| `authApi` | register, login, logout |
| `workspaceApi` | getMyWorkspaces, createWorkspace, getWorkspace, inviteMember, removeMember |
| `taskApi` | getTasks (with filters + cursor), createTask, updateTask, deleteTask |
| `attachmentApi` | getAttachments, getDownloadUrl, deleteAttachment |
| `userApi` | getMe |

---

### Auth Flow

```
Register / Login
  → POST /auth/register or /auth/login
  → Response: { accessToken, refreshToken }
  → dispatch(setCredentials({ accessToken }))
  → tokenStorage.setRefresh(refreshToken)
  → navigate('/dashboard')

Protected route access
  → ProtectedRoute checks selectIsAuthenticated
  → Redirect to /login if false

Token expiry (401)
  → baseApi intercepts automatically
  → POST /auth/refresh with refreshToken from localStorage
  → Stores new tokens, retries original request
  → If refresh fails → dispatch(logout()) → redirect to /login

Logout
  → POST /auth/logout
  → dispatch(logout())
  → navigate('/login')
```

Tokens are stored in `localStorage` via `utils/tokenStorage.ts` and hydrated into Redux on app load.

---

### Real-time (Socket.io)

**Setup** (`services/socket.ts`):
- Connects to `VITE_API_URL` (or `/` when proxied)
- Passes the JWT as `socket.handshake.auth.token`
- Reconnects automatically on disconnect

**`useSocket` hook** is used inside `AppLayout` and `WorkspacePage`. It listens for `notification` events from the server and:

| Event | Action |
|---|---|
| `task_created` | Adds task to RTK Query cache if it matches current filters |
| `task_updated` | Updates or repositions task in cache based on new status/priority |
| `task_deleted` | Removes task from all cached queries |
| `member_invited` | Invalidates workspace cache to refetch members |
| `member_removed` | Invalidates workspace cache to refetch members |

Every event also fires a `react-hot-toast` notification and dispatches `addNotification()` to the notification slice.

---

### Form Handling

All forms use **react-hook-form** with **Zod** schema validation via `@hookform/resolvers`.

**Pattern used across all forms:**
```typescript
const schema = z.object({ ... })

const { register, handleSubmit, formState: { errors }, setError } = useForm({
  resolver: zodResolver(schema),
})

// Client errors: errors.field?.message
// Server errors: setError('root', { message: 'API error message' })
```

**Forms in the app:**

| Form | Fields |
|---|---|
| LoginForm | email, password |
| RegisterForm | name, email, password, confirmPassword (with match check) |
| CreateWorkspaceModal | name (2–50 chars), description (optional) |
| InviteMemberModal | email, role (member / viewer) |
| TaskModal | title, description, priority, status, assignedTo, dueDate |

**File uploads** use a custom drag-drop component (`FileUpload.tsx`) with manual `FormData` + `fetch`, since multipart uploads don't fit naturally into RTK Query mutations.

---

### Styling

**Tailwind CSS** — utility-first, no external UI component library. All components are hand-built.

**Brand colors** (extended in `tailwind.config.js`):

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#534AB7` | Buttons, active states, links |
| `primary-light` | `#EEEDFE` | Hover backgrounds, badges |

**Status colors** (inline Tailwind classes):
- Priority high → red
- Priority medium → orange
- Priority low → green
- Role owner → purple
- Role member → blue
- Role viewer → gray

---

### Error Handling

- **`ErrorBoundary`** at the app root catches unhandled render errors and shows a "Something went wrong" fallback with a retry button.
- **Form errors** use `setError('root', ...)` to display API error messages inline below the form.
- **Toast notifications** (`react-hot-toast`) provide success/error feedback for mutations.
- **404** — `NotFoundPage` rendered for unknown routes.

---

## Components

### Layout

| Component | Purpose |
|---|---|
| `AppLayout` | Shell — sidebar + topbar + `<Outlet />`, mounts socket listener |
| `Sidebar` | Navigation links, workspace switcher, user menu |
| `Topbar` | Page header with notification bell |
| `AuthLayout` | Centred card layout for login/register |
| `UserMenu` | Dropdown with sign-out button |

### UI Primitives

| Component | Props of note |
|---|---|
| `Button` | `variant` (primary / outline / ghost), `isLoading` |
| `Input` | `label`, `error` — shows red border + message on error |
| `Modal` | `isOpen`, `onClose`, `title` — Escape + backdrop close |
| `Badge` | `role` ('owner' \| 'member' \| 'viewer') — colour-coded |
| `EmptyState` | `icon`, `title`, `description`, `action` |
| `Skeleton` | `className` — base; `WorkspaceCardSkeleton`, `KanbanSkeleton` presets |
| `FormError` | `message` — hidden when empty |

### Task Feature

| Component | Purpose |
|---|---|
| `TaskBoard` | Kanban — 3 columns (todo / in_progress / done), drag-drop with optimistic updates |
| `TaskCard` | Title, description preview, priority badge, assignee, due date |
| `TaskFilters` | Status + priority dropdowns, kanban/list view toggle |
| `TaskList` | Flat list with cursor-based "Load more" pagination |
| `TaskModal` | Create and edit form; delete button visible in edit mode |

### Workspace Feature

| Component | Purpose |
|---|---|
| `WorkspaceSwitcher` | Dropdown list of all user workspaces |
| `CreateWorkspaceModal` | Create form — navigates to new workspace on success |
| `InviteMemberModal` | Email + role form, shows role descriptions inline |
| `MemberList` | Avatar, name, role badge; remove button visible to owner only |

### Notification Feature

| Component | Purpose |
|---|---|
| `NotificationBell` | Bell icon with unread count badge, dropdown list |

### Attachment Feature

| Component | Purpose |
|---|---|
| `FileUpload` | Drag-drop area, validates type and size before upload |
| `AttachmentList` | List of files with download and delete actions |

---

## Testing

### Unit Tests (Vitest)

```bash
npm run test          # run once
npm run test:watch    # watch mode
```

- **Framework:** Vitest + `@testing-library/react`
- **API mocking:** MSW (Mock Service Worker) via `src/test/server.ts`
- **Setup:** `src/test/setup.ts` imports jest-dom matchers

### E2E Tests (Playwright)

```bash
npx playwright test             # headless, all browsers
npx playwright test --ui        # interactive UI mode
npx playwright test --headed    # headed (visible browser)
npx playwright show-report      # open last HTML report
```

**Browsers:** Chromium, Firefox, Mobile (iPhone 13)

**Test suites:**

| File | What's covered |
|---|---|
| `auth.spec.ts` | Login, register, logout, protected route guards, validation errors |
| `task.spec.ts` | Create, edit, delete tasks; kanban/list view; filters |
| `workspace.spec.ts` | Create workspace, member management, invite, remove |
| `realtime.spec.ts` | Notification bell, two-browser real-time task sync |
| `navigation.spec.ts` | Route navigation and redirects |

**Page Object Models** in `e2e/pages/` provide reusable selectors and actions for `LoginPage`, `RegisterPage`, and `WorkspacePage`.

**`auth.fixture.ts`** provides an `authenticatedPage` Playwright fixture so tests that need a logged-in session skip the login steps.

> Requires the dev server (`npm run dev`) running at `http://localhost:5173` before running E2E tests.
