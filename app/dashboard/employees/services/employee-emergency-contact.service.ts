import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

import type {
  EmployeeEmergencyContact,
} from "@/types/employee";

function logSupabaseError(
  label: string,
  error: {
    message?: string;
    details?: string;
    hint?: string;
    code?: string;
  },
  context?: Record<string, unknown>,
): void {
  console.error(label, {
    ...context,
    message: error.message ?? "Unknown Supabase error",
    details: error.details ?? null,
    hint: error.hint ?? null,
    code: error.code ?? null,
  });
}

export async function getEmployeeEmergencyContacts(
  employeeId: string,
): Promise<EmployeeEmergencyContact[]> {
  if (!employeeId || employeeId === "undefined") {
    return [];
  }

  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("employee_emergency_contacts")
    .select("*")
    .eq("employee_id", employeeId)
    .order("is_primary", {
      ascending: false,
    })
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    logSupabaseError(
      "Failed to load employee emergency contacts:",
      error,
      {
        employeeId,
        table: "employee_emergency_contacts",
      },
    );

    return [];
  }

  return (data ?? []) as EmployeeEmergencyContact[];
}

export async function getEmployeePrimaryEmergencyContact(
  employeeId: string,
): Promise<EmployeeEmergencyContact | null> {
  const contacts =
    await getEmployeeEmergencyContacts(employeeId);

  return (
    contacts.find((contact) => contact.is_primary) ??
    contacts[0] ??
    null
  );
}

export async function getEmployeeEmergencyContactById(
  contactId: string,
): Promise<EmployeeEmergencyContact | null> {
  if (!contactId || contactId === "undefined") {
    return null;
  }

  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("employee_emergency_contacts")
    .select("*")
    .eq("id", contactId)
    .maybeSingle();

  if (error) {
    logSupabaseError(
      "Failed to load employee emergency contact:",
      error,
      {
        contactId,
        table: "employee_emergency_contacts",
      },
    );

    return null;
  }

  return data
    ? (data as EmployeeEmergencyContact)
    : null;
}