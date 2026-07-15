// =====================================
// Employment
// =====================================

export const EMPLOYMENT_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  TERMINATED: "terminated",
  ON_LEAVE: "on_leave",
  PENDING: "pending",
} as const;

export const EMPLOYMENT_STATUS_LABELS = {
  active: "Active",
  inactive: "Inactive",
  terminated: "Terminated",
  on_leave: "On Leave",
  pending: "Pending",
} as const;

// =====================================
// Document AI Workflow
// =====================================

export const DOCUMENT_STATUS = {
  UPLOADED: "uploaded",
  PROCESSING: "processing",
  AI_EXTRACTED: "ai_extracted",
  NEEDS_REVIEW: "needs_review",
  APPROVED: "approved",
  REJECTED: "rejected",
  FAILED: "failed",
} as const;

export const DOCUMENT_STATUS_LABELS = {
  uploaded: "Uploaded",
  processing: "Processing",
  ai_extracted: "AI Extracted",
  needs_review: "Needs Review",
  approved: "Approved",
  rejected: "Rejected",
  failed: "Failed",
} as const;

// =====================================
// Leave
// =====================================

export const LEAVE_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
} as const;

export const LEAVE_TYPES = {
  VACATION: "Vacation",
  SICK: "Sick Leave",
  PERSONAL: "Personal Leave",
  BEREAVEMENT: "Bereavement",
  JURY: "Jury Duty",
  PARENTAL: "Parental Leave",
} as const;

// =====================================
// Training
// =====================================

export const TRAINING_STATUS = {
  ASSIGNED: "assigned",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  OVERDUE: "overdue",
} as const;

// =====================================
// Assets
// =====================================

export const ASSET_STATUS = {
  ASSIGNED: "assigned",
  RETURNED: "returned",
  LOST: "lost",
  DAMAGED: "damaged",
  RETIRED: "retired",
} as const;

// =====================================
// Performance
// =====================================

export const PERFORMANCE_STATUS = {
  DRAFT: "draft",
  COMPLETED: "completed",
} as const;

export const PERFORMANCE_RATING = {
  EXCEEDS: "Exceeds Expectations",
  MEETS: "Meets Expectations",
  DEVELOPING: "Developing",
  NEEDS_IMPROVEMENT: "Needs Improvement",
} as const;

// =====================================
// Roles
// =====================================

export const USER_ROLE = {
  ADMIN: "admin",
  HR_MANAGER: "hr_manager",
  MANAGER: "manager",
  EMPLOYEE: "employee",
} as const;

// =====================================
// Default Pagination
// =====================================

export const PAGE_SIZE = 25;