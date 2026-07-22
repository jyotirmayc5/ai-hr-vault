"use server";

import { revalidatePath } from "next/cache";

import { createServerSupabaseClient } from "@/lib/supabase/server";

import type { AccrualMethod } from "./leave-policy.service";

export interface LeavePolicyActionState {
  success: boolean;
  message: string;
  validationErrors?: {
    company_id?: string[];
    policy_id?: string[];
    leave_type?: string[];
    annual_allocation?: string[];
    max_carry_over?: string[];
    max_accrual?: string[];
    accrual_method?: string[];
    waiting_period_days?: string[];
    region_code?: string[];
    general?: string[];
  };
}

interface LeavePolicyInput {
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
}

interface SupabaseErrorLike {
  message?: string;
  details?: string | null;
  hint?: string | null;
  code?: string | null;
}

type LeavePolicyValidationErrors = NonNullable<
  LeavePolicyActionState["validationErrors"]
>;

const VALID_ACCRUAL_METHODS = [
  "annual",
  "monthly",
  "biweekly",
  "weekly",
  "per_pay_period",
  "none",
] as const;

const INITIAL_STATE: LeavePolicyActionState = {
  success: false,
  message: "",
  validationErrors: {},
};

function getString(
  formData: FormData,
  fieldName: string,
): string {
  const value = formData.get(fieldName);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function getNullableString(
  formData: FormData,
  fieldName: string,
): string | null {
  const value = getString(formData, fieldName);

  return value.length > 0 ? value : null;
}

function getBoolean(
  formData: FormData,
  fieldName: string,
): boolean {
  const value = formData.get(fieldName);

  if (typeof value !== "string") {
    return false;
  }

  return ["true", "on", "1", "yes"].includes(
    value.toLowerCase(),
  );
}

function getNumber(
  formData: FormData,
  fieldName: string,
): number {
  const value = getString(formData, fieldName);

  if (!value) {
    return Number.NaN;
  }

  return Number(value);
}

function getNullableNumber(
  formData: FormData,
  fieldName: string,
): number | null {
  const value = getString(formData, fieldName);

  if (!value) {
    return null;
  }

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue)
    ? parsedValue
    : Number.NaN;
}

function isValidUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function normalizeLeaveType(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

function normalizeRegionCode(
  value: string | null,
): string | null {
  if (!value) {
    return null;
  }

  return value.trim().toUpperCase();
}

function isValidAccrualMethod(
  value: string,
): boolean {
  return VALID_ACCRUAL_METHODS.includes(
    value as (typeof VALID_ACCRUAL_METHODS)[number],
  );
}

function buildLeavePolicyInput(
  formData: FormData,
): LeavePolicyInput {
  const accrualMethodValue = getString(
    formData,
    "accrual_method",
  );

  return {
    companyId: getString(formData, "company_id"),

    leaveType: normalizeLeaveType(
      getString(formData, "leave_type"),
    ),

    annualAllocation: getNumber(
      formData,
      "annual_allocation",
    ),

    carryOverAllowed: getBoolean(
      formData,
      "carry_over_allowed",
    ),

    maxCarryOver: getNullableNumber(
      formData,
      "max_carry_over",
    ),

    maxAccrual: getNullableNumber(
      formData,
      "max_accrual",
    ),

    accrualMethod:
      accrualMethodValue as AccrualMethod,

    waitingPeriodDays: getNumber(
      formData,
      "waiting_period_days",
    ),

    allowHalfDay: getBoolean(
      formData,
      "allow_half_day",
    ),

    requiresManagerApproval: getBoolean(
      formData,
      "requires_manager_approval",
    ),

    requiresHrApproval: getBoolean(
      formData,
      "requires_hr_approval",
    ),

    active: getBoolean(formData, "active"),

    regionCode: normalizeRegionCode(
      getNullableString(formData, "region_code"),
    ),
  };
}

function validateLeavePolicyInput(
  input: LeavePolicyInput,
): LeavePolicyValidationErrors {
  const errors: LeavePolicyValidationErrors = {};

  if (!input.companyId) {
    errors.company_id = ["Company is required."];
  } else if (!isValidUuid(input.companyId)) {
    errors.company_id = ["Company ID is invalid."];
  }

  if (!input.leaveType) {
    errors.leave_type = ["Leave type is required."];
  } else if (input.leaveType.length > 100) {
    errors.leave_type = [
      "Leave type cannot exceed 100 characters.",
    ];
  }

  if (
    !Number.isFinite(input.annualAllocation) ||
    input.annualAllocation < 0
  ) {
    errors.annual_allocation = [
      "Annual allocation must be zero or greater.",
    ];
  }

  if (
    input.maxCarryOver !== null &&
    (!Number.isFinite(input.maxCarryOver) ||
      input.maxCarryOver < 0)
  ) {
    errors.max_carry_over = [
      "Maximum carry-over must be zero or greater.",
    ];
  }

  if (
    input.carryOverAllowed &&
    input.maxCarryOver === null
  ) {
    errors.max_carry_over = [
      "Enter a maximum carry-over amount.",
    ];
  }

  if (
    input.maxAccrual !== null &&
    (!Number.isFinite(input.maxAccrual) ||
      input.maxAccrual < 0)
  ) {
    errors.max_accrual = [
      "Maximum accrual must be zero or greater.",
    ];
  }

  if (
    input.maxAccrual !== null &&
    Number.isFinite(input.maxAccrual) &&
    Number.isFinite(input.annualAllocation) &&
    input.maxAccrual < input.annualAllocation
  ) {
    errors.max_accrual = [
      "Maximum accrual cannot be less than the annual allocation.",
    ];
  }

  if (
    !isValidAccrualMethod(
      String(input.accrualMethod),
    )
  ) {
    errors.accrual_method = [
      "Select a valid accrual method.",
    ];
  }

  if (
    !Number.isInteger(input.waitingPeriodDays) ||
    input.waitingPeriodDays < 0
  ) {
    errors.waiting_period_days = [
      "Waiting period must be a whole number of zero or greater.",
    ];
  }

  if (
    input.regionCode &&
    input.regionCode.length > 20
  ) {
    errors.region_code = [
      "Region code cannot exceed 20 characters.",
    ];
  }

  return errors;
}

function hasValidationErrors(
  errors: LeavePolicyActionState["validationErrors"],
): boolean {
  return Boolean(
    errors && Object.keys(errors).length > 0,
  );
}

function logSupabaseError(
  label: string,
  error: SupabaseErrorLike,
  context?: Record<string, unknown>,
): void {
  console.error(
    [
      label,
      context
        ? `context: ${JSON.stringify(context)}`
        : null,
      `message: ${error.message ?? "Unknown error"}`,
      `details: ${error.details ?? "None"}`,
      `hint: ${error.hint ?? "None"}`,
      `code: ${error.code ?? "None"}`,
    ]
      .filter(Boolean)
      .join(" | "),
  );
}

async function getAuthenticatedUserId(): Promise<
  string | null
> {
  const supabase =
    await createServerSupabaseClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    logSupabaseError(
      "Failed to authenticate leave-policy user",
      error,
    );

    return null;
  }

  return user?.id ?? null;
}

async function verifyUserCompanyAccess(
  userId: string,
  companyId: string,
): Promise<boolean> {
  const supabase =
    await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, company_id")
    .eq("id", userId)
    .eq("company_id", companyId)
    .maybeSingle();

  if (error) {
    logSupabaseError(
      "Failed to verify user company access",
      error,
      {
        userId,
        companyId,
      },
    );

    return false;
  }

  return Boolean(data);
}

async function leavePolicyAlreadyExists({
  companyId,
  leaveType,
  regionCode,
  excludePolicyId,
}: {
  companyId: string;
  leaveType: string;
  regionCode: string | null;
  excludePolicyId?: string;
}): Promise<boolean> {
  const supabase =
    await createServerSupabaseClient();

  let query = supabase
    .from("leave_policies")
    .select("id")
    .eq("company_id", companyId)
    .eq("leave_type", leaveType);

  if (regionCode) {
    query = query.eq("region_code", regionCode);
  } else {
    query = query.is("region_code", null);
  }

  if (excludePolicyId) {
    query = query.neq("id", excludePolicyId);
  }

  const { data, error } = await query.limit(1);

  if (error) {
    logSupabaseError(
      "Failed to check for duplicate leave policy",
      error,
      {
        companyId,
        leaveType,
        regionCode,
        excludePolicyId,
      },
    );

    return false;
  }

  return Boolean(data && data.length > 0);
}

async function createLeavePolicyAuditLog({
  companyId,
  action,
  policyId,
  leaveType,
  performedBy,
}: {
  companyId: string;
  action: string;
  policyId: string;
  leaveType: string;
  performedBy: string;
}): Promise<void> {
  const supabase =
    await createServerSupabaseClient();

  const { error } = await supabase
    .from("employee_audit_logs")
    .insert({
      action,
      entity_type: "leave_policy",
      entity_id: policyId,
      description: `${action}: ${leaveType} leave policy`,
      metadata: {
        company_id: companyId,
        policy_id: policyId,
        leave_type: leaveType,
        performed_by: performedBy,
      },
    });

  if (error) {
    logSupabaseError(
      "Leave policy saved, but audit log creation failed",
      error,
      {
        companyId,
        policyId,
        action,
      },
    );
  }
}

async function requireCompanyAccess({
  userId,
  companyId,
}: {
  userId: string;
  companyId: string;
}): Promise<LeavePolicyActionState | null> {
  const hasAccess = await verifyUserCompanyAccess(
    userId,
    companyId,
  );

  if (hasAccess) {
    return null;
  }

  return {
    success: false,
    message:
      "You do not have access to the selected company.",
    validationErrors: {
      company_id: [
        "Your account is not assigned to this company.",
      ],
    },
  };
}

export async function createLeavePolicy(
  _previousState: LeavePolicyActionState =
    INITIAL_STATE,
  formData: FormData,
): Promise<LeavePolicyActionState> {
  const input = buildLeavePolicyInput(formData);

  const validationErrors =
    validateLeavePolicyInput(input);

  if (hasValidationErrors(validationErrors)) {
    return {
      success: false,
      message:
        "Please correct the highlighted fields.",
      validationErrors,
    };
  }

  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return {
      success: false,
      message:
        "You must be signed in to create a leave policy.",
      validationErrors: {
        general: ["Authentication is required."],
      },
    };
  }

  const companyAccessError =
    await requireCompanyAccess({
      userId,
      companyId: input.companyId,
    });

  if (companyAccessError) {
    return companyAccessError;
  }

  const duplicateExists =
    await leavePolicyAlreadyExists({
      companyId: input.companyId,
      leaveType: input.leaveType,
      regionCode: input.regionCode,
    });

  if (duplicateExists) {
    return {
      success: false,
      message:
        "A leave policy already exists for this company, leave type, and region.",
      validationErrors: {
        leave_type: [
          "This leave policy already exists.",
        ],
      },
    };
  }

  const supabase =
    await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("leave_policies")
    .insert({
      company_id: input.companyId,
      leave_type: input.leaveType,
      annual_allocation:
        input.annualAllocation,
      carry_over_allowed:
        input.carryOverAllowed,
      max_carry_over: input.carryOverAllowed
        ? input.maxCarryOver
        : null,
      max_accrual: input.maxAccrual,
      accrual_method: input.accrualMethod,
      waiting_period_days:
        input.waitingPeriodDays,
      allow_half_day: input.allowHalfDay,
      requires_manager_approval:
        input.requiresManagerApproval,
      requires_hr_approval:
        input.requiresHrApproval,
      active: input.active,
      region_code: input.regionCode,
    })
    .select("id")
    .single();

  if (error) {
    logSupabaseError(
      "Failed to create leave policy",
      error,
      {
        companyId: input.companyId,
        leaveType: input.leaveType,
        regionCode: input.regionCode,
      },
    );

    if (error.code === "23505") {
      return {
        success: false,
        message:
          "A matching leave policy already exists.",
        validationErrors: {
          leave_type: [
            "A policy already exists for this leave type and region.",
          ],
        },
      };
    }

    return {
      success: false,
      message:
        error.message ||
        "The leave policy could not be created.",
      validationErrors: {
        general: [
          "An unexpected database error occurred.",
        ],
      },
    };
  }

  await createLeavePolicyAuditLog({
    companyId: input.companyId,
    action: "Leave policy created",
    policyId: data.id,
    leaveType: input.leaveType,
    performedBy: userId,
  });

  revalidatePath(
    "/dashboard/settings/leave-policies",
  );
  revalidatePath("/dashboard/leave");

  return {
    success: true,
    message:
      "Leave policy created successfully.",
    validationErrors: {},
  };
}

export async function updateLeavePolicy(
  _previousState: LeavePolicyActionState =
    INITIAL_STATE,
  formData: FormData,
): Promise<LeavePolicyActionState> {
  const policyId = getString(
    formData,
    "policy_id",
  );

  const input = buildLeavePolicyInput(formData);

  const validationErrors =
    validateLeavePolicyInput(input);

  if (!policyId) {
    validationErrors.policy_id = [
      "Leave policy ID is required.",
    ];
  } else if (!isValidUuid(policyId)) {
    validationErrors.policy_id = [
      "Leave policy ID is invalid.",
    ];
  }

  if (hasValidationErrors(validationErrors)) {
    return {
      success: false,
      message:
        "Please correct the highlighted fields.",
      validationErrors,
    };
  }

  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return {
      success: false,
      message:
        "You must be signed in to update a leave policy.",
      validationErrors: {
        general: ["Authentication is required."],
      },
    };
  }

  const companyAccessError =
    await requireCompanyAccess({
      userId,
      companyId: input.companyId,
    });

  if (companyAccessError) {
    return companyAccessError;
  }

  const supabase =
    await createServerSupabaseClient();

  const {
    data: existingPolicy,
    error: existingError,
  } = await supabase
    .from("leave_policies")
    .select("id, company_id")
    .eq("id", policyId)
    .eq("company_id", input.companyId)
    .maybeSingle();

  if (existingError) {
    logSupabaseError(
      "Failed to verify leave policy before update",
      existingError,
      {
        policyId,
        companyId: input.companyId,
      },
    );

    return {
      success: false,
      message:
        "The leave policy could not be verified.",
      validationErrors: {
        general: [
          "An unexpected database error occurred.",
        ],
      },
    };
  }

  if (!existingPolicy) {
    return {
      success: false,
      message: "Leave policy not found.",
      validationErrors: {
        policy_id: [
          "The selected leave policy no longer exists.",
        ],
      },
    };
  }

  const duplicateExists =
    await leavePolicyAlreadyExists({
      companyId: input.companyId,
      leaveType: input.leaveType,
      regionCode: input.regionCode,
      excludePolicyId: policyId,
    });

  if (duplicateExists) {
    return {
      success: false,
      message:
        "Another leave policy already exists for this company, leave type, and region.",
      validationErrors: {
        leave_type: [
          "A matching leave policy already exists.",
        ],
      },
    };
  }

  const { data, error } = await supabase
    .from("leave_policies")
    .update({
      leave_type: input.leaveType,
      annual_allocation:
        input.annualAllocation,
      carry_over_allowed:
        input.carryOverAllowed,
      max_carry_over: input.carryOverAllowed
        ? input.maxCarryOver
        : null,
      max_accrual: input.maxAccrual,
      accrual_method: input.accrualMethod,
      waiting_period_days:
        input.waitingPeriodDays,
      allow_half_day: input.allowHalfDay,
      requires_manager_approval:
        input.requiresManagerApproval,
      requires_hr_approval:
        input.requiresHrApproval,
      active: input.active,
      region_code: input.regionCode,
      updated_at: new Date().toISOString(),
    })
    .eq("id", policyId)
    .eq("company_id", input.companyId)
    .select("id")
    .maybeSingle();

  if (error) {
    logSupabaseError(
      "Failed to update leave policy",
      error,
      {
        policyId,
        companyId: input.companyId,
      },
    );

    if (error.code === "23505") {
      return {
        success: false,
        message:
          "A matching leave policy already exists.",
        validationErrors: {
          leave_type: [
            "A policy already exists for this leave type and region.",
          ],
        },
      };
    }

    return {
      success: false,
      message:
        error.message ||
        "The leave policy could not be updated.",
      validationErrors: {
        general: [
          "An unexpected database error occurred.",
        ],
      },
    };
  }

  if (!data) {
    return {
      success: false,
      message:
        "The leave policy could not be updated.",
      validationErrors: {
        policy_id: [
          "The selected leave policy was not found.",
        ],
      },
    };
  }

  await createLeavePolicyAuditLog({
    companyId: input.companyId,
    action: "Leave policy updated",
    policyId,
    leaveType: input.leaveType,
    performedBy: userId,
  });

  revalidatePath(
    "/dashboard/settings/leave-policies",
  );
  revalidatePath("/dashboard/leave");

  return {
    success: true,
    message:
      "Leave policy updated successfully.",
    validationErrors: {},
  };
}

export async function toggleLeavePolicyStatus(
  policyId: string,
  companyId: string,
  active: boolean,
): Promise<LeavePolicyActionState> {
  if (!isValidUuid(policyId)) {
    return {
      success: false,
      message: "Leave policy ID is invalid.",
      validationErrors: {
        policy_id: [
          "Leave policy ID is invalid.",
        ],
      },
    };
  }

  if (!isValidUuid(companyId)) {
    return {
      success: false,
      message: "Company ID is invalid.",
      validationErrors: {
        company_id: ["Company ID is invalid."],
      },
    };
  }

  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return {
      success: false,
      message:
        "You must be signed in to update a leave policy.",
      validationErrors: {
        general: ["Authentication is required."],
      },
    };
  }

  const companyAccessError =
    await requireCompanyAccess({
      userId,
      companyId,
    });

  if (companyAccessError) {
    return companyAccessError;
  }

  const supabase =
    await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("leave_policies")
    .update({
      active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", policyId)
    .eq("company_id", companyId)
    .select("id, leave_type")
    .maybeSingle();

  if (error) {
    logSupabaseError(
      "Failed to update leave policy status",
      error,
      {
        policyId,
        companyId,
        active,
      },
    );

    return {
      success: false,
      message:
        error.message ||
        "The leave policy status could not be updated.",
      validationErrors: {
        general: [
          "An unexpected database error occurred.",
        ],
      },
    };
  }

  if (!data) {
    return {
      success: false,
      message: "Leave policy not found.",
      validationErrors: {
        policy_id: [
          "The selected leave policy could not be found.",
        ],
      },
    };
  }

  await createLeavePolicyAuditLog({
    companyId,
    action: active
      ? "Leave policy activated"
      : "Leave policy deactivated",
    policyId,
    leaveType: data.leave_type,
    performedBy: userId,
  });

  revalidatePath(
    "/dashboard/settings/leave-policies",
  );
  revalidatePath("/dashboard/leave");

  return {
    success: true,
    message: active
      ? "Leave policy activated successfully."
      : "Leave policy deactivated successfully.",
    validationErrors: {},
  };
}

export async function deleteLeavePolicy(
  policyId: string,
  companyId: string,
): Promise<LeavePolicyActionState> {
  if (!isValidUuid(policyId)) {
    return {
      success: false,
      message: "Leave policy ID is invalid.",
      validationErrors: {
        policy_id: [
          "Leave policy ID is invalid.",
        ],
      },
    };
  }

  if (!isValidUuid(companyId)) {
    return {
      success: false,
      message: "Company ID is invalid.",
      validationErrors: {
        company_id: ["Company ID is invalid."],
      },
    };
  }

  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return {
      success: false,
      message:
        "You must be signed in to delete a leave policy.",
      validationErrors: {
        general: ["Authentication is required."],
      },
    };
  }

  const companyAccessError =
    await requireCompanyAccess({
      userId,
      companyId,
    });

  if (companyAccessError) {
    return companyAccessError;
  }

  const supabase =
    await createServerSupabaseClient();

  const { data: policy, error: loadError } =
    await supabase
      .from("leave_policies")
      .select("id, leave_type")
      .eq("id", policyId)
      .eq("company_id", companyId)
      .maybeSingle();

  if (loadError) {
    logSupabaseError(
      "Failed to load leave policy before deletion",
      loadError,
      {
        policyId,
        companyId,
      },
    );

    return {
      success: false,
      message:
        "The leave policy could not be verified.",
      validationErrors: {
        general: [
          "An unexpected database error occurred.",
        ],
      },
    };
  }

  if (!policy) {
    return {
      success: false,
      message: "Leave policy not found.",
      validationErrors: {
        policy_id: [
          "The selected leave policy could not be found.",
        ],
      },
    };
  }

  const { error } = await supabase
    .from("leave_policies")
    .delete()
    .eq("id", policyId)
    .eq("company_id", companyId);

  if (error) {
    logSupabaseError(
      "Failed to delete leave policy",
      error,
      {
        policyId,
        companyId,
      },
    );

    return {
      success: false,
      message:
        error.message ||
        "The leave policy could not be deleted.",
      validationErrors: {
        general: [
          "An unexpected database error occurred.",
        ],
      },
    };
  }

  await createLeavePolicyAuditLog({
    companyId,
    action: "Leave policy deleted",
    policyId,
    leaveType: policy.leave_type,
    performedBy: userId,
  });

  revalidatePath(
    "/dashboard/settings/leave-policies",
  );
  revalidatePath("/dashboard/leave");

  return {
    success: true,
    message:
      "Leave policy deleted successfully.",
    validationErrors: {},
  };
}