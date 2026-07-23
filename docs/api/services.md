# Service Layer

> **Version:** 1.0  
> **Status:** Standard  
> **Last Updated:** July 2026

## Purpose

Services centralize data access, joins, calculations, and reusable business queries.

## Responsibilities

- Build company-scoped Supabase queries
- Normalize relationship results
- Return typed domain models
- Centralize calculation rules
- Handle controlled database errors
- Avoid React and presentation logic

## Naming

```text
employee.service.ts
leave-report.service.ts
payroll-calculation.service.ts
notification-recipient.service.ts
```

## Rules

- Use `server-only` for server services.
- Await the server Supabase client.
- Select only required columns.
- Apply `company_id` filters.
- Use explicit foreign-key relationships when needed.
- Prefer deterministic helper functions.
- Avoid duplicate query logic across pages.

## Testing

Test filters, tenant isolation, null relationships, status interpretation, calculations, and error behavior.
