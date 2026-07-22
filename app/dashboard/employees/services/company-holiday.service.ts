import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface CompanyHoliday {
  id: string;
  company_id: string;
  name: string;
  holiday_date: string;
  is_optional: boolean;
  description: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface CompanyHolidayRow {
  id: string;
  company_id: string;
  name: string;
  holiday_date: string;
  is_optional: boolean | null;
  description: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface SupabaseErrorLike {
  message?: string;
  details?: string;
  hint?: string;
  code?: string;
}

function logCompanyHolidayError(
  label: string,
  error: SupabaseErrorLike | null,
  context?: Record<string, unknown>,
): void {
  console.error(label, {
    ...context,
    message: error?.message ?? "Unknown Supabase error",
    details: error?.details ?? null,
    hint: error?.hint ?? null,
    code: error?.code ?? null,
  });
}

function mapCompanyHoliday(row: CompanyHolidayRow): CompanyHoliday {
  return {
    id: row.id,
    company_id: row.company_id,
    name: row.name,
    holiday_date: row.holiday_date,
    is_optional: row.is_optional ?? false,
    description: row.description,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * Returns all holidays configured for a company.
 */
export async function getCompanyHolidays(
  companyId: string,
): Promise<CompanyHoliday[]> {
  if (!companyId) {
    return [];
  }

  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("company_holidays")
    .select(
      `
        id,
        company_id,
        name,
        holiday_date,
        is_optional,
        description,
        created_at,
        updated_at
      `,
    )
    .eq("company_id", companyId)
    .order("holiday_date", { ascending: true });

  if (error) {
    if (error.code === "42P01") {
      console.warn(
        "The company_holidays table does not exist. Returning an empty holiday list.",
      );

      return [];
    }

    logCompanyHolidayError("Failed to fetch company holidays", error, {
      companyId,
    });

    return [];
  }

  return ((data ?? []) as CompanyHolidayRow[]).map(mapCompanyHoliday);
}

/**
 * Returns company holidays for a specific year.
 */
export async function getCompanyHolidaysForYear(
  companyId: string,
  year: number,
): Promise<CompanyHoliday[]> {
  if (!companyId || !Number.isInteger(year)) {
    return [];
  }

  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;

  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("company_holidays")
    .select(
      `
        id,
        company_id,
        name,
        holiday_date,
        is_optional,
        description,
        created_at,
        updated_at
      `,
    )
    .eq("company_id", companyId)
    .gte("holiday_date", startDate)
    .lte("holiday_date", endDate)
    .order("holiday_date", { ascending: true });

  if (error) {
    if (error.code === "42P01") {
      return [];
    }

    logCompanyHolidayError(
      "Failed to fetch company holidays for year",
      error,
      {
        companyId,
        year,
      },
    );

    return [];
  }

  return ((data ?? []) as CompanyHolidayRow[]).map(mapCompanyHoliday);
}

/**
 * Returns true when the supplied date is a company holiday.
 *
 * The date must use YYYY-MM-DD format.
 */
export async function isCompanyHoliday(
  companyId: string,
  date: string,
): Promise<boolean> {
  if (!companyId || !date) {
    return false;
  }

  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("company_holidays")
    .select("id")
    .eq("company_id", companyId)
    .eq("holiday_date", date)
    .limit(1)
    .maybeSingle();

  if (error) {
    if (error.code === "42P01") {
      return false;
    }

    logCompanyHolidayError("Failed to check company holiday", error, {
      companyId,
      date,
    });

    return false;
  }

  return data !== null;
}