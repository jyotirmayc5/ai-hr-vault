# Database Migrations

> **Version:** 1.0  
> **Status:** Living Documentation  
> **Last Updated:** July 2026

## Purpose

Migrations provide an ordered, reviewable history of schema changes.

## Rules

- Never edit an applied production migration.
- Create a new migration for every schema change.
- Use descriptive migration names.
- Include constraints, indexes, policies, and grants.
- Provide safe data backfills before adding restrictive constraints.
- Test rollback or corrective migration strategy.
- Avoid destructive changes without a documented migration plan.

## Recommended Workflow

```text
Design
  → create migration
  → test locally
  → review SQL
  → apply to staging
  → verify data and RLS
  → deploy application
  → apply to production
  → record release notes
```

## Migration Checklist

- Tables and columns
- Defaults
- Nullability
- Check constraints
- Foreign keys
- Indexes
- RLS enabled
- Policies
- Existing-data backfill
- Application compatibility
- Roll-forward recovery plan

## Naming Example

```text
20260722_add_leave_liability_indexes.sql
```
