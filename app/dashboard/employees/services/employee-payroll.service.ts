import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { EmployeePayroll } from "@/types/employee";

export async function getEmployeePayroll(
  employeeId: string
): Promise<EmployeePayroll[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("employee_payroll")
    .select("*")
    .eq("employee_id", employeeId)
    .order("pay_date", { ascending: false });

  if (error) {
    console.error("Failed to fetch employee payroll:", error);
    return [];
  }

  return (data ?? []) as EmployeePayroll[];
}