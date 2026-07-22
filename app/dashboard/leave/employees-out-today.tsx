import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  UserRoundCheck,
} from "lucide-react";

import type {
  EmployeeOutTodayItem,
} from "./services/leave-dashboard.service";

type EmployeesOutTodayProps = {
  employees: EmployeeOutTodayItem[];
};

function formatDate(
  value: string,
): string {
  const date = new Date(
    `${value}T00:00:00`,
  );

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  ).format(date);
}

function formatLeaveType(
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

function getLeaveTypeClasses(
  leaveType: string,
): string {
  switch (
    leaveType
      .trim()
      .toLowerCase()
  ) {
    case "vacation":
    case "annual":
    case "annual leave":
      return "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-950/40 dark:text-blue-300";

    case "sick":
    case "sick leave":
      return "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-950/40 dark:text-red-300";

    case "personal":
    case "personal leave":
      return "bg-purple-50 text-purple-700 ring-purple-600/20 dark:bg-purple-950/40 dark:text-purple-300";

    case "bereavement":
    case "bereavement leave":
      return "bg-slate-100 text-slate-700 ring-slate-600/20 dark:bg-slate-800 dark:text-slate-300";

    case "parental":
    case "parental leave":
    case "maternity":
    case "maternity leave":
    case "paternity":
    case "paternity leave":
      return "bg-pink-50 text-pink-700 ring-pink-600/20 dark:bg-pink-950/40 dark:text-pink-300";

    default:
      return "bg-muted text-muted-foreground ring-border";
  }
}

export default function EmployeesOutToday({
  employees,
}: EmployeesOutTodayProps) {
  return (
    <section
      aria-labelledby="employees-out-today-heading"
      className="overflow-hidden rounded-2xl border bg-card shadow-sm"
    >
      <header className="flex flex-col gap-3 border-b px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <UserRoundCheck className="h-5 w-5" />
          </div>

          <div>
            <h2
              id="employees-out-today-heading"
              className="font-semibold"
            >
              Employees Out Today
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Approved absences active today.
            </p>
          </div>
        </div>

        <div className="inline-flex w-fit items-center rounded-full border bg-muted/40 px-3 py-1 text-sm font-medium">
          {employees.length}{" "}
          {employees.length === 1
            ? "employee"
            : "employees"}
        </div>
      </header>

      {employees.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <CalendarDays className="h-6 w-6 text-muted-foreground" />
          </div>

          <h3 className="mt-4 font-medium">
            No employees are out today
          </h3>

          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            There are no approved leave requests covering today.
          </p>
        </div>
      ) : (
        <div className="divide-y">
          {employees.map(
            (employee) => (
              <article
                key={employee.id}
                className="flex flex-col gap-4 px-5 py-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/dashboard/employees/${employee.employeeId}/leave`}
                      className="truncate font-medium hover:underline"
                    >
                      {employee.employeeName}
                    </Link>

                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getLeaveTypeClasses(
                        employee.leaveType,
                      )}`}
                    >
                      {formatLeaveType(
                        employee.leaveType,
                      )}
                    </span>
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                    <span>
                      {employee.departmentName}
                    </span>

                    {employee.employeeNumber ? (
                      <>
                        <span aria-hidden="true">
                          •
                        </span>

                        <span>
                          {
                            employee.employeeNumber
                          }
                        </span>
                      </>
                    ) : null}
                  </div>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {formatDate(
                      employee.startDate,
                    )}{" "}
                    –{" "}
                    {formatDate(
                      employee.endDate,
                    )}
                  </p>
                </div>

                <Link
                  href={`/dashboard/employees/${employee.employeeId}/leave`}
                  className="inline-flex shrink-0 items-center gap-2 self-start text-sm font-medium text-primary hover:underline sm:self-auto"
                >
                  View leave
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ),
          )}
        </div>
      )}
    </section>
  );
}