import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getEmployees() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    console.error("Employee authentication error:", {
      message: authError.message,
      status: authError.status,
    });

    throw new Error("Your login session could not be verified.");
  }

  if (!user) {
    console.error("Employee authentication error: no signed-in user");

    throw new Error(
      "You are not signed in. Please log out and log back in.",
    );
  }

  console.log("Loading employees for user:", {
    userId: user.id,
    email: user.email,
  });

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
      department:departments!employees_department_id_fkey (
        id,
        name
      ),
      location:locations!employees_location_id_fkey (
        id,
        name
      )
    `)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error("Supabase employee fetch error:", {
      userId: user.id,
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    throw new Error(
      error.message || "Failed to fetch employees.",
    );
  }

  console.log("Employee query completed:", {
    userId: user.id,
    employeeCount: data?.length ?? 0,
  });

  return (data ?? []).map((employee) => ({
    ...employee,

    department: Array.isArray(employee.department)
      ? employee.department[0] ?? null
      : employee.department,

    location: Array.isArray(employee.location)
      ? employee.location[0] ?? null
      : employee.location,
  }));
}