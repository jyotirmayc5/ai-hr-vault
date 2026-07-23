# Database Relationships

> **Version:** 1.0  
> **Status:** Living Documentation  
> **Last Updated:** July 2026

## Tenant Root

```text
companies
  ├── departments
  ├── locations
  ├── employees
  ├── policies
  ├── holidays
  ├── notifications
  └── module records
```

## Employee Relationships

```text
employees
  ├── department
  ├── location
  ├── manager -> employees
  ├── compensation
  ├── documents
  ├── leave requests
  ├── assets
  ├── training
  ├── reviews
  ├── emergency contacts
  └── audit logs
```

## Rules

- A manager must belong to the same company.
- An employee cannot manage themselves.
- Department and location references must belong to the same company.
- Child records must not cross tenant boundaries.
- Effective-dated histories must not overlap unless explicitly supported.
- Deletion behavior must preserve required history.

## Foreign-Key Strategy

Use explicit foreign-key names where Supabase relationship ambiguity is possible.

## Integrity Validation

Database constraints should enforce what can be enforced centrally. Server validation should provide user-friendly errors before constraint failure.
