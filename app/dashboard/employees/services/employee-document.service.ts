import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { EmployeeDocument } from "@/types/employee";

function firstOrNull<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export async function getEmployeeDocuments(
  employeeId: string
): Promise<EmployeeDocument[]> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("employee_documents")
    .select(`
      id,
      employee_id,
      file_name,
      extraction_status,
      expiration_date,
      confidence_score,
      created_at,
      document_type:document_types (
        id,
        name
      )
    `)
    .eq("employee_id", employeeId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch employee documents:", error);
    return [];
  }

  return (data ?? []).map((doc) => ({
    ...doc,
    file_name: doc.file_name ?? "Untitled document",
    document_type: firstOrNull(doc.document_type),
  })) as EmployeeDocument[];
}