"use client";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Palmtree,
} from "lucide-react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  useMemo,
  useState,
} from "react";

import CalendarEventDialog from "./calendar-event-dialog";
import type {
  CompanyLeaveCalendarEvent,
  CompanyLeaveCalendarHoliday,
} from "./company-calendar.service";

type CompanyLeaveCalendarProps = {
  initialYear: number;
  initialMonth: number;
  events: CompanyLeaveCalendarEvent[];
  holidays: CompanyLeaveCalendarHoliday[];
};

type CalendarDay = {
  date: Date;
  dateKey: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
};

type LegendItemProps = {
  className: string;
  label: string;
};

const WEEK_DAYS = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const;

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

function formatDateKey(
  date: Date,
): string {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isDateInRange(
  dateKey: string,
  startDate: string,
  endDate: string,
): boolean {
  return (
    dateKey >= startDate &&
    dateKey <= endDate
  );
}

function getCalendarDays(
  year: number,
  month: number,
): CalendarDay[] {
  const firstDayOfMonth =
    new Date(year, month, 1);

  const lastDayOfMonth =
    new Date(year, month + 1, 0);

  const calendarStart =
    new Date(firstDayOfMonth);

  calendarStart.setDate(
    firstDayOfMonth.getDate() -
      firstDayOfMonth.getDay(),
  );

  const calendarEnd =
    new Date(lastDayOfMonth);

  calendarEnd.setDate(
    lastDayOfMonth.getDate() +
      (6 - lastDayOfMonth.getDay()),
  );

  const todayKey =
    formatDateKey(new Date());

  const days: CalendarDay[] = [];

  const currentDate =
    new Date(calendarStart);

  while (currentDate <= calendarEnd) {
    const date =
      new Date(currentDate);

    const dateKey =
      formatDateKey(date);

    days.push({
      date,
      dateKey,
      dayNumber: date.getDate(),
      isCurrentMonth:
        date.getMonth() === month,
      isToday:
        dateKey === todayKey,
    });

    currentDate.setDate(
      currentDate.getDate() + 1,
    );
  }

  return days;
}

function formatLeaveType(
  leaveType: string,
): string {
  return leaveType
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function getLeaveTypeClasses(
  leaveType: string,
): string {
  const normalizedType =
    leaveType.toLowerCase();

  if (
    normalizedType === "vacation" ||
    normalizedType === "annual"
  ) {
    return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/50 dark:text-blue-300";
  }

  if (normalizedType === "sick") {
    return "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-300";
  }

  if (normalizedType === "personal") {
    return "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900/60 dark:bg-purple-950/50 dark:text-purple-300";
  }

  if (
    normalizedType === "maternity" ||
    normalizedType === "paternity" ||
    normalizedType === "parental"
  ) {
    return "border-pink-200 bg-pink-50 text-pink-700 dark:border-pink-900/60 dark:bg-pink-950/50 dark:text-pink-300";
  }

  if (
    normalizedType === "bereavement"
  ) {
    return "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300";
  }

  return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-300";
}

function formatEventTooltip(
  event: CompanyLeaveCalendarEvent,
): string {
  const department =
    event.departmentName
      ? `Department: ${event.departmentName}`
      : null;

  const dates =
    event.startDate === event.endDate
      ? event.startDate
      : `${event.startDate} to ${event.endDate}`;

  return [
    event.employeeName,
    formatLeaveType(
      event.leaveType,
    ),
    dates,
    `${event.totalDays} day${
      event.totalDays === 1
        ? ""
        : "s"
    }`,
    department,
  ]
    .filter(Boolean)
    .join("\n");
}

export default function CompanyLeaveCalendar({
  initialYear,
  initialMonth,
  events,
  holidays,
}: CompanyLeaveCalendarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const searchParams =
    useSearchParams();

  const [
    selectedDepartment,
    setSelectedDepartment,
  ] = useState("all");

  const [
    selectedLeaveType,
    setSelectedLeaveType,
  ] = useState("all");

  const [
    selectedEvent,
    setSelectedEvent,
  ] =
    useState<CompanyLeaveCalendarEvent | null>(
      null,
    );

  const [
    dialogOpen,
    setDialogOpen,
  ] = useState(false);

  const calendarDays = useMemo(
    () =>
      getCalendarDays(
        initialYear,
        initialMonth,
      ),
    [
      initialYear,
      initialMonth,
    ],
  );

  const departments = useMemo(() => {
    return Array.from(
      new Set(
        events
          .map(
            (event) =>
              event.departmentName,
          )
          .filter(
            (
              department,
            ): department is string =>
              Boolean(department),
          ),
      ),
    ).sort((a, b) =>
      a.localeCompare(b),
    );
  }, [events]);

  const leaveTypes = useMemo(() => {
    return Array.from(
      new Set(
        events.map(
          (event) =>
            event.leaveType,
        ),
      ),
    ).sort((a, b) =>
      a.localeCompare(b),
    );
  }, [events]);

  const filteredEvents =
    useMemo(() => {
      return events.filter(
        (event) => {
          const matchesDepartment =
            selectedDepartment ===
              "all" ||
            event.departmentName ===
              selectedDepartment;

          const matchesLeaveType =
            selectedLeaveType ===
              "all" ||
            event.leaveType ===
              selectedLeaveType;

          return (
            matchesDepartment &&
            matchesLeaveType
          );
        },
      );
    }, [
      events,
      selectedDepartment,
      selectedLeaveType,
    ]);

  const eventsByDate = useMemo(() => {
    const map = new Map<
      string,
      CompanyLeaveCalendarEvent[]
    >();

    for (const day of calendarDays) {
      const dayEvents =
        filteredEvents.filter(
          (event) =>
            isDateInRange(
              day.dateKey,
              event.startDate,
              event.endDate,
            ),
        );

      map.set(
        day.dateKey,
        dayEvents,
      );
    }

    return map;
  }, [
    calendarDays,
    filteredEvents,
  ]);

  const holidaysByDate =
    useMemo(() => {
      const map = new Map<
        string,
        CompanyLeaveCalendarHoliday[]
      >();

      for (const holiday of holidays) {
        const current =
          map.get(holiday.date) ??
          [];

        current.push(holiday);

        map.set(
          holiday.date,
          current,
        );
      }

      return map;
    }, [holidays]);

  function navigateToMonth(
    year: number,
    month: number,
  ) {
    const params =
      new URLSearchParams(
        searchParams.toString(),
      );

    params.set(
      "year",
      String(year),
    );

    params.set(
      "month",
      String(month + 1),
    );

    router.push(
      `${pathname}?${params.toString()}`,
    );
  }

  function goToPreviousMonth() {
    const previousDate = new Date(
      initialYear,
      initialMonth - 1,
      1,
    );

    navigateToMonth(
      previousDate.getFullYear(),
      previousDate.getMonth(),
    );
  }

  function goToNextMonth() {
    const nextDate = new Date(
      initialYear,
      initialMonth + 1,
      1,
    );

    navigateToMonth(
      nextDate.getFullYear(),
      nextDate.getMonth(),
    );
  }

  function goToToday() {
    const today = new Date();

    navigateToMonth(
      today.getFullYear(),
      today.getMonth(),
    );
  }

  function openEventDialog(
    event: CompanyLeaveCalendarEvent,
  ) {
    setSelectedEvent(event);
    setDialogOpen(true);
  }

  function handleDialogOpenChange(
    open: boolean,
  ) {
    setDialogOpen(open);

    if (!open) {
      setSelectedEvent(null);
    }
  }

  const monthTitle =
    `${MONTHS[initialMonth]} ${initialYear}`;

  return (
    <>
      <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="flex flex-col gap-4 border-b p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CalendarDays className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold">
                {monthTitle}
              </h2>

              <p className="text-sm text-muted-foreground">
                {
                  filteredEvents.length
                }{" "}
                leave request
                {filteredEvents.length ===
                1
                  ? ""
                  : "s"}{" "}
                displayed
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <select
              value={
                selectedDepartment
              }
              onChange={(event) =>
                setSelectedDepartment(
                  event.target.value,
                )
              }
              aria-label="Filter by department"
              className="h-10 rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">
                All departments
              </option>

              {departments.map(
                (department) => (
                  <option
                    key={department}
                    value={department}
                  >
                    {department}
                  </option>
                ),
              )}
            </select>

            <select
              value={
                selectedLeaveType
              }
              onChange={(event) =>
                setSelectedLeaveType(
                  event.target.value,
                )
              }
              aria-label="Filter by leave type"
              className="h-10 rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">
                All leave types
              </option>

              {leaveTypes.map(
                (leaveType) => (
                  <option
                    key={leaveType}
                    value={leaveType}
                  >
                    {formatLeaveType(
                      leaveType,
                    )}
                  </option>
                ),
              )}
            </select>

            <div className="flex items-center rounded-lg border bg-background p-1">
              <button
                type="button"
                onClick={
                  goToPreviousMonth
                }
                aria-label="Previous month"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-muted"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={goToToday}
                className="h-8 rounded-md px-3 text-sm font-medium transition-colors hover:bg-muted"
              >
                Today
              </button>

              <button
                type="button"
                onClick={
                  goToNextMonth
                }
                aria-label="Next month"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-muted"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-7 border-b bg-muted/30">
              {WEEK_DAYS.map(
                (weekDay) => (
                  <div
                    key={weekDay}
                    className="border-r px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground last:border-r-0"
                  >
                    {weekDay}
                  </div>
                ),
              )}
            </div>

            <div className="grid grid-cols-7">
              {calendarDays.map(
                (day) => {
                  const dayEvents =
                    eventsByDate.get(
                      day.dateKey,
                    ) ?? [];

                  const dayHolidays =
                    holidaysByDate.get(
                      day.dateKey,
                    ) ?? [];

                  return (
                    <div
                      key={day.dateKey}
                      className={[
                        "min-h-36 border-b border-r p-2 transition-colors",
                        "hover:bg-muted/20",
                        !day.isCurrentMonth
                          ? "bg-muted/20 text-muted-foreground"
                          : "bg-background",
                      ].join(" ")}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span
                          className={[
                            "inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium",
                            day.isToday
                              ? "bg-primary text-primary-foreground"
                              : "",
                          ].join(
                            " ",
                          )}
                        >
                          {
                            day.dayNumber
                          }
                        </span>

                        {dayEvents.length >
                          0 && (
                          <span className="text-[11px] text-muted-foreground">
                            {
                              dayEvents.length
                            }{" "}
                            out
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        {dayHolidays.map(
                          (holiday) => (
                            <div
                              key={
                                holiday.id
                              }
                              title={
                                holiday.description ??
                                holiday.name
                              }
                              className="flex items-start gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-xs text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300"
                            >
                              <Palmtree className="mt-0.5 h-3 w-3 shrink-0" />

                              <span className="min-w-0 truncate font-medium">
                                {
                                  holiday.name
                                }

                                {holiday.isOptional
                                  ? " (Optional)"
                                  : ""}
                              </span>
                            </div>
                          ),
                        )}

                        {dayEvents
                          .slice(0, 4)
                          .map(
                            (event) => (
                              <button
                                key={
                                  event.id
                                }
                                type="button"
                                title={formatEventTooltip(
                                  event,
                                )}
                                onClick={() =>
                                  openEventDialog(
                                    event,
                                  )
                                }
                                className={[
                                  "flex w-full items-start gap-1.5 rounded-md border px-2 py-1.5 text-left text-xs transition-all",
                                  "hover:scale-[1.02] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
                                  getLeaveTypeClasses(
                                    event.leaveType,
                                  ),
                                ].join(
                                  " ",
                                )}
                              >
                                <CircleUserRound className="mt-0.5 h-3 w-3 shrink-0" />

                                <span className="min-w-0">
                                  <span className="block truncate font-medium">
                                    {
                                      event.employeeName
                                    }
                                  </span>

                                  <span className="block truncate opacity-80">
                                    {formatLeaveType(
                                      event.leaveType,
                                    )}
                                  </span>
                                </span>
                              </button>
                            ),
                          )}

                        {dayEvents.length >
                          4 && (
                          <div className="px-1 text-xs font-medium text-muted-foreground">
                            +
                            {dayEvents.length -
                              4}{" "}
                            more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t bg-muted/20 px-4 py-3 text-xs text-muted-foreground sm:px-6">
          <LegendItem
            className="border-blue-200 bg-blue-50 dark:border-blue-900/60 dark:bg-blue-950/50"
            label="Vacation"
          />

          <LegendItem
            className="border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-950/50"
            label="Sick"
          />

          <LegendItem
            className="border-purple-200 bg-purple-50 dark:border-purple-900/60 dark:bg-purple-950/50"
            label="Personal"
          />

          <LegendItem
            className="border-emerald-200 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/50"
            label="Holiday"
          />
        </div>
      </section>

      <CalendarEventDialog
        event={selectedEvent}
        open={dialogOpen}
        onOpenChange={
          handleDialogOpenChange
        }
      />
    </>
  );
}

function LegendItem({
  className,
  label,
}: LegendItemProps) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`h-3 w-3 rounded-sm border ${className}`}
      />

      <span>{label}</span>
    </div>
  );
}