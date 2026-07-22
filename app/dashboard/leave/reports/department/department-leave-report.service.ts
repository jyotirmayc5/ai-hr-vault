import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export type DepartmentLeaveReportRow = {
  departmentId: string | null;
  departmentName: string;
  leaveType: string;
  employeeCount: number;
  requestCount: number;
  totalDays: number;
};

export type DepartmentLeaveReportFilters = {
  year: number;
  departmentId?: string;
  leaveType?: string;
};

type LeaveRequestRecord = {
  id: string;
  employee_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  total_days: number | string | null;
};

type DepartmentRelation =
  | {
      id: string;
      name: string | null;
    }
  | {
      id: string;
      name: string | null;
    }[]
  | null;

type EmployeeRecord = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  department: DepartmentRelation;
};

type DepartmentReportGroup = {
  departmentId: string | null;
  departmentName: string;
  leaveType: string;
  employeeIds: Set<string>;
  requestIds: Set<string>;
  totalDays: number;
};

const INCLUDED_STATUSES = [
  "approved",
  "hr_approved",
  "completed",
];

function getYearDateRange(
  year: number,
): {
  startDate: string;
  endDate: string;
} {
  const startDate = new Date(
    Date.UTC(year, 0, 1),
  );

  const endDate = new Date(
    Date.UTC(year, 11, 31),
  );

  return {
    startDate: startDate
      .toISOString()
      .slice(0, 10),
    endDate: endDate
      .toISOString()
      .slice(0, 10),
  };
}

function getSingleRelation<T>(
  value: T | T[] | null | undefined,
): T | null {
  if (!value) {
    return null;
  }

  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

function toNumber(
  value: number | string | null | undefined,
): number {
  if (typeof value === "number") {
    return Number.isFinite(value)
      ? value
      : 0;
  }

  if (typeof value === "string") {
    const parsedValue = Number(value);

    return Number.isFinite(parsedValue)
      ? parsedValue
      : 0;
  }

  return 0;
}

function parseDateOnly(value: string): Date {
  const [year, month, day] = value
    .split("-")
    .map(Number);

  return new Date(
    Date.UTC(year, month - 1, day),
  );
}

function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getInclusiveDaysBetween(
  startDate: string,
  endDate: string,
): number {
  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);

  const difference =
    end.getTime() - start.getTime();

  return Math.max(
    Math.floor(
      difference /
        (1000 * 60 * 60 * 24),
    ) + 1,
    0,
  );
}

function getDaysInsideYear(
  requestStartDate: string,
  requestEndDate: string,
  yearStartDate: string,
  yearEndDate: string,
  storedTotalDays: number,
): number {
  const requestStart = parseDateOnly(
    requestStartDate,
  );

  const requestEnd = parseDateOnly(
    requestEndDate,
  );

  const yearStart = parseDateOnly(
    yearStartDate,
  );

  const yearEnd = parseDateOnly(
    yearEndDate,
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

  const overlappingCalendarDays =
    getInclusiveDaysBetween(
      formatDateOnly(overlapStart),
      formatDateOnly(overlapEnd),
    );

  const fullRequestCalendarDays =
    getInclusiveDaysBetween(
      requestStartDate,
      requestEndDate,
    );

  if (
    storedTotalDays > 0 &&
    fullRequestCalendarDays > 0
  ) {
    const proratedDays =
      storedTotalDays *
      (overlappingCalendarDays /
        fullRequestCalendarDays);

    return Number(
      proratedDays.toFixed(2),
    );
  }

  return overlappingCalendarDays;
}

function logSupabaseError(
  label: string,
  error: {
    message?: string;
    details?: string;
    hint?: string;
    code?: string;
  },
  context?: Record<string, unknown>,
): void {
  console.error(
    label,
    JSON.stringify(
      {
        ...context,
        message:
          error.message ??
          "Unknown Supabase error",
        details: error.details ?? null,
        hint: error.hint ?? null,
        code: error.code ?? null,
      },
      null,
      2,
    ),
  );
}

export async function getDepartmentLeaveReport(
  companyId: string,
  filters: DepartmentLeaveReportFilters,
): Promise<DepartmentLeaveReportRow[]> {
  const supabase =
    await createServerSupabaseClient();

  const { startDate, endDate } =
    getYearDateRange(filters.year);

  let leaveQuery = supabase
    .from("employee_leave_requests")
    .select(`
      id,
      employee_id,
      leave_type,
      start_date,
      end_date,
      total_days
    `)
    .eq("company_id", companyId)
    .in("status", INCLUDED_STATUSES)
    .lte("start_date", endDate)
    .gte("end_date", startDate)
    .order("start_date", {
      ascending: true,
    });

  if (filters.leaveType) {
    leaveQuery = leaveQuery.eq(
      "leave_type",
      filters.leaveType,
    );
  }

  const {
    data: leaveData,
    error: leaveError,
  } = await leaveQuery;

  if (leaveError) {
    logSupabaseError(
      "Failed to fetch department leave requests:",
      leaveError,
      {
        companyId,
        filters,
        startDate,
        endDate,
      },
    );

    throw new Error(
      `Failed to load department leave requests: ${
        leaveError.message ||
        "Unknown Supabase error"
      }`,
    );
  }

  const leaveRecords =
    (leaveData ??
      []) as LeaveRequestRecord[];

  if (leaveRecords.length === 0) {
    return [];
  }

  const employeeIds = Array.from(
    new Set(
      leaveRecords.map(
        (record) => record.employee_id,
      ),
    ),
  );

  const {
    data: employeeData,
    error: employeeError,
  } = await supabase
    .from("employees")
    .select(`
      id,
      first_name,
      last_name,
      department:departments!employees_department_id_fkey (
        id,
        name
      )
    `)
    .eq("company_id", companyId)
    .in("id", employeeIds);

  if (employeeError) {
    logSupabaseError(
      "Failed to fetch employees for department leave report:",
      employeeError,
      {
        companyId,
        employeeIds,
      },
    );

    throw new Error(
      `Failed to load employees for the department report: ${
        employeeError.message ||
        "Unknown Supabase error"
      }`,
    );
  }

  const employees =
    (employeeData ??
      []) as unknown as EmployeeRecord[];

  const employeeMap = new Map<
    string,
    EmployeeRecord
  >();

  for (const employee of employees) {
    employeeMap.set(employee.id, employee);
  }

  const groupedRows = new Map<
    string,
    DepartmentReportGroup
  >();

  for (const record of leaveRecords) {
    const employee = employeeMap.get(
      record.employee_id,
    );

    if (!employee) {
      continue;
    }

    const department = getSingleRelation(
      employee.department,
    );

    if (
    filters.departmentId &&
    department?.name !==
        filters.departmentId
    ) {
    continue;
    }

    const departmentId =
      department?.id ?? null;

    const departmentName =
      department?.name?.trim() ||
      "No department";

    const groupKey = [
      departmentId ?? "no-department",
      record.leave_type,
    ].join(":");

    const daysInsideYear =
      getDaysInsideYear(
        record.start_date,
        record.end_date,
        startDate,
        endDate,
        toNumber(record.total_days),
      );

    const existingGroup =
      groupedRows.get(groupKey);

    if (existingGroup) {
      existingGroup.employeeIds.add(
        record.employee_id,
      );

      existingGroup.requestIds.add(
        record.id,
      );

      existingGroup.totalDays +=
        daysInsideYear;

      continue;
    }

    groupedRows.set(groupKey, {
      departmentId,
      departmentName,
      leaveType: record.leave_type,
      employeeIds: new Set([
        record.employee_id,
      ]),
      requestIds: new Set([
        record.id,
      ]),
      totalDays: daysInsideYear,
    });
  }

  return Array.from(
    groupedRows.values(),
  )
    .map((group) => ({
      departmentId:
        group.departmentId,
      departmentName:
        group.departmentName,
      leaveType: group.leaveType,
      employeeCount:
        group.employeeIds.size,
      requestCount:
        group.requestIds.size,
      totalDays: Number(
        group.totalDays.toFixed(2),
      ),
    }))
    .sort(
      (firstRow, secondRow) => {
        const departmentComparison =
          firstRow.departmentName.localeCompare(
            secondRow.departmentName,
          );

        if (
          departmentComparison !== 0
        ) {
          return departmentComparison;
        }

        return firstRow.leaveType.localeCompare(
          secondRow.leaveType,
        );
      },
    );
}