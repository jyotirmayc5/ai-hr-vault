# Server Actions

> **Version:** 1.0  
> **Status:** Standard  
> **Last Updated:** July 2026

## Purpose

Server Actions perform authenticated application mutations.

## Required Sequence

1. Authenticate the user.
2. Resolve company context.
3. Check permissions.
4. Validate input.
5. Verify tenant ownership.
6. Perform the mutation.
7. Write an audit log.
8. Trigger notifications.
9. Revalidate affected paths.
10. Return a typed result.

## Standards

- Add `"use server"` at the file boundary.
- Keep actions small and focused.
- Move data access and calculations into services.
- Never trust client-provided company IDs without verification.
- Return user-safe messages.
- Do not expose database internals.
- Use consistent action-state types.

## Example Result

```ts
export type ActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };
```

## Error Handling

Log technical details server-side without exposing secrets or sensitive data. Return controlled errors to the UI.
