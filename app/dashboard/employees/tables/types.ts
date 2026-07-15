// =========================
// Core Employee Types
// =========================

export interface Department {
  id: string;
  name: string;
}

export interface Location {
  id: string;
  name: string;
}

export interface Manager {
  id: string;
  first_name: string;
  last_name: string;
  job_title: string | null;
}

export interface Employee {
  id: string;
  employee_number: string;

  first_name: string;
  last_name: string;

  email: string | null;
  phone: string | null;

  job_title: string | null;
  employment_status: string | null;

  start_date: string | null;
  termination_date: string | null;

  department: Department | null;
  location: Location | null;
  manager: Manager | null;
}

// =========================
// Documents
// =========================

export interface EmployeeDocument {
  id: string;

  file_name: string;

  extraction_status: string | null;

  expiration_date: string | null;

  confidence_score: number | null;

  created_at: string;

  document_type: {
    id: string;
    name: string;
  } | null;
}

// =========================
// Summary Cards
// =========================

export interface EmployeeSummary {
  documentCount: number;
  leaveRequestCount: number;
  approvedLeaveCount: number;

  assetCount: number;

  trainingCount: number;
  completedTrainingCount: number;

  performanceReviewCount: number;
}

// =========================
// Employee Profile Aggregate
// =========================

export interface EmployeeProfile {
  employee: Employee;

  latestCompensation: {
    salary_amount: number | null;
    currency: string | null;
  } | null;

  latestPerformance: unknown;

  emergencyContacts: unknown[];

  summary: EmployeeSummary;
}