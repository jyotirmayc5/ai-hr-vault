import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export type AnnualLeaveUtilizationRow = {
  employeeId: string;
  employeeName: string;
  departmentId: string | null;
  departmentName: string;
  leaveType: string;
  allocatedDays: number;
  usedDays: number;
  remainingDays: number;
  utilizationPercentage: number;
  requestCount: number;
};

export type AnnualLeaveReportFilters = {
  year: number;
  employeeId?: string;
  departmentId?: string;
  leaveType?: string;
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

type LeavePolicyRecord = {
  leave_type: string;
  annual_allocation: number | string | null;
};

type LeaveRequestRecord = {
  id: string;
  employee_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  total_days: number | string | null;
};

type AnnualUtilizationGroup = {
  employeeId: string;
  employeeName: string;
  departmentId: string | null;
  departmentName: string;
  leaveType: string;
  allocatedDays: number;
  usedDays: number;
  requestIds: Set<string>;
};

const INCLUDED_STATUSES = [
  "approved",
  "hr_approved",
  "completed",
];

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

function roundToTwoDecimals(
  value: number,
): number {
  return Number(value.toFixed(2));
}

function getEmployeeName(
  employee: EmployeeRecord,
): string {
  const fullName = [
    employee.first_name,
    employee.last_name,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || "Unnamed employee";
}

function getYearDateRange(
  year: number,
): {
  startDate: string;
  endDate: string;
} {
  return {
    startDate: `${year}-01-01`,
    endDate: `${year}-12-31`,
  };
}

function parseDateOnly(
  value: string,
): Date {
  const [year, month, day] = value
    .split("-")
    .map(Number);

  return new Date(
    Date.UTC(year, month - 1, day),
  );
}

function getInclusiveCalendarDays(
  startDate: string,
  endDate: string,
): number {
  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);

  const millisecondsPerDay =
    1000 * 60 * 60 * 24;

  const difference =
    end.getTime() - start.getTime();

  return Math.max(
    Math.floor(
      difference / millisecondsPerDay,
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
    getInclusiveCalendarDays(
      overlapStart
        .toISOString()
        .slice(0, 10),
      overlapEnd
        .toISOString()
        .slice(0, 10),
    );

  const fullRequestCalendarDays =
    getInclusiveCalendarDays(
      requestStartDate,
      requestEndDate,
    );

  if (
    storedTotalDays > 0 &&
    fullRequestCalendarDays > 0
  ) {
    return roundToTwoDecimals(
      storedTotalDays *
        (overlappingCalendarDays /
          fullRequestCalendarDays),
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

export async function getAnnualLeaveUtilization(
  companyId: string,
  filters: AnnualLeaveReportFilters,
): Promise<AnnualLeaveUtilizationRow[]> {
  const supabase =
    await createServerSupabaseClient();

  const { startDate, endDate } =
    getYearDateRange(filters.year);

  /*
   * Load employees first so the report can include
   * employees with zero leave usage.
   */
  let employeeQuery = supabase
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
    .order("first_name", {
      ascending: true,
    })
    .order("last_name", {
      ascending: true,
    });

  if (filters.employeeId) {
    employeeQuery = employeeQuery.eq(
      "id",
      filters.employeeId,
    );
  }

  const {
    data: employeeData,
    error: employeeError,
  } = await employeeQuery;

  if (employeeError) {
    logSupabaseError(
      "Failed to fetch employees for annual leave utilization:",
      employeeError,
      {
        companyId,
        filters,
      },
    );

    throw new Error(
      `Failed to load employees for the annual utilization report: ${
        employeeError.message ||
        "Unknown Supabase error"
      }`,
    );
  }

  let employees =
    (employeeData ??
      []) as unknown as EmployeeRecord[];

  /*
   * Department is a joined relation, so apply the
   * department filter after loading the employees.
   */
  if (filters.departmentId) {
    employees = employees.filter(
      (employee) => {
        const department =
          getSingleRelation(
            employee.department,
          );

        return (
          department?.id ===
          filters.departmentId
        );
      },
    );
  }

  if (employees.length === 0) {
    return [];
  }

  /*
   * Load active leave policies to determine each
   * leave type's annual allocation.
   */
  let policyQuery = supabase
    .from("leave_policies")
    .select(`
      leave_type,
      annual_allocation
    `)
    .eq("company_id", companyId)
    .eq("active", true)
    .order("leave_type", {
      ascending: true,
    });

  if (filters.leaveType) {
    policyQuery = policyQuery.eq(
      "leave_type",
      filters.leaveType,
    );
  }

  const {
    data: policyData,
    error: policyError,
  } = await policyQuery;

  if (policyError) {
    logSupabaseError(
      "Failed to fetch leave policies for annual utilization:",
      policyError,
      {
        companyId,
        filters,
      },
    );

    throw new Error(
      `Failed to load leave policies for the annual utilization report: ${
        policyError.message ||
        "Unknown Supabase error"
      }`,
    );
  }

  const policies =
    (policyData ??
      []) as LeavePolicyRecord[];

  /*
   * Build the initial employee/policy combinations.
   * This ensures zero-usage rows still appear.
   */
  const groupedRows = new Map<
    string,
    AnnualUtilizationGroup
  >();

  for (const employee of employees) {
    const department =
      getSingleRelation(
        employee.department,
      );

    const employeeName =
      getEmployeeName(employee);

    for (const policy of policies) {
      const groupKey = [
        employee.id,
        policy.leave_type,
      ].join(":");

      groupedRows.set(groupKey, {
        employeeId: employee.id,
        employeeName,
        departmentId:
          department?.id ?? null,
        departmentName:
          department?.name?.trim() ||
          "No department",
        leaveType: policy.leave_type,
        allocatedDays: toNumber(
          policy.annual_allocation,
        ),
        usedDays: 0,
        requestIds: new Set<string>(),
      });
    }
  }

  const employeeIds = employees.map(
    (employee) => employee.id,
  );

  /*
   * Load approved leave requests that overlap
   * the selected year.
   */
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
    .in("employee_id", employeeIds)
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
      "Failed to fetch leave requests for annual utilization:",
      leaveError,
      {
        companyId,
        filters,
        startDate,
        endDate,
      },
    );

    throw new Error(
      `Failed to load leave requests for the annual utilization report: ${
        leaveError.message ||
        "Unknown Supabase error"
      }`,
    );
  }

  const leaveRecords =
    (leaveData ??
      []) as LeaveRequestRecord[];

  const employeeMap = new Map<
    string,
    EmployeeRecord
  >();

  for (const employee of employees) {
    employeeMap.set(employee.id, employee);
  }

  /*
   * Add approved usage to the existing
   * employee/policy combinations.
   */
  for (const request of leaveRecords) {
    const employee = employeeMap.get(
      request.employee_id,
    );

    if (!employee) {
      continue;
    }

    const groupKey = [
      request.employee_id,
      request.leave_type,
    ].join(":");

    const daysInsideYear =
      getDaysInsideYear(
        request.start_date,
        request.end_date,
        startDate,
        endDate,
        toNumber(request.total_days),
      );

    const existingGroup =
      groupedRows.get(groupKey);

    if (existingGroup) {
      existingGroup.usedDays +=
        daysInsideYear;

      existingGroup.requestIds.add(
        request.id,
      );

      continue;
    }

    /*
     * Preserve a leave type even when no active
     * policy exists for it. Its allocation is zero.
     */
    const department =
      getSingleRelation(
        employee.department,
      );

    groupedRows.set(groupKey, {
      employeeId: employee.id,
      employeeName:
        getEmployeeName(employee),
      departmentId:
        department?.id ?? null,
      departmentName:
        department?.name?.trim() ||
        "No department",
      leaveType: request.leave_type,
      allocatedDays: 0,
      usedDays: daysInsideYear,
      requestIds: new Set([
        request.id,
      ]),
    });
  }

  return Array.from(
    groupedRows.values(),
  )
    .map((group) => {
      const allocatedDays =
        roundToTwoDecimals(
          group.allocatedDays,
        );

      const usedDays =
        roundToTwoDecimals(
          group.usedDays,
        );

      const remainingDays =
        roundToTwoDecimals(
          allocatedDays - usedDays,
        );

      const utilizationPercentage =
        allocatedDays > 0
          ? roundToTwoDecimals(
              (usedDays /
                allocatedDays) *
                100,
            )
          : 0;

      return {
        employeeId: group.employeeId,
        employeeName:
          group.employeeName,
        departmentId:
          group.departmentId,
        departmentName:
          group.departmentName,
        leaveType: group.leaveType,
        allocatedDays,
        usedDays,
        remainingDays,
        utilizationPercentage,
        requestCount:
          group.requestIds.size,
      };
    })
    .sort((firstRow, secondRow) => {
      const employeeComparison =
        firstRow.employeeName.localeCompare(
          secondRow.employeeName,
        );

      if (employeeComparison !== 0) {
        return employeeComparison;
      }

      return firstRow.leaveType.localeCompare(
        secondRow.leaveType,
      );
    });
}