# Training Module

> **Version:** 1.0  
> **Status:** In Development  
> **Owner:** AI HR Vault Product Team  
> **Last Updated:** July 2026

---

# 1. Purpose

The Training module manages courses, employee assignments, completion, certification, expiration, and compliance reporting.

---

# 2. Business Goals

- Track employee development
- Maintain compliance records
- Automate certification reminders
- Assign training by role or department
- Improve visibility into completion status

---

# 3. Scope

Included: courses, assignments, completion, certifications, expiration dates, attachments, reports, reminders.

Planned: learning paths, quizzes, SCORM providers, external LMS integrations.

---

# 4. Core Capabilities

- Company-scoped data access
- Role-based permissions
- Server-side validation
- Audit logging
- Notifications
- Search, filters, sorting, and pagination
- CSV and PDF reporting where applicable
- Responsive and accessible UI
- Production-ready error and empty states

---

# 5. Primary Users

- Employees
- Managers
- HR
- Administrators
- Specialized operational roles where applicable

Access must follow least-privilege principles and be enforced server-side.

---

# 6. Core Data Entities

`training_courses`, `employee_training`, `training_assignments`, `certifications`, `training_audit_logs`

All records must include company ownership, timestamps, and actor fields where appropriate.

---

# 7. Recommended Routes

```text
/dashboard/training
/dashboard/training/courses
/dashboard/training/assignments
/dashboard/training/compliance
/dashboard/training/reports
/dashboard/employees/[id]/training
```

---

# 8. Service and Action Standards

Services should:

- Resolve authenticated user and company context
- Apply company-scoped queries
- Return typed data
- Normalize database relationships
- Avoid UI logic

Server actions should:

1. Authenticate the user.
2. Resolve company context.
3. Check permissions.
4. Validate input.
5. Verify record ownership.
6. Perform the mutation.
7. Write an audit record.
8. Trigger notifications where applicable.
9. Revalidate affected routes.
10. Return a typed result.

---

# 9. Security Requirements

- Enable Row Level Security on all company-owned tables.
- Prevent cross-company access.
- Restrict sensitive fields by role.
- Keep service-role credentials server-only.
- Protect private files with signed URLs.
- Record sensitive exports.
- Avoid logging personal or confidential values.

---

# 10. Reporting

Reports should support relevant combinations of:

- Date range
- Employee
- Department
- Location
- Manager
- Status
- Category or type
- Export format

Reports must respect permissions and active filters.

---

# 11. Notifications

Notifications should be event-driven, company-scoped, and configurable where appropriate.

Supported delivery strategy:

- In-app first
- Email second
- External channels through integrations later

---

# 12. Accessibility

The module should support:

- Keyboard navigation
- Visible focus states
- Accessible dialogs and forms
- Semantic tables and headings
- Screen-reader-friendly validation
- Sufficient contrast
- Text labels in addition to color

---

# 13. Testing Requirements

- Authentication and authorization
- Company isolation
- CRUD workflows
- Status transitions
- Validation failures
- Audit logging
- Notification generation
- Reports and exports
- Responsive behavior
- Accessibility
- Error handling

---

# 14. Recommended Implementation Phases

1. Course catalog
2. Employee assignments
3. Completion and certification
4. Reminders and reports
5. Learning paths and integrations

---

# 15. Definition of Done

The module is complete when:

- Database design is finalized.
- RLS policies are verified.
- Service layer is complete.
- Server actions are complete.
- Core UI workflows are complete.
- Permissions are enforced.
- Audit logging is complete.
- Notifications are implemented.
- Reports and exports are implemented where applicable.
- Critical tests pass.
- Accessibility is verified.
- Documentation is current.
- Production hardening is complete.

---

# 16. Future Enhancements

- Learning paths
- Skills matrix
- Quizzes and assessments
- SCORM support
- External LMS sync
- AI training recommendations

---

# 17. Related Documentation

- `../01-product-blueprint.md`
- `../02-product-roadmap.md`
- `../03-technical-architecture.md`
- `../feature-catalog.md`
- `10-permissions.md`
- `11-reporting.md`
- `12-integrations.md`
- `14-administration.md`

---

# 18. Guiding Principle

> Build the module so that every workflow is secure, understandable, auditable, and scalable across multiple companies.
