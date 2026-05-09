# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Peano is a bilingual (zh-CN/en) sticky-note management app with rich text editing, tags, status markers, and image upload. It has a Go backend and a React frontend.

## Common Commands

### Backend (Go)

Run from repo root:

```bash
# Start backend (requires CGO_ENABLED=1 for SQLite)
cd backend && go run app/cmd/main.go --env app/cmd/.env

# Format code
cd backend && go fmt ./...

# Generate Swagger docs
cd backend && swag init -g app/cmd/main.go -o app/docs --parseDependency --parseInternal --parseDepth 1

# Build Linux binary (cross-compile, CGO_ENABLED=0)
cd backend && go build -ldflags="-s -w" -o ./build/peano-backend ./app/cmd/main.go
```

### Frontend (React + Vite)

Uses **Bun** as package manager:

```bash
# Install dependencies
cd frontend && bun install

# Start dev server (port 5174, proxies /api and /uploads to backend)
cd frontend && bun run dev

# Build for production
cd frontend && bun run build

# Lint
cd frontend && bun run lint
```

### Taskfile

`task --list` shows available tasks (backend:run, backend:build, backend:swagger, backend:fmt, frontend:run, frontend:build).

## Backend Architecture

### Dependency Injection with Uber FX

The backend uses **Uber FX** for dependency injection. `backend/app/cmd/main.go` bootstraps the app by composing FX modules in order:

1. `plugins.PluginsModule` — provides `*gorm.DB` (SQLite via CGO)
2. `repo.RepoModule` — data access layer + invokes `baseRepo.InitBaseData` on startup
3. `logic.LogicModule` — business logic layer
4. `handler.HandlerModule` — HTTP handlers
5. `server.ServerModule` — starts the Gin HTTP server

Each layer has a `provider.go` that registers constructors and binds interfaces to implementations using `fx.Annotate(..., fx.As(...))`.

### Layered Code Organization

```
internal/handler/{domain}/  # HTTP handlers, route-specific DTOs
internal/logic/{domain}/    # Business logic, depends on repo interfaces
internal/repo/{domain}/     # GORM data access, depends on DB
model/{domain}/             # GORM structs
```

Interfaces are declared in the **consumer's** package. For example:
- `handler/user` declares `UserLogic` interface; `logic/user` implements it.
- `logic/user` declares `UserRepo` interface; `repo/user` implements it.

### Startup Behavior

`baseRepo.InitBaseData` (invoked by FX on startup) does three things:
1. Auto-migrates all GORM models (`User`, `SystemConfig`, `File`, `Item`, `Tag`, `ItemTag`).
2. Checks `system_configs` for `init=ok`. If present, skips user initialization.
3. If first boot, creates a default admin from `ADMIN_USERNAME` / `ADMIN_PASSWORD` env vars.

### Environment Configuration

Copy `backend/app/cmd/.example.env` to `backend/app/cmd/.env`. Key vars:
- `HTTP_PORT` (default 8080)
- `SQLITE_DB_PATH` (default `data.db`)
- `ADMIN_USERNAME` / `ADMIN_PASSWORD`
- `JWT_SECRET`, `ACCESS_TOKEN_EXPIRE`, `REFRESH_TOKEN_EXPIRE`
- `STORAGE_TYPE` (`local` or `oss`), `STORAGE_LOCAL_PATH`, `STORAGE_LOCAL_BASE_URL`

### API Response Format

All JSON responses use `{ code: number, message?: string, data?: T }`.

## Frontend Architecture

### Path Alias

`@/` maps to `src/`. Configured in `vite.config.ts` and `tsconfig.json`.

### API Client

`src/utils/http.ts` creates an Axios instance with interceptors:
- Injects `Authorization: Bearer <access_token>` from `localStorage` on every request.
- On 401, queues pending requests, calls `/user/refresh-token`, then retries with the new token.
- If refresh fails, clears tokens and redirects to `/login`.

### Routing

`BrowserRouter` with `basename="/peano"`. Routes:
- `/login` — public
- `/home`, `/archive`, `/profile` — protected via `ProtectedRoute` + `AppLayout`

### State Management

Only `authStore.ts` uses Zustand. Other state is local to components.

### Styling

Tailwind CSS v4 with `@tailwindcss/vite` plugin. shadcn/ui components in `src/components/ui/` (New York style, zinc base). Custom editor styles in `src/styles/editor.css`.

### Dev Proxy

`vite.config.ts` proxies `/api` and `/uploads` to `BACKEND_URL` (default `http://localhost:3145`, overridable via `VITE_BACKEND_URL`). The frontend dev server runs on port 5174.

## Important Notes

- **CGO is required** for backend dev because SQLite driver uses CGO. The Taskfile sets `CGO_ENABLED=1` for `backend:run`.
- **No frontend tests** exist in this repo.
- Backend tests are sparse and located in `backend/utils/` only.
- The frontend is served under the `/peano/` subpath in production (`base: "/peano/"` in Vite config).
