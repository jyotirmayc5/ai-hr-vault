# Database Schema

> **Version:** 1.0  
> **Status:** Living Documentation  
> **Last Updated:** July 2026

## Purpose

This document defines the database design standards for AI HR Vault.

## Platform

- PostgreSQL through Supabase
- UUID primary keys
- Multi-tenant company ownership
- Row Level Security
- Effective-dated history where required

## Core Domains

```text
companies
profiles
employees
departments
locations
employee_compensation
employee_documents
employee_leave_requests
employee_assets
employee_training
employee_reviews
employee_audit_logs
notifications
```

## Standards

- Use `uuid` primary keys.
- Use `company_id` on every company-owned table.
- Use `created_at` and `updated_at`.
- Add `created_by` and `updated_by` for meaningful mutations.
- Prefer foreign keys over duplicated descriptive values.
- Use check constraints or reference tables for controlled statuses.
- Use `numeric` for money and precise balances.
- Use `date` for date-only business values.
- Use `timestamptz` for events.
- Avoid hard deletion for regulated or historical records.
- Add indexes for common tenant and filter queries.

## Naming

- Tables: plural snake_case
- Columns: snake_case
- Foreign keys: `<entity>_id`
- Constraints: descriptive names
- Indexes: `idx_<table>_<columns>`

## Multi-Tenancy

Every query and policy must enforce company isolation. Related records must belong to the same company.

## History

Use separate history records for compensation, status, department, manager, and other effective-dated changes rather than overwriting the past.

## Related Documents

- `tables.md`
- `relationships.md`
- `rls-policies.md`
- `migrations.md`
