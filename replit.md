# Workspace

## Overview

pnpm workspace monorepo using TypeScript. This project is a Hungarian-language cultural events portal for Csíkszereda (Miercurea Ciuc, Romania).

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifact: csikszereda-programajanlat, preview: /)
- **API framework**: Express 5 (artifact: api-server, preview: /api)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **UI**: Tailwind CSS v4, shadcn/ui, framer-motion
- **Fonts**: Plus Jakarta Sans, Playfair Display (Google Fonts)
- **Color palette**: Transylvanian Terracotta red (#primary) + Warm Amber gold (#secondary) on cream background

## Artifacts

- `artifacts/csikszereda-programajanlat` — Main React frontend (preview: /)
- `artifacts/api-server` — Express API backend (preview: /api)

## Features

- Hero carousel with featured events
- Weekly calendar strip (Hungarian day names)
- Month highlight cinematic section
- Upcoming events grid with category filters
- Event detail page with related events
- All text in Hungarian

## Database Schema

- `categories` table: id, name, slug, color
- `events` table: id, title, description, image_url, start_date, end_date, location, location_address, category_id, featured, month_highlight, ticket_url, price, tags[], created_at

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
