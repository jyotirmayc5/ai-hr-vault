"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import type { CompanyHoliday } from "@/app/dashboard/employees/services/company-holiday.service";
import type { LeaveCalendarEvent } from "@/app/dashboard/employees/services/employee-leave.service";

import CalendarDay from "./components/calendar-day";

interface LeaveCalendarProps {
  initialYear: number;
  initialMonth: number;
  events: LeaveCalendarEvent[];
  holidays: CompanyHoliday[];
}

const WEEK_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDateOnly(value: string): Date | null {
  const [yearValue, monthValue, dayValue] = value.split("-");

  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return null;
  }

  const parsedDate = new Date(year, month - 1, day);

  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day
  ) {
    return null;
  }

  return parsedDate;
}

function isDateWithinEvent(
  date: Date,
  event: LeaveCalendarEvent,
): boolean {
  const startDate = parseDateOnly(event.startDate);
  const endDate = parseDateOnly(event.endDate);

  if (!startDate || !endDate) {
    return false;
  }

  const targetDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  return targetDate >= startDate && targetDate <= endDate;
}

function createCalendarDays(year: number, month: number): Date[] {
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const lastDayOfMonth = new Date(year, month, 0);

  const firstCalendarDate = new Date(firstDayOfMonth);
  firstCalendarDate.setDate(
    firstDayOfMonth.getDate() - firstDayOfMonth.getDay(),
  );

  const lastCalendarDate = new Date(lastDayOfMonth);
  lastCalendarDate.setDate(
    lastDayOfMonth.getDate() + (6 - lastDayOfMonth.getDay()),
  );

  const days: Date[] = [];
  const currentDate = new Date(firstCalendarDate);

  while (currentDate <= lastCalendarDate) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return days;
}

export default function LeaveCalendar({
  initialYear,
  initialMonth,
  events,
  holidays,
}: LeaveCalendarProps) {
  const [currentDate, setCurrentDate] = useState(
    new Date(initialYear, initialMonth - 1, 1),
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const calendarDays = useMemo(
    () => createCalendarDays(year, month),
    [year, month],
  );

  const eventsByDate = useMemo(() => {
    const result = new Map<string, LeaveCalendarEvent[]>();

    for (const date of calendarDays) {
      const dateKey = formatDateKey(date);

      result.set(
        dateKey,
        events.filter((event) => isDateWithinEvent(date, event)),
      );
    }

    return result;
  }, [calendarDays, events]);

  const holidaysByDate = useMemo(() => {
    const result = new Map<string, CompanyHoliday[]>();

    for (const holiday of holidays) {
      const existingHolidays =
        result.get(holiday.holiday_date) ?? [];

      result.set(holiday.holiday_date, [
        ...existingHolidays,
        holiday,
      ]);
    }

    return result;
  }, [holidays]);

  const todayKey = formatDateKey(new Date());

  function goToPreviousMonth(): void {
    setCurrentDate((previousDate) => {
      return new Date(
        previousDate.getFullYear(),
        previousDate.getMonth() - 1,
        1,
      );
    });
  }

  function goToNextMonth(): void {
    setCurrentDate((previousDate) => {
      return new Date(
        previousDate.getFullYear(),
        previousDate.getMonth() + 1,
        1,
      );
    });
  }

  function goToToday(): void {
    const today = new Date();

    setCurrentDate(
      new Date(today.getFullYear(), today.getMonth(), 1),
    );
  }

  const monthTitle = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <section className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Monthly leave and holiday calendar
          </p>

          <h2 className="text-xl font-semibold">{monthTitle}</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToToday}
            className="rounded-md border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            Today
          </button>

          <button
            type="button"
            onClick={goToPreviousMonth}
            aria-label="Previous month"
            className="rounded-md border p-2 transition-colors hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={goToNextMonth}
            aria-label="Next month"
            className="rounded-md border p-2 transition-colors hover:bg-muted"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[760px]">
          <div className="grid grid-cols-7 border-l">
            {WEEK_DAYS.map((day) => (
              <div
                key={day}
                className="border-b border-r bg-muted/50 px-2 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">
                  {day.slice(0, 3)}
                </span>
              </div>
            ))}

            {calendarDays.map((date) => {
              const dateKey = formatDateKey(date);

              return (
                <CalendarDay
                  key={dateKey}
                  date={date}
                  isCurrentMonth={
                    date.getMonth() === month - 1
                  }
                  isToday={dateKey === todayKey}
                  events={eventsByDate.get(dateKey) ?? []}
                  holidays={holidaysByDate.get(dateKey) ?? []}
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-t p-4 text-xs">
        <CalendarLegend
          label="Vacation"
          indicatorClassName="bg-blue-100 dark:bg-blue-950"
        />

        <CalendarLegend
          label="Sick"
          indicatorClassName="bg-red-100 dark:bg-red-950"
        />

        <CalendarLegend
          label="Personal"
          indicatorClassName="bg-purple-100 dark:bg-purple-950"
        />

        <CalendarLegend
          label="Other"
          indicatorClassName="bg-amber-100 dark:bg-amber-950"
        />

        <CalendarLegend
          label="Company Holiday"
          indicatorClassName="bg-emerald-100 dark:bg-emerald-950"
        />

        <span className="text-muted-foreground">
          Dashed border means pending leave
        </span>
      </div>
    </section>
  );
}

interface CalendarLegendProps {
  label: string;
  indicatorClassName: string;
}

function CalendarLegend({
  label,
  indicatorClassName,
}: CalendarLegendProps) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={[
          "h-3 w-3 rounded-sm border",
          indicatorClassName,
        ].join(" ")}
      />

      <span>{label}</span>
    </div>
  );
}