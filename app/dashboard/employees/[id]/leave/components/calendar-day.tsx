import { PartyPopper } from "lucide-react";

import type { CompanyHoliday } from "@/app/dashboard/employees/services/company-holiday.service";
import type { LeaveCalendarEvent } from "@/app/dashboard/employees/services/employee-leave.service";

interface CalendarDayProps {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: LeaveCalendarEvent[];
  holidays: CompanyHoliday[];
}

function getLeaveTypeClasses(leaveType: string): string {
  const normalizedType = leaveType.trim().toLowerCase();

  switch (normalizedType) {
    case "vacation":
    case "annual":
    case "annual leave":
      return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300";

    case "sick":
    case "sick leave":
      return "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300";

    case "personal":
    case "personal leave":
      return "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900 dark:bg-purple-950 dark:text-purple-300";

    case "bereavement":
      return "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300";

    case "parental":
    case "parental leave":
    case "maternity":
    case "paternity":
      return "border-pink-200 bg-pink-50 text-pink-700 dark:border-pink-900 dark:bg-pink-950 dark:text-pink-300";

    default:
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300";
  }
}

function getStatusClasses(
  status: LeaveCalendarEvent["status"],
): string {
  switch (status) {
    case "pending":
      return "border-dashed";

    case "rejected":
    case "cancelled":
      return "opacity-50 line-through";

    default:
      return "";
  }
}

function getStatusLabel(
  status: LeaveCalendarEvent["status"],
): string {
  switch (status) {
    case "approved":
      return "Approved";

    case "manager_approved":
      return "Manager Approved";

    case "hr_approved":
      return "HR Approved";

    case "completed":
      return "Completed";

    case "rejected":
      return "Rejected";

    case "cancelled":
      return "Cancelled";

    case "pending":
    default:
      return "Pending";
  }
}

export default function CalendarDay({
  date,
  isCurrentMonth,
  isToday,
  events,
  holidays,
}: CalendarDayProps) {
  const visibleItems = [
    ...holidays.map((holiday) => ({
      type: "holiday" as const,
      id: holiday.id,
      holiday,
    })),
    ...events.map((event) => ({
      type: "leave" as const,
      id: event.id,
      event,
    })),
  ];

  return (
    <div
      className={[
        "min-h-28 border-b border-r p-2",
        isCurrentMonth ? "bg-card" : "bg-muted/30",
      ].join(" ")}
    >
      <div className="mb-2 flex items-center justify-between">
        <span
          className={[
            "flex h-7 w-7 items-center justify-center rounded-full text-sm",
            isToday
              ? "bg-primary font-semibold text-primary-foreground"
              : isCurrentMonth
                ? "text-foreground"
                : "text-muted-foreground",
          ].join(" ")}
        >
          {date.getDate()}
        </span>
      </div>

      <div className="space-y-1">
        {visibleItems.slice(0, 3).map((item) => {
          if (item.type === "holiday") {
            const { holiday } = item;

            const holidayTitle = [
              holiday.name,
              holiday.is_optional ? "Optional holiday" : "Company holiday",
              holiday.description,
            ]
              .filter(Boolean)
              .join(" — ");

            return (
              <div
                key={`holiday-${holiday.id}`}
                title={holidayTitle}
                className="flex items-center gap-1 truncate rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
              >
                <PartyPopper className="h-3 w-3 shrink-0" />

                <span className="truncate">{holiday.name}</span>

                {holiday.is_optional ? (
                  <span className="shrink-0 text-[10px]">Optional</span>
                ) : null}
              </div>
            );
          }

          const { event } = item;

          const titleParts = [
            event.leaveType,
            getStatusLabel(event.status),
            `${event.startDate} to ${event.endDate}`,
          ];

          if (event.reason) {
            titleParts.push(event.reason);
          }

          return (
            <div
              key={`leave-${event.id}`}
              title={titleParts.join(" — ")}
              className={[
                "truncate rounded border px-2 py-1 text-xs font-medium",
                getLeaveTypeClasses(event.leaveType),
                getStatusClasses(event.status),
              ].join(" ")}
            >
              {event.leaveType}
            </div>
          );
        })}

        {visibleItems.length > 3 ? (
          <p className="px-1 text-xs text-muted-foreground">
            +{visibleItems.length - 3} more
          </p>
        ) : null}
      </div>
    </div>
  );
}