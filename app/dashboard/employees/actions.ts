import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getEmployees() {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("employees")
    .select(`
      id,
      employee_number,
      first_name,
      last_name,
      email,
      phone,
      job_title,
      employment_status,
      start_date,
      department:departments!employees_department_id_fkey (
        id,
        name
      ),
      location:locations!employees_location_id_fkey (
        id,
        name
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase employee fetch error:", JSON.stringify(error, null, 2));
    throw new Error(error.message || "Failed to fetch employees");
  }

  const employees = (data ?? []).map((employee) => ({
    ...employee,
    department: Array.isArray(employee.department)
      ? employee.department[0] ?? null
      : employee.department,
    location: Array.isArray(employee.location)
      ? employee.location[0] ?? null
      : employee.location,
  }));

  return employees;
}