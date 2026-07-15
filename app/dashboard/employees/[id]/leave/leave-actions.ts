"use server";

import { revalidatePath } from "next/cache";

import { createServerSupabaseClient } from "@/lib/supabase/server";

import type { LeaveRequestStatus } from "@/app/dashboard/employees/services/employee-leave.service";

export interface LeaveRequestValidationErrors {
  leave_type?: string[];
  start_date?: string[];
  end_date?: string[];
  reason?: string[];
  status?: string[];
  rejection_reason?: string[];
  general?: string[];
}

export interface LeaveRequestActionState {
  success: boolean;
  message: string | null;
  validationErrors?: LeaveRequestValidationErrors;
}

interface EmployeeContext {
  employeeId: string;
  companyId: string;
  employeeName: string;
}

interface LeaveRequestInput {
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string | null;
  status: LeaveRequestStatus;
  rejectionReason: string | null;
}

interface ExistingLeaveRequest {
  id: string;
  company_id: string;
  employee_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  total_days: number | string | null;
  reason: string | null;
  status: string | null;
  rejection_reason: string | null;
}

const allowedLeaveTypes = new Set<string>([
  "vacation",
  "sick",
  "personal",
  "bereavement",
  "parental",
  "medical",
  "jury_duty",
  "unpaid",
  "other",
]);

const allowedStatuses = new Set<LeaveRequestStatus>([
  "pending",
  "approved",
  "rejected",
  "cancelled",
]);

function getStringValue(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function emptyStringToNull(value: string): string | null {
  return value.length > 0 ? value : null;
}

function isValidDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return date.toISOString().slice(0, 10) === value;
}

function parseDate(value: string): Date {
  return new Date(`${value}T00:00:00Z`);
}

function calculateCalendarDays(
  startDate: string,
  endDate: string,
): number {
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  const millisecondsPerDay = 24 * 60 * 60 * 1000;

  return (
    Math.floor(
      (end.getTime() - start.getTime()) / millisecondsPerDay,
    ) + 1
  );
}

function normalizeStatus(value: string): LeaveRequestStatus {
  if (allowedStatuses.has(value as LeaveRequestStatus)) {
    return value as LeaveRequestStatus;
  }

  return "pending";
}

function formatLeaveType(value: string): string {
  return value
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

function buildValidationErrors(
  input: LeaveRequestInput,
): LeaveRequestValidationErrors {
  const validationErrors: LeaveRequestValidationErrors = {};

  if (!input.leaveType) {
    validationErrors.leave_type = ["Leave type is required."];
  } else if (!allowedLeaveTypes.has(input.leaveType)) {
    validationErrors.leave_type = ["Select a valid leave type."];
  }

  if (!input.startDate) {
    validationErrors.start_date = ["Start date is required."];
  } else if (!isValidDateString(input.startDate)) {
    validationErrors.start_date = ["Enter a valid start date."];
  }

  if (!input.endDate) {
    validationErrors.end_date = ["End date is required."];
  } else if (!isValidDateString(input.endDate)) {
    validationErrors.end_date = ["Enter a valid end date."];
  }

  if (
    isValidDateString(input.startDate) &&
    isValidDateString(input.endDate) &&
    parseDate(input.endDate).getTime() <
      parseDate(input.startDate).getTime()
  ) {
    validationErrors.end_date = [
      "End date cannot be before the start date.",
    ];
  }

  if (input.reason && input.reason.length > 1000) {
    validationErrors.reason = [
      "Reason cannot be longer than 1,000 characters.",
    ];
  }

  if (!allowedStatuses.has(input.status)) {
    validationErrors.status = ["Select a valid status."];
  }

  if (input.status === "rejected" && !input.rejectionReason) {
    validationErrors.rejection_reason = [
      "A rejection reason is required when rejecting leave.",
    ];
  }

  if (
    input.rejectionReason &&
    input.rejectionReason.length > 1000
  ) {
    validationErrors.rejection_reason = [
      "Rejection reason cannot be longer than 1,000 characters.",
    ];
  }

  return validationErrors;
}

function hasValidationErrors(
  errors: LeaveRequestValidationErrors,
): boolean {
  return Object.values(errors).some((messages) => {
    return Array.isArray(messages) && messages.length > 0;
  });
}

function parseLeaveRequestInput(
  formData: FormData,
  editing: boolean,
): LeaveRequestInput {
  const statusValue = editing
    ? getStringValue(formData, "status")
    : "pending";

  return {
    leaveType: getStringValue(formData, "leave_type"),
    startDate: getStringValue(formData, "start_date"),
    endDate: getStringValue(formData, "end_date"),
    reason: emptyStringToNull(
      getStringValue(formData, "reason"),
    ),
    status: normalizeStatus(statusValue),
    rejectionReason: emptyStringToNull(
      getStringValue(formData, "rejection_reason"),
    ),
  };
}

async function getAuthenticatedUserId(): Promise<string | null> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error(
      [
        "Failed to load authenticated user for leave action",
        `name: ${error.name}`,
        `message: ${error.message}`,
        `status: ${error.status ?? "None"}`,
      ].join(" | "),
    );

    return null;
  }

  return user?.id ?? null;
}

async function getEmployeeContext(
  employeeId: string,
): Promise<EmployeeContext | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("employees")
    .select(
      `
        id,
        company_id,
        first_name,
        last_name
      `,
    )
    .eq("id", employeeId)
    .maybeSingle();

  if (error) {
    console.error(
      [
        "Failed to load employee context for leave action",
        `employeeId: ${employeeId}`,
        `message: ${error.message}`,
        `details: ${error.details ?? "None"}`,
        `hint: ${error.hint ?? "None"}`,
        `code: ${error.code ?? "None"}`,
      ].join(" | "),
    );

    return null;
  }

  if (!data?.id || !data.company_id) {
    return null;
  }

  const employeeName =
    `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim();

  return {
    employeeId: data.id,
    companyId: data.company_id,
    employeeName: employeeName || "employee",
  };
}

async function getExistingLeaveRequest(
  employeeId: string,
  leaveRequestId: string,
): Promise<ExistingLeaveRequest | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("employee_leave_requests")
    .select(
      `
        id,
        company_id,
        employee_id,
        leave_type,
        start_date,
        end_date,
        total_days,
        reason,
        status,
        rejection_reason
      `,
    )
    .eq("id", leaveRequestId)
    .eq("employee_id", employeeId)
    .maybeSingle();

  if (error) {
    console.error(
      [
        "Failed to load existing leave request",
        `employeeId: ${employeeId}`,
        `leaveRequestId: ${leaveRequestId}`,
        `message: ${error.message}`,
        `details: ${error.details ?? "None"}`,
        `hint: ${error.hint ?? "None"}`,
        `code: ${error.code ?? "None"}`,
      ].join(" | "),
    );

    return null;
  }

  return data as ExistingLeaveRequest | null;
}

async function insertAuditLog({
  companyId,
  employeeId,
  userId,
  action,
  description,
  oldValues,
  newValues,
}: {
  companyId: string;
  employeeId: string;
  userId: string | null;
  action: string;
  description: string;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
}): Promise<void> {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("employee_audit_logs")
    .insert({
      company_id: companyId,
      employee_id: employeeId,
      action,
      description,
      old_values: oldValues ?? null,
      new_values: newValues ?? null,
      created_by: userId,
    });

  if (error) {
    console.error(
      [
        "Failed to create leave audit log",
        `employeeId: ${employeeId}`,
        `companyId: ${companyId}`,
        `action: ${action}`,
        `message: ${error.message}`,
        `details: ${error.details ?? "None"}`,
        `hint: ${error.hint ?? "None"}`,
        `code: ${error.code ?? "None"}`,
      ].join(" | "),
    );
  }
}

function revalidateEmployeeLeavePaths(employeeId: string): void {
  revalidatePath(`/dashboard/employees/${employeeId}`);
  revalidatePath(`/dashboard/employees/${employeeId}/leave`);
}

export async function createLeaveRequest(
  employeeId: string,
  _previousState: LeaveRequestActionState,
  formData: FormData,
): Promise<LeaveRequestActionState> {
  if (!employeeId || employeeId === "undefined") {
    return {
      success: false,
      message: "A valid employee is required.",
      validationErrors: {
        general: ["A valid employee is required."],
      },
    };
  }

  const input = parseLeaveRequestInput(formData, false);
  const validationErrors = buildValidationErrors(input);

  if (hasValidationErrors(validationErrors)) {
    return {
      success: false,
      message: "Please correct the highlighted fields.",
      validationErrors,
    };
  }

  const [employeeContext, userId] = await Promise.all([
    getEmployeeContext(employeeId),
    getAuthenticatedUserId(),
  ]);

  if (!employeeContext) {
    return {
      success: false,
      message: "The employee could not be found.",
      validationErrors: {
        general: ["The employee could not be found."],
      },
    };
  }

  const totalDays = calculateCalendarDays(
    input.startDate,
    input.endDate,
  );

  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("employee_leave_requests")
    .insert({
      company_id: employeeContext.companyId,
      employee_id: employeeContext.employeeId,
      leave_type: input.leaveType,
      start_date: input.startDate,
      end_date: input.endDate,
      total_days: totalDays,
      reason: input.reason,
      status: "pending",
      approved_by: null,
      approved_at: null,
      rejection_reason: null,
      created_by: userId,
      updated_by: userId,
    })
    .select(
      `
        id,
        leave_type,
        start_date,
        end_date,
        total_days,
        reason,
        status
      `,
    )
    .single();

  if (error) {
    console.error(
      [
        "Failed to create employee leave request",
        `employeeId: ${employeeId}`,
        `companyId: ${employeeContext.companyId}`,
        `message: ${error.message}`,
        `details: ${error.details ?? "None"}`,
        `hint: ${error.hint ?? "None"}`,
        `code: ${error.code ?? "None"}`,
      ].join(" | "),
    );

    return {
      success: false,
      message: "The leave request could not be created.",
      validationErrors: {
        general: [
          "The leave request could not be created. Please try again.",
        ],
      },
    };
  }

  await insertAuditLog({
    companyId: employeeContext.companyId,
    employeeId: employeeContext.employeeId,
    userId,
    action: "leave_request_created",
    description: `Created a ${formatLeaveType(
      input.leaveType,
    )} leave request for ${employeeContext.employeeName}.`,
    newValues: {
      leave_request_id: data.id,
      leave_type: input.leaveType,
      start_date: input.startDate,
      end_date: input.endDate,
      total_days: totalDays,
      reason: input.reason,
      status: "pending",
    },
  });

  revalidateEmployeeLeavePaths(employeeId);

  return {
    success: true,
    message: "Leave request created successfully.",
    validationErrors: undefined,
  };
}

export async function updateLeaveRequest(
  employeeId: string,
  leaveRequestId: string,
  _previousState: LeaveRequestActionState,
  formData: FormData,
): Promise<LeaveRequestActionState> {
  if (
    !employeeId ||
    employeeId === "undefined" ||
    !leaveRequestId ||
    leaveRequestId === "undefined"
  ) {
    return {
      success: false,
      message: "A valid employee and leave request are required.",
      validationErrors: {
        general: [
          "A valid employee and leave request are required.",
        ],
      },
    };
  }

  const input = parseLeaveRequestInput(formData, true);
  const validationErrors = buildValidationErrors(input);

  if (hasValidationErrors(validationErrors)) {
    return {
      success: false,
      message: "Please correct the highlighted fields.",
      validationErrors,
    };
  }

  const [employeeContext, existingRequest, userId] =
    await Promise.all([
      getEmployeeContext(employeeId),
      getExistingLeaveRequest(employeeId, leaveRequestId),
      getAuthenticatedUserId(),
    ]);

  if (!employeeContext) {
    return {
      success: false,
      message: "The employee could not be found.",
      validationErrors: {
        general: ["The employee could not be found."],
      },
    };
  }

  if (!existingRequest) {
    return {
      success: false,
      message: "The leave request could not be found.",
      validationErrors: {
        general: ["The leave request could not be found."],
      },
    };
  }

  if (existingRequest.company_id !== employeeContext.companyId) {
    return {
      success: false,
      message: "The leave request does not belong to this company.",
      validationErrors: {
        general: [
          "The leave request does not belong to this company.",
        ],
      },
    };
  }

  const totalDays = calculateCalendarDays(
    input.startDate,
    input.endDate,
  );

  const previousStatus = normalizeStatus(
    existingRequest.status ?? "pending",
  );

  const statusChanged = previousStatus !== input.status;

  let approvedBy: string | null = null;
  let approvedAt: string | null = null;

  if (input.status === "approved") {
    approvedBy = userId;

    approvedAt = statusChanged
      ? new Date().toISOString()
      : undefined as never;
  }

  const rejectionReason =
    input.status === "rejected"
      ? input.rejectionReason
      : null;

  const updatePayload: Record<string, unknown> = {
    leave_type: input.leaveType,
    start_date: input.startDate,
    end_date: input.endDate,
    total_days: totalDays,
    reason: input.reason,
    status: input.status,
    approved_by: approvedBy,
    rejection_reason: rejectionReason,
    updated_by: userId,
    updated_at: new Date().toISOString(),
  };

  if (input.status !== "approved") {
    updatePayload.approved_at = null;
  } else if (statusChanged) {
    updatePayload.approved_at = new Date().toISOString();
  }

  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("employee_leave_requests")
    .update(updatePayload)
    .eq("id", leaveRequestId)
    .eq("employee_id", employeeId)
    .eq("company_id", employeeContext.companyId)
    .select(
      `
        id,
        leave_type,
        start_date,
        end_date,
        total_days,
        reason,
        status,
        approved_by,
        approved_at,
        rejection_reason
      `,
    )
    .maybeSingle();

  if (error) {
    console.error(
      [
        "Failed to update employee leave request",
        `employeeId: ${employeeId}`,
        `leaveRequestId: ${leaveRequestId}`,
        `companyId: ${employeeContext.companyId}`,
        `message: ${error.message}`,
        `details: ${error.details ?? "None"}`,
        `hint: ${error.hint ?? "None"}`,
        `code: ${error.code ?? "None"}`,
      ].join(" | "),
    );

    return {
      success: false,
      message: "The leave request could not be updated.",
      validationErrors: {
        general: [
          "The leave request could not be updated. Please try again.",
        ],
      },
    };
  }

  if (!data) {
    return {
      success: false,
      message: "The leave request was not updated.",
      validationErrors: {
        general: [
          "The leave request was not updated. It may no longer exist.",
        ],
      },
    };
  }

  await insertAuditLog({
    companyId: employeeContext.companyId,
    employeeId: employeeContext.employeeId,
    userId,
    action: statusChanged
      ? `leave_request_${input.status}`
      : "leave_request_updated",
    description: statusChanged
      ? `${formatLeaveType(
          input.leaveType,
        )} leave request for ${
          employeeContext.employeeName
        } was changed to ${input.status}.`
      : `Updated the ${formatLeaveType(
          input.leaveType,
        )} leave request for ${employeeContext.employeeName}.`,
    oldValues: {
      leave_request_id: existingRequest.id,
      leave_type: existingRequest.leave_type,
      start_date: existingRequest.start_date,
      end_date: existingRequest.end_date,
      total_days: existingRequest.total_days,
      reason: existingRequest.reason,
      status: existingRequest.status,
      rejection_reason: existingRequest.rejection_reason,
    },
    newValues: {
      leave_request_id: data.id,
      leave_type: data.leave_type,
      start_date: data.start_date,
      end_date: data.end_date,
      total_days: data.total_days,
      reason: data.reason,
      status: data.status,
      approved_by: data.approved_by,
      approved_at: data.approved_at,
      rejection_reason: data.rejection_reason,
    },
  });

  revalidateEmployeeLeavePaths(employeeId);

  return {
    success: true,
    message: "Leave request updated successfully.",
    validationErrors: undefined,
  };
}