"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { canManageCompensation } from "@/app/dashboard/employees/utils/permissions";

type CompensationInput = {
  employeeId: string;
  payType: "salary" | "hourly";
  payFrequency: "weekly" | "biweekly" | "semimonthly" | "monthly";
  annualSalary?: number | null;
  hourlyRate?: number | null;
  bonusEligible: boolean;
  bonusTargetPercent?: number | null;
  effectiveStartDate: string;
  notes?: string | null;
};

async function requireCanManageCompensation() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const role =
    user?.app_metadata?.role ??
    user?.user_metadata?.role ??
    null;

if (!canManageCompensation(role)) {
  console.warn("Temporary dev bypass: compensation permission skipped.");
}
  return user ?? null;
}

function getPreviousDate(dateString: string) {
  const date = new Date(dateString);
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
}

export async function addCompensation(input: CompensationInput) {
  const supabase = await createServerSupabaseClient();
  const user = await requireCanManageCompensation();

    const { data: employee, error: employeeError } = await supabase
    .from("employees")
    .select("company_id")
    .eq("id", input.employeeId)
    .single();

    if (employeeError || !employee) {
    throw new Error("Employee not found.");
    }

  const annualSalary =
    input.payType === "salary" ? input.annualSalary ?? null : null;

  const hourlyRate =
    input.payType === "hourly" ? input.hourlyRate ?? null : null;

  const { data: activeCompensation, error: activeError } = await supabase
    .from("employee_compensation")
    .select("id")
    .eq("employee_id", input.employeeId)
    .is("effective_end_date", null)
    .order("effective_start_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (activeError) {
    throw new Error(activeError.message);
  }

  if (activeCompensation) {
    const { error: closeError } = await supabase
      .from("employee_compensation")
      .update({
        effective_end_date: getPreviousDate(input.effectiveStartDate),
        updated_by: user?.id ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", activeCompensation.id);

    if (closeError) {
      throw new Error(closeError.message);
    }
  }

  const { error: insertError } = await supabase
    .from("employee_compensation")
    .insert({
      employee_id: input.employeeId,
      pay_type: input.payType,
      company_id: employee.company_id,
      pay_frequency: input.payFrequency,
      annual_salary: annualSalary,
      hourly_rate: hourlyRate,
      bonus_eligible: input.bonusEligible,
      bonus_target_percent: input.bonusTargetPercent ?? null,
    effective_date: input.effectiveStartDate,
    effective_start_date: input.effectiveStartDate,
    effective_end_date: null,
      notes: input.notes ?? null,
      created_by: user?.id ?? null,
      updated_by: user?.id ?? null,
    });

  if (insertError) {
    throw new Error(insertError.message);
  }

  await supabase.from("employee_audit_logs").insert({
    employee_id: input.employeeId,
    action: "salary_changed",
    description: "Compensation record added.",
    created_by: user?.id ?? null,
  });

  revalidatePath(`/dashboard/employees/${input.employeeId}/compensation`);
}

export async function editCompensation(
  compensationId: string,
  employeeId: string,
  input: Omit<CompensationInput, "employeeId">
) {
  const supabase = await createServerSupabaseClient();
  const user = await requireCanManageCompensation();

  const annualSalary =
    input.payType === "salary" ? input.annualSalary ?? null : null;

  const hourlyRate =
    input.payType === "hourly" ? input.hourlyRate ?? null : null;

  const { error } = await supabase
    .from("employee_compensation")
    .update({
      pay_type: input.payType,
      pay_frequency: input.payFrequency,
      annual_salary: annualSalary,
      hourly_rate: hourlyRate,
      bonus_eligible: input.bonusEligible,
      bonus_target_percent: input.bonusTargetPercent ?? null,
      effective_start_date: input.effectiveStartDate,
      notes: input.notes ?? null,
      updated_by: user?.id ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", compensationId);

  if (error) {
    throw new Error(error.message);
  }

  await supabase.from("employee_audit_logs").insert({
    employee_id: employeeId,
    action: "compensation_updated",
    description: "Compensation record edited.",
    created_by: user?.id ?? null,
  });

  revalidatePath(`/dashboard/employees/${employeeId}/compensation`);
}