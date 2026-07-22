import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export type LeaveLiabilityReportFilters = {
  year: number;
  employeeId?: string;
  departmentId?: string;
  leaveType?: string;
};

export type LeaveLiabilityReportRow = {
  employeeId: string;
  employeeNumber: string | null;
  employeeName: string;
  departmentId: string | null;
  departmentName: string | null;
  leaveType: string;

  allocatedDays: number;
  usedDays: number;
  unusedDays: number;

  payType: "salary" | "hourly" | null;
  annualSalary: number | null;
  hourlyRate: number | null;
  dailyRate: number;

  estimatedLiability: number;
};

export type DepartmentLeaveLiabilityRow = {
  departmentId: string | null;
  departmentName: string;
  employeeCount: number;
  unusedDays: number;
  estimatedLiability: number;
};

export type LeaveLiabilitySummary = {
  employeeCount: number;
  allocatedDays: number;
  usedDays: number;
  unusedDays: number;
  averageUnusedDays: number;
  estimatedLiability: number;
};

export type LeaveLiabilityReport = {
  rows: LeaveLiabilityReportRow[];
  departments: DepartmentLeaveLiabilityRow[];
  summary: LeaveLiabilitySummary;
};

type EmployeeRecord = {
  id: string;
  employee_number: string | null;
  first_name: string | null;
  last_name: string | null;
  department_id: string | null;
  department:
    | {
        id: string;
        name: string | null;
      }
    | {
        id: string;
        name: string | null;
      }[]
    | null;
};

type LeavePolicyRecord = {
  leave_type: string;
  annual_allocation: number | string | null;
};

type LeaveRequestRecord = {
  employee_id: string;
  leave_type: string;
  total_days: number | string | null;
  status: string;
  start_date: string;
  end_date: string;
};

type CompensationRecord = {
  employee_id: string;
  pay_type: string | null;
  annual_salary: number | string | null;
  hourly_rate: number | string | null;
  effective_date: string;
};

type NormalizedCompensation = {
  payType: "salary" | "hourly" | null;
  annualSalary: number | null;
  hourlyRate: number | null;
  dailyRate: number;
};

const APPROVED_LEAVE_STATUSES = new Set([
  "manager_approved",
  "approved",
  "hr_approved",
  "completed",
]);

const DEFAULT_WORKING_DAYS_PER_YEAR = 260;
const DEFAULT_WORKING_HOURS_PER_DAY = 8;

function toNumber(
  value: number | string | null | undefined,
): number {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return 0;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

function roundToTwoDecimals(
  value: number,
): number {
  return Math.round(
    (value + Number.EPSILON) * 100,
  ) / 100;
}

function getEmployeeName(
  employee: EmployeeRecord,
): string {
  const name = [
    employee.first_name,
    employee.last_name,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return name || "Unnamed employee";
}

function getDepartment(
  employee: EmployeeRecord,
): {
  id: string | null;
  name: string | null;
} {
  const relation = Array.isArray(
    employee.department,
  )
    ? employee.department[0] ?? null
    : employee.department;

  return {
    id:
      relation?.id ??
      employee.department_id ??
      null,
    name: relation?.name ?? null,
  };
}

function normalizePayType(
  value: string | null,
): "salary" | "hourly" | null {
  if (value === "salary") {
    return "salary";
  }

  if (value === "hourly") {
    return "hourly";
  }

  return null;
}

function calculateDailyRate(
  payType: "salary" | "hourly" | null,
  annualSalary: number | null,
  hourlyRate: number | null,
): number {
  if (
    payType === "salary" &&
    annualSalary !== null
  ) {
    return roundToTwoDecimals(
      annualSalary /
        DEFAULT_WORKING_DAYS_PER_YEAR,
    );
  }

  if (
    payType === "hourly" &&
    hourlyRate !== null
  ) {
    return roundToTwoDecimals(
      hourlyRate *
        DEFAULT_WORKING_HOURS_PER_DAY,
    );
  }

  return 0;
}

function normalizeCompensation(
  compensation:
    | CompensationRecord
    | undefined,
): NormalizedCompensation {
  if (!compensation) {
    return {
      payType: null,
      annualSalary: null,
      hourlyRate: null,
      dailyRate: 0,
    };
  }

  const payType = normalizePayType(
    compensation.pay_type,
  );

  const annualSalaryValue = toNumber(
    compensation.annual_salary,
  );

  const hourlyRateValue = toNumber(
    compensation.hourly_rate,
  );

  const annualSalary =
    annualSalaryValue > 0
      ? annualSalaryValue
      : null;

  const hourlyRate =
    hourlyRateValue > 0
      ? hourlyRateValue
      : null;

  return {
    payType,
    annualSalary,
    hourlyRate,
    dailyRate: calculateDailyRate(
      payType,
      annualSalary,
      hourlyRate,
    ),
  };
}

function getYearDateRange(year: number): {
  startDate: string;
  endDate: string;
} {
  return {
    startDate: `${year}-01-01`,
    endDate: `${year}-12-31`,
  };
}

function getLatestCompensationByEmployee(
  rows: CompensationRecord[],
): Map<string, CompensationRecord> {
  const compensationByEmployee = new Map<
    string,
    CompensationRecord
  >();

  for (const row of rows) {
    const existing =
      compensationByEmployee.get(
        row.employee_id,
      );

    if (
      !existing ||
      row.effective_date >
        existing.effective_date
    ) {
      compensationByEmployee.set(
        row.employee_id,
        row,
      );
    }
  }

  return compensationByEmployee;
}

function getPolicyAllocationMap(
  policies: LeavePolicyRecord[],
): Map<string, number> {
  const allocationByLeaveType = new Map<
    string,
    number
  >();

  for (const policy of policies) {
    allocationByLeaveType.set(
      policy.leave_type,
      toNumber(policy.annual_allocation),
    );
  }

  return allocationByLeaveType;
}

function getUsedLeaveMap(
  requests: LeaveRequestRecord[],
): Map<string, number> {
  const usedLeaveByEmployeeAndType = new Map<
    string,
    number
  >();

  for (const request of requests) {
    if (
      !APPROVED_LEAVE_STATUSES.has(
        request.status,
      )
    ) {
      continue;
    }

    const key = `${request.employee_id}:${request.leave_type}`;

    const current =
      usedLeaveByEmployeeAndType.get(key) ??
      0;

    usedLeaveByEmployeeAndType.set(
      key,
      current + toNumber(request.total_days),
    );
  }

  return usedLeaveByEmployeeAndType;
}

function buildDepartmentRows(
  rows: LeaveLiabilityReportRow[],
): DepartmentLeaveLiabilityRow[] {
  const departmentMap = new Map<
    string,
    {
      departmentId: string | null;
      departmentName: string;
      employeeIds: Set<string>;
      unusedDays: number;
      estimatedLiability: number;
    }
  >();

  for (const row of rows) {
    const key =
      row.departmentId ??
      "unassigned";

    const existing =
      departmentMap.get(key);

    if (existing) {
      existing.employeeIds.add(
        row.employeeId,
      );

      existing.unusedDays +=
        row.unusedDays;

      existing.estimatedLiability +=
        row.estimatedLiability;

      continue;
    }

    departmentMap.set(key, {
      departmentId: row.departmentId,
      departmentName:
        row.departmentName ??
        "Unassigned",
      employeeIds: new Set([
        row.employeeId,
      ]),
      unusedDays: row.unusedDays,
      estimatedLiability:
        row.estimatedLiability,
    });
  }

  return Array.from(
    departmentMap.values(),
  )
    .map((department) => ({
      departmentId:
        department.departmentId,
      departmentName:
        department.departmentName,
      employeeCount:
        department.employeeIds.size,
      unusedDays: roundToTwoDecimals(
        department.unusedDays,
      ),
      estimatedLiability:
        roundToTwoDecimals(
          department.estimatedLiability,
        ),
    }))
    .sort(
      (a, b) =>
        b.estimatedLiability -
        a.estimatedLiability,
    );
}

function buildSummary(
  rows: LeaveLiabilityReportRow[],
): LeaveLiabilitySummary {
  const employeeIds = new Set(
    rows.map((row) => row.employeeId),
  );

  const allocatedDays = rows.reduce(
    (total, row) =>
      total + row.allocatedDays,
    0,
  );

  const usedDays = rows.reduce(
    (total, row) =>
      total + row.usedDays,
    0,
  );

  const unusedDays = rows.reduce(
    (total, row) =>
      total + row.unusedDays,
    0,
  );

  const estimatedLiability =
    rows.reduce(
      (total, row) =>
        total +
        row.estimatedLiability,
      0,
    );

  const employeeCount =
    employeeIds.size;

  return {
    employeeCount,
    allocatedDays:
      roundToTwoDecimals(
        allocatedDays,
      ),
    usedDays:
      roundToTwoDecimals(usedDays),
    unusedDays:
      roundToTwoDecimals(unusedDays),
    averageUnusedDays:
      employeeCount > 0
        ? roundToTwoDecimals(
            unusedDays /
              employeeCount,
          )
        : 0,
    estimatedLiability:
      roundToTwoDecimals(
        estimatedLiability,
      ),
  };
}

export async function getLeaveLiabilityReport(
  companyId: string,
  filters: LeaveLiabilityReportFilters,
): Promise<LeaveLiabilityReport> {
  const supabase =
    await createServerSupabaseClient();

  const { startDate, endDate } =
    getYearDateRange(filters.year);

  let employeesQuery = supabase
    .from("employees")
    .select(`
      id,
      employee_number,
      first_name,
      last_name,
      department_id,
      department:departments!employees_department_id_fkey (
        id,
        name
      )
    `)
    .eq("company_id", companyId)
    .neq(
      "employment_status",
      "terminated",
    )
    .order("last_name", {
      ascending: true,
    })
    .order("first_name", {
      ascending: true,
    });

  if (filters.employeeId) {
    employeesQuery =
      employeesQuery.eq(
        "id",
        filters.employeeId,
      );
  }

  if (filters.departmentId) {
    employeesQuery =
      employeesQuery.eq(
        "department_id",
        filters.departmentId,
      );
  }

  let policiesQuery = supabase
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
    policiesQuery =
      policiesQuery.eq(
        "leave_type",
        filters.leaveType,
      );
  }

  let requestsQuery = supabase
    .from("employee_leave_requests")
    .select(`
      employee_id,
      leave_type,
      total_days,
      status,
      start_date,
      end_date
    `)
    .eq("company_id", companyId)
    .lte("start_date", endDate)
    .gte("end_date", startDate);

  if (filters.employeeId) {
    requestsQuery =
      requestsQuery.eq(
        "employee_id",
        filters.employeeId,
      );
  }

  if (filters.leaveType) {
    requestsQuery =
      requestsQuery.eq(
        "leave_type",
        filters.leaveType,
      );
  }

  let compensationQuery = supabase
    .from("employee_compensation")
    .select(`
      employee_id,
      pay_type,
      annual_salary,
      hourly_rate,
      effective_date
    `)
    .eq("company_id", companyId)
    .lte("effective_date", endDate)
    .order("effective_date", {
      ascending: false,
    });

  if (filters.employeeId) {
    compensationQuery =
      compensationQuery.eq(
        "employee_id",
        filters.employeeId,
      );
  }

  const [
    employeesResult,
    policiesResult,
    requestsResult,
    compensationResult,
  ] = await Promise.all([
    employeesQuery,
    policiesQuery,
    requestsQuery,
    compensationQuery,
  ]);

  if (employeesResult.error) {
    throw new Error(
      `Failed to load employees for leave liability report: ${employeesResult.error.message}`,
    );
  }

  if (policiesResult.error) {
    throw new Error(
      `Failed to load leave policies for leave liability report: ${policiesResult.error.message}`,
    );
  }

  if (requestsResult.error) {
    throw new Error(
      `Failed to load leave requests for leave liability report: ${requestsResult.error.message}`,
    );
  }

  if (compensationResult.error) {
    throw new Error(
      `Failed to load compensation for leave liability report: ${compensationResult.error.message}`,
    );
  }

  const employees =
    (employeesResult.data ??
      []) as EmployeeRecord[];

  const policies =
    (policiesResult.data ??
      []) as LeavePolicyRecord[];

  const leaveRequests =
    (requestsResult.data ??
      []) as LeaveRequestRecord[];

  const compensationRows =
    (compensationResult.data ??
      []) as CompensationRecord[];

  const allocationByLeaveType =
    getPolicyAllocationMap(policies);

  const usedLeaveByEmployeeAndType =
    getUsedLeaveMap(leaveRequests);

  const latestCompensationByEmployee =
    getLatestCompensationByEmployee(
      compensationRows,
    );

  const reportRows: LeaveLiabilityReportRow[] =
    [];

  for (const employee of employees) {
    const department =
      getDepartment(employee);

    const compensation =
      normalizeCompensation(
        latestCompensationByEmployee.get(
          employee.id,
        ),
      );

    for (const [
      leaveType,
      allocatedDays,
    ] of allocationByLeaveType.entries()) {
      const usageKey = `${employee.id}:${leaveType}`;

      const usedDays =
        usedLeaveByEmployeeAndType.get(
          usageKey,
        ) ?? 0;

      const unusedDays = Math.max(
        allocatedDays - usedDays,
        0,
      );

      const estimatedLiability =
        unusedDays *
        compensation.dailyRate;

      reportRows.push({
        employeeId: employee.id,
        employeeNumber:
          employee.employee_number,
        employeeName:
          getEmployeeName(employee),
        departmentId:
          department.id,
        departmentName:
          department.name,
        leaveType,

        allocatedDays:
          roundToTwoDecimals(
            allocatedDays,
          ),

        usedDays:
          roundToTwoDecimals(
            usedDays,
          ),

        unusedDays:
          roundToTwoDecimals(
            unusedDays,
          ),

        payType:
          compensation.payType,

        annualSalary:
          compensation.annualSalary,

        hourlyRate:
          compensation.hourlyRate,

        dailyRate:
          compensation.dailyRate,

        estimatedLiability:
          roundToTwoDecimals(
            estimatedLiability,
          ),
      });
    }
  }

  reportRows.sort((a, b) => {
    const departmentComparison =
      (
        a.departmentName ??
        "Unassigned"
      ).localeCompare(
        b.departmentName ??
          "Unassigned",
      );

    if (departmentComparison !== 0) {
      return departmentComparison;
    }

    const employeeComparison =
      a.employeeName.localeCompare(
        b.employeeName,
      );

    if (employeeComparison !== 0) {
      return employeeComparison;
    }

    return a.leaveType.localeCompare(
      b.leaveType,
    );
  });

  return {
    rows: reportRows,
    departments:
      buildDepartmentRows(reportRows),
    summary: buildSummary(reportRows),
  };
}