# ADR-002: Use Supabase

> **Status:** Accepted  
> **Date:** July 2026

## Context

The platform requires authentication, PostgreSQL, private file storage, database policies, and efficient integration with Next.js.

## Decision

Use Supabase for authentication, PostgreSQL, storage, and Row Level Security.

## Reasons

- Managed PostgreSQL
- Built-in authentication
- Private storage and signed URLs
- Row Level Security
- TypeScript-friendly SDK
- Rapid product development
- SQL ownership and portability

## Consequences

- RLS must be designed and tested carefully.
- Server and browser clients have different responsibilities.
- Service-role credentials must remain server-only.
- Database migrations remain an engineering responsibility.

## Alternatives Considered

- Firebase
- Auth0 plus managed PostgreSQL
- Fully custom infrastructure
