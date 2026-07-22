import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export type AccrualMethod =
  | "annual"
  | "monthly"
  | "per_pay_period";

export interface LeavePolicy {
  id: string;
  companyId: string;
  leaveType: string;
  annualAllocation: number;
  carryOverAllowed: boolean;
  maxCarryOver: number | null;
  maxAccrual: number | null;
  accrualMethod: AccrualMethod;
  waitingPeriodDays: number;
  allowHalfDay: boolean;
  requiresManagerApproval: boolean;
  requiresHrApproval: boolean;
  active: boolean;
  regionCode: string | null;
  createdAt: string;
  updatedAt: string;
}

interface LeavePolicyRow {
  id: string;
  company_id: string;
  leave_type: string;
  annual_allocation: number;
  carry_over_allowed: boolean;
  max_carry_over: number | null;
  max_accrual: number | null;
  accrual_method: AccrualMethod;
  waiting_period_days: number;
  allow_half_day: boolean;
  requires_manager_approval: boolean;
  requires_hr_approval: boolean;
  active: boolean;
  region_code: string | null;
  created_at: string;
  updated_at: string;
}

function mapPolicy(row: LeavePolicyRow): LeavePolicy {
  return {
    id: row.id,
    companyId: row.company_id,
    leaveType: row.leave_type,
    annualAllocation: Number(row.annual_allocation),
    carryOverAllowed: row.carry_over_allowed,
    maxCarryOver: row.max_carry_over,
    maxAccrual: row.max_accrual,
    accrualMethod: row.accrual_method,
    waitingPeriodDays: row.waiting_period_days,
    allowHalfDay: row.allow_half_day,
    requiresManagerApproval: row.requires_manager_approval,
    requiresHrApproval: row.requires_hr_approval,
    active: row.active,
    regionCode: row.region_code,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getLeavePolicies(
  companyId: string,
): Promise<LeavePolicy[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("leave_policies")
    .select("*")
    .eq("company_id", companyId)
    .order("leave_type");

  if (error) {
    console.error("Failed to load leave policies", {
      companyId,
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    return [];
  }

  return ((data ?? []) as LeavePolicyRow[]).map(mapPolicy);
}

export async function getLeavePolicy(
  companyId: string,
  leaveType: string,
  regionCode?: string | null,
): Promise<LeavePolicy | null> {
  const supabase = await createServerSupabaseClient();

  let query = supabase
    .from("leave_policies")
    .select("*")
    .eq("company_id", companyId)
    .eq("leave_type", leaveType)
    .eq("active", true);

  if (regionCode) {
    query = query.eq("region_code", regionCode);
  } else {
    query = query.is("region_code", null);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error("Failed to load leave policy", {
      companyId,
      leaveType,
      regionCode,
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    return null;
  }

  if (!data) {
    return null;
  }

  return mapPolicy(data as LeavePolicyRow);
}

export async function getVacationPolicy(
  companyId: string,
): Promise<LeavePolicy | null> {
  return getLeavePolicy(companyId, "vacation");
}

export async function getSickPolicy(
  companyId: string,
): Promise<LeavePolicy | null> {
  return getLeavePolicy(companyId, "sick");
}

export async function getPersonalPolicy(
  companyId: string,
): Promise<LeavePolicy | null> {
  return getLeavePolicy(companyId, "personal");
}