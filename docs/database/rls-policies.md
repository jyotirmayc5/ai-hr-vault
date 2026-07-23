# Row Level Security Policies

> **Version:** 1.0  
> **Status:** Required  
> **Last Updated:** July 2026

## Purpose

RLS is the final database-level protection for tenant and record access.

## Principles

- Enable RLS on every company-owned table.
- Deny access by default.
- Resolve company membership from authenticated identity.
- Separate `select`, `insert`, `update`, and `delete` policies.
- Do not rely on hidden UI controls.
- Keep service-role usage limited to controlled server workflows.

## Common Policy Model

A user may access a row when:

```text
row.company_id belongs to one of the user's active company memberships
AND
the user's role permits the requested action
```

Additional record-level rules may restrict:

- Employees to their own records
- Managers to direct or indirect reports
- Payroll users to payroll-relevant fields and tables
- IT users to asset and identity data
- Administrators to company-scoped records

## Testing

For every protected table test:

- Unauthenticated access
- Correct company access
- Cross-company denial
- Employee self-access
- Manager scope
- HR and admin access
- Insert ownership
- Update ownership
- Delete restrictions

## Service Role

Service-role access bypasses RLS and must never be exposed to client code.
