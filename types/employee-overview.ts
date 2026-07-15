export type EmployeeOverviewEventType =
  | "birthday"
  | "work_anniversary"
  | "document_expiration"
  | "training_expiration";

export interface EmployeeOverviewEmployment {
  employeeId: string;
  employeeNumber: string | null;

  firstName: string;
  lastName: string;
  workEmail: string | null;
  phone: string | null;

  jobTitle: string | null;
  employmentType: string | null;
  employmentStatus: string | null;

  departmentName: string | null;
  locationName: string | null;
  managerName: string | null;

  startDate: string | null;
  terminationDate: string | null;
}

export interface EmployeeOverviewCompensation {
  id: string;
  employeeId: string;

  payType: string | null;
  payFrequency: string | null;

  annualSalary: number | null;
  hourlyRate: number | null;

  bonusEligible: boolean;
  bonusTargetPercent: number | null;

  effectiveStartDate: string | null;
  effectiveEndDate: string | null;

  createdAt: string | null;
  updatedAt: string | null;
}

export interface EmployeeOverviewLeave {
  ptoHours: number;
  sickHours: number;
  otherLeaveHours: number;

  pendingRequests: number;
  approvedRequests: number;
}

export interface EmployeeOverviewDocuments {
  totalDocuments: number;
  pendingReview: number;
  approvedDocuments: number;
  expiringSoon: number;
}

export interface EmployeeOverviewAsset {
  id: string;
  employeeId: string;

  assetName: string;
  assetType: string | null;

  serialNumber: string | null;
  assetTag: string | null;

  assignedDate: string | null;
  returnDate: string | null;

  status: string | null;
}

export interface EmployeeOverviewEmergencyContact {
  id: string;
  employeeId: string;

  firstName: string;
  lastName: string;

  relationship: string;
  phone: string;

  email: string | null;
  address: string | null;

  isPrimary: boolean;
}

export interface EmployeeOverviewEvent {
  id: string;
  type: EmployeeOverviewEventType;

  title: string;
  description: string | null;

  eventDate: string;
}

export interface EmployeeOverviewActivity {
  id: string;
  employeeId: string;

  action: string;
  description: string | null;

  performedBy: string | null;
  createdAt: string;
}

export interface EmployeeOverviewData {
  employment: EmployeeOverviewEmployment;

  compensation: EmployeeOverviewCompensation | null;

  leave: EmployeeOverviewLeave;

  documents: EmployeeOverviewDocuments;

  assets: EmployeeOverviewAsset[];

  emergencyContact: EmployeeOverviewEmergencyContact | null;

  upcomingEvents: EmployeeOverviewEvent[];

  recentActivity: EmployeeOverviewActivity[];
}