import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { EmployeeCompensation } from "@/types/employee";

export async function getEmployeeCompensation(
  employeeId: string
): Promise<EmployeeCompensation[]> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("employee_compensation")
    .select("*")
    .eq("employee_id", employeeId)
    .order("effective_start_date", { ascending: false });

  if (error) {
    console.error("Error fetching employee compensation:", error);
    return [];
  }

  return data as EmployeeCompensation[];
}