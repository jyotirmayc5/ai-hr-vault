import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { EmployeeAuditLog } from "@/types/employee";

interface GetEmployeeAuditLogOptions {
  limit?: number;
}

/**
 * Returns audit activity for a specific employee.
 *
 * The most recent activity is returned first.
 */
export async function getEmployeeAuditLog(
  employeeId: string,
  options: GetEmployeeAuditLogOptions = {},
): Promise<EmployeeAuditLog[]> {
  if (!employeeId || employeeId === "undefined") {
    return [];
  }

  const limit = normalizeLimit(options.limit);

  const supabase = await createServerSupabaseClient();

  let query = supabase
    .from("employee_audit_logs")
    .select("*")
    .eq("employee_id", employeeId)
    .order("created_at", {
      ascending: false,
    });

  if (limit !== null) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to load employee audit log:", {
      employeeId,
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    throw new Error(`Failed to load employee audit log: ${error.message}`);
  }

  return (data ?? []) as EmployeeAuditLog[];
}

/**
 * Returns recent audit activity for the employee overview page.
 */
export async function getEmployeeRecentActivity(
  employeeId: string,
  limit = 10,
): Promise<EmployeeAuditLog[]> {
  return getEmployeeAuditLog(employeeId, {
    limit,
  });
}

/**
 * Returns a single audit entry.
 */
export async function getEmployeeAuditLogById(
  auditLogId: string,
): Promise<EmployeeAuditLog | null> {
  if (!auditLogId || auditLogId === "undefined") {
    return null;
  }

  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("employee_audit_logs")
    .select("*")
    .eq("id", auditLogId)
    .maybeSingle();

  if (error) {
    console.error("Failed to load employee audit entry:", {
      auditLogId,
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    throw new Error(`Failed to load employee audit entry: ${error.message}`);
  }

  return data ? (data as EmployeeAuditLog) : null;
}

function normalizeLimit(limit: number | undefined): number | null {
  if (limit === undefined) {
    return null;
  }

  if (!Number.isFinite(limit)) {
    return null;
  }

  const normalizedLimit = Math.floor(limit);

  if (normalizedLimit <= 0) {
    return null;
  }

  return Math.min(normalizedLimit, 100);
}