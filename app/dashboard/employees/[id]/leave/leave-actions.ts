"use server";

import { revalidatePath } from "next/cache";

import {
  getEmployeeNotificationRecipient,
  getLeaveSubmissionRecipients,
} from "@/app/dashboard/notifications/notification-recipient.service";
import {
  createNotifications,
  notifyLeaveRejected,
} from "@/app/dashboard/notifications/notification.service";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type LeaveActionState = {
  success: boolean;
  message: string;
  validationErrors?: {
    leave_type?: string[];
    start_date?: string[];
    end_date?: string[];
    reason?: string[];
    rejection_reason?: string[];
    general?: string[];
  };
};

type SupabaseErrorLike = {
  message?: string;
  details?: string | null;
  hint?: string | null;
  code?: string;
};

type LeaveRequestRecord = {
  id: string;
  company_id: string;
  employee_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  status: string;
};

type CreatedLeaveRequestRecord = {
  id: string;
  company_id: string;
  employee_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
};

type EmployeeNotificationDetails = {
  id: string;
  company_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
};

function getStringValue(
  formData: FormData,
  fieldName: string,
): string {
  const value = formData.get(fieldName);

  return typeof value === "string" ? value.trim() : "";
}

function getNullableStringValue(
  formData: FormData,
  fieldName: string,
): string | null {
  const value = getStringValue(formData, fieldName);

  return value.length > 0 ? value : null;
}

function isValidDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsedDate = new Date(`${value}T00:00:00Z`);

  return !Number.isNaN(parsedDate.getTime());
}

function formatEmployeeName(
  employee: EmployeeNotificationDetails,
): string {
  const fullName = [
    employee.first_name,
    employee.last_name,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || employee.email || "Employee";
}

function formatLeaveType(leaveType: string): string {
  return leaveType
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function formatDateRange(
  startDate: string,
  endDate: string,
): string {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    return `${startDate} to ${endDate}`;
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  if (startDate === endDate) {
    return formatter.format(start);
  }

  return `${formatter.format(start)} to ${formatter.format(end)}`;
}

function logSupabaseError(
  label: string,
  error: SupabaseErrorLike | null,
  context?: Record<string, unknown>,
): void {
  console.error(label, {
    ...context,
    message: error?.message ?? "Unknown Supabase error",
    details: error?.details ?? null,
    hint: error?.hint ?? null,
    code: error?.code ?? null,
  });
}

function logNotificationError(
  label: string,
  error: unknown,
  context?: Record<string, unknown>,
): void {
  console.error(label, {
    ...context,
    message:
      error instanceof Error
        ? error.message
        : "Unknown notification error",
  });
}

function getLeavePath(employeeId: string): string {
  return `/dashboard/employees/${employeeId}/leave`;
}

function getLeaveRequestLink(
  employeeId: string,
  leaveRequestId: string,
): string {
  return `${getLeavePath(employeeId)}?request=${leaveRequestId}`;
}

function revalidateLeavePages(employeeId: string): void {
  revalidatePath(getLeavePath(employeeId));
  revalidatePath("/dashboard/leave");
  revalidatePath("/dashboard/notifications");
  revalidatePath("/dashboard");
}

async function getAuthenticatedUser() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    if (error) {
      logSupabaseError(
        "Failed to authenticate leave action user",
        error,
      );
    }

    return {
      supabase,
      user: null,
    };
  }

  return {
    supabase,
    user,
  };
}

async function getEmployeeNotificationDetails(
  employeeId: string,
): Promise<EmployeeNotificationDetails | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("employees")
    .select(`
      id,
      company_id,
      first_name,
      last_name,
      email
    `)
    .eq("id", employeeId)
    .maybeSingle();

  if (error) {
    logSupabaseError(
      "Failed to load employee notification details",
      error,
      {
        employeeId,
      },
    );

    return null;
  }

  return data as EmployeeNotificationDetails | null;
}

async function getLeaveRequestById(
  leaveRequestId: string,
): Promise<LeaveRequestRecord | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("employee_leave_requests")
    .select(`
      id,
      company_id,
      employee_id,
      leave_type,
      start_date,
      end_date,
      reason,
      status
    `)
    .eq("id", leaveRequestId)
    .maybeSingle();

  if (error) {
    logSupabaseError(
      "Failed to load leave request for action",
      error,
      {
        leaveRequestId,
      },
    );

    return null;
  }

  return data as LeaveRequestRecord | null;
}

/**
 * Audit logging is deliberately non-blocking.
 */
async function createLeaveAuditLog({
  employeeId,
  action,
  description,
}: {
  employeeId: string;
  action: string;
  description: string;
}): Promise<void> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const auditPayload = {
    employee_id: employeeId,
    action,
    description,
    created_by: user?.id ?? null,
  };

  const { error } = await supabase
    .from("employee_audit_logs")
    .insert(auditPayload);

  if (error) {
    logSupabaseError(
      "Failed to create leave audit log",
      error,
      {
        employeeId,
        action,
      },
    );
  }
}

/**
 * Notifies the employee's manager after a leave request is created.
 *
 * If no linked manager account exists, HR and admin users receive
 * the notification instead.
 */
async function createLeaveSubmissionNotifications(
  request: CreatedLeaveRequestRecord,
): Promise<void> {
  try {
    const [employee, recipients] = await Promise.all([
      getEmployeeNotificationDetails(
        request.employee_id,
      ),
      getLeaveSubmissionRecipients(
        request.employee_id,
        request.company_id,
      ),
    ]);

    if (!employee) {
      console.warn(
        "Leave request created, but employee notification details were not found.",
        {
          requestId: request.id,
          employeeId: request.employee_id,
        },
      );

      return;
    }

    if (recipients.length === 0) {
      console.warn(
        "Leave request created, but no manager, HR, or admin notification recipients were found.",
        {
          requestId: request.id,
          employeeId: request.employee_id,
          companyId: request.company_id,
        },
      );

      return;
    }

    const employeeName = formatEmployeeName(employee);
    const leaveType = formatLeaveType(
      request.leave_type,
    );
    const dateRange = formatDateRange(
      request.start_date,
      request.end_date,
    );

    await createNotifications({
      companyId: request.company_id,
      userIds: recipients.map(
        (recipient) => recipient.userId,
      ),
      title: "Manager Approval Required",
      message: `${employeeName}'s ${leaveType} leave request for ${dateRange} requires approval.`,
      type: "leave",
      priority: "high",
      link: getLeaveRequestLink(
        request.employee_id,
        request.id,
      ),
      metadata: {
        entityType: "leave_request",
        event: "manager_approval_required",
        leaveRequestId: request.id,
        employeeId: request.employee_id,
        employeeName,
        leaveType: request.leave_type,
        startDate: request.start_date,
        endDate: request.end_date,
      },
    });
  } catch (error) {
    logNotificationError(
      "Leave request was created, but recipient notifications failed",
      error,
      {
        requestId: request.id,
        employeeId: request.employee_id,
      },
    );
  }
}

/**
 * Notifies the employee when a leave request is rejected.
 */
async function createLeaveRejectedNotification(
  request: LeaveRequestRecord,
  rejectionReason: string,
): Promise<void> {
  try {
    const [employee, recipient] = await Promise.all([
      getEmployeeNotificationDetails(
        request.employee_id,
      ),
      getEmployeeNotificationRecipient(
        request.employee_id,
      ),
    ]);

    if (!employee || !recipient) {
      console.warn(
        "Leave request rejected, but the employee has no linked notification account.",
        {
          requestId: request.id,
          employeeId: request.employee_id,
        },
      );

      return;
    }

    await notifyLeaveRejected({
      companyId: request.company_id,
      recipientUserId: recipient.userId,
      employeeId: request.employee_id,
      employeeName: formatEmployeeName(employee),
      leaveRequestId: request.id,
      leaveType: request.leave_type,
      startDate: request.start_date,
      endDate: request.end_date,
      rejectionReason,
    });
  } catch (error) {
    logNotificationError(
      "Leave request rejected, but employee notification failed",
      error,
      {
        requestId: request.id,
        employeeId: request.employee_id,
      },
    );
  }
}

export async function createLeaveRequest(
  _previousState: LeaveActionState,
  formData: FormData,
): Promise<LeaveActionState> {
  const employeeId = getStringValue(
    formData,
    "employee_id",
  );
  const companyId = getStringValue(
    formData,
    "company_id",
  );
  const leaveType = getStringValue(
    formData,
    "leave_type",
  );
  const startDate = getStringValue(
    formData,
    "start_date",
  );
  const endDate = getStringValue(
    formData,
    "end_date",
  );
  const reason = getNullableStringValue(
    formData,
    "reason",
  );

  const validationErrors: NonNullable<
    LeaveActionState["validationErrors"]
  > = {};

  if (!employeeId) {
    validationErrors.general = [
      "Employee ID is required.",
    ];
  }

  if (!companyId) {
    validationErrors.general = [
      ...(validationErrors.general ?? []),
      "Company ID is required.",
    ];
  }

  if (!leaveType) {
    validationErrors.leave_type = [
      "Leave type is required.",
    ];
  }

  if (!startDate) {
    validationErrors.start_date = [
      "Start date is required.",
    ];
  } else if (!isValidDateString(startDate)) {
    validationErrors.start_date = [
      "Enter a valid start date.",
    ];
  }

  if (!endDate) {
    validationErrors.end_date = [
      "End date is required.",
    ];
  } else if (!isValidDateString(endDate)) {
    validationErrors.end_date = [
      "Enter a valid end date.",
    ];
  }

  if (
    isValidDateString(startDate) &&
    isValidDateString(endDate) &&
    endDate < startDate
  ) {
    validationErrors.end_date = [
      "End date cannot be earlier than the start date.",
    ];
  }

  if (reason && reason.length > 1000) {
    validationErrors.reason = [
      "Reason must be 1,000 characters or fewer.",
    ];
  }

  if (Object.keys(validationErrors).length > 0) {
    return {
      success: false,
      message:
        "Please correct the highlighted fields.",
      validationErrors,
    };
  }

  const totalDays =
    Math.floor(
      (new Date(`${endDate}T00:00:00Z`).getTime() -
        new Date(`${startDate}T00:00:00Z`).getTime()) /
        (1000 * 60 * 60 * 24),
    ) + 1;

  const { supabase, user } =
    await getAuthenticatedUser();

  if (!user) {
    return {
      success: false,
      message:
        "You must be signed in to create a leave request.",
      validationErrors: {
        general: ["Authentication is required."],
      },
    };
  }

  const { data, error } = await supabase
    .from("employee_leave_requests")
    .insert({
      company_id: companyId,
      employee_id: employeeId,
      leave_type: leaveType,
      start_date: startDate,
      end_date: endDate,
      total_days: totalDays,
      reason,
      status: "pending",
      approver_id: null,
      approved_by: null,
      approved_at: null,
      rejected_by: null,
      rejected_at: null,
      rejection_reason: null,
      created_by: user.id,
      updated_by: user.id,
    })
    .select(`
      id,
      company_id,
      employee_id,
      leave_type,
      start_date,
      end_date,
      total_days
    `)
    .single();

  if (error || !data) {
    logSupabaseError(
      "Failed to create leave request",
      error,
      {
        employeeId,
        companyId,
      },
    );

    const errorMessage =
      error?.message ||
      "Unable to create the leave request.";

    return {
      success: false,
      message: errorMessage,
      validationErrors: {
        general: [errorMessage],
      },
    };
  }

  const createdRequest =
    data as CreatedLeaveRequestRecord;

  await createLeaveAuditLog({
    employeeId,
    action: "leave_request_created",
    description: `${leaveType} leave request created for ${startDate} through ${endDate}.`,
  });

  await createLeaveSubmissionNotifications(
    createdRequest,
  );

  revalidateLeavePages(employeeId);

  return {
    success: true,
    message: "Leave request created successfully.",
  };
}

export async function updateLeaveRequest(
  _previousState: LeaveActionState,
  formData: FormData,
): Promise<LeaveActionState> {
  const leaveRequestId = getStringValue(
    formData,
    "leave_request_id",
  );
  const employeeId = getStringValue(
    formData,
    "employee_id",
  );
  const leaveType = getStringValue(
    formData,
    "leave_type",
  );
  const startDate = getStringValue(
    formData,
    "start_date",
  );
  const endDate = getStringValue(
    formData,
    "end_date",
  );
  const reason = getNullableStringValue(
    formData,
    "reason",
  );

  const validationErrors: NonNullable<
    LeaveActionState["validationErrors"]
  > = {};

  if (!leaveRequestId) {
    validationErrors.general = [
      "Leave request ID is required.",
    ];
  }

  if (!employeeId) {
    validationErrors.general = [
      ...(validationErrors.general ?? []),
      "Employee ID is required.",
    ];
  }

  if (!leaveType) {
    validationErrors.leave_type = [
      "Leave type is required.",
    ];
  }

  if (!startDate || !isValidDateString(startDate)) {
    validationErrors.start_date = [
      "Enter a valid start date.",
    ];
  }

  if (!endDate || !isValidDateString(endDate)) {
    validationErrors.end_date = [
      "Enter a valid end date.",
    ];
  }

  if (
    isValidDateString(startDate) &&
    isValidDateString(endDate) &&
    endDate < startDate
  ) {
    validationErrors.end_date = [
      "End date cannot be earlier than the start date.",
    ];
  }

  if (reason && reason.length > 1000) {
    validationErrors.reason = [
      "Reason must be 1,000 characters or fewer.",
    ];
  }

  if (Object.keys(validationErrors).length > 0) {
    return {
      success: false,
      message:
        "Please correct the highlighted fields.",
      validationErrors,
    };
  }

  const existingRequest =
    await getLeaveRequestById(leaveRequestId);

  if (!existingRequest) {
    return {
      success: false,
      message: "Leave request not found.",
      validationErrors: {
        general: [
          "The leave request could not be found.",
        ],
      },
    };
  }

  if (existingRequest.employee_id !== employeeId) {
    return {
      success: false,
      message:
        "The leave request does not belong to this employee.",
      validationErrors: {
        general: ["Employee validation failed."],
      },
    };
  }

  if (existingRequest.status !== "pending") {
    return {
      success: false,
      message:
        "Only pending leave requests can be edited.",
      validationErrors: {
        general: [
          "Approved, rejected, or cancelled requests cannot be edited.",
        ],
      },
    };
  }

  const { supabase, user } =
    await getAuthenticatedUser();

  if (!user) {
    return {
      success: false,
      message:
        "You must be signed in to update a leave request.",
      validationErrors: {
        general: ["Authentication is required."],
      },
    };
  }

  const { error } = await supabase
    .from("employee_leave_requests")
    .update({
      leave_type: leaveType,
      start_date: startDate,
      end_date: endDate,
      reason,
      updated_by: user.id,
    })
    .eq("id", leaveRequestId)
    .eq("employee_id", employeeId);

  if (error) {
    logSupabaseError(
      "Failed to update leave request",
      error,
      {
        leaveRequestId,
        employeeId,
      },
    );

    const errorMessage =
      error.message ||
      "Unable to update the leave request.";

    return {
      success: false,
      message: errorMessage,
      validationErrors: {
        general: [errorMessage],
      },
    };
  }

  await createLeaveAuditLog({
    employeeId,
    action: "leave_request_updated",
    description: `${leaveType} leave request updated for ${startDate} through ${endDate}.`,
  });

  revalidateLeavePages(employeeId);

  return {
    success: true,
    message: "Leave request updated successfully.",
  };
}

export async function deleteLeaveRequest(
  leaveRequestId: string,
  employeeId: string,
): Promise<LeaveActionState> {
  if (!leaveRequestId || !employeeId) {
    return {
      success: false,
      message:
        "Leave request information is missing.",
      validationErrors: {
        general: [
          "Leave request ID and employee ID are required.",
        ],
      },
    };
  }

  const existingRequest =
    await getLeaveRequestById(leaveRequestId);

  if (!existingRequest) {
    return {
      success: false,
      message: "Leave request not found.",
      validationErrors: {
        general: [
          "The leave request could not be found.",
        ],
      },
    };
  }

  if (existingRequest.employee_id !== employeeId) {
    return {
      success: false,
      message:
        "The leave request does not belong to this employee.",
      validationErrors: {
        general: ["Employee validation failed."],
      },
    };
  }

  if (existingRequest.status !== "pending") {
    return {
      success: false,
      message:
        "Only pending leave requests can be deleted.",
      validationErrors: {
        general: [
          "Processed leave requests cannot be deleted.",
        ],
      },
    };
  }

  const { supabase, user } =
    await getAuthenticatedUser();

  if (!user) {
    return {
      success: false,
      message:
        "You must be signed in to delete a leave request.",
      validationErrors: {
        general: ["Authentication is required."],
      },
    };
  }

  const { error } = await supabase
    .from("employee_leave_requests")
    .delete()
    .eq("id", leaveRequestId)
    .eq("employee_id", employeeId)
    .eq("status", "pending");

  if (error) {
    logSupabaseError(
      "Failed to delete leave request",
      error,
      {
        leaveRequestId,
        employeeId,
      },
    );

    const errorMessage =
      error.message ||
      "Unable to delete the leave request.";

    return {
      success: false,
      message: errorMessage,
      validationErrors: {
        general: [errorMessage],
      },
    };
  }

  await createLeaveAuditLog({
    employeeId,
    action: "leave_request_deleted",
    description: `${existingRequest.leave_type} leave request for ${existingRequest.start_date} through ${existingRequest.end_date} was deleted.`,
  });

  revalidateLeavePages(employeeId);

  return {
    success: true,
    message: "Leave request deleted successfully.",
  };
}

export async function rejectLeaveRequest(
  _previousState: LeaveActionState,
  formData: FormData,
): Promise<LeaveActionState> {
  const leaveRequestId = getStringValue(
    formData,
    "leave_request_id",
  );
  const employeeId = getStringValue(
    formData,
    "employee_id",
  );
  const rejectionReason = getStringValue(
    formData,
    "rejection_reason",
  );

  const validationErrors: NonNullable<
    LeaveActionState["validationErrors"]
  > = {};

  if (!leaveRequestId) {
    validationErrors.general = [
      "Leave request ID is required.",
    ];
  }

  if (!employeeId) {
    validationErrors.general = [
      ...(validationErrors.general ?? []),
      "Employee ID is required.",
    ];
  }

  if (!rejectionReason) {
    validationErrors.rejection_reason = [
      "A rejection reason is required.",
    ];
  } else if (rejectionReason.length > 1000) {
    validationErrors.rejection_reason = [
      "Rejection reason must be 1,000 characters or fewer.",
    ];
  }

  if (Object.keys(validationErrors).length > 0) {
    return {
      success: false,
      message:
        "Please correct the highlighted fields.",
      validationErrors,
    };
  }

  const existingRequest =
    await getLeaveRequestById(leaveRequestId);

  if (!existingRequest) {
    return {
      success: false,
      message: "Leave request not found.",
      validationErrors: {
        general: [
          "The leave request could not be found.",
        ],
      },
    };
  }

  if (existingRequest.employee_id !== employeeId) {
    return {
      success: false,
      message:
        "The leave request does not belong to this employee.",
      validationErrors: {
        general: ["Employee validation failed."],
      },
    };
  }

  if (
    existingRequest.status !== "pending" &&
    existingRequest.status !== "manager_approved"
  ) {
    return {
      success: false,
      message:
        "Only pending or manager-approved leave requests can be rejected.",
      validationErrors: {
        general: [
          `This request is currently ${existingRequest.status}.`,
        ],
      },
    };
  }

  const { supabase, user } =
    await getAuthenticatedUser();

  if (!user) {
    return {
      success: false,
      message:
        "You must be signed in to reject leave.",
      validationErrors: {
        general: ["Authentication is required."],
      },
    };
  }

  const rejectedAt = new Date().toISOString();

  const { data, error } = await supabase
    .from("employee_leave_requests")
    .update({
      status: "rejected",
      approved_by: null,
      approved_at: null,
      rejected_by: user.id,
      rejected_at: rejectedAt,
      rejection_reason: rejectionReason,
      updated_by: user.id,
    })
    .eq("id", leaveRequestId)
    .eq("employee_id", employeeId)
    .in("status", ["pending", "manager_approved"])
    .select(`
      id,
      company_id,
      employee_id,
      leave_type,
      start_date,
      end_date,
      reason,
      status
    `)
    .maybeSingle();

  if (error) {
    logSupabaseError(
      "Failed to reject leave request",
      error,
      {
        leaveRequestId,
        employeeId,
      },
    );

    const errorMessage =
      error.message ||
      "Unable to reject the leave request.";

    return {
      success: false,
      message: errorMessage,
      validationErrors: {
        general: [errorMessage],
      },
    };
  }

  if (!data) {
    return {
      success: false,
      message:
        "The leave request was changed before it could be rejected.",
      validationErrors: {
        general: [
          "Refresh the page and try again.",
        ],
      },
    };
  }

  const rejectedRequest =
    data as LeaveRequestRecord;

  await createLeaveAuditLog({
    employeeId,
    action: "leave_request_rejected",
    description: `${existingRequest.leave_type} leave request for ${existingRequest.start_date} through ${existingRequest.end_date} was rejected. Reason: ${rejectionReason}`,
  });

  await createLeaveRejectedNotification(
    rejectedRequest,
    rejectionReason,
  );

  revalidateLeavePages(employeeId);

  return {
    success: true,
    message: "Leave request rejected successfully.",
  };
}