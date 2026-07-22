"use server";

import { revalidatePath } from "next/cache";

import {
  getEmployeeNotificationRecipient,
  getLeaveHrApprovalRecipients,
} from "@/app/dashboard/notifications/notification-recipient.service";
import {
  createNotifications,
} from "@/app/dashboard/notifications/notification.service";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type SupabaseClient = Awaited<
  ReturnType<typeof createServerSupabaseClient>
>;

type LeaveRequestDetails = {
  id: string;
  company_id: string;
  employee_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  status: string;
};

type EmployeeDetails = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
};

type LeaveUserRole = "employee" | "manager" | "hr" | "admin";

type CurrentUserAccess = {
  userId: string;
  companyId: string;
  role: LeaveUserRole;
};

type ProfileAccessRow = {
  id: string;
  company_id: string | null;
  role: string | null;
};

function getEmployeeLeavePath(employeeId: string): string {
  return `/dashboard/employees/${employeeId}/leave`;
}

function getLeaveRequestLink(
  employeeId: string,
  leaveRequestId: string,
): string {
  return `${getEmployeeLeavePath(employeeId)}?request=${leaveRequestId}`;
}

function revalidateLeavePages(employeeId: string): void {
  revalidatePath(getEmployeeLeavePath(employeeId));
  revalidatePath("/dashboard/leave");
  revalidatePath("/dashboard/notifications");
  revalidatePath("/dashboard");
}

function formatEmployeeName(
  employee: EmployeeDetails | null,
): string {
  if (!employee) {
    return "Employee";
  }

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

function isLeaveUserRole(value: string | null): value is LeaveUserRole {
  return (
    value === "employee" ||
    value === "manager" ||
    value === "hr" ||
    value === "admin"
  );
}

async function getCurrentUserAccess(
  supabase: SupabaseClient,
): Promise<CurrentUserAccess> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    console.error("Failed to load authenticated user", {
      message: authError.message,
      status: authError.status,
    });

    throw new Error(
      "Your login session could not be verified.",
    );
  }

  if (!user) {
    throw new Error(
      "You must be signed in to manage leave requests.",
    );
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      company_id,
      role
    `)
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Failed to load leave permissions", {
      userId: user.id,
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    throw new Error(
      "Your leave permissions could not be verified.",
    );
  }

  const profile = data as ProfileAccessRow | null;

  if (!profile) {
    throw new Error(
      "No user profile was found for your account.",
    );
  }

  if (!profile.company_id) {
    throw new Error(
      "Your account is not assigned to a company.",
    );
  }

  if (!isLeaveUserRole(profile.role)) {
    throw new Error(
      "Your account does not have a valid leave-management role.",
    );
  }

  return {
    userId: user.id,
    companyId: profile.company_id,
    role: profile.role,
  };
}

function assertSameCompany(
  access: CurrentUserAccess,
  leaveRequest: LeaveRequestDetails,
): void {
  if (access.companyId !== leaveRequest.company_id) {
    throw new Error(
      "You do not have permission to manage this company's leave request.",
    );
  }
}

function assertManagerApprovalPermission(
  access: CurrentUserAccess,
): void {
  if (
    access.role !== "manager" &&
    access.role !== "admin"
  ) {
    throw new Error(
      "Only a manager or administrator can provide manager approval.",
    );
  }
}

function assertHRApprovalPermission(
  access: CurrentUserAccess,
): void {
  if (
    access.role !== "hr" &&
    access.role !== "admin"
  ) {
    throw new Error(
      "Only HR or an administrator can provide HR approval.",
    );
  }
}

function assertCompletionPermission(
  access: CurrentUserAccess,
): void {
  if (
    access.role !== "hr" &&
    access.role !== "admin"
  ) {
    throw new Error(
      "Only HR or an administrator can complete a leave request.",
    );
  }
}

function assertRejectionPermission(
  access: CurrentUserAccess,
  status: string,
): void {
  if (status === "pending") {
    if (
      access.role !== "manager" &&
      access.role !== "admin"
    ) {
      throw new Error(
        "Only a manager or administrator can reject a pending leave request.",
      );
    }

    return;
  }

  if (status === "manager_approved") {
    if (
      access.role !== "hr" &&
      access.role !== "admin"
    ) {
      throw new Error(
        "Only HR or an administrator can reject a manager-approved leave request.",
      );
    }

    return;
  }

  throw new Error(
    `Leave requests with status "${status}" cannot be rejected.`,
  );
}

async function getLeaveRequestDetails(
  supabase: SupabaseClient,
  leaveRequestId: string,
  employeeId: string,
): Promise<LeaveRequestDetails | null> {
  const { data, error } = await supabase
    .from("employee_leave_requests")
    .select(`
      id,
      company_id,
      employee_id,
      leave_type,
      start_date,
      end_date,
      status
    `)
    .eq("id", leaveRequestId)
    .eq("employee_id", employeeId)
    .maybeSingle();

  if (error) {
    console.error("Failed to load leave request details", {
      leaveRequestId,
      employeeId,
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    return null;
  }

  return data as LeaveRequestDetails | null;
}

async function getEmployeeDetails(
  supabase: SupabaseClient,
  employeeId: string,
): Promise<EmployeeDetails | null> {
  const { data, error } = await supabase
    .from("employees")
    .select(`
      id,
      first_name,
      last_name,
      email
    `)
    .eq("id", employeeId)
    .maybeSingle();

  if (error) {
    console.error(
      "Failed to load employee notification details",
      {
        employeeId,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      },
    );

    return null;
  }

  return data as EmployeeDetails | null;
}

/**
 * Audit logging must not cause the approval action to fail.
 */
async function writeAuditLog(
  supabase: SupabaseClient,
  leaveRequestId: string,
  employeeId: string,
  action: string,
  performedBy: string | null,
): Promise<void> {
  const { error } = await supabase
    .from("employee_audit_logs")
    .insert({
      employee_id: employeeId,
      action,
      entity_type: "leave_request",
      entity_id: leaveRequestId,
      performed_by: performedBy,
      created_at: new Date().toISOString(),
    });

  if (error) {
    console.error("Failed to write leave audit log", {
      leaveRequestId,
      employeeId,
      action,
      performedBy,
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
  }
}

/**
 * Manager approval succeeded.
 * Notify HR and admin users that HR approval is required.
 */
/**
 * Manager approval succeeded.
 * Notify the employee that the request is awaiting HR approval.
 */
async function safelyNotifyEmployeeManagerApproved(
  supabase: SupabaseClient,
  leaveRequest: LeaveRequestDetails,
): Promise<void> {
  try {
    const [employee, recipient] = await Promise.all([
      getEmployeeDetails(
        supabase,
        leaveRequest.employee_id,
      ),
      getEmployeeNotificationRecipient(
        leaveRequest.employee_id,
      ),
    ]);

    if (!recipient) {
      console.warn(
        "Manager approval succeeded, but the employee has no linked notification account.",
        {
          leaveRequestId: leaveRequest.id,
          employeeId: leaveRequest.employee_id,
        },
      );

      return;
    }

    const employeeName = formatEmployeeName(employee);
    const leaveType = formatLeaveType(
      leaveRequest.leave_type,
    );
    const dateRange = formatDateRange(
      leaveRequest.start_date,
      leaveRequest.end_date,
    );

    await createNotifications({
      companyId: leaveRequest.company_id,
      userIds: [recipient.userId],
      title: "Leave Approved by Manager",
      message: `Your ${leaveType} leave request for ${dateRange} was approved by your manager and is awaiting HR approval.`,
      type: "leave",
      priority: "normal",
      link: getLeaveRequestLink(
        leaveRequest.employee_id,
        leaveRequest.id,
      ),
      metadata: {
        entityType: "leave_request",
        event: "leave_manager_approved",
        leaveRequestId: leaveRequest.id,
        employeeId: leaveRequest.employee_id,
        employeeName,
        leaveType: leaveRequest.leave_type,
        startDate: leaveRequest.start_date,
        endDate: leaveRequest.end_date,
      },
    });
  } catch (error) {
    logNotificationError(
      "Manager approval succeeded, but employee notification failed",
      error,
      {
        leaveRequestId: leaveRequest.id,
        employeeId: leaveRequest.employee_id,
      },
    );
  }
}

async function safelyNotifyHR(
  supabase: SupabaseClient,
  leaveRequest: LeaveRequestDetails,
): Promise<void> {
  try {
    const [employee, recipients] = await Promise.all([
      getEmployeeDetails(
        supabase,
        leaveRequest.employee_id,
      ),
      getLeaveHrApprovalRecipients(
        leaveRequest.company_id,
      ),
    ]);

    if (recipients.length === 0) {
      console.warn(
        "Manager approval succeeded, but no HR or admin recipients were found.",
        {
          companyId: leaveRequest.company_id,
          leaveRequestId: leaveRequest.id,
        },
      );

      return;
    }

    const employeeName = formatEmployeeName(employee);
    const leaveType = formatLeaveType(
      leaveRequest.leave_type,
    );
    const dateRange = formatDateRange(
      leaveRequest.start_date,
      leaveRequest.end_date,
    );

    await createNotifications({
      companyId: leaveRequest.company_id,
      userIds: recipients.map(
        (recipient) => recipient.userId,
      ),
      title: "HR Approval Required",
      message: `${employeeName}'s ${leaveType} leave request for ${dateRange} has received manager approval and now requires HR approval.`,
      type: "leave",
      priority: "high",
      link: getLeaveRequestLink(
        leaveRequest.employee_id,
        leaveRequest.id,
      ),
      metadata: {
        entityType: "leave_request",
        event: "hr_approval_required",
        leaveRequestId: leaveRequest.id,
        employeeId: leaveRequest.employee_id,
        employeeName,
        leaveType: leaveRequest.leave_type,
        startDate: leaveRequest.start_date,
        endDate: leaveRequest.end_date,
      },
    });
  } catch (error) {
    logNotificationError(
      "Manager approval succeeded, but HR notification failed",
      error,
      {
        leaveRequestId: leaveRequest.id,
        employeeId: leaveRequest.employee_id,
      },
    );
  }
}

/**
 * HR approval succeeded.
 * Notify the employee that the request is fully approved.
 */
async function safelyNotifyEmployeeApproved(
  supabase: SupabaseClient,
  leaveRequest: LeaveRequestDetails,
): Promise<void> {
  try {
    const [employee, recipient] = await Promise.all([
      getEmployeeDetails(
        supabase,
        leaveRequest.employee_id,
      ),
      getEmployeeNotificationRecipient(
        leaveRequest.employee_id,
      ),
    ]);

    if (!recipient) {
      console.warn(
        "HR approval succeeded, but the employee has no linked notification account.",
        {
          leaveRequestId: leaveRequest.id,
          employeeId: leaveRequest.employee_id,
        },
      );

      return;
    }

    const employeeName = formatEmployeeName(employee);
    const leaveType = formatLeaveType(
      leaveRequest.leave_type,
    );
    const dateRange = formatDateRange(
      leaveRequest.start_date,
      leaveRequest.end_date,
    );

    await createNotifications({
      companyId: leaveRequest.company_id,
      userIds: [recipient.userId],
      title: "Leave Request Approved",
      message: `Your ${leaveType} leave request for ${dateRange} has been approved.`,
      type: "leave",
      priority: "normal",
      link: getLeaveRequestLink(
        leaveRequest.employee_id,
        leaveRequest.id,
      ),
      metadata: {
        entityType: "leave_request",
        event: "leave_approved",
        leaveRequestId: leaveRequest.id,
        employeeId: leaveRequest.employee_id,
        employeeName,
        leaveType: leaveRequest.leave_type,
        startDate: leaveRequest.start_date,
        endDate: leaveRequest.end_date,
      },
    });
  } catch (error) {
    logNotificationError(
      "HR approval succeeded, but employee notification failed",
      error,
      {
        leaveRequestId: leaveRequest.id,
        employeeId: leaveRequest.employee_id,
      },
    );
  }
}

/**
 * Leave rejection succeeded.
 * Notify the employee with the rejection reason.
 */
async function safelyNotifyEmployeeRejected(
  supabase: SupabaseClient,
  leaveRequest: LeaveRequestDetails,
  reason: string,
): Promise<void> {
  try {
    const [employee, recipient] = await Promise.all([
      getEmployeeDetails(
        supabase,
        leaveRequest.employee_id,
      ),
      getEmployeeNotificationRecipient(
        leaveRequest.employee_id,
      ),
    ]);

    if (!recipient) {
      console.warn(
        "Leave rejection succeeded, but the employee has no linked notification account.",
        {
          leaveRequestId: leaveRequest.id,
          employeeId: leaveRequest.employee_id,
        },
      );

      return;
    }

    const employeeName = formatEmployeeName(employee);
    const leaveType = formatLeaveType(
      leaveRequest.leave_type,
    );
    const dateRange = formatDateRange(
      leaveRequest.start_date,
      leaveRequest.end_date,
    );

    await createNotifications({
      companyId: leaveRequest.company_id,
      userIds: [recipient.userId],
      title: "Leave Request Rejected",
      message: `Your ${leaveType} leave request for ${dateRange} was rejected. Reason: ${reason}`,
      type: "leave",
      priority: "high",
      link: getLeaveRequestLink(
        leaveRequest.employee_id,
        leaveRequest.id,
      ),
      metadata: {
        entityType: "leave_request",
        event: "leave_rejected",
        leaveRequestId: leaveRequest.id,
        employeeId: leaveRequest.employee_id,
        employeeName,
        leaveType: leaveRequest.leave_type,
        startDate: leaveRequest.start_date,
        endDate: leaveRequest.end_date,
        rejectionReason: reason,
      },
    });
  } catch (error) {
    logNotificationError(
      "Leave rejection succeeded, but employee notification failed",
      error,
      {
        leaveRequestId: leaveRequest.id,
        employeeId: leaveRequest.employee_id,
      },
    );
  }
}

/**
 * Leave completion succeeded.
 * Notify the employee that the workflow is complete.
 */
async function safelyNotifyEmployeeCompleted(
  supabase: SupabaseClient,
  leaveRequest: LeaveRequestDetails,
): Promise<void> {
  try {
    const recipient =
      await getEmployeeNotificationRecipient(
        leaveRequest.employee_id,
      );

    if (!recipient) {
      console.warn(
        "Leave completion succeeded, but the employee has no linked notification account.",
        {
          leaveRequestId: leaveRequest.id,
          employeeId: leaveRequest.employee_id,
        },
      );

      return;
    }

    const leaveType = formatLeaveType(
      leaveRequest.leave_type,
    );
    const dateRange = formatDateRange(
      leaveRequest.start_date,
      leaveRequest.end_date,
    );

    await createNotifications({
      companyId: leaveRequest.company_id,
      userIds: [recipient.userId],
      title: "Leave Completed",
      message: `Your ${leaveType} leave for ${dateRange} has been marked as completed.`,
      type: "leave",
      priority: "normal",
      link: getLeaveRequestLink(
        leaveRequest.employee_id,
        leaveRequest.id,
      ),
      metadata: {
        entityType: "leave_request",
        event: "leave_completed",
        leaveRequestId: leaveRequest.id,
        employeeId: leaveRequest.employee_id,
        leaveType: leaveRequest.leave_type,
        startDate: leaveRequest.start_date,
        endDate: leaveRequest.end_date,
      },
    });
  } catch (error) {
    logNotificationError(
      "Leave completion succeeded, but employee notification failed",
      error,
      {
        leaveRequestId: leaveRequest.id,
        employeeId: leaveRequest.employee_id,
      },
    );
  }
}

export async function approveByManager(
  leaveRequestId: string,
  employeeId: string,
): Promise<void> {
  if (!leaveRequestId || !employeeId) {
    throw new Error(
      "Leave request ID and employee ID are required.",
    );
  }

  const supabase =
    await createServerSupabaseClient();

  const access =
    await getCurrentUserAccess(supabase);

  assertManagerApprovalPermission(access);

  const leaveRequest =
    await getLeaveRequestDetails(
      supabase,
      leaveRequestId,
      employeeId,
    );

  if (!leaveRequest) {
    throw new Error("Leave request not found.");
  }

  assertSameCompany(access, leaveRequest);

  if (leaveRequest.status !== "pending") {
    throw new Error(
      `Only pending leave requests can receive manager approval. Current status: ${leaveRequest.status}.`,
    );
  }

  const approvedAt = new Date().toISOString();

  const {
    data: updatedRequest,
    error,
  } = await supabase
    .from("employee_leave_requests")
    .update({
      status: "manager_approved",
      manager_approved_by: access.userId,
      manager_approved_at: approvedAt,
      updated_by: access.userId,
      updated_at: approvedAt,
    })
    .eq("id", leaveRequestId)
    .eq("employee_id", employeeId)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();

  if (error) {
    console.error(
      "Failed to approve leave by manager",
      {
        leaveRequestId,
        employeeId,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      },
    );

    throw new Error(error.message);
  }

  if (!updatedRequest) {
    throw new Error(
      "The leave request was not updated. It may have already been processed.",
    );
  }

  await writeAuditLog(
    supabase,
    leaveRequestId,
    employeeId,
    "Manager Approved Leave",
    access.userId,
  );

  await Promise.all([
    safelyNotifyEmployeeManagerApproved(
      supabase,
      leaveRequest,
    ),
    safelyNotifyHR(
      supabase,
      leaveRequest,
    ),
  ]);

  revalidateLeavePages(employeeId);
}

export async function approveByHR(
  leaveRequestId: string,
  employeeId: string,
): Promise<void> {
  if (!leaveRequestId || !employeeId) {
    throw new Error(
      "Leave request ID and employee ID are required.",
    );
  }

  const supabase =
    await createServerSupabaseClient();

  const access =
    await getCurrentUserAccess(supabase);

  assertHRApprovalPermission(access);

  const leaveRequest =
    await getLeaveRequestDetails(
      supabase,
      leaveRequestId,
      employeeId,
    );

  if (!leaveRequest) {
    throw new Error("Leave request not found.");
  }

  assertSameCompany(access, leaveRequest);

  if (leaveRequest.status !== "manager_approved") {
    throw new Error(
      `Only manager-approved leave requests can receive HR approval. Current status: ${leaveRequest.status}.`,
    );
  }

  const approvedAt = new Date().toISOString();

  const {
    data: updatedRequest,
    error,
  } = await supabase
    .from("employee_leave_requests")
    .update({
      status: "hr_approved",
      hr_approved_by: access.userId,
      hr_approved_at: approvedAt,
      approved_by: access.userId,
      approved_at: approvedAt,
      rejected_by: null,
      rejected_at: null,
      rejection_reason: null,
      updated_by: access.userId,
      updated_at: approvedAt,
    })
    .eq("id", leaveRequestId)
    .eq("employee_id", employeeId)
    .eq("status", "manager_approved")
    .select("id")
    .maybeSingle();

  if (error) {
    console.error(
      "Failed to approve leave by HR",
      {
        leaveRequestId,
        employeeId,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      },
    );

    throw new Error(error.message);
  }

  if (!updatedRequest) {
    throw new Error(
      "The leave request was not updated. It may have already been processed.",
    );
  }

  await writeAuditLog(
    supabase,
    leaveRequestId,
    employeeId,
    "HR Approved Leave",
    access.userId,
  );

  await safelyNotifyEmployeeApproved(
    supabase,
    leaveRequest,
  );

  revalidateLeavePages(employeeId);
}

export async function completeLeave(
  leaveRequestId: string,
  employeeId: string,
): Promise<void> {
  if (!leaveRequestId || !employeeId) {
    throw new Error(
      "Leave request ID and employee ID are required.",
    );
  }

  const supabase =
    await createServerSupabaseClient();

  const access =
    await getCurrentUserAccess(supabase);

  assertCompletionPermission(access);

  const leaveRequest =
    await getLeaveRequestDetails(
      supabase,
      leaveRequestId,
      employeeId,
    );

  if (!leaveRequest) {
    throw new Error("Leave request not found.");
  }

  assertSameCompany(access, leaveRequest);

  if (
    leaveRequest.status !== "hr_approved" &&
    leaveRequest.status !== "approved"
  ) {
    throw new Error(
      `Only approved leave requests can be completed. Current status: ${leaveRequest.status}.`,
    );
  }

  const completedAt = new Date().toISOString();

  const {
    data: updatedRequest,
    error,
  } = await supabase
    .from("employee_leave_requests")
    .update({
      status: "completed",
      completed_by: access.userId,
      completed_at: completedAt,
      updated_by: access.userId,
      updated_at: completedAt,
    })
    .eq("id", leaveRequestId)
    .eq("employee_id", employeeId)
    .in("status", [
      "hr_approved",
      "approved",
    ])
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Failed to complete leave", {
      leaveRequestId,
      employeeId,
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    throw new Error(error.message);
  }

  if (!updatedRequest) {
    throw new Error(
      "The leave request was not updated. It may have already been processed.",
    );
  }

  await writeAuditLog(
    supabase,
    leaveRequestId,
    employeeId,
    "Leave Completed",
    access.userId,
  );

  await safelyNotifyEmployeeCompleted(
    supabase,
    leaveRequest,
  );

  revalidateLeavePages(employeeId);
}

export async function rejectLeave(
  leaveRequestId: string,
  employeeId: string,
  reason: string,
): Promise<void> {
  if (!leaveRequestId || !employeeId) {
    throw new Error(
      "Leave request ID and employee ID are required.",
    );
  }

  const rejectionReason = reason.trim();

  if (!rejectionReason) {
    throw new Error(
      "A rejection reason is required.",
    );
  }

  if (rejectionReason.length > 1000) {
    throw new Error(
      "Rejection reason must be 1,000 characters or fewer.",
    );
  }

  const supabase =
    await createServerSupabaseClient();

  const access =
    await getCurrentUserAccess(supabase);

  const leaveRequest =
    await getLeaveRequestDetails(
      supabase,
      leaveRequestId,
      employeeId,
    );

  if (!leaveRequest) {
    throw new Error("Leave request not found.");
  }

  assertSameCompany(access, leaveRequest);
  assertRejectionPermission(
    access,
    leaveRequest.status,
  );

  if (
    leaveRequest.status !== "pending" &&
    leaveRequest.status !== "manager_approved"
  ) {
    throw new Error(
      `Only pending or manager-approved requests can be rejected. Current status: ${leaveRequest.status}.`,
    );
  }

  const rejectedAt = new Date().toISOString();

  const {
    data: updatedRequest,
    error,
  } = await supabase
    .from("employee_leave_requests")
    .update({
      status: "rejected",
      approved_by: null,
      approved_at: null,
      rejected_by: access.userId,
      rejected_at: rejectedAt,
      rejection_reason: rejectionReason,
      updated_by: access.userId,
      updated_at: rejectedAt,
    })
    .eq("id", leaveRequestId)
    .eq("employee_id", employeeId)
    .in("status", [
      "pending",
      "manager_approved",
    ])
    .select("id")
    .maybeSingle();

  if (error) {
    console.error(
      "Failed to reject leave request",
      {
        leaveRequestId,
        employeeId,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      },
    );

    throw new Error(error.message);
  }

  if (!updatedRequest) {
    throw new Error(
      "The leave request was not updated. It may have already been processed.",
    );
  }

  await writeAuditLog(
    supabase,
    leaveRequestId,
    employeeId,
    "Leave Rejected",
    access.userId,
  );

  await safelyNotifyEmployeeRejected(
    supabase,
    leaveRequest,
    rejectionReason,
  );

  revalidateLeavePages(employeeId);
}