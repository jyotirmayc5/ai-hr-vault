# Payroll Module

> **Version:** 1.0  
> **Status:** Planned  
> **Owner:** AI HR Vault Product Team  
> **Last Updated:** July 2026

---

# 1. Purpose

The Payroll module enables organizations to calculate employee gross pay, process approved earnings and deductions, produce pay statements, maintain payroll history, and export payroll data to accounting or external payroll systems.

The module should provide a controlled, accurate, and auditable payroll workflow while recognizing that payroll rules vary significantly by country, state, province, employment type, and company policy.

The initial implementation should focus on payroll preparation and controlled payroll calculations rather than attempting to replace all tax filing, benefits, or statutory remittance systems immediately.

---

# 2. Business Goals

The module should help organizations:

- Centralize payroll-related employee data
- Reduce manual payroll preparation
- Calculate regular and overtime earnings
- Process bonuses and adjustments
- Track deductions
- Generate pay statements
- Maintain payroll history
- Reconcile attendance, leave, and compensation data
- Export approved payroll data
- Reduce payroll errors
- Improve payroll auditability
- Support future accounting and payroll integrations

---

# 3. Scope

## Included

- Payroll settings
- Pay schedules
- Pay periods
- Payroll runs
- Employee compensation inputs
- Salary calculations
- Hourly calculations
- Overtime inputs
- Bonuses
- Commissions
- Reimbursements
- Pre-tax deductions
- Post-tax deductions
- Employer contributions
- Paid leave inputs
- Unpaid leave adjustments
- Payroll review
- Payroll approval
- Payroll locking
- Pay statements
- Payroll history
- CSV export
- Accounting export
- Audit logging
- Notifications

## Planned

- Tax withholding calculations
- Jurisdiction-specific tax rules
- Direct deposit files
- Benefits deductions
- Garnishments
- Retirement contributions
- Employer tax calculations
- Payroll tax filings
- Government remittances
- Multi-state payroll
- Multi-country payroll
- Retroactive pay
- Off-cycle payroll
- Supplemental payroll
- Contractor payments
- Expense reimbursements
- Payroll accounting journal entries
- QuickBooks integration
- ADP integration
- Gusto integration
- Payroll provider API integrations

## Excluded from Initial Release

- Automated federal tax filing
- Automated state tax filing
- Automated local tax filing
- Direct government remittance
- Benefits enrollment
- Full general ledger accounting
- Banking services
- Wage garnishment compliance administration
- International payroll compliance engine

---

# 4. Product Positioning

The initial Payroll module should be positioned as:

> A payroll preparation, calculation, approval, reporting, and export system integrated with employee compensation, attendance, and leave.

It should not initially be marketed as a full payroll tax filing service unless all legal, tax, banking, and compliance requirements have been implemented and independently reviewed.

---

# 5. User Roles

## Employee

Can:

- View own pay statements
- View payroll history
- View approved earnings and deductions
- Download permitted pay statements
- Report payroll concerns
- Update permitted payment information

## Manager

Can:

- View limited team payroll inputs where authorized
- Approve bonuses or commissions
- Review attendance-related payroll exceptions
- Approve overtime where required

Managers should not automatically see employee salary or deduction details.

## HR

Can:

- View payroll-relevant employee information
- Review compensation changes
- Review employment status
- Review paid and unpaid leave
- Submit payroll adjustments
- Review payroll exceptions
- Access approved reports where permitted

## Payroll

Can:

- Create payroll runs
- Import payroll inputs
- Review compensation
- Calculate earnings
- Manage deductions
- Review attendance and leave inputs
- Resolve payroll exceptions
- Approve payroll
- Lock payroll
- Generate pay statements
- Export payroll files

## Finance

Can:

- Review payroll totals
- Approve funding totals
- View accounting summaries
- Export journal entries
- Access company-level payroll reports

## Administrator

Can:

- Configure payroll settings
- Manage pay schedules
- Manage permissions
- Unlock payroll where authorized
- View audit history
- Manage payroll integrations

---

# 6. Payroll Lifecycle

```text
Pay Period Created
        │
        ▼
Payroll Run Draft
        │
        ▼
Inputs Collected
        │
        ▼
Calculations Performed
        │
        ▼
Exceptions Reviewed
        │
        ▼
Payroll Reviewed
        │
        ▼
Payroll Approved
        │
        ▼
Payroll Locked
        │
        ▼
Pay Statements Generated
        │
        ▼
Exported / Processed
        │
        ▼
Completed
```

Alternative paths:

```text
Draft
  ├── Cancelled
  └── Returned for Correction

Reviewed
  ├── Approved
  └── Returned to Draft

Locked
  └── Reopened through controlled override
```

Every payroll transition should:

- Be authorized
- Be timestamped
- Record the acting user
- Write an audit log
- Preserve previous calculations
- Trigger applicable notifications
- Prevent unauthorized changes
- Maintain a reproducible calculation snapshot

---

# 7. Payroll Statuses

Recommended payroll run statuses:

```text
draft
collecting_inputs
calculating
pending_review
reviewed
approved
locked
exported
completed
cancelled
```

## Draft

The payroll run has been created but is not ready for processing.

## Collecting Inputs

Attendance, leave, bonuses, deductions, and adjustments are being collected.

## Calculating

The system is generating payroll results.

## Pending Review

The payroll run requires payroll or finance review.

## Reviewed

Review has been completed, but final approval is still required.

## Approved

The payroll run has received final authorization.

## Locked

Payroll details can no longer be modified through normal workflows.

## Exported

Payroll data has been exported to an external provider or accounting system.

## Completed

The payroll cycle is closed.

## Cancelled

The payroll run was cancelled before completion.

---

# 8. Pay Schedules

Supported pay schedules may include:

```text
weekly
biweekly
semimonthly
monthly
quarterly
custom
```

A pay schedule should define:

- Company
- Schedule name
- Frequency
- Pay period rules
- Pay date rules
- Processing deadline
- Default workweek start
- Time zone
- Active status
- Effective date
- End date

Examples:

- Weekly Friday payroll
- Biweekly Friday payroll
- Semimonthly 15th and last day
- Monthly last business day

---

# 9. Pay Periods

A pay period should include:

- Company
- Pay schedule
- Period start date
- Period end date
- Pay date
- Submission deadline
- Approval deadline
- Status
- Locked timestamp
- Created by
- Created at

Pay periods should be generated according to the pay schedule.

Date calculations must support:

- Weekends
- Company holidays
- Bank holidays
- Custom payment-date adjustment rules

---

# 10. Employee Compensation Inputs

Payroll should obtain employee compensation from effective-dated compensation history.

Supported pay types:

```text
salary
hourly
commission
contract
```

Compensation data may include:

- Annual salary
- Hourly rate
- Pay frequency
- Standard weekly hours
- Bonus eligibility
- Commission eligibility
- Effective start date
- Effective end date
- Currency
- Compensation notes

Payroll must select the compensation record effective during the applicable pay period.

Historical payroll results must not change when compensation records are updated later.

---

# 11. Payroll Run Structure

A payroll run should include:

- Company
- Pay schedule
- Pay period
- Run type
- Status
- Currency
- Employee count
- Gross payroll
- Total deductions
- Total employer contributions
- Estimated taxes
- Net payroll
- Created by
- Reviewed by
- Approved by
- Locked by
- Created at
- Reviewed at
- Approved at
- Locked at

Recommended payroll run types:

```text
regular
off_cycle
bonus
correction
final
supplemental
```

---

# 12. Employee Payroll Calculation

Each employee payroll result should include:

- Employee
- Payroll run
- Compensation basis
- Regular earnings
- Overtime earnings
- Double-time earnings
- Paid leave earnings
- Holiday earnings
- Bonus earnings
- Commission earnings
- Reimbursements
- Other earnings
- Gross pay
- Pre-tax deductions
- Taxable wages
- Estimated taxes
- Post-tax deductions
- Net pay
- Employer contributions
- Payroll notes
- Exception status

The calculation result must preserve:

- Input values
- Rate values
- Quantity values
- Formula version
- Calculation timestamp
- Source references

---

# 13. Salary Calculation

For salaried employees, a basic periodic salary calculation may use:

```text
period salary =
annual salary
÷ number of pay periods per year
```

Typical pay-period counts:

```text
weekly = 52
biweekly = 26
semimonthly = 24
monthly = 12
```

The system must define how it handles:

- Partial-period hires
- Partial-period terminations
- Unpaid leave
- Salary changes during the period
- Retroactive changes
- Additional earnings
- Rounding

Proration rules must be company-configurable and documented.

---

# 14. Hourly Calculation

For hourly employees:

```text
regular earnings =
approved regular hours
× hourly rate
```

```text
overtime earnings =
approved overtime hours
× overtime rate
```

Payroll should use approved attendance or approved imported hours.

The calculation must distinguish:

- Regular hours
- Overtime hours
- Double-time hours
- Holiday hours
- Paid leave hours
- Unpaid leave hours

---

# 15. Overtime Calculation

Overtime may depend on:

- Daily threshold
- Weekly threshold
- Consecutive days
- Holiday rules
- Weekend rules
- Jurisdiction
- Employee classification
- Collective agreement
- Company policy

Recommended overtime multipliers:

```text
regular = 1.0
overtime = 1.5
double_time = 2.0
holiday = configurable
```

Original approved attendance totals should remain available for audit.

The initial implementation should allow configurable overtime inputs rather than claim automatic legal compliance across all jurisdictions.

---

# 16. Paid and Unpaid Leave

Payroll should integrate with approved leave.

Paid leave may generate earnings based on:

- Salary allocation
- Hourly rate
- Standard scheduled hours
- Leave policy rules

Unpaid leave may reduce pay based on:

- Scheduled hours missed
- Daily salary rate
- Hourly rate
- Company proration rules

Payroll should distinguish:

```text
vacation pay
sick pay
personal leave pay
holiday pay
unpaid leave deduction
other paid leave
```

---

# 17. Earnings

Recommended earnings types:

```text
regular
overtime
double_time
holiday
paid_leave
bonus
commission
retroactive_pay
shift_differential
allowance
reimbursement
severance
other
```

Each earning should include:

- Payroll result
- Earning type
- Description
- Quantity
- Rate
- Multiplier
- Amount
- Tax treatment
- Source
- Notes

---

# 18. Bonuses and Commissions

Bonus records may include:

- Employee
- Bonus type
- Amount
- Percentage
- Related period
- Approval status
- Approved by
- Tax treatment
- Payroll run
- Notes

Commission records may include:

- Employee
- Commission plan
- Sales period
- Eligible amount
- Commission rate
- Calculated amount
- Adjustment
- Approval status
- Payroll run

Bonus and commission approvals should occur before payroll locking.

---

# 19. Deductions

Recommended deduction categories:

```text
pre_tax
post_tax
garnishment
benefit
retirement
loan_repayment
union_dues
other
```

Each deduction should include:

- Employee
- Deduction type
- Fixed amount or percentage
- Effective date
- End date
- Maximum amount
- Year-to-date limit
- Priority
- Active status
- Employer contribution
- Notes

The system must prevent deductions from producing invalid net pay unless explicitly permitted.

---

# 20. Employer Contributions

Employer contributions may include:

- Retirement contributions
- Insurance contributions
- Health benefits
- Payroll taxes
- Allowances
- Other employer-paid amounts

These amounts may not reduce employee net pay but should be included in payroll cost reporting.

---

# 21. Taxes

Tax calculations are highly jurisdiction-specific.

The initial module should support:

- Taxable wage fields
- Imported tax amounts
- Estimated tax fields
- External payroll provider calculations
- Manual adjustments
- Tax calculation version metadata

A future compliant tax engine would require:

- Federal rules
- State or provincial rules
- Local rules
- Filing status
- Allowances
- Tax credits
- Wage bases
- Annual limits
- Employer taxes
- Regulatory updates
- Filing and remittance workflows

No automated tax calculation should be considered production-ready without specialist review.

---

# 22. Net Pay

Basic calculation:

```text
net pay =
gross pay
- employee taxes
- pre-tax deductions where applicable
- post-tax deductions
- garnishments
+ non-taxable reimbursements
```

The calculation must clearly distinguish:

- Earnings
- Taxable earnings
- Non-taxable reimbursements
- Employee deductions
- Employer contributions
- Taxes
- Net pay

---

# 23. Payroll Exceptions

Recommended exception types:

```text
missing_compensation
missing_hours
unapproved_timesheet
negative_net_pay
duplicate_payment
missing_bank_details
invalid_deduction
unexpected_salary_change
unresolved_leave
termination_mismatch
missing_tax_data
calculation_error
```

Each exception should include:

- Payroll run
- Employee
- Exception type
- Severity
- Description
- Resolution status
- Assigned reviewer
- Resolution notes
- Resolved by
- Resolved at

Recommended statuses:

```text
open
acknowledged
resolved
dismissed
blocking
```

Blocking exceptions must prevent approval or locking.

---

# 24. Payroll Review

The review experience should show:

- Employee count
- New hires
- Terminations
- Salary changes
- Hourly totals
- Overtime totals
- Paid leave
- Unpaid leave
- Bonuses
- Deductions
- Exceptions
- Gross payroll
- Net payroll
- Employer costs
- Variance from prior payroll

Reviewers should be able to drill into individual employee calculations.

---

# 25. Payroll Variance Analysis

The system should compare the current payroll with a prior comparable run.

Recommended variance checks:

- Gross pay change
- Net pay change
- Overtime change
- Bonus change
- Deduction change
- Employee count change
- New employee payment
- Terminated employee payment
- Unusually high or low payment

Companies should be able to configure materiality thresholds.

---

# 26. Payroll Approval

Recommended workflow:

```text
Payroll Preparer
      │
      ▼
Payroll Reviewer
      │
      ▼
Finance Approver
      │
      ▼
Locked
```

Approval roles should be configurable.

No user should approve their own payroll preparation when separation of duties is required.

---

# 27. Payroll Locking

Once locked:

- Calculations cannot be changed through normal workflows.
- Inputs cannot be edited for the run.
- Pay statements can be generated.
- Exports can be produced.
- Changes require an authorized reopen or correction run.
- Audit logging is mandatory.

Unlocking should require:

- Elevated permission
- Reason
- Acting user
- Timestamp
- Audit record
- Optional second approval

---

# 28. Off-Cycle and Correction Payroll

Off-cycle payroll may be used for:

- Missed payment
- Bonus payment
- Final payment
- Correction
- Severance
- Reimbursement

Correction payroll should preserve the original payroll and create an adjusting transaction rather than silently altering history.

---

# 29. Final Payroll

Employee termination may require:

- Final salary
- Unpaid hours
- Overtime
- Leave payout
- Severance
- Bonus
- Expense reimbursement
- Deductions
- Asset recovery adjustments where legally permitted

Final-pay rules vary by jurisdiction and require configurable deadlines and specialist review.

---

# 30. Pay Statements

Each pay statement should display:

- Company name
- Employee name
- Employee number
- Pay period
- Pay date
- Earnings
- Hours
- Rates
- Deductions
- Taxes
- Employer contributions where appropriate
- Gross pay
- Net pay
- Year-to-date totals
- Currency
- Statement identifier

Pay statements should be:

- Permission-controlled
- Stored securely
- Downloadable as PDF
- Immutable after payroll lock
- Regenerable from the payroll snapshot
- Accessible only to authorized users

---

# 31. Year-to-Date Totals

Year-to-date totals may include:

- Gross earnings
- Taxable wages
- Employee taxes
- Employer taxes
- Deductions
- Employer contributions
- Net pay
- Regular hours
- Overtime hours
- Paid leave hours

Year-to-date values should be derived from completed payroll results rather than mutable employee records.

---

# 32. Payroll Dashboard

Recommended dashboard metrics:

- Current payroll status
- Next pay date
- Payroll deadline
- Employees included
- Gross payroll
- Net payroll
- Employer cost
- Open exceptions
- Unapproved timesheets
- Payroll variance
- Recent payroll runs

Recommended route:

```text
/dashboard/payroll
```

---

# 33. Current and Planned Routes

Recommended routes:

```text
/dashboard/payroll
/dashboard/payroll/runs
/dashboard/payroll/runs/new
/dashboard/payroll/runs/[id]
/dashboard/payroll/pay-schedules
/dashboard/payroll/pay-periods
/dashboard/payroll/earnings
/dashboard/payroll/deductions
/dashboard/payroll/bonuses
/dashboard/payroll/pay-statements
/dashboard/payroll/reports
/dashboard/payroll/settings
/dashboard/payroll/integrations
```

Employee-specific route:

```text
/dashboard/employees/[id]/payroll
```

Employee self-service route:

```text
/dashboard/my-pay
```

---

# 34. Suggested Application Structure

```text
app/dashboard/payroll/
├── page.tsx
├── runs/
│   ├── page.tsx
│   ├── new/
│   │   └── page.tsx
│   └── [id]/
│       └── page.tsx
├── pay-schedules/
│   └── page.tsx
├── pay-periods/
│   └── page.tsx
├── earnings/
│   └── page.tsx
├── deductions/
│   └── page.tsx
├── bonuses/
│   └── page.tsx
├── pay-statements/
│   └── page.tsx
├── reports/
│   └── page.tsx
├── settings/
│   └── page.tsx
├── integrations/
│   └── page.tsx
├── components/
├── services/
├── actions.ts
├── types.ts
└── validation.ts
```

---

# 35. Database Ownership

Recommended tables:

```text
pay_schedules
pay_periods
payroll_runs
payroll_employee_results
payroll_earnings
payroll_deductions
employee_deductions
payroll_employer_contributions
payroll_taxes
payroll_exceptions
payroll_approvals
pay_statements
payroll_exports
payroll_adjustments
payroll_audit_logs
```

Supporting tables:

```text
companies
employees
employee_compensation
attendance_records
timesheets
employee_leave_requests
employee_leave_balances
departments
locations
notifications
```

Future tables may include:

```text
employee_bank_accounts
employee_tax_profiles
tax_jurisdictions
tax_rules
benefit_enrollments
garnishment_orders
direct_deposit_batches
payroll_journal_entries
payroll_provider_connections
```

---

# 36. Suggested Table Responsibilities

## pay_schedules

Stores company payroll frequency and date rules.

## pay_periods

Stores individual payroll periods and deadlines.

## payroll_runs

Stores payroll workflow state and company-level totals.

## payroll_employee_results

Stores one calculated result per employee per payroll run.

## payroll_earnings

Stores earning line items.

## payroll_deductions

Stores deduction line items applied during payroll.

## employee_deductions

Stores effective-dated recurring employee deductions.

## payroll_employer_contributions

Stores employer-paid contribution line items.

## payroll_taxes

Stores imported, estimated, or calculated tax line items.

## payroll_exceptions

Stores blocking and non-blocking payroll issues.

## payroll_approvals

Stores review and approval decisions.

## pay_statements

Stores generated statement metadata and secure file references.

## payroll_exports

Stores export history and provider status.

---

# 37. Relationships

```text
companies
   │
   ├── pay schedules
   │      └── pay periods
   │
   └── payroll runs
          │
          ├── employee payroll results
          │      ├── earnings
          │      ├── deductions
          │      ├── taxes
          │      └── contributions
          │
          ├── approvals
          ├── exceptions
          ├── exports
          └── pay statements
```

Each employee payroll result should reference:

- Employee
- Payroll run
- Effective compensation
- Approved timesheet where applicable
- Relevant leave inputs
- Calculation version

---

# 38. Service Layer

Recommended services:

```text
payroll.service.ts
payroll-run.service.ts
pay-schedule.service.ts
pay-period.service.ts
payroll-calculation.service.ts
payroll-input.service.ts
payroll-exception.service.ts
payroll-approval.service.ts
pay-statement.service.ts
payroll-export.service.ts
payroll-report.service.ts
```

Services should:

- Authenticate the user
- Resolve company context
- Apply company scope
- Use decimal-safe calculations
- Preserve calculation snapshots
- Avoid UI logic
- Reject invalid status transitions
- Return typed results
- Maintain reproducible totals
- Centralize calculation rules

---

# 39. Server Actions

Recommended actions:

```text
createPaySchedule
updatePaySchedule
generatePayPeriods
createPayrollRun
collectPayrollInputs
calculatePayrollRun
recalculateEmployeePayroll
addPayrollAdjustment
addBonus
addDeduction
resolvePayrollException
submitPayrollForReview
reviewPayroll
approvePayroll
lockPayroll
unlockPayroll
cancelPayrollRun
generatePayStatements
exportPayroll
createCorrectionPayroll
```

Each action should:

1. Authenticate the user.
2. Resolve the company.
3. Check permissions.
4. Validate input.
5. Validate payroll status.
6. Perform the operation.
7. Recalculate affected totals.
8. Write an audit log.
9. Trigger notifications.
10. Revalidate affected routes.
11. Return a typed result.

---

# 40. Calculation Standards

Payroll calculations should:

- Use decimal-safe arithmetic.
- Avoid JavaScript floating-point calculations for money.
- Store monetary values using appropriate numeric database types.
- Define currency precision.
- Apply rounding consistently.
- Preserve source values.
- Preserve formula versions.
- Produce reproducible results.
- Avoid recalculating locked historical payroll from current employee data.

Recommended monetary storage:

```text
numeric(18, 4)
```

Final displayed values may be rounded according to currency rules.

---

# 41. Validation Rules

## Payroll Run

- Pay period belongs to the current company.
- No duplicate active regular payroll exists for the same period.
- Status transition is valid.
- Currency is supported.
- Pay schedule is active.
- Payroll period dates are valid.

## Employee Result

- Employee belongs to the company.
- Employee is eligible for the period.
- Effective compensation exists.
- Hours are approved where required.
- Deductions are valid.
- Earnings are non-negative unless adjustment rules permit otherwise.
- Net pay is valid.
- Calculation totals reconcile.

## Locking

- No blocking exceptions remain.
- Required approvals exist.
- Employee totals equal payroll-run totals.
- Pay period is valid.
- User has lock permission.
- Required review separation is satisfied.

---

# 42. Permissions

| Action | Employee | Manager | HR | Payroll | Finance | Admin |
|---|---:|---:|---:|---:|---:|---:|
| View own pay statement | Yes | Yes | Yes | Yes | Limited | Yes |
| View own payroll history | Yes | Yes | Yes | Yes | Limited | Yes |
| View team salary | No | Limited | Limited | Yes | Limited | Yes |
| Add payroll input | No | Limited | Yes | Yes | Limited | Yes |
| Create payroll run | No | No | Limited | Yes | Limited | Yes |
| Calculate payroll | No | No | Limited | Yes | No | Yes |
| Review payroll | No | No | Limited | Yes | Yes | Yes |
| Approve payroll | No | No | Limited | Limited | Yes | Yes |
| Lock payroll | No | No | No | Yes | Yes | Yes |
| Unlock payroll | No | No | No | Limited | Limited | Yes |
| Export payroll | No | No | Limited | Yes | Yes | Yes |
| Manage payroll settings | No | No | Limited | Limited | Limited | Yes |

Final permissions must support separation of duties.

---

# 43. Row Level Security

All payroll tables must have RLS enabled.

Policies should ensure:

- Company data is isolated.
- Employees only access their own statements and permitted payroll history.
- Managers do not automatically access salary data.
- HR accesses only authorized payroll fields.
- Payroll users access company-scoped payroll records.
- Finance accesses summarized or approved records according to permissions.
- Service-role operations remain controlled.
- Export files are protected.
- Payroll integration credentials remain server-only.

---

# 44. Privacy and Data Classification

Payroll data is highly sensitive.

Sensitive data may include:

- Salary
- Hourly rate
- Bonuses
- Deductions
- Taxes
- Net pay
- Bank details
- Tax identifiers
- Garnishments

Requirements:

- Apply least-privilege access.
- Do not expose payroll data in general employee queries.
- Avoid logging sensitive values.
- Encrypt integration credentials.
- Protect bank and tax data.
- Record access to sensitive exports.
- Use secure document storage for pay statements.
- Define retention policies.
- Support access review procedures.

---

# 45. Audit Logging

Audit events should include:

- Pay schedule created
- Pay schedule changed
- Pay period generated
- Payroll run created
- Payroll calculated
- Employee result recalculated
- Bonus added
- Deduction added
- Adjustment added
- Exception resolved
- Payroll reviewed
- Payroll approved
- Payroll locked
- Payroll unlocked
- Pay statement generated
- Payroll exported
- Correction run created
- Payroll cancelled

Audit records should include:

- Company ID
- Payroll run ID
- Employee ID where relevant
- Action
- Performed by
- Timestamp
- Previous values
- New values
- Reason
- Relevant metadata

---

# 46. Notifications

Recommended notifications:

- Payroll period opened
- Timesheet deadline approaching
- Payroll input required
- Payroll exception created
- Payroll review required
- Payroll approval required
- Payroll approved
- Payroll locked
- Pay statement available
- Payroll export completed
- Payroll export failed
- Payroll reopened
- Correction payroll created

Sensitive payroll amounts should generally not be included in email subject lines or unsecured notifications.

---

# 47. Reports

Recommended payroll reports:

- Payroll register
- Employee payroll history
- Gross-to-net report
- Earnings report
- Deduction report
- Employer contribution report
- Overtime payroll report
- Paid leave payroll report
- Unpaid leave report
- Department payroll summary
- Location payroll summary
- Payroll variance report
- New-hire payroll report
- Termination payroll report
- Year-to-date payroll report
- Payroll exception report
- Payroll audit report

Sensitive reports must be permission-controlled.

---

# 48. Exports

Supported initial exports:

- CSV
- PDF payroll register
- Accounting summary
- External provider file

Exports should:

- Respect permissions
- Use locked or approved payroll data
- Include export version
- Include company and pay period
- Include generation timestamp
- Avoid unnecessary sensitive fields
- Store export history
- Record the acting user
- Track provider status
- Use secure file storage

Future formats:

- NACHA or banking files where legally and operationally appropriate
- QuickBooks journal import
- ADP-compatible export
- Gusto-compatible export
- API delivery
- SFTP delivery

---

# 49. Accounting Integration

Payroll may generate accounting entries such as:

```text
Debit: Salary Expense
Debit: Employer Tax Expense
Debit: Benefits Expense
Credit: Payroll Payable
Credit: Tax Payable
Credit: Benefit Payable
Credit: Cash
```

The exact accounts should be configurable.

The system should support:

- Department allocation
- Location allocation
- Cost center allocation
- Earnings account mapping
- Deduction liability mapping
- Employer contribution mapping
- Export validation
- Balanced journal verification

---

# 50. External Payroll Provider Integration

The initial integration strategy should support exporting payroll-ready data to providers.

A provider connection may include:

- Company
- Provider
- External company ID
- Connection status
- Credential metadata
- Last sync
- Sync direction
- Supported features
- Error status

Providers may include:

- ADP
- Gusto
- QuickBooks Payroll
- Paychex
- Rippling
- Regional payroll providers

Credentials must be encrypted and server-only.

---

# 51. Security Requirements

- Never expose payroll service credentials.
- Never calculate sensitive payroll entirely in the browser.
- Validate every payroll action server-side.
- Use decimal-safe calculation methods.
- Require elevated authorization for locking and unlocking.
- Prevent modification of locked payroll.
- Record sensitive exports.
- Use signed URLs for pay statements.
- Protect employee bank and tax data.
- Apply separation of duties.
- Rate-limit sensitive actions where appropriate.
- Require reauthentication for high-risk operations where supported.

---

# 52. Performance Requirements

- Index `company_id`.
- Index `pay_period_id`.
- Index `payroll_run_id`.
- Index `employee_id`.
- Index payroll status.
- Index pay date.
- Use composite indexes for company and period queries.
- Avoid recalculating the entire payroll for a single employee change when unnecessary.
- Process large calculations through controlled jobs where appropriate.
- Cache stable payroll summaries carefully.
- Paginate large payroll registers.
- Generate large reports asynchronously where necessary.

---

# 53. Accessibility Requirements

The module should support:

- Keyboard navigation
- Accessible review tables
- Visible focus indicators
- Accessible approval dialogs
- Clear validation messages
- Text labels for statuses
- Semantic headings
- Screen-reader-friendly pay statement links
- Sufficient color contrast
- Clear confirmation for locking and unlocking

---

# 54. Testing Requirements

## Pay Schedules

- Create valid schedule
- Generate pay periods
- Handle weekend pay date
- Handle holiday pay date
- Reject invalid period rules

## Salary Payroll

- Calculate weekly salary
- Calculate biweekly salary
- Calculate semimonthly salary
- Calculate monthly salary
- Apply partial-period proration
- Apply salary change during period

## Hourly Payroll

- Calculate regular hours
- Calculate overtime
- Calculate double time
- Apply hourly-rate changes
- Reject unapproved hours

## Leave Integration

- Include paid leave
- Exclude unpaid leave
- Handle partial-day leave
- Avoid duplicate payment of leave and worked hours

## Deductions

- Fixed deduction
- Percentage deduction
- Effective date
- End date
- Maximum limit
- Negative-net-pay prevention

## Workflow

- Create payroll run
- Calculate payroll
- Resolve exceptions
- Review payroll
- Approve payroll
- Lock payroll
- Prevent locked edits
- Create correction run

## Company Isolation

- Cross-company payroll records are inaccessible.
- Cross-company payroll actions fail.
- Exports contain only current-company records.
- Pay statements are private.

## Reconciliation

- Employee totals equal payroll-run totals.
- Gross minus deductions and taxes equals net pay.
- Export totals match locked payroll.
- Year-to-date totals reconcile.

---

# 55. Definition of Done

The Payroll module is feature complete when:

- Pay schedules are complete
- Pay periods are complete
- Payroll runs are complete
- Salary calculations are validated
- Hourly calculations are validated
- Attendance integration is complete
- Leave integration is complete
- Earnings are complete
- Deductions are complete
- Bonuses and commissions are complete
- Payroll exceptions are complete
- Review workflow is complete
- Approval workflow is complete
- Payroll locking is complete
- Correction payroll is complete
- Pay statements are complete
- Payroll reports are complete
- CSV export is complete
- Accounting export is complete
- Permissions are enforced
- RLS policies are verified
- Audit logging is complete
- Privacy controls are verified
- Reconciliation tests pass
- Accessibility is verified
- Documentation is current
- Production hardening is complete
- Legal and payroll-specialist review is completed where required

---

# 56. Recommended Implementation Phases

## Phase 1 — Foundation

- Pay schedules
- Pay periods
- Payroll settings
- Payroll run tables
- Employee payroll result tables
- Decimal-safe calculation utilities

## Phase 2 — Payroll Inputs

- Compensation integration
- Attendance integration
- Leave integration
- Bonuses
- Deductions
- Adjustments

## Phase 3 — Calculations

- Salary calculations
- Hourly calculations
- Overtime
- Paid and unpaid leave
- Gross-to-net framework
- Reconciliation

## Phase 4 — Workflow

- Payroll review
- Exceptions
- Approval
- Locking
- Correction runs

## Phase 5 — Outputs

- Pay statements
- Payroll register
- CSV export
- PDF export
- Accounting export

## Phase 6 — Integrations

- QuickBooks
- ADP
- Gusto
- Provider APIs
- Direct deposit workflows

## Phase 7 — Advanced Compliance

- Tax engine
- Garnishments
- Benefits deductions
- Filing
- Multi-state
- Multi-country

---

# 57. Current Maturity Assessment

| Area | Current Status |
|---|---|
| Payroll Requirements | Planned |
| Database Design | Planned |
| Pay Schedules | Planned |
| Pay Periods | Planned |
| Payroll Runs | Planned |
| Compensation Integration | Planned |
| Attendance Integration | Planned |
| Leave Integration | Planned |
| Salary Calculation | Planned |
| Hourly Calculation | Planned |
| Overtime | Planned |
| Earnings | Planned |
| Deductions | Planned |
| Bonuses | Planned |
| Taxes | Planned |
| Exceptions | Planned |
| Review Workflow | Planned |
| Approval Workflow | Planned |
| Payroll Locking | Planned |
| Pay Statements | Planned |
| Reports | Planned |
| Exports | Planned |
| Integrations | Planned |
| Permissions | Planned |
| Production Testing | Planned |

---

# 58. Future Enhancements

- Tax calculation engine
- Direct deposit
- Multi-state payroll
- Multi-country payroll
- Contractor payments
- Benefits deductions
- Garnishments
- Payroll tax filing
- Employer remittances
- Expense reimbursement
- Salary advances
- Payroll loans
- Compensation planning integration
- Payroll forecasting
- Labor-cost analytics
- Automated anomaly detection
- AI payroll review assistant
- Mobile pay statements
- Earned wage access integrations
- Global payroll provider integrations

---

# 59. Dependencies

| Module | Dependency |
|---|---|
| Employee Management | Employee identity, status, compensation |
| Attendance | Approved hours and overtime |
| Leave | Paid and unpaid leave |
| Notifications | Payroll deadlines, approvals, statements |
| Permissions | Employee, payroll, finance, HR, admin access |
| Audit | Every payroll mutation |
| Reporting | Payroll results and history |
| Administration | Pay schedules, currency, company settings |
| Integrations | Accounting, banking, and payroll providers |
| AI | Exception review and anomaly detection |

---

# 60. Related Documentation

- `../01-product-blueprint.md`
- `../02-product-roadmap.md`
- `../03-technical-architecture.md`
- `../feature-catalog.md`
- `01-employee-management.md`
- `02-leave-management.md`
- `03-attendance.md`
- `09-notifications.md`
- `10-permissions.md`
- `11-reporting.md`
- `12-integrations.md`
- `14-administration.md`

---

# 61. Guiding Principle

> Payroll must be accurate, reproducible, secure, permission-controlled, and auditable before it is considered ready to affect employee pay.