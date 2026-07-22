import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CircleGauge,
} from "lucide-react";

import { createServerSupabaseClient } from "@/lib/supabase/server";

import CompanyLeaveCalendar from "./company-calendar";
import {
  getCompanyLeaveCalendarData,
} from "./company-calendar.service";

type CompanyLeaveCalendarPageProps = {
  searchParams: Promise<{
    year?: string;
    month?: string;
  }>;
};

function getValidYear(
  value: string | undefined,
): number {
  const currentYear =
    new Date().getFullYear();

  if (!value) {
    return currentYear;
  }

  const parsedYear =
    Number.parseInt(value, 10);

  if (
    !Number.isInteger(parsedYear) ||
    parsedYear < 2000 ||
    parsedYear > 2100
  ) {
    return currentYear;
  }

  return parsedYear;
}

function getValidMonth(
  value: string | undefined,
): number {
  const currentMonth =
    new Date().getMonth() + 1;

  if (!value) {
    return currentMonth;
  }

  const parsedMonth =
    Number.parseInt(value, 10);

  if (
    !Number.isInteger(parsedMonth) ||
    parsedMonth < 1 ||
    parsedMonth > 12
  ) {
    return currentMonth;
  }

  return parsedMonth;
}

export default async function CompanyLeaveCalendarPage({
  searchParams,
}: CompanyLeaveCalendarPageProps) {
  const params = await searchParams;

  const selectedYear =
    getValidYear(params.year);

  const selectedMonth =
    getValidMonth(params.month);

  const supabase =
    await createServerSupabaseClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select(`
      id,
      company_id,
      role
    `)
    .eq("id", user.id)
    .maybeSingle();

  if (
    profileError ||
    !profile?.company_id
  ) {
    if (profileError) {
      console.error(
        "Failed to load calendar user profile:",
        profileError,
      );
    }

    redirect("/dashboard");
  }

  const calendarData =
    await getCompanyLeaveCalendarData({
      companyId: profile.company_id,
      year: selectedYear,
      month: selectedMonth,
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/dashboard/leave"
            className="mb-3 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to leave dashboard
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border bg-card shadow-sm">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Company Leave Calendar
              </h1>

              <p className="text-sm text-muted-foreground">
                View approved leave and
                company holidays across the
                organization.
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/dashboard/leave"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border bg-background px-4 text-sm font-medium shadow-sm transition-colors hover:bg-muted"
        >
          <CircleGauge className="h-4 w-4" />
          Leave overview
        </Link>
      </div>

      <CompanyLeaveCalendar
        initialYear={selectedYear}
        initialMonth={
          selectedMonth - 1
        }
        events={calendarData.events}
        holidays={
          calendarData.holidays
        }
      />
    </div>
  );
}