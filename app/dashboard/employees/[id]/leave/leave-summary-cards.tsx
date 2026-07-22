import {
  CalendarClock,
  CalendarCheck,
  Clock3,
  CalendarDays,
} from "lucide-react";

import type { EmployeeLeaveSummary } from "@/app/dashboard/employees/services/employee-leave.service";

interface LeaveSummaryCardsProps {
  summary: EmployeeLeaveSummary;
}

export default function LeaveSummaryCards({
  summary,
}: LeaveSummaryCardsProps) {
  const cards = [
    {
      title: "Pending",
      value: summary.pending,
      icon: Clock3,
      iconClass:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    },
    {
      title: "Approved",
      value: summary.approved,
      icon: CalendarCheck,
      iconClass:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    },
    {
      title: "Upcoming",
      value: summary.upcoming,
      icon: CalendarClock,
      iconClass:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    },
    {
      title: "Days Used",
      value: summary.daysUsed,
      icon: CalendarDays,
      iconClass:
        "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {card.title}
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight">
                  {card.value}
                </p>
              </div>

              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full ${card.iconClass}`}
              >
                <Icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}