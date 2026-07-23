# ADR-001: Use Next.js App Router

> **Status:** Accepted  
> **Date:** July 2026

## Context

AI HR Vault requires server-rendered pages, authenticated data access, nested layouts, route-level loading states, and scalable module organization.

## Decision

Use Next.js App Router as the application framework and routing architecture.

## Reasons

- Server Components
- Server Actions
- Nested layouts
- Route groups and dynamic routes
- Strong TypeScript support
- Efficient server-first data access
- Vercel-compatible deployment

## Consequences

- Server and client boundaries must be explicit.
- Browser-only code requires `"use client"`.
- Authentication and cookies must follow App Router patterns.
- Teams must avoid legacy Pages Router conventions.

## Alternatives Considered

- Next.js Pages Router
- Separate React SPA and API
- Remix
