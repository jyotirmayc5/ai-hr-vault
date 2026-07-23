# Database Tables

> **Version:** 1.0  
> **Status:** Living Documentation  
> **Last Updated:** July 2026

## Purpose

This document catalogs the major tables used by AI HR Vault.

## Core Platform

| Table | Responsibility |
|---|---|
| `companies` | Tenant records |
| `profiles` | Authenticated user profiles |
| `company_memberships` | User-to-company membership |
| `roles` | Canonical and custom roles |
| `permissions` | Available application permissions |

## Organization

| Table | Responsibility |
|---|---|
| `departments` | Company departments |
| `locations` | Work locations |
| `job_titles` | Standard job titles |
| `company_settings` | Company configuration |

## Employees

| Table | Responsibility |
|---|---|
| `employees` | Core employee identity and employment |
| `employee_compensation` | Effective-dated compensation |
| `employee_documents` | Private employee files and metadata |
| `employee_emergency_contacts` | Emergency contacts |
| `employee_audit_logs` | Employee-related audit trail |

## Leave

| Table | Responsibility |
|---|---|
| `employee_leave_requests` | Leave requests and approval state |
| `leave_policies` | Company leave rules |
| `employee_leave_balances` | Employee balances |
| `company_holidays` | Company holidays |

## Other Modules

| Table | Responsibility |
|---|---|
| `employee_assets` | Employee asset assignments |
| `employee_training` | Training history |
| `employee_reviews` | Performance records |
| `notifications` | In-app notifications |

## Required Table Metadata

Company-owned tables should generally include:

```text
id
company_id
created_at
updated_at
created_by
updated_by
```

Each table must have documented ownership, constraints, indexes, RLS policies, and retention behavior.
