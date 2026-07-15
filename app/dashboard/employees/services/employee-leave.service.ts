import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export type LeaveRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";

export interface EmployeeLeaveRequest {
  id: string;
  company_id: string;
  employee_id: string;

  leave_type: string;
  start_date: string;
  end_date: string;

  reason: string | null;
  status: LeaveRequestStatus;

  approved_at: string | null;

  created_at: string;
  updated_at: string;
}

export interface EmployeeLeaveSummary {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  cancelledRequests: number;
  approvedDays: number;
  upcomingApprovedLeave: EmployeeLeaveRequest | null;
}

export interface EmployeeLeaveData {
  requests: EmployeeLeaveRequest[];
  summary: EmployeeLeaveSummary;
}

interface EmployeeLeaveRequestRow {
  id: string;
  company_id: string;
  employee_id: string;

  leave_type: string;
  start_date: string;
  end_date: string;

  reason: string | null;
  status: string | null;

  approved_at: string | null;

  created_at: string;
  updated_at: string;
}

function normalizeLeaveStatus(
  status: string | null | undefined,
): LeaveRequestStatus {
  switch (status?.toLowerCase()) {
    case "approved":
      return "approved";

    case "rejected":
      return "rejected";

    case "cancelled":
    case "canceled":
      return "cancelled";

    case "pending":
    default:
      return "pending";
  }
}

function calculateLeaveDays(
  startDate: string | null | undefined,
  endDate: string | null | undefined,
): number {
  if (!startDate || !endDate) {
    return 0;
  }

  const start = new Date(
    `${startDate.slice(0, 10)}T00:00:00`,
  );

  const end = new Date(
    `${endDate.slice(0, 10)}T00:00:00`,
  );

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    end < start
  ) {
    return 0;
  }

  const millisecondsPerDay = 1000 * 60 * 60 * 24;

  return (
    Math.floor(
      (end.getTime() - start.getTime()) /
        millisecondsPerDay,
    ) + 1
  );
}

function mapLeaveRequest(
  row: EmployeeLeaveRequestRow,
): EmployeeLeaveRequest {
  return {
    id: row.id,
    company_id: row.company_id,
    employee_id: row.employee_id,

    leave_type: row.leave_type,
    start_date: row.start_date,
    end_date: row.end_date,

    reason: row.reason,
    status: normalizeLeaveStatus(row.status),

    approved_at: row.approved_at,

    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function buildLeaveSummary(
  requests: EmployeeLeaveRequest[],
): EmployeeLeaveSummary {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const upcomingApprovedLeave =
    requests
      .filter((request) => {
        if (request.status !== "approved") {
          return false;
        }

        const startDate = new Date(
          `${request.start_date.slice(0, 10)}T00:00:00`,
        );

        return (
          !Number.isNaN(startDate.getTime()) &&
          startDate >= today
        );
      })
      .sort((firstRequest, secondRequest) => {
        const firstDate = new Date(
          `${firstRequest.start_date.slice(0, 10)}T00:00:00`,
        ).getTime();

        const secondDate = new Date(
          `${secondRequest.start_date.slice(0, 10)}T00:00:00`,
        ).getTime();

        return firstDate - secondDate;
      })[0] ?? null;

  return {
    totalRequests: requests.length,

    pendingRequests: requests.filter(
      (request) => request.status === "pending",
    ).length,

    approvedRequests: requests.filter(
      (request) => request.status === "approved",
    ).length,

    rejectedRequests: requests.filter(
      (request) => request.status === "rejected",
    ).length,

    cancelledRequests: requests.filter(
      (request) => request.status === "cancelled",
    ).length,

    approvedDays: requests
      .filter(
        (request) => request.status === "approved",
      )
      .reduce(
        (total, request) =>
          total +
          calculateLeaveDays(
            request.start_date,
            request.end_date,
          ),
        0,
      ),

    upcomingApprovedLeave,
  };
}

const leaveRequestSelect = `
  id,
  company_id,
  employee_id,
  leave_type,
  start_date,
  end_date,
  reason,
  status,
  approved_at,
  created_at,
  updated_at
`;

export async function getEmployeeLeaveRequests(
  employeeId: string,
): Promise<EmployeeLeaveRequest[]> {
  if (!employeeId || employeeId === "undefined") {
    return [];
  }

  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("employee_leave_requests")
    .select(leaveRequestSelect)
    .eq("employee_id", employeeId)
    .order("start_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error(
      [
        "Failed to load employee leave requests",
        `employeeId: ${employeeId}`,
        `message: ${error.message}`,
        `details: ${error.details ?? "None"}`,
        `hint: ${error.hint ?? "None"}`,
        `code: ${error.code ?? "None"}`,
      ].join(" | "),
    );

    return [];
  }

  return ((data ?? []) as EmployeeLeaveRequestRow[]).map(
    mapLeaveRequest,
  );
}

export async function getEmployeeLeaveRequest(
  employeeId: string,
  leaveRequestId: string,
): Promise<EmployeeLeaveRequest | null> {
  if (
    !employeeId ||
    employeeId === "undefined" ||
    !leaveRequestId ||
    leaveRequestId === "undefined"
  ) {
    return null;
  }

  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("employee_leave_requests")
    .select(leaveRequestSelect)
    .eq("employee_id", employeeId)
    .eq("id", leaveRequestId)
    .maybeSingle();

  if (error) {
    console.error(
      [
        "Failed to load employee leave request",
        `employeeId: ${employeeId}`,
        `leaveRequestId: ${leaveRequestId}`,
        `message: ${error.message}`,
        `details: ${error.details ?? "None"}`,
        `hint: ${error.hint ?? "None"}`,
        `code: ${error.code ?? "None"}`,
      ].join(" | "),
    );

    return null;
  }

  if (!data) {
    return null;
  }

  return mapLeaveRequest(
    data as EmployeeLeaveRequestRow,
  );
}

export async function getEmployeeLeaveSummary(
  employeeId: string,
): Promise<EmployeeLeaveSummary> {
  const requests =
    await getEmployeeLeaveRequests(employeeId);

  return buildLeaveSummary(requests);
}

export async function getEmployeeLeaveData(
  employeeId: string,
): Promise<EmployeeLeaveData> {
  const requests =
    await getEmployeeLeaveRequests(employeeId);

  return {
    requests,
    summary: buildLeaveSummary(requests),
  };
}