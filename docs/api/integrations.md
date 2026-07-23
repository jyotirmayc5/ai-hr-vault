# API Integration Standards

> **Version:** 1.0  
> **Status:** Planned  
> **Last Updated:** July 2026

## Purpose

This document defines standards for external provider integrations.

## Connection Requirements

Store:

- Company
- Provider
- External account identifier
- Connection status
- Token metadata
- Granted scopes
- Last synchronization
- Last error
- Created and updated timestamps

## Security

- Encrypt tokens.
- Keep credentials server-only.
- Request minimum scopes.
- Support revocation.
- Never log access or refresh tokens.
- Verify webhook signatures.
- Prevent cross-company mapping.

## Synchronization

Every sync should track:

- Direction
- Source record
- External record ID
- Attempt count
- Status
- Error
- Started and completed timestamps

## Reliability

Use idempotency, retries with backoff, dead-letter handling, reconciliation, and visible error states.
