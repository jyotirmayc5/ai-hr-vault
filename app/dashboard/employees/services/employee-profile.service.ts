import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

import type {
  Employee,
  EmployeeCompensation,
  EmployeeLeave,
  EmployeeProfile,
  EmployeeReview,
} from "@/types/employee";

import { getEmployeeAssets } from "./employee-asset.service";
import { getEmployeeEmergencyContacts } from "./employee-emergency-contact.service";

function firstOrNull<T>(
  value: T | T[] | null | undefined,
): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function logSupabaseError(
  label: string,
  error: {
    message?: string;
    details?: string;
    hint?: string;
    code?: string;
  } | null,
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

export async function getEmployee(
  employeeId: string,
): Promise<Employee> {
  if (!employeeId || employeeId === "undefined") {
    throw new Error("A valid employee ID is required.");
  }

  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("employees")
    .select(`
      id,
      company_id,
      employee_number,
      first_name,
      last_name,
      email,
      phone,
      job_title,
      employment_status,
      start_date,
      termination_date,
      manager_id,
      department:departments!employees_department_id_fkey (
        id,
        name
      ),
      location:locations!employees_location_id_fkey (
        id,
        name
      )
    `)
    .eq("id", employeeId)
    .maybeSingle();

  if (error) {
    logSupabaseError("Failed to fetch employee:", error, {
      employeeId,
    });

    throw new Error(`Failed to fetch employee: ${error.message}`);
  }

  if (!data) {
    throw new Error("Employee not found.");
  }

  let manager: {
    id: string;
    first_name: string;
    last_name: string;
    job_title: string | null;
  } | null = null;

  if (data.manager_id) {
    const { data: managerData, error: managerError } =
      await supabase
        .from("employees")
        .select(`
          id,
          first_name,
          last_name,
          job_title
        `)
        .eq("id", data.manager_id)
        .maybeSingle();

    if (managerError) {
      logSupabaseError(
        "Failed to fetch employee manager:",
        managerError,
        {
          employeeId,
          managerId: data.manager_id,
        },
      );
    } else {
      manager = managerData ?? null;
    }
  }

  return {
    ...data,
    department: firstOrNull(data.department),
    location: firstOrNull(data.location),
    manager,
  } as Employee;
}

export async function getEmployeeLeave(
  employeeId: string,
): Promise<EmployeeLeave[]> {
  if (!employeeId || employeeId === "undefined") {
    return [];
  }

  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("employee_leave_requests")
    .select("*")
    .eq("employee_id", employeeId)
    .order("start_date", {
      ascending: false,
      nullsFirst: false,
    });

  if (error) {
    logSupabaseError("Failed to fetch employee leave:", error, {
      employeeId,
    });

    return [];
  }

  return (data ?? []) as EmployeeLeave[];
}

export async function getEmployeeTraining(employeeId: string) {
  if (!employeeId || employeeId === "undefined") {
    return [];
  }

  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("employee_training")
    .select("*")
    .eq("employee_id", employeeId)
    .order("due_date", {
      ascending: true,
      nullsFirst: false,
    });

  if (error) {
    logSupabaseError(
      "Failed to fetch employee training:",
      error,
      {
        employeeId,
      },
    );

    return [];
  }

  return data ?? [];
}

export async function getEmployeePerformance(
  employeeId: string,
): Promise<EmployeeReview[]> {
  if (!employeeId || employeeId === "undefined") {
    return [];
  }

  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("employee_performance_reviews")
    .select("*")
    .eq("employee_id", employeeId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    logSupabaseError(
      "Failed to fetch employee performance:",
      error,
      {
        employeeId,
      },
    );

    return [];
  }

  return (data ?? []) as EmployeeReview[];
}

export async function getEmployeeCompensation(
  employeeId: string,
): Promise<EmployeeCompensation[]> {
  if (!employeeId || employeeId === "undefined") {
    return [];
  }

  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("employee_compensation")
    .select("*")
    .eq("employee_id", employeeId)
    .order("effective_start_date", {
      ascending: false,
      nullsFirst: false,
    })
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    logSupabaseError(
      "Failed to fetch employee compensation:",
      error,
      {
        employeeId,
      },
    );

    return [];
  }

  return (data ?? []) as EmployeeCompensation[];
}

async function getEmployeeDocumentCount(
  employeeId: string,
): Promise<number> {
  if (!employeeId || employeeId === "undefined") {
    return 0;
  }

  const supabase = await createServerSupabaseClient();

  const { count, error } = await supabase
    .from("employee_documents")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("employee_id", employeeId);

  if (error) {
    logSupabaseError(
      "Failed to count employee documents:",
      error,
      {
        employeeId,
      },
    );

    return 0;
  }

  return count ?? 0;
}

export async function getEmployeeProfile(
  employeeId: string,
): Promise<EmployeeProfile | null> {
  if (!employeeId || employeeId === "undefined") {
    return null;
  }

  try {
    const [
      employee,
      compensation,
      documentCount,
      leave,
      assets,
      training,
      performance,
      emergencyContacts,
    ] = await Promise.all([
      getEmployee(employeeId),
      getEmployeeCompensation(employeeId),
      getEmployeeDocumentCount(employeeId),
      getEmployeeLeave(employeeId),
      getEmployeeAssets(employeeId),
      getEmployeeTraining(employeeId),
      getEmployeePerformance(employeeId),
      getEmployeeEmergencyContacts(employeeId),
    ]);

    const latestCompensation =
      compensation.find(
        (item) => item.effective_end_date === null,
      ) ??
      compensation[0] ??
      null;

    const latestPerformance = performance[0] ?? null;

    const approvedLeaveCount = leave.filter(
      (item) =>
        item.status?.toLowerCase().trim() === "approved",
    ).length;

    const completedTrainingCount = training.filter(
      (item) =>
        typeof item.status === "string" &&
        item.status.toLowerCase().trim() === "completed",
    ).length;

    return {
      employee,
      latestCompensation,
      latestPerformance,
      emergencyContacts,
      leave,
      summary: {
        documentCount,
        leaveRequestCount: leave.length,
        approvedLeaveCount,
        assetCount: assets.length,
        trainingCount: training.length,
        completedTrainingCount,
        performanceReviewCount: performance.length,
      },
    };
  } catch (error) {
    console.error("Failed to fetch employee profile:", {
      employeeId,
      message:
        error instanceof Error
          ? error.message
          : "Unknown employee profile error",
      error,
    });

    return null;
  }
}