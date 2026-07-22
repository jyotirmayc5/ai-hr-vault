import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export type CompanyLeaveCalendarEvent = {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNumber: string | null;
  departmentId: string | null;
  departmentName: string | null;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: string;
  reason: string | null;
};

export type CompanyLeaveCalendarHoliday = {
  id: string;
  name: string;
  date: string;
  description: string | null;
  isOptional: boolean;
};

export type CompanyLeaveCalendarData = {
  events: CompanyLeaveCalendarEvent[];
  holidays: CompanyLeaveCalendarHoliday[];
};

export type GetCompanyLeaveCalendarDataParams = {
  companyId: string;
  year: number;
  month: number;
};

type LeaveRequestRecord = {
  id: string;
  employee_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  total_days: number | string | null;
  status: string;
  reason: string | null;
  employee:
    | {
        id: string;
        employee_number: string | null;
        first_name: string | null;
        last_name: string | null;
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
      }
    | {
        id: string;
        employee_number: string | null;
        first_name: string | null;
        last_name: string | null;
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
      }[]
    | null;
};

type HolidayRecord = {
  id: string;
  name: string;
  holiday_date: string;
  description: string | null;
  is_optional: boolean | null;
};

function getMonthDateRange(
  year: number,
  month: number,
): {
  startDate: string;
  endDate: string;
} {
  const firstDay = new Date(
    Date.UTC(year, month - 1, 1),
  );

  const lastDay = new Date(
    Date.UTC(year, month, 0),
  );

  return {
    startDate: firstDay
      .toISOString()
      .slice(0, 10),
    endDate: lastDay
      .toISOString()
      .slice(0, 10),
  };
}

function getEmployee(
  employee: LeaveRequestRecord["employee"],
) {
  if (Array.isArray(employee)) {
    return employee[0] ?? null;
  }

  return employee;
}

function getDepartment(
  department:
    | {
        id: string;
        name: string | null;
      }
    | {
        id: string;
        name: string | null;
      }[]
    | null,
) {
  if (Array.isArray(department)) {
    return department[0] ?? null;
  }

  return department;
}

function getEmployeeName(
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

function parseTotalDays(
  value: number | string | null,
): number {
  if (typeof value === "number") {
    return Number.isFinite(value)
      ? value
      : 0;
  }

  if (typeof value === "string") {
    const parsedValue = Number.parseFloat(value);

    return Number.isFinite(parsedValue)
      ? parsedValue
      : 0;
  }

  return 0;
}

export async function getCompanyLeaveCalendarData({
  companyId,
  year,
  month,
}: GetCompanyLeaveCalendarDataParams): Promise<CompanyLeaveCalendarData> {
  if (!companyId) {
    throw new Error(
      "A company ID is required to load the leave calendar.",
    );
  }

  if (
    !Number.isInteger(year) ||
    year < 2000 ||
    year > 2100
  ) {
    throw new Error(
      "A valid calendar year is required.",
    );
  }

  if (
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12
  ) {
    throw new Error(
      "A valid calendar month is required.",
    );
  }

  const supabase =
    await createServerSupabaseClient();

  const {
    startDate,
    endDate,
  } = getMonthDateRange(
    year,
    month,
  );

  const [
    leaveRequestsResult,
    holidaysResult,
  ] = await Promise.all([
    supabase
      .from("employee_leave_requests")
      .select(`
        id,
        employee_id,
        leave_type,
        start_date,
        end_date,
        total_days,
        status,
        reason,
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
      .eq("company_id", companyId)
      .in("status", [
        "manager_approved",
        "hr_approved",
        "approved",
        "completed",
      ])
      .lte("start_date", endDate)
      .gte("end_date", startDate)
      .order("start_date", {
        ascending: true,
      })
      .order("created_at", {
        ascending: true,
      }),

    supabase
      .from("company_holidays")
      .select(`
        id,
        name,
        holiday_date,
        description,
        is_optional
      `)
      .eq("company_id", companyId)
      .gte("holiday_date", startDate)
      .lte("holiday_date", endDate)
      .order("holiday_date", {
        ascending: true,
      }),
  ]);

  if (leaveRequestsResult.error) {
    console.error(
      "Failed to load company leave calendar events:",
      leaveRequestsResult.error,
    );

    throw new Error(
      "Unable to load company leave calendar events.",
    );
  }

  if (holidaysResult.error) {
    console.error(
      "Failed to load company calendar holidays:",
      holidaysResult.error,
    );

    throw new Error(
      "Unable to load company holidays.",
    );
  }

  const leaveRequests =
    (leaveRequestsResult.data ??
      []) as LeaveRequestRecord[];

  const holidayRecords =
    (holidaysResult.data ??
      []) as HolidayRecord[];

  const events: CompanyLeaveCalendarEvent[] =
    leaveRequests.map((request) => {
      const employee = getEmployee(
        request.employee,
      );

      const department = getDepartment(
        employee?.department ?? null,
      );

      return {
        id: request.id,
        employeeId:
          employee?.id ??
          request.employee_id,
        employeeName: getEmployeeName(
          employee?.first_name ?? null,
          employee?.last_name ?? null,
        ),
        employeeNumber:
          employee?.employee_number ??
          null,
        departmentId:
          department?.id ?? null,
        departmentName:
          department?.name ?? null,
        leaveType: request.leave_type,
        startDate: request.start_date,
        endDate: request.end_date,
        totalDays: parseTotalDays(
          request.total_days,
        ),
        status: request.status,
        reason: request.reason,
      };
    });

  const holidays: CompanyLeaveCalendarHoliday[] =
    holidayRecords.map((holiday) => ({
      id: holiday.id,
      name: holiday.name,
      date: holiday.holiday_date,
      description:
        holiday.description,
      isOptional:
        holiday.is_optional ?? false,
    }));

  return {
    events,
    holidays,
  };
}