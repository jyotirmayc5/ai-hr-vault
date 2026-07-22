import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export type LeaveRequestStatus =
  | "pending"
  | "approved"
  | "manager_approved"
  | "hr_approved"
  | "completed"
  | "rejected"
  | "cancelled";

export type LeaveType = string;

export interface EmployeeLeaveRequest {
  id: string;
  company_id: string | null;
  employee_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  status: LeaveRequestStatus;

  approved_by: string | null;
  approved_at: string | null;

  manager_approved_by: string | null;
  manager_approved_at: string | null;

  hr_approved_by: string | null;
  hr_approved_at: string | null;

  rejected_by: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;

  completed_by: string | null;
  completed_at: string | null;

  created_at: string;
  updated_at: string | null;
  total_days: number;
}

export interface EmployeeLeaveSummary {
  totalRequests: number;
  pending: number;
  approved: number;
  upcoming: number;
  rejected: number;
  daysUsed: number;
}

export interface EmployeeLeaveBalance {
  leaveType: string;
  label: string;
  allocated: number;
  used: number;
  pending: number;
  remaining: number;
}

export interface CompanyLeavePolicy {
  id: string;
  companyId: string;
  leaveType: string;
  label: string;
  annualAllocation: number;
  carryOverAllowed: boolean;
  maxCarryOver: number | null;
  maxAccrual: number | null;
  accrualMethod: string;
  waitingPeriodDays: number;
  allowHalfDay: boolean;
  requiresManagerApproval: boolean;
  requiresHrApproval: boolean;
  active: boolean;
}

export interface EmployeeLeaveCalendarEvent {
  id: string;
  employeeId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: LeaveRequestStatus;
  reason: string | null;
  totalDays: number;
}

/**
 * Compatibility export used by leave-calendar.tsx.
 */
export type LeaveCalendarEvent =
  EmployeeLeaveCalendarEvent;

export interface EmployeeLeaveData {
  requests: EmployeeLeaveRequest[];
  summary: EmployeeLeaveSummary;
  balances: EmployeeLeaveBalance[];
  policies: CompanyLeavePolicy[];
}

interface LeaveRequestRow {
  id: string;
  company_id: string | null;
  employee_id: string;
  leave_type: string | null;
  start_date: string;
  end_date: string;
  reason: string | null;
  status: string | null;

  approved_by: string | null;
  approved_at: string | null;

  manager_approved_by: string | null;
  manager_approved_at: string | null;

  hr_approved_by: string | null;
  hr_approved_at: string | null;

  rejected_by: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;

  completed_by: string | null;
  completed_at: string | null;

  created_at: string;
  updated_at: string | null;
}

interface LeavePolicyRow {
  id: string;
  company_id: string;
  leave_type: string;
  annual_allocation: number | string | null;
  carry_over_allowed: boolean | null;
  max_carry_over: number | string | null;
  max_accrual: number | string | null;
  accrual_method: string | null;
  waiting_period_days: number | string | null;
  allow_half_day: boolean | null;
  requires_manager_approval: boolean | null;
  requires_hr_approval: boolean | null;
  active: boolean | null;
}

const APPROVED_LEAVE_STATUSES: LeaveRequestStatus[] = [
  "manager_approved",
  "approved",
  "hr_approved",
  "completed",
];

function normalizeNumber(
  value: number | string | null | undefined,
): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const parsedValue = Number(value);

    return Number.isFinite(parsedValue)
      ? parsedValue
      : 0;
  }

  return 0;
}

function normalizeNullableNumber(
  value: number | string | null | undefined,
): number | null {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue)
    ? parsedValue
    : null;
}

function normalizeLeaveStatus(
  status: string | null | undefined,
): LeaveRequestStatus {
  const normalizedStatus = status
    ?.trim()
    .toLowerCase();

  switch (normalizedStatus) {
    case "manager_approved":
      return "manager_approved";

    case "approved":
      return "approved";

    case "hr_approved":
      return "hr_approved";

    case "completed":
      return "completed";

    case "rejected":
      return "rejected";

    case "cancelled":
      return "cancelled";

    case "pending":
    default:
      return "pending";
  }
}

function normalizeLeaveType(
  leaveType: string | null | undefined,
): string {
  const normalizedValue = leaveType
    ?.trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

  switch (normalizedValue) {
    case "annual":
    case "annual_leave":
    case "pto":
    case "paid_time_off":
      return "vacation";

    case "sick_leave":
      return "sick";

    case "personal_leave":
      return "personal";

    default:
      return normalizedValue || "other";
  }
}

function formatLeaveTypeLabel(
  leaveType: string,
): string {
  return leaveType
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function mapLeavePolicy(
  row: LeavePolicyRow,
): CompanyLeavePolicy | null {
  const leaveType = normalizeLeaveType(
    row.leave_type,
  );

  if (!leaveType || leaveType === "other") {
    return null;
  }

  return {
    id: row.id,
    companyId: row.company_id,
    leaveType,
    label: formatLeaveTypeLabel(leaveType),
    annualAllocation: normalizeNumber(
      row.annual_allocation,
    ),
    carryOverAllowed:
      row.carry_over_allowed ?? false,
    maxCarryOver: normalizeNullableNumber(
      row.max_carry_over,
    ),
    maxAccrual: normalizeNullableNumber(
      row.max_accrual,
    ),
    accrualMethod:
      row.accrual_method?.trim() || "annual",
    waitingPeriodDays: normalizeNumber(
      row.waiting_period_days,
    ),
    allowHalfDay: row.allow_half_day ?? true,
    requiresManagerApproval:
      row.requires_manager_approval ?? true,
    requiresHrApproval:
      row.requires_hr_approval ?? false,
    active: row.active ?? true,
  };
}

function isApprovedStatus(
  status: LeaveRequestStatus,
): boolean {
  return APPROVED_LEAVE_STATUSES.includes(
    status,
  );
}

/**
 * Calculates calendar days including both dates.
 *
 * Example:
 * July 1 through July 3 = 3 days.
 */
function calculateLeaveDays(
  startDate: string,
  endDate: string,
): number {
  const start = new Date(
    `${startDate}T00:00:00Z`,
  );

  const end = new Date(
    `${endDate}T00:00:00Z`,
  );

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    end < start
  ) {
    return 0;
  }

  const millisecondsPerDay =
    1000 * 60 * 60 * 24;

  const difference =
    end.getTime() - start.getTime();

  return (
    Math.floor(
      difference / millisecondsPerDay,
    ) + 1
  );
}

/**
 * Calculates the portion of a leave request that
 * falls within the selected calendar year.
 */
function calculateLeaveDaysForYear(
  startDate: string,
  endDate: string,
  year: number,
): number {
  const requestStart = new Date(
    `${startDate}T00:00:00Z`,
  );

  const requestEnd = new Date(
    `${endDate}T00:00:00Z`,
  );

  if (
    Number.isNaN(requestStart.getTime()) ||
    Number.isNaN(requestEnd.getTime()) ||
    requestEnd < requestStart
  ) {
    return 0;
  }

  const yearStart = new Date(
    Date.UTC(year, 0, 1),
  );

  const yearEnd = new Date(
    Date.UTC(year, 11, 31),
  );

  const overlapStart =
    requestStart > yearStart
      ? requestStart
      : yearStart;

  const overlapEnd =
    requestEnd < yearEnd
      ? requestEnd
      : yearEnd;

  if (overlapEnd < overlapStart) {
    return 0;
  }

  const millisecondsPerDay =
    1000 * 60 * 60 * 24;

  return (
    Math.floor(
      (overlapEnd.getTime() -
        overlapStart.getTime()) /
        millisecondsPerDay,
    ) + 1
  );
}

function mapLeaveRequest(
  row: LeaveRequestRow,
): EmployeeLeaveRequest {
  return {
    id: row.id,
    company_id: row.company_id,
    employee_id: row.employee_id,

    leave_type: normalizeLeaveType(
      row.leave_type,
    ),

    start_date: row.start_date,
    end_date: row.end_date,

    reason: row.reason,
    status: normalizeLeaveStatus(row.status),

    approved_by: row.approved_by,
    approved_at: row.approved_at,

    manager_approved_by:
      row.manager_approved_by,
    manager_approved_at:
      row.manager_approved_at,

    hr_approved_by:
      row.hr_approved_by,
    hr_approved_at:
      row.hr_approved_at,

    rejected_by: row.rejected_by,
    rejected_at: row.rejected_at,
    rejection_reason: row.rejection_reason,

    completed_by: row.completed_by,
    completed_at: row.completed_at,

    created_at: row.created_at,
    updated_at: row.updated_at,

    total_days: calculateLeaveDays(
      row.start_date,
      row.end_date,
    ),
  };
}

function mapCalendarEvent(
  request: EmployeeLeaveRequest,
): EmployeeLeaveCalendarEvent {
  return {
    id: request.id,
    employeeId: request.employee_id,
    leaveType: request.leave_type,
    startDate: request.start_date,
    endDate: request.end_date,
    status: request.status,
    reason: request.reason,
    totalDays: request.total_days,
  };
}

function buildLeaveSummary(
  requests: EmployeeLeaveRequest[],
): EmployeeLeaveSummary {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return requests.reduce<EmployeeLeaveSummary>(
    (summary, request) => {
      summary.totalRequests += 1;

      if (request.status === "pending") {
        summary.pending += 1;
      }

      if (isApprovedStatus(request.status)) {
        summary.approved += 1;
        summary.daysUsed += request.total_days;

        const startDate = new Date(
          `${request.start_date}T00:00:00`,
        );

        if (
          !Number.isNaN(startDate.getTime()) &&
          startDate.getTime() >=
            today.getTime()
        ) {
          summary.upcoming += 1;
        }
      }

      if (request.status === "rejected") {
        summary.rejected += 1;
      }

      return summary;
    },
    {
      totalRequests: 0,
      pending: 0,
      approved: 0,
      upcoming: 0,
      rejected: 0,
      daysUsed: 0,
    },
  );
}

function buildLeaveBalances(
  requests: EmployeeLeaveRequest[],
  policies: CompanyLeavePolicy[],
  year = new Date().getFullYear(),
): EmployeeLeaveBalance[] {
  const usedDays: Record<string, number> = {};
  const pendingDays: Record<string, number> =
    {};

  for (const request of requests) {
    const leaveType = normalizeLeaveType(
      request.leave_type,
    );

    const daysForYear =
      calculateLeaveDaysForYear(
        request.start_date,
        request.end_date,
        year,
      );

    if (daysForYear <= 0) {
      continue;
    }

    if (request.status === "pending") {
      pendingDays[leaveType] =
        (pendingDays[leaveType] ?? 0) +
        daysForYear;

      continue;
    }

    if (isApprovedStatus(request.status)) {
      usedDays[leaveType] =
        (usedDays[leaveType] ?? 0) +
        daysForYear;
    }
  }

  return policies.map((policy) => {
    const used =
      usedDays[policy.leaveType] ?? 0;

    const pending =
      pendingDays[policy.leaveType] ?? 0;

    const allocated =
      policy.annualAllocation;

    return {
      leaveType: policy.leaveType,
      label: policy.label,
      allocated,
      used,
      pending,
      remaining: Math.max(
        allocated - used,
        0,
      ),
    };
  });
}

function logLeaveServiceError(
  label: string,
  error: {
    message?: string;
    details?: string | null;
    hint?: string | null;
    code?: string;
  } | null,
  context?: Record<string, unknown>,
): void {
  console.error(label, {
    ...context,
    message:
      error?.message ??
      "Unknown Supabase error",
    details: error?.details ?? null,
    hint: error?.hint ?? null,
    code: error?.code ?? null,
  });
}

export async function getCompanyLeavePolicies(
  companyId: string,
): Promise<CompanyLeavePolicy[]> {
  if (
    !companyId ||
    companyId === "undefined"
  ) {
    return [];
  }

  const supabase =
    await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("leave_policies")
    .select(`
      id,
      company_id,
      leave_type,
      annual_allocation,
      carry_over_allowed,
      max_carry_over,
      max_accrual,
      accrual_method,
      waiting_period_days,
      allow_half_day,
      requires_manager_approval,
      requires_hr_approval,
      active
    `)
    .eq("company_id", companyId)
    .eq("active", true)
    .order("leave_type", {
      ascending: true,
    });

  if (error) {
    logLeaveServiceError(
      "Failed to fetch company leave policies",
      error,
      {
        companyId,
      },
    );

    return [];
  }

  return ((data ?? []) as LeavePolicyRow[])
    .map(mapLeavePolicy)
    .filter(
      (
        policy,
      ): policy is CompanyLeavePolicy =>
        policy !== null,
    );
}

export async function getEmployeeLeaveRequests(
  employeeId: string,
): Promise<EmployeeLeaveRequest[]> {
  if (
    !employeeId ||
    employeeId === "undefined"
  ) {
    return [];
  }

  const supabase =
    await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("employee_leave_requests")
    .select(`
      id,
      company_id,
      employee_id,
      leave_type,
      start_date,
      end_date,
      reason,
      status,
      approved_by,
      approved_at,
      manager_approved_by,
      manager_approved_at,
      hr_approved_by,
      hr_approved_at,
      rejected_by,
      rejected_at,
      rejection_reason,
      completed_by,
      completed_at,
      created_at,
      updated_at
    `)
    .eq("employee_id", employeeId)
    .order("start_date", {
      ascending: false,
    })
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    logLeaveServiceError(
      "Failed to fetch employee leave requests",
      error,
      {
        employeeId,
      },
    );

    return [];
  }

  return (
    (data ?? []) as LeaveRequestRow[]
  ).map(mapLeaveRequest);
}

export async function getEmployeeLeaveRequest(
  requestId: string,
): Promise<EmployeeLeaveRequest | null> {
  if (
    !requestId ||
    requestId === "undefined"
  ) {
    return null;
  }

  const supabase =
    await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("employee_leave_requests")
    .select(`
      id,
      company_id,
      employee_id,
      leave_type,
      start_date,
      end_date,
      reason,
      status,
      approved_by,
      approved_at,
      manager_approved_by,
      manager_approved_at,
      hr_approved_by,
      hr_approved_at,
      rejected_by,
      rejected_at,
      rejection_reason,
      completed_by,
      completed_at,
      created_at,
      updated_at
    `)
    .eq("id", requestId)
    .maybeSingle();

  if (error) {
    logLeaveServiceError(
      "Failed to fetch employee leave request",
      error,
      {
        requestId,
      },
    );

    return null;
  }

  if (!data) {
    return null;
  }

  return mapLeaveRequest(
    data as LeaveRequestRow,
  );
}

/**
 * Returns events for the employee leave calendar.
 */
export async function getEmployeeLeaveCalendarEvents(
  employeeId: string,
): Promise<EmployeeLeaveCalendarEvent[]> {
  const requests =
    await getEmployeeLeaveRequests(
      employeeId,
    );

  return requests.map(mapCalendarEvent);
}

/**
 * Returns requests, summary, dynamic policy balances,
 * and active company leave policies.
 */
export async function getEmployeeLeaveData(
  employeeId: string,
  companyId: string,
): Promise<EmployeeLeaveData> {
  if (
    !employeeId ||
    employeeId === "undefined"
  ) {
    return {
      requests: [],
      summary: buildLeaveSummary([]),
      balances: [],
      policies: [],
    };
  }

  if (
    !companyId ||
    companyId === "undefined"
  ) {
    const requests =
      await getEmployeeLeaveRequests(
        employeeId,
      );

    return {
      requests,
      summary: buildLeaveSummary(requests),
      balances: [],
      policies: [],
    };
  }

  const [requests, policies] =
    await Promise.all([
      getEmployeeLeaveRequests(employeeId),
      getCompanyLeavePolicies(companyId),
    ]);

  return {
    requests,
    summary: buildLeaveSummary(requests),
    balances: buildLeaveBalances(
      requests,
      policies,
    ),
    policies,
  };
}