import { CalendarDays, PartyPopper } from "lucide-react";

import type { CompanyHoliday } from "@/app/dashboard/employees/services/company-holiday.service";

interface CompanyHolidaysProps {
  holidays: CompanyHoliday[];
}

function formatHolidayDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);

  if (!year || !month || !day) {
    return date;
  }

  const localDate = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(localDate);
}

export default function CompanyHolidays({
  holidays,
}: CompanyHolidaysProps) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="flex items-center gap-3 border-b px-6 py-4">
        <div className="rounded-lg bg-primary/10 p-2">
          <CalendarDays className="h-5 w-5 text-primary" />
        </div>

        <div>
          <h3 className="text-lg font-semibold">Company Holidays</h3>

          <p className="text-sm text-muted-foreground">
            Upcoming holidays observed by the company.
          </p>
        </div>
      </div>

      {holidays.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
          <div className="mb-3 rounded-full bg-muted p-3">
            <CalendarDays className="h-6 w-6 text-muted-foreground" />
          </div>

          <p className="font-medium">No company holidays configured</p>

          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Add company holidays to display them on the employee leave page.
          </p>
        </div>
      ) : (
        <div className="divide-y">
          {holidays.map((holiday) => (
            <article
              key={holiday.id}
              className="flex items-start gap-4 px-6 py-5 transition-colors hover:bg-muted/40"
            >
              <div className="mt-0.5 shrink-0 rounded-full bg-primary/10 p-2">
                <PartyPopper className="h-5 w-5 text-primary" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-medium">{holiday.name}</h4>

                  {holiday.is_optional && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                      Optional
                    </span>
                  )}
                </div>

                <p className="mt-1 text-sm text-muted-foreground">
                  {formatHolidayDate(holiday.holiday_date)}
                </p>

                {holiday.description ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {holiday.description}
                  </p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}