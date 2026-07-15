// types/employee.ts

export interface LookupItem {
  id: string;
  name: string;
}

export interface EmployeeManager {
  id: string;
  first_name: string;
  last_name: string;
  job_title: string | null;
}

/* ============================================================
   Employee
============================================================ */

export interface Employee {
  id: string;
  company_id: string;

  employee_number: string | null;

  first_name: string;
  last_name: string;

  email: string | null;
  phone: string | null;

  job_title: string | null;
  employment_type: string | null;
  employment_status: string | null;

  start_date: string | null;
  termination_date: string | null;

  manager_id: string | null;
  department_id: string | null;
  location_id: string | null;

  created_at: string;
  updated_at: string | null;

  department: LookupItem | null;
  location: LookupItem | null;
  manager: EmployeeManager | null;
}

/* ============================================================
   Documents
============================================================ */

export interface EmployeeDocument {
  id: string;
  employee_id: string;
  file_name: string;
  extraction_status: string | null;
  expiration_date: string | null;
  confidence_score: number | null;
  created_at: string | null;
  document_type: LookupItem | null;
}

/* ============================================================
   Leave
============================================================ */

export interface EmployeeLeave {
  id: string;
  employee_id: string;
  start_date: string | null;
  end_date: string | null;
  status: string | null;
  leave_type: string | null;
  created_at: string | null;
}

/* ============================================================
   Payroll
============================================================ */

export interface EmployeePayroll {
  id: string;
  employee_id: string;
  pay_date: string | null;
  gross_pay: number | null;
  net_pay: number | null;
  created_at: string | null;
}

/* ============================================================
   Performance Review
============================================================ */

export interface EmployeeReview {
  id: string;
  employee_id: string;
  review_date: string | null;
  reviewer_id: string | null;
  rating: number | null;
  status: string | null;
  comments: string | null;
  created_at: string | null;
}

/* ============================================================
   Timeline
============================================================ */

export interface EmployeeTimeline {
  id: string;
  employee_id: string;
  title: string | null;
  description: string | null;
  created_at: string | null;
}

/* ============================================================
   Compensation
============================================================ */

export interface EmployeeCompensation {
  id: string;
  employee_id: string;
  pay_type: "salary" | "hourly";
  pay_frequency: "weekly" | "biweekly" | "semimonthly" | "monthly";
  annual_salary: number | null;
  hourly_rate: number | null;
  bonus_eligible: boolean;
  bonus_target_percent: number | null;
  effective_start_date: string;
  effective_end_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/* ============================================================
   Emergency Contact
============================================================ */

export interface EmergencyContact {
  id: string;
  employee_id: string;
  first_name: string | null;
  last_name: string | null;
  relationship: string | null;
  phone: string | null;
  email: string | null;
  is_primary: boolean | null;
}

/* ============================================================
   Profile Summary
============================================================ */

export interface EmployeeSummary {
  documentCount: number;
  leaveRequestCount: number;
  approvedLeaveCount: number;
  assetCount: number;
  trainingCount: number;
  completedTrainingCount: number;
  performanceReviewCount: number;
}

/* ============================================================
   Employee Profile
============================================================ */

export interface EmployeeProfile {
  employee: Employee;

  latestCompensation: EmployeeCompensation | null;
  latestPerformance: EmployeeReview | null;

  emergencyContacts: EmployeeEmergencyContact[];
  leave: EmployeeLeave[];

  summary: {
    documentCount: number;
    leaveRequestCount: number;
    approvedLeaveCount: number;
    assetCount: number;
    trainingCount: number;
    completedTrainingCount: number;
    performanceReviewCount: number;
  };
}

export interface EmployeeAsset {
  id: string;
  company_id: string;
  employee_id: string;

  asset_name: string;
  asset_type: string | null;
  asset_tag: string | null;
  serial_number: string | null;

  assigned_date: string | null;
  return_due_date: string | null;
  returned_date: string | null;

  status: string | null;
  condition_assigned: string | null;
  condition_returned: string | null;
  notes: string | null;

  created_at: string;
  updated_at: string | null;
  created_by: string | null;
  updated_by: string | null;
}

export interface EmployeeEmergencyContact {
  id: string;
  company_id: string;
  employee_id: string;

  first_name: string;
  last_name: string;
  relationship: string;
  phone: string;
  email: string | null;
  address: string | null;
  is_primary: boolean;

  created_at: string;
  updated_at: string | null;
  created_by: string | null;
  updated_by: string | null;
}

export interface EmployeeAuditLog {
  id: string;
  company_id: string;
  employee_id: string;

  action: string;
  description: string | null;
  entity_type: string | null;
  entity_id: string | null;

  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;

  performed_by: string | null;
  created_at: string;
}