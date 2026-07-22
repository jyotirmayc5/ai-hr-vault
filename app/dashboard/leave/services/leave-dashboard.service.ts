import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export type LeaveDashboardStatus =
  | "pending"
  | "manager_approved"
  | "approved"
  | "hr_approved"
  | "rejected"
  | "cancelled"
  | "completed";

export interface LeaveDashboardSummary {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  employeesOnLeave: number;
  upcomingThisWeek: number;
}

export interface LeaveStatusCount {
  status: LeaveDashboardStatus;
  label: string;
  count: number;
}

export interface LeaveTypeCount {
  leaveType: string;
  label: string;
  count: number;
  totalDays: number;
}

export interface UpcomingLeaveItem {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNumber: string | null;
  departmentId: string | null;
  departmentName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: LeaveDashboardStatus;
}

export interface EmployeeOutTodayItem {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNumber: string | null;
  departmentId: string | null;
  departmentName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: LeaveDashboardStatus;
}

export interface DepartmentLeaveItem {
  departmentId: string | null;
  departmentName: string;
  employeeCount: number;
  requestCount: number;
  totalDays: number;
}

export interface LeaveDashboardData {
  summary: LeaveDashboardSummary;
  statusCounts: LeaveStatusCount[];
  typeCounts: LeaveTypeCount[];
  upcomingLeave: UpcomingLeaveItem[];
  employeesOutToday: EmployeeOutTodayItem[];
  departmentLeave: DepartmentLeaveItem[];
}

interface ProfileDatabaseRow {
  company_id: string | null;
}

interface DepartmentDatabaseRow {
  id: string;
  name: string | null;
}

interface EmployeeDatabaseRow {
  id: string;
  employee_number: string | null;
  first_name: string | null;
  last_name: string | null;
  department:
    | DepartmentDatabaseRow
    | DepartmentDatabaseRow[]
    | null;
}

interface LeaveRequestDatabaseRow {
  id: string;
  employee_id: string;
  leave_type: string | null;
  start_date: string;
  end_date: string;
  status: string | null;
  employee:
    | EmployeeDatabaseRow
    | EmployeeDatabaseRow[]
    | null;
}

interface NormalizedLeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNumber: string | null;
  departmentId: string | null;
  departmentName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: LeaveDashboardStatus;
}

const APPROVED_STATUSES: LeaveDashboardStatus[] = [
  "manager_approved",
  "approved",
  "hr_approved",
  "completed",
];

const PENDING_STATUSES: LeaveDashboardStatus[] = [
  "pending",
];

function firstOrNull<T>(
  value: T | T[] | null | undefined,
): T | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value)
    ? value[0] ?? null
    : value;
}

function normalizeLeaveStatus(
  value: string | null | undefined,
): LeaveDashboardStatus {
  switch (value?.toLowerCase()) {
    case "pending":
      return "pending";

    case "manager_approved":
      return "manager_approved";

    case "approved":
      return "approved";

    case "hr_approved":
      return "hr_approved";

    case "rejected":
      return "rejected";

    case "cancelled":
      return "cancelled";

    case "completed":
      return "completed";

    default:
      return "pending";
  }
}

function formatLabel(
  value: string,
): string {
  return value
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase(),
    );
}

function buildEmployeeName(
  firstName: string | null,
  lastName: string | null,
): string {
  const name = [
    firstName,
    lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return name || "Unknown employee";
}

function getTodayDate(): string {
  const today = new Date();

  const year = today.getFullYear();

  const month = String(
    today.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    today.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(
  date: Date,
  days: number,
): Date {
  const result = new Date(date);

  result.setDate(
    result.getDate() + days,
  );

  return result;
}

function formatDateKey(
  date: Date,
): string {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function calculateLeaveDays(
  startDate: string,
  endDate: string,
): number {
  const start = new Date(
    `${startDate}T00:00:00`,
  );

  const end = new Date(
    `${endDate}T00:00:00`,
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

  return (
    Math.floor(
      (end.getTime() -
        start.getTime()) /
        millisecondsPerDay,
    ) + 1
  );
}

function mapLeaveRequest(
  row: LeaveRequestDatabaseRow,
): NormalizedLeaveRequest {
  const employee = firstOrNull(
    row.employee,
  );

  const department = firstOrNull(
    employee?.department,
  );

  return {
    id: row.id,
    employeeId:
      employee?.id ??
      row.employee_id,
    employeeName: buildEmployeeName(
      employee?.first_name ?? null,
      employee?.last_name ?? null,
    ),
    employeeNumber:
      employee?.employee_number ??
      null,
    departmentId:
      department?.id ?? null,
    departmentName:
      department?.name ??
      "Unassigned",
    leaveType:
      row.leave_type?.trim() ||
      "Other",
    startDate: row.start_date,
    endDate: row.end_date,
    totalDays: calculateLeaveDays(
      row.start_date,
      row.end_date,
    ),
    status: normalizeLeaveStatus(
      row.status,
    ),
  };
}

function buildSummary(
  requests: NormalizedLeaveRequest[],
): LeaveDashboardSummary {
  const today = getTodayDate();

  const weekEnd = formatDateKey(
    addDays(
      new Date(
        `${today}T00:00:00`,
      ),
      7,
    ),
  );

  const activeEmployeeIds =
    new Set(
      requests
        .filter(
          (request) =>
            APPROVED_STATUSES.includes(
              request.status,
            ) &&
            request.startDate <=
              today &&
            request.endDate >=
              today,
        )
        .map(
          (request) =>
            request.employeeId,
        ),
    );

  const upcomingThisWeekEmployeeIds =
    new Set(
      requests
        .filter(
          (request) =>
            APPROVED_STATUSES.includes(
              request.status,
            ) &&
            request.startDate >
              today &&
            request.startDate <=
              weekEnd,
        )
        .map(
          (request) =>
            request.employeeId,
        ),
    );

  return {
    totalRequests:
      requests.length,

    pendingRequests:
      requests.filter(
        (request) =>
          PENDING_STATUSES.includes(
            request.status,
          ),
      ).length,

    approvedRequests:
      requests.filter(
        (request) =>
          APPROVED_STATUSES.includes(
            request.status,
          ),
      ).length,

    rejectedRequests:
      requests.filter(
        (request) =>
          request.status ===
          "rejected",
      ).length,

    employeesOnLeave:
      activeEmployeeIds.size,

    upcomingThisWeek:
      upcomingThisWeekEmployeeIds.size,
  };
}

function buildStatusCounts(
  requests: NormalizedLeaveRequest[],
): LeaveStatusCount[] {
  const statusOrder: LeaveDashboardStatus[] =
    [
      "pending",
      "manager_approved",
      "approved",
      "hr_approved",
      "rejected",
      "cancelled",
      "completed",
    ];

  const counts = new Map<
    LeaveDashboardStatus,
    number
  >();

  for (const request of requests) {
    counts.set(
      request.status,
      (counts.get(
        request.status,
      ) ?? 0) + 1,
    );
  }

  return statusOrder.map(
    (status) => ({
      status,
      label: formatLabel(status),
      count:
        counts.get(status) ?? 0,
    }),
  );
}

function buildTypeCounts(
  requests: NormalizedLeaveRequest[],
): LeaveTypeCount[] {
  const groups = new Map<
    string,
    {
      count: number;
      totalDays: number;
    }
  >();

  for (const request of requests) {
    const current =
      groups.get(
        request.leaveType,
      ) ?? {
        count: 0,
        totalDays: 0,
      };

    current.count += 1;
    current.totalDays +=
      request.totalDays;

    groups.set(
      request.leaveType,
      current,
    );
  }

  return Array.from(
    groups.entries(),
  )
    .map(
      ([
        leaveType,
        values,
      ]) => ({
        leaveType,
        label:
          formatLabel(
            leaveType,
          ),
        count: values.count,
        totalDays:
          values.totalDays,
      }),
    )
    .sort(
      (a, b) =>
        b.count - a.count,
    );
}

function buildUpcomingLeave(
  requests: NormalizedLeaveRequest[],
): UpcomingLeaveItem[] {
  const today = getTodayDate();

  return requests
    .filter(
      (request) =>
        request.startDate >=
          today &&
        APPROVED_STATUSES.includes(
          request.status,
        ),
    )
    .sort((a, b) => {
      const startDateComparison =
        a.startDate.localeCompare(
          b.startDate,
        );

      if (
        startDateComparison !== 0
      ) {
        return startDateComparison;
      }

      return a.employeeName.localeCompare(
        b.employeeName,
      );
    })
    .slice(0, 20)
    .map((request) => ({
      id: request.id,
      employeeId:
        request.employeeId,
      employeeName:
        request.employeeName,
      employeeNumber:
        request.employeeNumber,
      departmentId:
        request.departmentId,
      departmentName:
        request.departmentName,
      leaveType:
        request.leaveType,
      startDate:
        request.startDate,
      endDate:
        request.endDate,
      totalDays:
        request.totalDays,
      status:
        request.status,
    }));
}

function buildEmployeesOutToday(
  requests: NormalizedLeaveRequest[],
): EmployeeOutTodayItem[] {
  const today = getTodayDate();

  return requests
    .filter(
      (request) =>
        APPROVED_STATUSES.includes(
          request.status,
        ) &&
        request.startDate <=
          today &&
        request.endDate >=
          today,
    )
    .sort((a, b) => {
      const departmentComparison =
        a.departmentName.localeCompare(
          b.departmentName,
        );

      if (
        departmentComparison !== 0
      ) {
        return departmentComparison;
      }

      return a.employeeName.localeCompare(
        b.employeeName,
      );
    })
    .map((request) => ({
      id: request.id,
      employeeId:
        request.employeeId,
      employeeName:
        request.employeeName,
      employeeNumber:
        request.employeeNumber,
      departmentId:
        request.departmentId,
      departmentName:
        request.departmentName,
      leaveType:
        request.leaveType,
      startDate:
        request.startDate,
      endDate:
        request.endDate,
      totalDays:
        request.totalDays,
      status:
        request.status,
    }));
}

function buildDepartmentLeave(
  requests: NormalizedLeaveRequest[],
): DepartmentLeaveItem[] {
  const groups = new Map<
    string,
    {
      departmentId:
        | string
        | null;
      departmentName: string;
      employeeIds: Set<string>;
      requestCount: number;
      totalDays: number;
    }
  >();

  for (const request of requests) {
    if (
      !APPROVED_STATUSES.includes(
        request.status,
      )
    ) {
      continue;
    }

    const key =
      request.departmentId ??
      "unassigned";

    const current =
      groups.get(key) ?? {
        departmentId:
          request.departmentId,
        departmentName:
          request.departmentName,
        employeeIds:
          new Set<string>(),
        requestCount: 0,
        totalDays: 0,
      };

    current.employeeIds.add(
      request.employeeId,
    );

    current.requestCount += 1;

    current.totalDays +=
      request.totalDays;

    groups.set(key, current);
  }

  return Array.from(
    groups.values(),
  )
    .map((group) => ({
      departmentId:
        group.departmentId,
      departmentName:
        group.departmentName,
      employeeCount:
        group.employeeIds.size,
      requestCount:
        group.requestCount,
      totalDays:
        group.totalDays,
    }))
    .sort(
      (a, b) =>
        b.totalDays -
        a.totalDays,
    );
}

function emptyDashboardData(): LeaveDashboardData {
  return {
    summary: {
      totalRequests: 0,
      pendingRequests: 0,
      approvedRequests: 0,
      rejectedRequests: 0,
      employeesOnLeave: 0,
      upcomingThisWeek: 0,
    },
    statusCounts: [],
    typeCounts: [],
    upcomingLeave: [],
    employeesOutToday: [],
    departmentLeave: [],
  };
}

export async function getLeaveDashboard(): Promise<LeaveDashboardData> {
  const supabase =
    await createServerSupabaseClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error(
      "Unable to load leave dashboard because the user is not authenticated.",
      authError,
    );

    return emptyDashboardData();
  }

  const {
    data: profileData,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error(
      [
        "Failed to load leave dashboard profile",
        `message: ${profileError.message}`,
        `details: ${profileError.details ?? "None"}`,
        `hint: ${profileError.hint ?? "None"}`,
        `code: ${profileError.code ?? "None"}`,
      ].join(" | "),
    );

    return emptyDashboardData();
  }

  const profile =
    profileData as ProfileDatabaseRow | null;

  if (!profile?.company_id) {
    console.error(
      "Unable to load leave dashboard because the user profile has no company ID.",
    );

    return emptyDashboardData();
  }

  const { data, error } =
    await supabase
      .from(
        "employee_leave_requests",
      )
      .select(`
        id,
        employee_id,
        leave_type,
        start_date,
        end_date,
        status,
        employee:employees!employee_leave_requests_employee_id_fkey (
          id,
          employee_number,
          first_name,
          last_name,
          department:departments!employees_department_id_fkey (
            id,
            name
          )
        )
      `)
      .eq(
        "company_id",
        profile.company_id,
      )
      .order("start_date", {
        ascending: false,
      });

  if (error) {
    console.error(
      [
        "Failed to load leave dashboard",
        `message: ${error.message}`,
        `details: ${error.details ?? "None"}`,
        `hint: ${error.hint ?? "None"}`,
        `code: ${error.code ?? "None"}`,
      ].join(" | "),
    );

    return emptyDashboardData();
  }

  const rows =
    (data ??
      []) as unknown as LeaveRequestDatabaseRow[];

  const requests =
    rows.map(mapLeaveRequest);

  return {
    summary:
      buildSummary(requests),

    statusCounts:
      buildStatusCounts(
        requests,
      ),

    typeCounts:
      buildTypeCounts(requests),

    upcomingLeave:
      buildUpcomingLeave(
        requests,
      ),

    employeesOutToday:
      buildEmployeesOutToday(
        requests,
      ),

    departmentLeave:
      buildDepartmentLeave(
        requests,
      ),
  };
}