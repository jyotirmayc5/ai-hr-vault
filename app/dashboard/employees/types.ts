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

export interface EmployeeLeave {
  id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  status: string;
  reason: string | null;
}

export interface EmployeeAsset {
  id: string;
  asset_name: string;
  asset_type: string | null;
  serial_number: string | null;
  assigned_date: string | null;
  returned_date: string | null;
  status: string;
  notes: string | null;
}

export interface EmployeeTraining {
  id: string;
  course_name: string;
  provider: string | null;
  status: string;
  assigned_date: string | null;
  due_date: string | null;
  completed_date: string | null;
  expiration_date: string | null;
}

export interface EmployeePerformanceReview {
  id: string;
  review_period: string | null;
  rating: string | null;
  summary: string | null;
  status: string;
  completed_at: string | null;
}

export interface EmployeeCompensation {
  id: string;
  salary_amount: number | null;
  currency: string | null;
  pay_frequency: string | null;
  pay_type: string | null;
  bonus_target: number | null;
  effective_date: string | null;
  end_date: string | null;
}

export interface EmployeeEmergencyContact {
  id: string;
  name: string;
  relationship: string | null;
  phone: string | null;
  email: string | null;
  is_primary: boolean;
}

export interface EmployeeSummary {
  documentCount: number;
  leaveRequestCount: number;
  approvedLeaveCount: number;
  assetCount: number;
  trainingCount: number;
  completedTrainingCount: number;
  performanceReviewCount: number;
}

export interface EmployeeProfile {
  employee: Employee;
  latestCompensation: EmployeeCompensation | null;
  latestPerformance: EmployeePerformanceReview | null;
  emergencyContacts: EmployeeEmergencyContact[];
  summary: EmployeeSummary;
}

export interface EmployeeReview {
  id: string;
  employee_id: string;
  review_date?: string | null;
  reviewer_id?: string | null;
  rating?: number | null;
  status?: string | null;
  comments?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}