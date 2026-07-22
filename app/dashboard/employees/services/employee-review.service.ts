import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { EmployeeReview } from "@/types/employee";

export async function getEmployeeReviews(
  employeeId: string
): Promise<EmployeeReview[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("employee_reviews")
    .select("*")
    .eq("employee_id", employeeId)
    .order("review_date", { ascending: false });

  if (error) {
    console.error("Failed to fetch employee reviews:", error);
    return [];
  }

  return (data ?? []) as EmployeeReview[];
}