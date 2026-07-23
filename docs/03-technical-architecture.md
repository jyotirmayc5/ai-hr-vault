# AI HR Vault Technical Architecture

Version: 1.0
Status: Living Document
Last Updated: July 2026

---

# Purpose

This document defines the architectural standards, coding conventions, security model, and development patterns used throughout AI HR Vault.

Every new feature and module must follow these standards.

---

# Architecture Overview

AI HR Vault is a modern multi-tenant SaaS application built using a server-first architecture.

## Frontend

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Lucide Icons

## Backend

- Next.js Server Actions
- Supabase

## Database

- PostgreSQL

## Authentication

- Supabase Auth

## File Storage

- Supabase Storage

## Email

- Resend

## AI

- OpenAI

## Hosting

- Vercel

---

# Design Principles

## Server First

Business logic belongs on the server.

Client components should primarily handle:

- User interaction
- Local UI state
- Form input
- Optimistic updates

Database access should not occur directly from client components.

---

## Service Layer

Every module should expose services.

Example

app/dashboard/employees/services/

employee.service.ts

employee-profile.service.ts

employee-document.service.ts

Services should:

- Query data
- Normalize responses
- Handle joins
- Return typed models

They should not contain UI logic.

---

## Server Actions

Mutations belong in server actions.

Examples:

createEmployee()

updateEmployee()

deleteEmployee()

approveLeave()

assignAsset()

Server actions should:

- Validate input
- Authorize user
- Write audit logs
- Trigger notifications
- Revalidate affected pages

---

# Folder Structure

Example

app/

dashboard/

employees/

leave/

training/

performance/

settings/

Each module follows:

page.tsx

components/

services/

actions.ts

types.ts

validation.ts

---

# Database Standards

## UUID Primary Keys

All tables use UUIDs.

---

## Foreign Keys

Always use explicit foreign keys.

---

## Constraints

Every important business rule belongs in the database.

Examples

CHECK constraints

UNIQUE constraints

NOT NULL

---

## Indexes

Indexes required for:

company_id

employee_id

status

created_at

search fields

---

## Migrations

All schema changes use migrations.

Never edit production tables manually.

---

# Multi-Tenant Architecture

Every business record must belong to a company.

Example

company_id

exists on:

employees

leave_requests

assets

training

performance

documents

etc.

No data may be shared across companies.

---

# Security

## Authentication

Supabase Auth

---

## Authorization

Role-Based Access Control

Never rely on hidden buttons.

Every server action validates permissions.

---

## Row Level Security

Every table must have RLS enabled.

Policies must isolate company data.

---

## Storage

Documents use signed URLs.

Never expose public employee files.

---

## Secrets

Secrets remain server-side.

Never expose:

Service Role Key

API keys

Access tokens

---

# Coding Standards

## TypeScript

Avoid any.

Use strict typing.

Export interfaces.

---

## Components

Prefer Server Components.

Use Client Components only when necessary.

---

## Naming

Components

PascalCase

Services

kebab-case.service.ts

Actions

actions.ts

Validation

validation.ts

---

## Imports

Use aliases.

Example

@/lib

@/components

Avoid deep relative imports.

---

# UI Standards

Every page should include:

Header

Breadcrumb

Primary actions

Search/filter (if applicable)

Responsive layout

Loading state

Empty state

Error state

---

# Forms

Every form should include:

Validation

Inline errors

Loading state

Success feedback

Cancel action

---

# Tables

Every data table should support:

Sorting

Filtering

Pagination

Empty state

Loading state

Responsive layout

Export (when appropriate)

---

# Notifications

Actions should notify users when appropriate.

Supported channels

In-App

Email

Future

SMS

Slack

Teams

---

# Audit Logging

Every important mutation writes an audit record.

Examples

Employee created

Employee updated

Leave approved

Asset assigned

Training completed

Payroll processed

---

# Reporting Standards

Reports should support:

Filtering

CSV Export

PDF Export

Printing

---

# Performance Standards

Prefer server-side queries.

Avoid unnecessary client fetching.

Paginate large datasets.

Optimize expensive joins.

Use indexes.

---

# Error Handling

Never expose internal errors.

Log technical details.

Display user-friendly messages.

---

# Accessibility

Keyboard navigation

ARIA labels

Focus management

Color contrast

Screen reader support

---

# Testing Strategy

Critical workflows should be tested before release.

Authentication

Employee CRUD

Leave approval

Document upload

Payroll calculations

Permissions

Notifications

Exports

---

# Release Checklist

Before merging:

✓ Types pass

✓ Lint passes

✓ Build succeeds

✓ Permissions verified

✓ Audit logging verified

✓ Responsive UI checked

✓ Documentation updated

✓ No console errors

✓ Migration tested

---

# Definition of Done

A feature is complete only when:

- Database finalized
- Backend implemented
- UI complete
- Validation complete
- Permissions enforced
- Notifications implemented
- Audit logging implemented
- Documentation updated
- Tested
- Production ready

---

# Engineering Principle

Every feature should make the system simpler, more secure, and easier to maintain—not merely add functionality.