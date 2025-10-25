# Copilot Instructions for kills-scum

sempre responder em português do Brasil.

## Overview
This is a monorepo built with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), combining Next.js (frontend), tRPC (API), TailwindCSS, shadcn/ui, and Turborepo for optimized builds. The main app is in `apps/web`, with shared business logic in `packages/api`.

## Architecture
- **apps/web/**: Next.js app. UI components in `src/components/`, pages in `src/app/`, API routes in `src/app/api/`.
- **packages/api/**: tRPC routers and business logic. Entry point: `src/index.ts`. Routers in `src/routers/`.
- **Monorepo**: Managed by Turborepo. Shared config in root and per-package/app.

## Key Patterns & Conventions
- **tRPC**: API endpoints are defined in `packages/api/src/routers/`. Use type-safe procedures for client-server communication.
- **UI Components**: Use shadcn/ui and TailwindCSS. Custom components in `apps/web/src/components/` and `apps/web/src/components/ui/`.
- **TypeScript**: Strict type checking. Use `npm run check-types` to validate types.
- **Config Files**: Shared TypeScript config in `tsconfig.base.json`. App-specific configs in each app/package.
- **Environment Variables**: Store secrets in `apps/web/.env`.

## Developer Workflows
- **Install dependencies**: `npm install`
- **Start dev server**: `npm run dev` (runs all apps)
- **Build**: `npm run build`
- **Type check**: `npm run check-types`
- **Add API endpoint**: Create a new router in `packages/api/src/routers/`, export in `index.ts`, and consume via tRPC in `apps/web/src/utils/trpc.ts`.
- **Add UI component**: Place in `apps/web/src/components/` or `apps/web/src/components/ui/`.

## Integration Points
- **tRPC**: Client setup in `apps/web/src/utils/trpc.ts`. Server routers in `packages/api/src/routers/`.
- **TailwindCSS**: Config in `apps/web/postcss.config.mjs` and `apps/web/index.css`.
- **shadcn/ui**: Custom UI primitives in `apps/web/src/components/ui/`.

## Examples
- To add a new API route: `packages/api/src/routers/newRoute.ts` and update `index.ts`.
- To use a shared type: Import from `packages/api` in your Next.js app.
- To add a button: Use or extend `apps/web/src/components/ui/button.tsx`.

## Tips
- Prefer type-safe communication via tRPC.
- Keep UI logic in components, API logic in routers.
- Use Turborepo for efficient builds and caching.

---
_Last updated: 2025-10-24_
