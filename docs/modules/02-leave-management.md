# Leave Management Module

> **Version:** 1.0  
> **Status:** Feature Complete — Production Hardening Required  
> **Owner:** AI HR Vault Product Team  
> **Last Updated:** July 2026

---

# 1. Purpose

The Leave Management module enables companies to define leave policies, track employee balances, process leave requests, manage approvals, display company-wide leave visibility, send notifications, and generate operational and financial reports.

The module should provide a reliable system for employees, managers, HR teams, and administrators to manage time off without spreadsheets, emails, or manual calculations.

---

# 2. Business Goals

The module should help organizations:

- Standardize leave policies
- Automate approval workflows
- Maintain accurate leave balances
- Improve manager visibility
- Reduce manual administration
- Prevent scheduling conflicts
- Support compliance
- Provide employee self-service
- Track leave utilization
- Estimate leave liability
- Create audit-ready leave records

---

# 3. Scope

## Included

- Leave policies
- Leave requests
- Manager approval
- HR approval
- Rejection
- Cancellation
- Completion
- Leave balances
- Company holidays
- Employee leave calendar
- Company leave calendar
- Employees out today
- Notifications
- Leave reports
- CSV export
- PDF export
- Leave liability reporting
- Approval timeline
- Department and leave-type filters

## Planned

- Advanced accrual engine
- Automatic carryover processing
- Leave year closing
- Negative balance rules
- Blackout dates
- Minimum staffing rules
- Delegated approvals
- Multi-level approval chains
- Half-day and hourly leave refinement
- Automatic return-to-work workflows
- Calendar synchronization
- ICS export
- Scheduled leave reports
- Leave forecasting
- Regional policy templates

## Excluded

The following belong to separate modules:

- Attendance tracking
- Payroll deduction calculations
- Disability case management
- Benefits administration
- Workers' compensation
- Shift scheduling
- Medical documentation workflows

---

# 4. User Roles

## Employee

Can:

- View own leave balances
- View own leave history
- View company holidays
- Submit leave requests
- Cancel eligible requests
- View approval status
- View rejection reasons
- Receive notifications

## Manager

Can:

- View team leave requests
- View team calendar
- Approve or reject eligible requests
- View overlapping team leave
- Receive approval notifications
- View department leave reports where permitted

## HR

Can:

- View company leave data
- Review manager-approved requests
- Approve or reject requests
- Manage policies
- Manage company holidays
- Adjust balances where authorized
- Run reports
- Review liability
- Complete leave workflows

## Administrator

Can:

- Perform all leave operations
- Manage policies
- Manage balances
- Configure workflows
- View all reports
- Override workflow steps where permitted
- Manage notifications
- Access audit history

## Payroll

Can:

- View approved leave relevant to payroll
- View unpaid leave
- View leave liability
- Export approved leave data
- Access restricted compensation-dependent reports

---

# 5. Leave Request Lifecycle

```text
Draft
  │
  ▼
Pending
  │
  ▼
Manager Approved
  │
  ▼
HR Approved / Approved
  │
  ▼
Completed
```

Alternative paths:

```text
Pending
  ├── Rejected
  └── Cancelled

Manager Approved
  ├── Rejected
  └── Cancelled

Approved
  ├── Cancelled
  └── Completed
```

Every status transition must:

- Be authorized
- Be validated against the current status
- Record the acting user
- Record the action timestamp
- Write an audit log
- Trigger applicable notifications
- Recalculate affected balances where necessary
- Revalidate affected pages

---

# 6. Standard Leave Statuses

Current standardized statuses:

```text
pending
manager_approved
approved
hr_approved
rejected
cancelled
completed
```

## Pending

The request has been submitted and is awaiting the first approval step.

## Manager Approved

The employee's manager approved the request and HR review is still required.

## Approved

The request has completed the required approval process.

## HR Approved

The HR approval step has been completed. Depending on workflow configuration, this may represent final approval or an intermediate state.

## Rejected

The request was declined.

## Cancelled

The request was withdrawn or cancelled.

## Completed

The approved leave period has ended and the workflow has been closed.

The application should eventually simplify status handling so that `approved` and `hr_approved` have clearly distinct and consistently enforced meanings.

---

# 7. Leave Types

Recommended leave types include:

```text
vacation
sick
personal
bereavement
parental
maternity
paternity
unpaid
jury_duty
military
study
other
```

Leave types should be company-configurable rather than permanently hardcoded.

Each leave type may define:

- Display name
- Description
- Annual allocation
- Accrual method
- Carryover rules
- Maximum carryover
- Maximum accrual
- Waiting period
- Minimum request increment
- Half-day eligibility
- Manager approval requirement
- HR approval requirement
- Documentation requirement
- Paid or unpaid status
- Active status
- Region or jurisdiction

---

# 8. Leave Policy Structure

A leave policy should support:

- Company
- Leave type
- Display name
- Description
- Annual allocation
- Accrual method
- Accrual frequency
- Accrual rate
- Carryover allowed
- Maximum carryover
- Maximum accrual
- Waiting period
- Effective date
- Expiration date
- Half-day support
- Hourly support
- Manager approval requirement
- HR approval requirement
- Documentation requirement
- Negative balance rules
- Active status
- Region code
- Employee eligibility rules

Future policy eligibility may depend on:

- Employment type
- Location
- Department
- Job level
- Tenure
- Work schedule
- Union or agreement
- Country or state

---

# 9. Leave Balance Model

Each employee balance should represent:

- Leave type
- Allocated amount
- Accrued amount
- Carried-over amount
- Adjustments
- Used amount
- Pending amount
- Remaining amount
- Maximum accrual
- Effective leave year

Recommended calculation:

```text
available =
allocated
+ accrued
+ carried_over
+ adjustments
- approved_used
- reserved_pending
```

The exact calculation must be governed by company policy.

## Balance Rules

- Rejected requests must not reduce the balance.
- Cancelled requests must release reserved leave.
- Approved requests must reduce or reserve available leave.
- Completed requests must remain part of used leave.
- Manual adjustments must require authorization and audit logging.
- Historical balances should not be silently overwritten.
- Balance calculations should avoid double-counting approved requests.

---

# 10. Date and Duration Rules

The system should validate:

- Start date is valid.
- End date is valid.
- End date is not before start date.
- Request does not overlap an existing incompatible request.
- Non-working days are handled consistently.
- Company holidays are excluded where policy requires.
- Half-day requests use valid increments.
- Total days match policy and work-schedule rules.
- Requests respect minimum notice rules where configured.
- Requests respect maximum consecutive leave rules where configured.

Date-only values should be handled without timezone shifts.

---

# 11. Approval Workflow

## Standard Workflow

```text
Employee submits
      │
      ▼
Manager reviews
      │
      ▼
HR reviews
      │
      ▼
Approved
```

## Optional Workflow Variants

```text
Employee → Manager → Approved
Employee → HR → Approved
Employee → Manager → HR → Approved
Employee → Multi-level manager chain → HR → Approved
```

Approval rules should eventually be driven by policy configuration.

## Approval Requirements

Each approval action should:

1. Authenticate the user.
2. Resolve the current company.
3. Load the leave request.
4. Verify company ownership.
5. Verify role and reporting relationship.
6. Verify current request status.
7. Apply the valid next status.
8. Record actor and timestamp.
9. Write an audit log.
10. Create notifications.
11. Revalidate reports, calendars, and employee pages.

---

# 12. Approval Timeline

Each request should display a clear timeline, such as:

```text
Request Submitted
      │
      ▼
Manager Approval
      │
      ▼
HR Approval
      │
      ▼
Approved
      │
      ▼
Completed
```

The timeline should show:

- Step title
- Step description
- Completion status
- Current step
- Acting user
- Completion timestamp
- Rejection or cancellation state
- Reason where applicable

---

# 13. Employee Leave Experience

The employee leave page should display:

- Employee identity
- Leave summary cards
- Create-request action
- Leave request table
- Approval timeline
- Leave calendar
- Company holidays
- Leave balances
- Status badges
- Request details
- Rejection reason
- Cancellation options where permitted

Current route:

```text
/dashboard/employees/[id]/leave
```

---

# 14. Company Leave Dashboard

Current route:

```text
/dashboard/leave
```

The leave dashboard should provide:

- Pending request count
- Upcoming leave count
- Employees out today
- Leave days used
- Status distribution
- Leave-type distribution
- Upcoming leave table
- Department summary
- Navigation to reports
- Navigation to company calendar

The dashboard should remain company-scoped.

---

# 15. Company Leave Calendar

Current route:

```text
/dashboard/leave/calendar
```

The company calendar should support:

- Month view
- Previous month
- Next month
- Today navigation
- Employee names
- Leave type
- Leave date ranges
- Company holidays
- Department filtering
- Leave-type filtering
- Request detail dialog
- Link to employee leave record
- Responsive behavior
- Multi-day event rendering

Future enhancements:

- Week view
- Agenda view
- Team-only view
- Location filtering
- Manager filtering
- Conflict indicators
- Minimum staffing warnings
- Calendar subscription
- ICS export
- Google Calendar sync
- Outlook sync

---

# 16. Employees Out Today

The dashboard should identify employees whose approved leave includes the current date.

Each record should display:

- Employee name
- Employee number
- Department
- Leave type
- Start date
- End date
- Status
- Link to employee leave page

Only statuses considered active and approved should be included.

---

# 17. Company Holidays

Company holidays should support:

- Holiday name
- Holiday date
- Description
- Optional status
- Company ownership
- Calendar display
- Leave-duration calculation rules

Future enhancements:

- Recurring holidays
- Regional holiday templates
- Location-specific holidays
- Country-specific calendars
- Optional holiday employee selection

---

# 18. Current Application Structure

Expected leave-related routes and files include:

```text
app/dashboard/leave/
├── page.tsx
├── leave-overview-cards.tsx
├── leave-status-chart.tsx
├── leave-type-chart.tsx
├── upcoming-leave-table.tsx
├── department-leave-table.tsx
├── employees-out-today.tsx
├── services/
│   └── leave-dashboard.service.ts
├── calendar/
│   ├── page.tsx
│   ├── company-calendar.tsx
│   ├── company-calendar.service.ts
│   └── calendar-event-dialog.tsx
└── reports/
    ├── page.tsx
    ├── services/
    ├── monthly/
    ├── department/
    ├── annual/
    └── liability/
```

Employee-specific leave files are expected under:

```text
app/dashboard/employees/[id]/leave/
```

---

# 19. Database Ownership

The module primarily owns or depends on:

```text
employee_leave_requests
leave_policies
company_holidays
employee_leave_balances
employee_audit_logs
notifications
```

Depending on the final schema, policy tables may be named:

```text
leave_policies
company_leave_policies
```

The project should standardize the canonical table name and remove ambiguity.

Future tables may include:

```text
leave_balance_transactions
leave_accrual_runs
leave_policy_assignments
leave_approval_steps
leave_delegations
leave_blackout_periods
leave_calendar_sync_events
leave_year_closures
```

---

# 20. Leave Request Table Requirements

The leave request record should contain or reference:

- `id`
- `company_id`
- `employee_id`
- `leave_type`
- `start_date`
- `end_date`
- `total_days`
- `reason`
- `status`
- `manager_approved_by`
- `manager_approved_at`
- `hr_approved_by`
- `hr_approved_at`
- `approved_by`
- `approved_at`
- `rejected_by`
- `rejected_at`
- `rejection_reason`
- `cancelled_by`
- `cancelled_at`
- `created_by`
- `updated_by`
- `created_at`
- `updated_at`

Future fields may include:

- Policy ID
- Half-day period
- Requested hours
- Supporting document ID
- Calendar event IDs
- Sync status
- Return-to-work status
- Payroll processing status

---

# 21. Relationships

```text
companies
   │
   ├── leave policies
   ├── company holidays
   └── employees
          │
          ├── leave requests
          ├── leave balances
          └── manager
```

Each leave request must belong to:

- One company
- One employee
- One leave type or policy

Approval actors must belong to the same company unless an explicitly supported external workflow exists.

---

# 22. Service Layer

Recommended leave services include:

```text
app/dashboard/employees/services/employee-leave.service.ts
app/dashboard/leave/services/leave-dashboard.service.ts
app/dashboard/leave/reports/services/leave-report.service.ts
app/dashboard/leave/calendar/company-calendar.service.ts
app/dashboard/settings/leave-policies/leave-policy.service.ts
```

Services should:

- Authenticate users when required
- Resolve company context
- Apply company filters
- Normalize Supabase joins
- Return typed data
- Avoid UI logic
- Handle controlled errors
- Use consistent status interpretation
- Reuse shared date helpers

---

# 23. Server Actions

Typical actions include:

```text
createLeaveRequest
updateLeaveRequest
deleteLeaveRequest
cancelLeaveRequest
approveByManager
approveByHR
rejectLeaveRequest
completeLeave
createLeavePolicy
updateLeavePolicy
deactivateLeavePolicy
adjustLeaveBalance
```

Each action should:

1. Authenticate the user.
2. Resolve the company.
3. Check permissions.
4. Validate the request.
5. Verify ownership.
6. Validate the status transition.
7. Perform the mutation.
8. Update balances where necessary.
9. Write an audit log.
10. Trigger notifications.
11. Revalidate all affected routes.
12. Return a typed result.

---

# 24. Validation Rules

## Request Validation

- Employee is valid and belongs to the company.
- Leave type is active.
- Start and end dates are valid.
- End date is not before start date.
- Total days are positive.
- Request does not violate overlap rules.
- Balance is sufficient unless negative balances are allowed.
- Required documentation is present.
- Waiting period is satisfied.
- Employee is eligible for the policy.

## Approval Validation

- User has permission.
- Request belongs to the user's company.
- Request is in the expected status.
- Manager approval is performed by an authorized manager.
- HR approval is performed by HR or admin.
- Rejected or cancelled requests cannot be approved.
- Completed requests cannot be modified through normal approval actions.

## Policy Validation

- Allocation is non-negative.
- Carryover maximum is valid.
- Accrual maximum is valid.
- Waiting period is non-negative.
- Effective dates are valid.
- Duplicate active policies are prevented where required.

---

# 25. Permissions

| Action | Employee | Manager | HR | Payroll | Admin |
|---|---:|---:|---:|---:|---:|
| View own balance | Yes | Yes | Yes | Limited | Yes |
| Submit own request | Yes | Yes | Yes | No | Yes |
| Cancel own eligible request | Yes | Yes | Yes | No | Yes |
| View team requests | No | Yes | Yes | Limited | Yes |
| Manager approve | No | Yes | Yes | No | Yes |
| HR approve | No | No | Yes | No | Yes |
| Reject request | Limited | Yes | Yes | No | Yes |
| Complete leave | No | Limited | Yes | No | Yes |
| Manage policies | No | No | Yes | No | Yes |
| Adjust balances | No | No | Yes | Limited | Yes |
| View liability | No | Limited | Yes | Yes | Yes |
| Export reports | Own only | Team | Yes | Limited | Yes |

Final permissions must be enforced on the server and through RLS where possible.

---

# 26. Row Level Security

All leave-related tables must have RLS enabled.

Policies should ensure:

- Company data is isolated.
- Employees can access permitted portions of their own requests.
- Managers can access authorized team requests.
- HR and administrators can access company-scoped leave records.
- Payroll only accesses payroll-relevant leave data.
- Unauthorized users cannot infer sensitive leave reasons.
- Service-role workflows remain controlled.

Leave reasons and supporting documents may require stricter access than general calendar visibility.

---

# 27. Privacy Requirements

The company calendar should not automatically expose sensitive medical or personal details.

Calendar visibility should generally display:

- Employee name
- Leave category where permitted
- Date range
- General status

It should not display:

- Detailed medical information
- Supporting documentation
- Sensitive rejection notes
- Private HR comments

Companies should eventually be able to configure whether leave types are visible to coworkers and managers.

---

# 28. Audit Logging

Audit events should include:

- Request created
- Request updated
- Request deleted
- Request cancelled
- Manager approved
- HR approved
- Request approved
- Request rejected
- Leave completed
- Policy created
- Policy changed
- Policy deactivated
- Balance adjusted
- Calendar sync created
- Calendar sync failed
- Report exported

Audit records should include:

- Company ID
- Employee ID
- Leave request ID
- Action
- Performed by
- Timestamp
- Previous status
- New status
- Relevant metadata

---

# 29. Notifications

Current and recommended leave notifications:

- New request submitted
- Manager approval required
- Manager approval completed
- HR approval required
- Request approved
- Request rejected
- Request cancelled
- Upcoming leave reminder
- Employee out today
- Return-to-work reminder
- Leave balance low
- Policy changed
- Supporting document required

Notification recipients may include:

- Employee
- Direct manager
- HR
- Administrator
- Payroll

Delivery channels:

- In-app
- Email
- Future Slack
- Future Teams
- Future SMS

---

# 30. Reports

## Employee Leave History

Should support:

- Employee filter
- Department filter
- Leave-type filter
- Status filter
- Date range
- CSV export
- PDF export

## Monthly Leave Report

Should include:

- Year
- Month
- Employee
- Department
- Leave type
- Request count
- Total days

## Department Leave Report

Should include:

- Department
- Employee count
- Request count
- Leave days
- Leave-type breakdown

## Annual Utilization Report

Should include:

- Employee
- Allocation
- Used
- Remaining
- Utilization rate
- Year

## Leave Liability Report

Should include:

- Employee
- Leave balance
- Compensation basis
- Estimated daily rate
- Estimated liability
- Department
- Leave type

Liability calculations must document assumptions and should not be presented as accounting advice.

---

# 31. Exports

Supported formats:

- CSV
- PDF

Exports should:

- Respect active filters
- Respect role permissions
- Use company-scoped data
- Avoid unauthorized sensitive fields
- Include generation date
- Include report title
- Include filter summary
- Use consistent formatting
- Write an audit record for sensitive exports

Future support:

- XLSX
- Scheduled email delivery
- Secure report links

---

# 32. Calendar Integrations

Planned integrations:

- Google Calendar
- Microsoft Outlook
- ICS export

Future leave request fields may include:

```text
google_calendar_event_id
google_calendar_sync_status
google_calendar_synced_at
google_calendar_sync_error

outlook_calendar_event_id
outlook_calendar_sync_status
outlook_calendar_synced_at
outlook_calendar_sync_error
```

A separate connection table should store:

- Company
- Provider
- Connected account
- Access-token metadata
- Refresh-token metadata
- Token expiration
- Calendar ID
- Active status
- Last sync
- Sync error

Tokens must be encrypted and never exposed to client components.

---

# 33. Search and Filtering

Leave views and reports should support relevant combinations of:

- Employee
- Department
- Location
- Manager
- Leave type
- Status
- Start date
- End date
- Year
- Month

Filtering should be server-side for large datasets.

---

# 34. UI Requirements

Every leave page should include:

- Clear title
- Breadcrumbs
- Primary actions
- Status badges
- Loading state
- Empty state
- Error state
- Responsive layout
- Accessible forms
- Confirmation for destructive actions
- Clear approval-state communication

Calendars must not rely only on color to communicate leave type or status.

---

# 35. Accessibility Requirements

The module should support:

- Keyboard-operable calendars
- Accessible dialogs
- Screen-reader labels
- Visible focus states
- Text labels in addition to color coding
- Semantic tables
- Accessible form errors
- Sufficient color contrast
- Clear current-step indicators in timelines

---

# 36. Performance Requirements

- Index `company_id`.
- Index `employee_id`.
- Index `status`.
- Index `start_date`.
- Index `end_date`.
- Consider composite indexes for common report filters.
- Avoid loading full employee profiles in report queries.
- Paginate large request tables.
- Restrict calendar queries to visible date ranges.
- Aggregate reports in SQL where beneficial.
- Avoid repeated leave-balance recalculation across components.

---

# 37. Testing Requirements

## Request Creation

- Create valid request
- Reject invalid dates
- Reject missing fields
- Reject unauthorized employee
- Reject insufficient balance where required
- Reject invalid leave type
- Handle company holidays correctly
- Calculate total days correctly

## Approval Workflow

- Manager approves valid pending request
- Unauthorized manager cannot approve
- HR approves correct workflow state
- Invalid status transition is rejected
- Rejected request cannot be approved
- Cancelled request cannot be completed
- Audit log is created
- Notifications are generated

## Balances

- Approved leave reduces available balance
- Rejected leave does not reduce balance
- Cancelled leave releases balance
- Completed leave remains used
- Manual adjustment is audited
- Carryover rules are applied correctly

## Company Isolation

- Users cannot view another company's requests
- Users cannot approve another company's requests
- Reports only include current-company records
- Calendar only includes current-company records

## Reports

- Filters return correct rows
- CSV matches displayed report
- PDF includes correct totals
- Liability calculations are reproducible
- Sensitive fields are permission-controlled

## Calendar

- Multi-day leave renders on all applicable dates
- Holidays render correctly
- Month navigation works
- Filters work
- Dialog opens correct request
- Date-only values do not shift because of timezone

---

# 38. Definition of Done

The Leave Management module is feature complete when:

- Leave request CRUD is complete
- Approval workflow is complete
- Rejection and cancellation are complete
- Completion workflow is complete
- Leave policies are complete
- Leave balances are reliable
- Company holidays are complete
- Employee calendar is complete
- Company calendar is complete
- Employees out today is complete
- Dashboard metrics are complete
- Notifications are complete
- Reports are complete
- CSV export is complete
- PDF export is complete
- Liability report is validated
- Permissions are enforced
- RLS policies are verified
- Audit logging is complete
- Accessibility is verified
- Critical tests pass
- Documentation is current
- Production hardening is complete

---

# 39. Current Maturity Assessment

| Area | Current Status |
|---|---|
| Leave Request CRUD | Feature Complete |
| Manager Approval | Feature Complete |
| HR Approval | Feature Complete |
| Rejection | Feature Complete |
| Cancellation | Feature Complete |
| Completion Workflow | Feature Complete |
| Approval Timeline | Feature Complete |
| Leave Summary Cards | Feature Complete |
| Employee Leave Calendar | Feature Complete |
| Company Holidays | Feature Complete |
| Leave Balances | Feature Complete with further validation required |
| Leave Policies | In Development |
| Leave Dashboard | Feature Complete |
| Employees Out Today | Feature Complete |
| Company Leave Calendar | Feature Complete |
| Employee History Report | Feature Complete |
| Monthly Report | Feature Complete |
| Department Report | Feature Complete |
| Annual Utilization | Feature Complete |
| Leave Liability | Feature Complete with calculation review required |
| CSV Export | Feature Complete |
| PDF Export | Feature Complete |
| In-App Notifications | Feature Complete |
| Email Notifications | In Development |
| Calendar Integrations | Planned |
| Advanced Accrual Automation | Planned |
| Permissions Hardening | In Development |
| Production Testing | Planned |

---

# 40. Future Enhancements

- Advanced accrual engine
- Automated carryover
- Leave-year close
- Leave donations
- Shared leave pools
- Negative balance requests
- Blackout dates
- Minimum staffing rules
- Conflict warnings
- Delegated approvers
- Approval escalation
- Multi-level approvals
- Location-specific policies
- Regional compliance templates
- Hourly leave
- Partial-day leave improvements
- Return-to-work forms
- Supporting-document workflows
- Leave forecasting
- Burnout-risk indicators
- AI policy assistant
- Google Calendar integration
- Outlook integration
- ICS subscription
- Mobile leave approvals

---

# 41. Dependencies

| Module | Dependency |
|---|---|
| Employee Management | Employee, manager, department, company |
| Notifications | Request and approval events |
| Reporting | Leave requests, policies, balances |
| Payroll | Paid and unpaid approved leave |
| Attendance | Leave exclusions and absence reconciliation |
| Performance | Optional attendance and absence context |
| Permissions | Employee, manager, HR, admin access |
| Audit | Every leave mutation |
| Administration | Policy and holiday configuration |
| Integrations | Calendar and communication providers |
| AI | Policy search, forecasting, workflow assistance |

---

# 42. Related Documentation

- `../01-product-blueprint.md`
- `../02-product-roadmap.md`
- `../03-technical-architecture.md`
- `../feature-catalog.md`
- `01-employee-management.md`
- `09-notifications.md`
- `10-permissions.md`
- `11-reporting.md`
- `12-integrations.md`
- `14-administration.md`

---

# 43. Guiding Principle

> Leave management must provide employees with clarity, managers with visibility, HR with control, and the organization with accurate, secure, and auditable workforce data.