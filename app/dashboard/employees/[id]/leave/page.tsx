import { notFound } from "next/navigation";

import { getCompanyHolidays } from "@/app/dashboard/employees/services/company-holiday.service";
import {
  getEmployeeLeaveCalendarEvents,
  getEmployeeLeaveData,
} from "@/app/dashboard/employees/services/employee-leave.service";
import { getEmployeeProfile } from "@/app/dashboard/employees/services/employee-profile.service";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import CompanyHolidays from "./company-holidays";
import LeaveBalance from "./leave-balance";
import LeaveCalendar from "./leave-calendar";
import LeaveRequestDialog from "./leave-request-dialog";
import LeaveRequestTable from "./leave-request-table";
import type { LeaveUserRole } from "./leave-request-row";
import LeaveSummaryCards from "./leave-summary-cards";

export default async function EmployeeLeavePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: employeeId } = await params;

  if (!employeeId || employeeId === "undefined") {
    notFound();
  }

  const employeeProfile = await getEmployeeProfile(employeeId);

  if (!employeeProfile) {
    notFound();
  }

  const employee = employeeProfile.employee;

  if (!employee.company_id) {
    throw new Error(
      "The employee is not assigned to a company.",
    );
  }

  const currentUserRole = await getCurrentUserRole();

  const [leaveData, calendarEvents, holidays] =
    await Promise.all([
      getEmployeeLeaveData(
        employeeId,
        employee.company_id,
      ),
      getEmployeeLeaveCalendarEvents(employeeId),
      getCompanyHolidays(employee.company_id),
    ]);

  const employeeName = [
    employee.first_name,
    employee.last_name,
  ]
    .filter(Boolean)
    .join(" ");

  const today = new Date();

  const canCreateLeaveRequest =
    currentUserRole === "employee" ||
    currentUserRole === "manager" ||
    currentUserRole === "hr" ||
    currentUserRole === "admin";

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Employee Leave Management
          </p>

          <h1 className="text-2xl font-semibold tracking-tight">
            {employeeName || "Employee"}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            View balances, create requests, and manage
            employee leave.
          </p>
        </div>

        {canCreateLeaveRequest ? (
          <LeaveRequestDialog
            employeeId={employeeId}
            companyId={employee.company_id}
          />
        ) : null}
      </header>

      {/* Summary */}
      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">
            Leave Summary
          </h2>

          <p className="text-sm text-muted-foreground">
            Review request totals, approval status, and
            approved leave days.
          </p>
        </div>

        <LeaveSummaryCards summary={leaveData.summary} />
      </section>

      {/* Leave Balance */}
      <LeaveBalance balances={leaveData.balances} />

      {/* Calendar */}
      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">
            Leave Calendar
          </h2>

          <p className="text-sm text-muted-foreground">
            View vacation, sick, personal, and other leave
            across the calendar.
          </p>
        </div>

        <LeaveCalendar
          initialYear={today.getFullYear()}
          initialMonth={today.getMonth() + 1}
          events={calendarEvents}
          holidays={holidays}
        />
      </section>

      {/* Company Holidays */}
      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">
            Company Holidays
          </h2>

          <p className="text-sm text-muted-foreground">
            Official company holidays observed during the
            year.
          </p>
        </div>

        <CompanyHolidays holidays={holidays} />
      </section>

      {/* Leave Requests */}
      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">
            Leave Requests
          </h2>

          <p className="text-sm text-muted-foreground">
            Review request details, approval progress, and
            available actions.
          </p>
        </div>

        <LeaveRequestTable
          employeeId={employeeId}
          companyId={employee.company_id}
          requests={leaveData.requests}
          currentUserRole={currentUserRole}
        />
      </section>
    </div>
  );
}

async function getCurrentUserRole(): Promise<LeaveUserRole> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error("Unable to verify current user:", {
      message: userError.message,
      status: userError.status,
    });

    throw new Error(
      "Your login session could not be verified.",
    );
  }

  if (!user) {
    throw new Error(
      "You must be signed in to view leave requests.",
    );
  }

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

  if (profileError) {
    console.error("Unable to load current user role:", {
      userId: user.id,
      message: profileError.message,
      details: profileError.details,
      hint: profileError.hint,
      code: profileError.code,
    });

    throw new Error(
      "Your account permissions could not be loaded.",
    );
  }

  return normalizeUserRole(profile?.role);
}

function normalizeUserRole(
  role: string | null | undefined,
): LeaveUserRole {
  switch (role?.trim().toLowerCase()) {
    case "admin":
    case "super_admin":
    case "company_admin":
      return "admin";

    case "hr":
    case "hr_admin":
    case "human_resources":
      return "hr";

    case "manager":
    case "supervisor":
      return "manager";

    case "employee":
    default:
      return "employee";
  }
}