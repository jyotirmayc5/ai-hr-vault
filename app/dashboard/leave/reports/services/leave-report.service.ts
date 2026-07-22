import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export type LeaveReportStatus =
  | "pending"
  | "manager_approved"
  | "approved"
  | "hr_approved"
  | "rejected"
  | "cancelled"
  | "completed";

export type LeaveReportFilters = {
  employeeId?: string;
  departmentId?: string;
  leaveType?: string;
  status?: LeaveReportStatus;
  startDate?: string;
  endDate?: string;
};

export type EmployeeLeaveHistoryRow = {
  id: string;
  companyId: string;
  employeeId: string;
  employeeName: string;
  employeeNumber: string | null;
  departmentId: string | null;
  departmentName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: LeaveReportStatus;
  reason: string | null;
  managerApprovedAt: string | null;
  hrApprovedAt: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
};

export type LeaveReportOption = {
  id: string;
  label: string;
};

export type LeaveReportFilterOptions = {
  employees: LeaveReportOption[];
  departments: LeaveReportOption[];
  leaveTypes: string[];
  statuses: LeaveReportStatus[];
};

type EmployeeRelation = {
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

type LeaveHistoryRecord = {
  id: string;
  company_id: string;
  employee_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  total_days: number | string | null;
  status: LeaveReportStatus;
  reason: string | null;
  manager_approved_at: string | null;
  hr_approved_at: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  employee: EmployeeRelation | EmployeeRelation[] | null;
};

type FilterEmployeeRecord = {
  id: string;
  employee_number: string | null;
  first_name: string | null;
  last_name: string | null;
};

type FilterDepartmentRecord = {
  id: string;
  name: string | null;
};

function getSingleRelation<T>(
  relation: T | T[] | null | undefined,
): T | null {
  if (!relation) {
    return null;
  }

  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }

  return relation;
}

function getEmployeeName(
  firstName: string | null,
  lastName: string | null,
): string {
  const fullName = [firstName, lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || "Unknown employee";
}

function normalizeNumber(
  value: number | string | null | undefined,
): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function isValidDateString(value?: string): value is string {
  if (!value) {
    return false;
  }

  return !Number.isNaN(Date.parse(value));
}

export async function getEmployeeLeaveHistory(
  companyId: string,
  filters: LeaveReportFilters = {},
): Promise<EmployeeLeaveHistoryRow[]> {
  if (!companyId) {
    return [];
  }

  const supabase = await createServerSupabaseClient();

  let query = supabase
    .from("employee_leave_requests")
    .select(
      `
        id,
        company_id,
        employee_id,
        leave_type,
        start_date,
        end_date,
        total_days,
        status,
        reason,
        manager_approved_at,
        hr_approved_at,
        approved_at,
        rejected_at,
        rejection_reason,
        created_at,
        employee:employees!employee_leave_requests_employee_id_fkey (
          id,
          employee_number,
          first_name,
          last_name,
          department_id,
          department:departments!employees_department_id_fkey (
            id,
            name
          )
        )
      `,
    )
    .eq("company_id", companyId)
    .order("start_date", {
      ascending: false,
    })
    .order("created_at", {
      ascending: false,
    });

  if (filters.employeeId) {
    query = query.eq(
      "employee_id",
      filters.employeeId,
    );
  }

  if (filters.departmentId) {
    query = query.eq(
      "employee.department_id",
      filters.departmentId,
    );
  }

  if (filters.leaveType) {
    query = query.eq(
      "leave_type",
      filters.leaveType,
    );
  }

  if (filters.status) {
    query = query.eq(
      "status",
      filters.status,
    );
  }

  if (isValidDateString(filters.startDate)) {
    query = query.gte(
      "start_date",
      filters.startDate,
    );
  }

  if (isValidDateString(filters.endDate)) {
    query = query.lte(
      "end_date",
      filters.endDate,
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error(
      "Failed to fetch employee leave history",
      {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        companyId,
        filters,
      },
    );

    throw new Error(
      "Unable to load the employee leave history report.",
    );
  }

  const records =
    (data ?? []) as unknown as LeaveHistoryRecord[];

  return records.map((record) => {
    const employee = getSingleRelation(
      record.employee,
    );

    const department = getSingleRelation(
      employee?.department,
    );

    return {
      id: record.id,
      companyId: record.company_id,
      employeeId: record.employee_id,
      employeeName: getEmployeeName(
        employee?.first_name ?? null,
        employee?.last_name ?? null,
      ),
      employeeNumber:
        employee?.employee_number ?? null,
      departmentId:
        employee?.department_id ??
        department?.id ??
        null,
      departmentName:
        department?.name ?? "Unassigned",
      leaveType: record.leave_type,
      startDate: record.start_date,
      endDate: record.end_date,
      totalDays: normalizeNumber(
        record.total_days,
      ),
      status: record.status,
      reason: record.reason,
      managerApprovedAt:
        record.manager_approved_at,
      hrApprovedAt:
        record.hr_approved_at,
      approvedAt: record.approved_at,
      rejectedAt: record.rejected_at,
      rejectionReason:
        record.rejection_reason,
      createdAt: record.created_at,
    };
  });
}

export async function getLeaveReportFilterOptions(
  companyId: string,
): Promise<LeaveReportFilterOptions> {
  if (!companyId) {
    return {
      employees: [],
      departments: [],
      leaveTypes: [],
      statuses: [],
    };
  }

  const supabase = await createServerSupabaseClient();

  const [
    employeesResult,
    departmentsResult,
    leaveTypesResult,
  ] = await Promise.all([
    supabase
      .from("employees")
      .select(
        `
          id,
          employee_number,
          first_name,
          last_name
        `,
      )
      .eq("company_id", companyId)
      .order("first_name", {
        ascending: true,
      })
      .order("last_name", {
        ascending: true,
      }),

    supabase
      .from("departments")
      .select(
        `
          id,
          name
        `,
      )
      .eq("company_id", companyId)
      .order("name", {
        ascending: true,
      }),

    supabase
      .from("employee_leave_requests")
      .select("leave_type")
      .eq("company_id", companyId),
  ]);

  if (employeesResult.error) {
    console.error(
      "Failed to load leave report employees",
      {
        message: employeesResult.error.message,
        details: employeesResult.error.details,
        hint: employeesResult.error.hint,
        code: employeesResult.error.code,
      },
    );
  }

  if (departmentsResult.error) {
    console.error(
      "Failed to load leave report departments",
      {
        message:
          departmentsResult.error.message,
        details:
          departmentsResult.error.details,
        hint: departmentsResult.error.hint,
        code: departmentsResult.error.code,
      },
    );
  }

  if (leaveTypesResult.error) {
    console.error(
      "Failed to load leave report types",
      {
        message:
          leaveTypesResult.error.message,
        details:
          leaveTypesResult.error.details,
        hint: leaveTypesResult.error.hint,
        code: leaveTypesResult.error.code,
      },
    );
  }

  const employees =
    (employeesResult.data ??
      []) as FilterEmployeeRecord[];

  const departments =
    (departmentsResult.data ??
      []) as FilterDepartmentRecord[];

  const leaveTypes = Array.from(
    new Set(
      (leaveTypesResult.data ?? [])
        .map((row) => row.leave_type)
        .filter(
          (
            leaveType,
          ): leaveType is string =>
            typeof leaveType === "string" &&
            leaveType.length > 0,
        ),
    ),
  ).sort((first, second) =>
    first.localeCompare(second),
  );

  return {
    employees: employees.map((employee) => ({
      id: employee.id,
      label: getEmployeeName(
        employee.first_name,
        employee.last_name,
      ),
    })),

    departments: departments.map(
      (department) => ({
        id: department.id,
        label:
          department.name ??
          "Unnamed department",
      }),
    ),

    leaveTypes,

    statuses: [
      "pending",
      "manager_approved",
      "approved",
      "hr_approved",
      "rejected",
      "cancelled",
      "completed",
    ],
  };
}