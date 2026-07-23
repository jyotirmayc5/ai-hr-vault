# ADR-003: Company-Scoped Multi-Tenancy

> **Status:** Accepted  
> **Date:** July 2026

## Context

AI HR Vault serves multiple organizations in one platform while requiring strict data isolation.

## Decision

Use shared application and database infrastructure with company-scoped rows identified by `company_id`, protected by server authorization and Row Level Security.

## Rules

- Every company-owned record includes `company_id`.
- Queries apply company scope.
- Related records must belong to the same company.
- RLS enforces tenant isolation.
- Cross-company actions are rejected.
- Service-role operations remain controlled and auditable.

## Reasons

- Efficient SaaS operations
- Simpler deployment model
- Shared feature delivery
- Lower infrastructure overhead
- Strong PostgreSQL policy support

## Consequences

- Missing company filters are security defects.
- RLS tests are mandatory.
- Unique constraints may need to include `company_id`.
- Imports, exports, jobs, and integrations must preserve tenant context.

## Alternatives Considered

- Database per tenant
- Schema per tenant
- Separate application deployment per customer
