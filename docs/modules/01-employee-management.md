# Employee Management Module

> **Version:** 1.0  
> **Status:** In Development  
> **Owner:** AI HR Vault Product Team  
> **Last Updated:** July 2026

---

# 1. Purpose

The Employee Management module is the central source of truth for employee information in AI HR Vault.

It manages the complete employee lifecycle, including:

- Hiring
- Personal information
- Employment details
- Compensation
- Documents
- Leave
- Performance
- Training
- Assets
- Emergency contacts
- Transfers
- Promotions
- Termination
- Audit history

Every workforce module depends directly or indirectly on the employee record.

---

# 2. Business Goals

The module should help organizations:

- Replace employee spreadsheets
- Centralize employee records
- Maintain accurate employment information
- Secure sensitive employee data
- Track employee changes over time
- Reduce duplicate data entry
- Improve HR reporting
- Support employee self-service
- Provide a foundation for payroll, leave, attendance, performance, training, and assets

---

# 3. Scope

## Included

- Employee directory
- Employee profile
- Personal information
- Employment information
- Compensation history
- Documents
- Leave information
- Performance records
- Training records
- Assigned assets
- Emergency contacts
- Employee audit history
- Employee creation and updates
- Employee status management
- Manager and department assignment
- Search, filtering, sorting, and pagination

## Planned

- CSV import
- CSV export
- Bulk employee updates
- Employee timeline
- Employee self-service
- Profile completion score
- Custom employee fields
- Org chart
- Rehire workflow
- Promotion workflow
- Transfer workflow
- Structured offboarding

## Excluded

The following are separate modules but depend on Employee Management:

- Attendance
- Payroll
- Recruitment
- Benefits
- Workforce scheduling
- Learning management
- Advanced succession planning

---

# 4. User Roles

## Administrator

Can:

- View all employees
- Create employees
- Edit all employee fields
- Manage compensation
- Manage documents
- Terminate employees
- Restore archived employees
- View audit history
- Export employee data

## HR

Can:

- View all employees
- Create employees
- Edit employee records
- Manage documents
- Manage emergency contacts
- Manage employment status
- View approved compensation information
- Run employee reports

## Manager

Can:

- View direct and indirect reports
- View permitted employee details
- Update selected team information
- View team leave
- View team training
- Complete performance actions
- View assigned assets where permitted

## Employee

Can:

- View their own profile
- Update permitted personal fields
- View their leave information
- View assigned assets
- View training records
- View approved documents
- Manage emergency contacts where permitted

## Payroll

Can:

- View compensation-related fields
- View employment and pay status
- Access payroll-required employee fields
- Run payroll exports

## IT

Can:

- View identity and work-assignment fields
- Manage assigned technology assets
- View onboarding and offboarding tasks

---

# 5. Employee Lifecycle

```text
Candidate
   │
   ▼
Draft Employee
   │
   ▼
Active Employee
   │
   ├── Promotion
   ├── Transfer
   ├── Manager Change
   ├── Compensation Change
   ├── Leave of Absence
   └── Return from Leave
   │
   ▼
Terminated
   │
   ▼
Archived
   │
   └── Rehired
```

Every lifecycle change should:

- Be authorized
- Record an effective date
- Record the user performing the action
- Write an audit log
- Trigger applicable notifications
- Preserve historical data

---

# 6. Employee Statuses

Recommended standardized statuses:

```text
draft
active
on_leave
suspended
terminated
retired
archived
```

## Draft

Employee setup has started but is incomplete.

## Active

Employee is actively employed.

## On Leave

Employee is on an approved extended leave of absence.

## Suspended

Employee remains employed but is temporarily inactive.

## Terminated

Employment has ended.

## Retired

Employment ended because of retirement.

## Archived

Record is retained for historical purposes and excluded from active employee views.

---

# 7. Employment Types

Recommended values:

```text
full_time
part_time
temporary
contractor
intern
seasonal
```

These values should be standardized through a database constraint or reference table.

---

# 8. Employee Profile Structure

The employee profile is divided into focused sections.

## Overview

Displays:

- Employee name
- Profile photo
- Employee number
- Job title
- Department
- Location
- Manager
- Employment status
- Start date
- Contact information
- Summary cards
- Recent activity

## Personal Information

Fields may include:

- Legal first name
- Middle name
- Legal last name
- Preferred name
- Personal email
- Work email
- Phone
- Alternate phone
- Date of birth
- Address
- City
- State or province
- Postal code
- Country
- Profile photo

Sensitive demographic fields should be optional and permission-controlled.

## Employment Information

Fields include:

- Employee number
- Company
- Department
- Location
- Job title
- Manager
- Employment type
- Employment status
- Start date
- Original hire date
- Probation end date
- Termination date
- Termination reason
- Work arrangement
- Standard weekly hours

## Compensation

Fields include:

- Pay type
- Annual salary
- Hourly rate
- Pay frequency
- Bonus eligibility
- Bonus target percentage
- Effective date
- End date
- Notes
- Created by
- Updated by

Compensation records must preserve history. Existing records should not be overwritten when a new compensation change takes effect.

## Documents

Categories may include:

- Employment agreements
- Identity documents
- Tax forms
- Certifications
- Licenses
- Performance documents
- Policy acknowledgments
- Other employee documents

Documents should use private storage and signed URLs.

## Leave

Displays:

- Leave balances
- Leave requests
- Leave history
- Approval status
- Leave calendar
- Company holidays

## Performance

Displays:

- Performance reviews
- Goals
- Feedback
- Improvement plans
- Review history

## Training

Displays:

- Assigned courses
- Completed courses
- Certifications
- Expiration dates
- Compliance status

## Assets

Displays:

- Assigned assets
- Assignment date
- Expected return date
- Return status
- Asset condition
- Asset history

## Emergency Contacts

Displays:

- Contact name
- Relationship
- Phone
- Email
- Address
- Primary contact status

## Audit Log

Displays a chronological history of significant employee-related actions.

---

# 9. Current Application Pages

Current employee routes are expected to include:

```text
/dashboard/employees
/dashboard/employees/new
/dashboard/employees/[id]
/dashboard/employees/[id]/personal
/dashboard/employees/[id]/employment
/dashboard/employees/[id]/compensation
/dashboard/employees/[id]/documents
/dashboard/employees/[id]/leave
/dashboard/employees/[id]/performance
/dashboard/employees/[id]/training
/dashboard/employees/[id]/assets
/dashboard/employees/[id]/emergency-contacts
/dashboard/employees/[id]/audit-log
```

## Future Routes

```text
/dashboard/employees/import
/dashboard/employees/reports
/dashboard/employees/[id]/timeline
/dashboard/employees/[id]/offboarding
/dashboard/employees/[id]/access
```

---

# 10. Core Features

## Employee Directory

The directory should support:

- Employee cards or table view
- Search by name
- Search by employee number
- Search by email
- Department filtering
- Location filtering
- Employment status filtering
- Employment type filtering
- Manager filtering
- Sorting
- Pagination
- Responsive layout
- Empty state
- Loading state
- Error state

## Create Employee

The create flow should support:

- Required-field validation
- Duplicate email detection
- Duplicate employee-number detection
- Company assignment
- Department assignment
- Location assignment
- Manager assignment
- Employment status
- Start date
- Audit logging
- Success notification
- Redirect to the new profile

## Edit Employee

The edit flow should:

- Validate authorization
- Validate input
- Preserve restricted fields
- Track changed values
- Write audit logs
- Revalidate affected pages
- Provide user feedback

## Archive Employee

Archiving should:

- Preserve the employee record
- Exclude the employee from active lists by default
- Retain documents and history
- Prevent normal active workflows
- Be reversible by an authorized user

## Terminate Employee

Termination should support:

- Effective termination date
- Termination reason
- Last working day
- Account deactivation
- Asset return checklist
- Final payroll tasks
- Leave balance review
- Document retention
- Audit logging
- Notifications

---

# 11. Database Ownership

The module primarily owns or directly depends on the following tables:

```text
employees
employee_compensation
employee_documents
employee_emergency_contacts
employee_assets
employee_training
employee_reviews
employee_audit_logs
employee_leave_requests
```

Supporting tables include:

```text
companies
profiles
departments
locations
document_types
leave_policies
company_holidays
```

Future tables may include:

```text
employee_status_history
employee_job_history
employee_manager_history
employee_department_history
employee_custom_fields
employee_custom_field_values
employee_offboarding_tasks
employee_onboarding_tasks
```

---

# 12. Employee Table Requirements

The `employees` table should contain or reference:

- `id`
- `company_id`
- `employee_number`
- `first_name`
- `middle_name`
- `last_name`
- `preferred_name`
- `email`
- `personal_email`
- `phone`
- `job_title`
- `department_id`
- `location_id`
- `manager_id`
- `employment_type`
- `employment_status`
- `start_date`
- `termination_date`
- `created_at`
- `updated_at`
- `created_by`
- `updated_by`

Additional fields may be introduced through migrations as requirements evolve.

---

# 13. Relationships

```text
companies
   │
   └── employees
          ├── department
          ├── location
          ├── manager
          ├── compensation
          ├── documents
          ├── leave requests
          ├── training
          ├── reviews
          ├── assets
          ├── emergency contacts
          └── audit logs
```

An employee manager is another employee in the same company.

The system must prevent cross-company manager assignments.

---

# 14. Service Layer

Recommended service files include:

```text
app/dashboard/employees/services/employee.service.ts
app/dashboard/employees/services/employee-profile.service.ts
app/dashboard/employees/services/employee-overview.service.ts
app/dashboard/employees/services/employee-document.service.ts
app/dashboard/employees/services/employee-leave.service.ts
app/dashboard/employees/services/employee-asset.service.ts
app/dashboard/employees/services/employee-training.service.ts
app/dashboard/employees/services/employee-performance.service.ts
```

Services should:

- Authenticate the user when required
- Resolve the current company
- Apply company-scoped queries
- Return typed data
- Normalize Supabase joins
- Throw controlled errors
- Avoid UI logic

---

# 15. Server Actions

Typical employee actions include:

```text
createEmployee
updateEmployee
archiveEmployee
restoreEmployee
terminateEmployee
rehireEmployee
changeEmployeeManager
changeEmployeeDepartment
changeEmployeeLocation
addCompensation
editCompensation
addEmergencyContact
updateEmergencyContact
deleteEmergencyContact
```

Each action should:

1. Authenticate the user.
2. Resolve the current company.
3. Check permissions.
4. Validate the payload.
5. Confirm the employee belongs to the company.
6. Perform the mutation.
7. Write an audit log.
8. Trigger notifications where applicable.
9. Revalidate affected routes.
10. Return a typed result.

---

# 16. Validation Rules

## Required Fields

At minimum:

- First name
- Last name
- Work email
- Employee number
- Company
- Employment status
- Start date

## Uniqueness

The following should generally be unique within a company:

- Employee number
- Work email

## Referential Validation

- Department must belong to the same company.
- Location must belong to the same company.
- Manager must belong to the same company.
- Employee cannot be their own manager.
- Archived or terminated employees should not be assignable as active managers unless explicitly permitted.

## Date Validation

- Start date must be valid.
- Termination date cannot precede start date.
- Compensation effective dates must be valid.
- Historical records must not overlap unless the business rule explicitly allows it.

---

# 17. Permissions

| Action | Employee | Manager | HR | Payroll | IT | Admin |
|---|---:|---:|---:|---:|---:|---:|
| View own profile | Yes | Yes | Yes | Limited | Limited | Yes |
| Edit own personal information | Limited | Limited | Yes | No | No | Yes |
| View team profiles | No | Yes | Yes | Limited | Limited | Yes |
| Create employee | No | No | Yes | No | No | Yes |
| Edit employment data | No | Limited | Yes | Limited | Limited | Yes |
| View compensation | Own or limited | Limited | Yes | Yes | No | Yes |
| Change compensation | No | No | Limited | Yes | No | Yes |
| View documents | Own or limited | Limited | Yes | Limited | Limited | Yes |
| Terminate employee | No | No | Yes | No | No | Yes |
| View audit log | Limited | Limited | Yes | Limited | Limited | Yes |
| Archive employee | No | No | Yes | No | No | Yes |

Final access rules must be enforced in both server-side authorization and database RLS policies.

---

# 18. Row Level Security

All employee-related tables must have RLS enabled.

Policies must ensure:

- Users only access records belonging to their company.
- Employees only access permitted parts of their own record.
- Managers only access permitted records within their reporting structure.
- HR and administrators access company-scoped records.
- Payroll users access only payroll-relevant data.
- Service-role access is restricted to controlled server workflows.

Hiding a link or button is not an authorization control.

---

# 19. Audit Logging

Audit events should include:

- Employee created
- Employee updated
- Employee archived
- Employee restored
- Employee terminated
- Employee rehired
- Manager changed
- Department changed
- Location changed
- Employment status changed
- Compensation added
- Compensation changed
- Document uploaded
- Document deleted
- Emergency contact changed
- Asset assigned
- Asset returned
- Training completed

An audit record should include:

- Company ID
- Employee ID
- Entity type
- Entity ID
- Action
- Performed by
- Timestamp
- Relevant metadata
- Previous values where appropriate
- New values where appropriate

---

# 20. Notifications

Potential employee-related notifications include:

- Employee account created
- Welcome invitation
- Manager assignment changed
- Department changed
- Probation ending
- Contract expiring
- Document expiring
- Certification expiring
- Work anniversary
- Birthday reminder
- Termination initiated
- Offboarding task assigned
- Asset return required

Notifications should be configurable at the company level where appropriate.

---

# 21. Reporting

Recommended employee reports:

- Employee directory
- Active employees
- New hires
- Terminated employees
- Employees on leave
- Headcount by department
- Headcount by location
- Headcount by employment type
- Headcount by manager
- Missing employee information
- Missing documents
- Expiring documents
- Upcoming probation completions
- Compensation summary
- Employee turnover
- Employee tenure
- Employee status history

Sensitive reports must be permission-controlled.

---

# 22. Import and Export

## CSV Import

The import workflow should include:

1. Downloadable template
2. File upload
3. Column mapping
4. Data validation
5. Duplicate detection
6. Preview
7. Error report
8. Confirm import
9. Audit record
10. Import summary

## Export

Exports should support:

- Current filters
- Permission-based field selection
- CSV
- PDF where appropriate
- Audit logging for sensitive exports

Sensitive fields should never be included unless the user has explicit permission.

---

# 23. Search

Employee search should support:

- First name
- Last name
- Preferred name
- Employee number
- Work email
- Job title
- Department
- Location

Future enhancements may include:

- Fuzzy search
- Full-text search
- AI-assisted search
- Saved searches
- Advanced filters

---

# 24. UI Requirements

Every employee page should provide:

- Clear title
- Breadcrumbs
- Employee identity context
- Primary action
- Loading state
- Empty state
- Error state
- Responsive behavior
- Keyboard navigation
- Accessible labels
- Consistent status badges

Employee profile tabs should preserve consistent navigation and context.

Destructive actions must require confirmation.

---

# 25. Security Requirements

- Do not expose service-role credentials.
- Do not query employee-sensitive data directly from client components.
- Use signed URLs for private documents.
- Protect compensation and identity data.
- Enforce company isolation.
- Validate every server mutation.
- Record sensitive exports.
- Avoid logging sensitive personal data in console output.
- Apply least-privilege access.
- Review retention requirements before deleting records.

---

# 26. Performance Requirements

- Paginate large employee lists.
- Index `company_id`.
- Index `employee_number`.
- Index `department_id`.
- Index `location_id`.
- Index `manager_id`.
- Index `employment_status`.
- Avoid loading every employee relation in directory queries.
- Load detailed profile data only on employee pages.
- Optimize manager hierarchy queries.
- Use server-side filtering and sorting.

---

# 27. Accessibility Requirements

The module should support:

- Keyboard navigation
- Visible focus states
- Accessible labels
- Screen-reader-friendly form errors
- Semantic headings
- Sufficient color contrast
- Non-color-only status indicators
- Accessible dialogs
- Accessible tables

---

# 28. Testing Requirements

## Authentication and Authorization

- Unauthenticated users cannot access employee pages.
- Employees cannot view unauthorized employee records.
- Managers only see authorized team members.
- Company data is isolated.
- Restricted compensation data is protected.

## Employee CRUD

- Create valid employee
- Reject missing required fields
- Reject duplicate employee number
- Reject duplicate work email
- Update employee
- Archive employee
- Restore employee
- Terminate employee

## Relationships

- Assign department
- Assign location
- Assign manager
- Reject cross-company assignments
- Reject self-management

## Compensation

- Add initial compensation
- Close previous compensation
- Add new effective compensation
- Preserve history
- Restrict unauthorized access

## Documents

- Upload private document
- Generate signed URL
- Reject unauthorized access
- Handle expiration fields

## Audit

- Verify important actions create audit records.
- Verify performed-by values.
- Verify entity references.

---

# 29. Definition of Done

The Employee Management module is feature complete when:

- Employee CRUD is complete
- Employee directory is complete
- Search and filters are complete
- Employee profile sections are complete
- Compensation history is complete
- Emergency contacts are complete
- Documents are complete
- Leave integration is complete
- Assets integration is complete
- Training integration is complete
- Performance integration is complete
- Audit history is complete
- Permissions are enforced
- RLS policies are verified
- Notifications are implemented
- Reports are implemented
- Import and export are implemented
- Responsive behavior is verified
- Accessibility is verified
- Critical tests pass
- Documentation is current

---

# 30. Current Maturity Assessment

| Area | Current Status |
|---|---|
| Employee Directory | Feature Complete |
| Employee Overview | Feature Complete |
| Personal Information | Feature Complete |
| Employment Information | Feature Complete |
| Compensation | Feature Complete |
| Documents | Feature Complete |
| Leave Integration | Feature Complete |
| Emergency Contacts | Feature Complete |
| Assets | In Development |
| Training | In Development |
| Performance | In Development |
| Audit History | In Development |
| Import | Planned |
| Export | Planned |
| Bulk Actions | Planned |
| Employee Lifecycle Workflows | Planned |
| Permissions | In Development |
| Production Hardening | Planned |

This assessment should be updated whenever the implementation changes.

---

# 31. Future Enhancements

- Employee self-service portal
- Employee profile completion score
- Custom fields
- Employee timeline
- Organization chart
- Skills matrix
- Digital signatures
- Bulk updates
- Bulk status changes
- Succession planning
- Talent pools
- Employee recognition
- Automated onboarding
- Automated offboarding
- Rehire workflow
- QR employee badges
- Mobile employee directory
- AI employee record assistant

---

# 32. Dependencies

| Module | Dependency |
|---|---|
| Leave | Employee, company, manager, department |
| Attendance | Employee, location, schedule |
| Payroll | Employee, employment, compensation |
| Performance | Employee and manager |
| Training | Employee and job requirements |
| Assets | Employee and department |
| Recruitment | Creates employee records after hire |
| Notifications | Employee and manager contact details |
| Reporting | Employee and organizational data |
| Permissions | Employee identity and reporting relationships |
| Audit | Employee-related actions |
| Integrations | Employee identity and account data |

---

# 33. Related Documentation

- `../01-product-blueprint.md`
- `../02-product-roadmap.md`
- `../03-technical-architecture.md`
- `../feature-catalog.md`
- `02-leave-management.md`
- `06-assets.md`
- `07-training.md`
- `08-performance.md`
- `10-permissions.md`
- `11-reporting.md`

---

# 34. Guiding Principle

> The employee record is the foundation of AI HR Vault. Every employee workflow must preserve accuracy, security, history, and company-level data isolation.