import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export type LeaveNotificationType =
  | "leave_request_created"
  | "manager_approval_required"
  | "hr_approval_required"
  | "leave_approved"
  | "leave_rejected"
  | "upcoming_leave_reminder"
  | "return_to_work_reminder";

export type NotificationSourceType = "employee_leave_request";

export interface CreateNotificationInput {
  companyId: string;
  recipientUserId: string;
  employeeId?: string | null;
  actorUserId?: string | null;
  notificationType: LeaveNotificationType;
  title: string;
  message: string;
  actionUrl?: string | null;
  sourceType?: NotificationSourceType | null;
  sourceId?: string | null;
  metadata?: Record<string, unknown>;
}

export interface LeaveNotificationDetails {
  requestId: string;
  companyId: string;
  employeeId: string;
  actorUserId?: string | null;
  leaveType: string;
  startDate: string;
  endDate: string;
  employeeName?: string | null;
}

export interface RejectLeaveNotificationDetails
  extends LeaveNotificationDetails {
  rejectionReason?: string | null;
}

interface EmployeeNotificationRecord {
  id: string;
  user_id: string | null;
  manager_id: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
}

interface ManagerNotificationRecord {
  id: string;
  user_id: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
}

interface NotificationInsertRecord {
  company_id: string;
  recipient_user_id: string;
  employee_id: string | null;
  actor_user_id: string | null;
  notification_type: LeaveNotificationType;
  title: string;
  message: string;
  action_url: string | null;
  source_type: NotificationSourceType | null;
  source_id: string | null;
  metadata: Record<string, unknown>;
}

function logNotificationError(
  label: string,
  error: {
    message?: string;
    details?: string;
    hint?: string;
    code?: string;
  } | null,
  context?: Record<string, unknown>,
): void {
  console.error(label, {
    ...context,
    message: error?.message ?? "Unknown notification error",
    details: error?.details ?? null,
    hint: error?.hint ?? null,
    code: error?.code ?? null,
  });
}

function formatEmployeeName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
): string {
  const name = [firstName, lastName]
    .filter((value): value is string => Boolean(value?.trim()))
    .join(" ")
    .trim();

  return name || "An employee";
}

function formatLeaveType(leaveType: string): string {
  return leaveType
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDateRange(startDate: string, endDate: string): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  const start = formatter.format(new Date(`${startDate}T00:00:00Z`));
  const end = formatter.format(new Date(`${endDate}T00:00:00Z`));

  return startDate === endDate ? start : `${start} – ${end}`;
}

function getLeaveRequestActionUrl(employeeId: string): string {
  return `/dashboard/employees/${employeeId}/leave`;
}

/**
 * Creates one in-app notification.
 */
export async function createNotification(
  input: CreateNotificationInput,
): Promise<string | null> {
  if (!input.recipientUserId) {
    console.warn("Notification was not created because recipientUserId is empty", {
      notificationType: input.notificationType,
      sourceId: input.sourceId ?? null,
    });

    return null;
  }

  const supabase = await createServerSupabaseClient();

  const notification: NotificationInsertRecord = {
    company_id: input.companyId,
    recipient_user_id: input.recipientUserId,
    employee_id: input.employeeId ?? null,
    actor_user_id: input.actorUserId ?? null,
    notification_type: input.notificationType,
    title: input.title.trim(),
    message: input.message.trim(),
    action_url: input.actionUrl ?? null,
    source_type: input.sourceType ?? null,
    source_id: input.sourceId ?? null,
    metadata: input.metadata ?? {},
  };

  const { data, error } = await supabase
    .from("notifications")
    .insert(notification)
    .select("id")
    .single();

  if (error) {
    logNotificationError("Failed to create notification", error, {
      companyId: input.companyId,
      recipientUserId: input.recipientUserId,
      notificationType: input.notificationType,
      sourceId: input.sourceId ?? null,
    });

    return null;
  }

  return data.id as string;
}

/**
 * Creates the same notification for multiple authenticated users.
 */
export async function createNotificationsForUsers(
  recipientUserIds: string[],
  input: Omit<CreateNotificationInput, "recipientUserId">,
): Promise<number> {
  const uniqueRecipientIds = Array.from(
    new Set(recipientUserIds.filter(Boolean)),
  );

  if (uniqueRecipientIds.length === 0) {
    return 0;
  }

  const supabase = await createServerSupabaseClient();

  const notifications: NotificationInsertRecord[] =
    uniqueRecipientIds.map((recipientUserId) => ({
      company_id: input.companyId,
      recipient_user_id: recipientUserId,
      employee_id: input.employeeId ?? null,
      actor_user_id: input.actorUserId ?? null,
      notification_type: input.notificationType,
      title: input.title.trim(),
      message: input.message.trim(),
      action_url: input.actionUrl ?? null,
      source_type: input.sourceType ?? null,
      source_id: input.sourceId ?? null,
      metadata: input.metadata ?? {},
    }));

  const { error } = await supabase
    .from("notifications")
    .insert(notifications);

  if (error) {
    logNotificationError(
      "Failed to create notifications for multiple users",
      error,
      {
        companyId: input.companyId,
        recipientCount: uniqueRecipientIds.length,
        notificationType: input.notificationType,
        sourceId: input.sourceId ?? null,
      },
    );

    return 0;
  }

  return uniqueRecipientIds.length;
}

/**
 * Loads the employee associated with the leave request.
 */
async function getEmployeeNotificationRecord(
  employeeId: string,
): Promise<EmployeeNotificationRecord | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("employees")
    .select(`
      id,
      user_id,
      manager_id,
      first_name,
      last_name,
      email
    `)
    .eq("id", employeeId)
    .maybeSingle();

  if (error) {
    logNotificationError(
      "Failed to load employee notification details",
      error,
      {
        employeeId,
      },
    );

    return null;
  }

  return data as EmployeeNotificationRecord | null;
}

/**
 * Loads the employee's manager and the manager's auth user ID.
 */
async function getEmployeeManager(
  managerId: string,
): Promise<ManagerNotificationRecord | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("employees")
    .select(`
      id,
      user_id,
      first_name,
      last_name,
      email
    `)
    .eq("id", managerId)
    .maybeSingle();

  if (error) {
    logNotificationError(
      "Failed to load employee manager notification details",
      error,
      {
        managerId,
      },
    );

    return null;
  }

  return data as ManagerNotificationRecord | null;
}

/**
 * Notification 1:
 * Sent to the employee's manager when a new leave request is submitted.
 */
export async function notifyManagerOfLeaveRequest(
  details: LeaveNotificationDetails,
): Promise<string | null> {
  const employee = await getEmployeeNotificationRecord(details.employeeId);

  if (!employee) {
    return null;
  }

  if (!employee.manager_id) {
    console.warn("Manager notification skipped because employee has no manager", {
      employeeId: details.employeeId,
      requestId: details.requestId,
    });

    return null;
  }

  const manager = await getEmployeeManager(employee.manager_id);

  if (!manager?.user_id) {
    console.warn(
      "Manager notification skipped because manager has no linked user account",
      {
        employeeId: details.employeeId,
        managerId: employee.manager_id,
        requestId: details.requestId,
      },
    );

    return null;
  }

  const employeeName =
    details.employeeName ??
    formatEmployeeName(employee.first_name, employee.last_name);

  const formattedLeaveType = formatLeaveType(details.leaveType);
  const dateRange = formatDateRange(details.startDate, details.endDate);

  return createNotification({
    companyId: details.companyId,
    recipientUserId: manager.user_id,
    employeeId: details.employeeId,
    actorUserId: details.actorUserId ?? employee.user_id,
    notificationType: "manager_approval_required",
    title: "New leave request",
    message: `${employeeName} requested ${formattedLeaveType} leave for ${dateRange}. Manager approval is required.`,
    actionUrl: getLeaveRequestActionUrl(details.employeeId),
    sourceType: "employee_leave_request",
    sourceId: details.requestId,
    metadata: {
      leaveType: details.leaveType,
      startDate: details.startDate,
      endDate: details.endDate,
      employeeName,
      managerId: manager.id,
    },
  });
}

/**
 * Notification 2:
 * Sent to one or more HR users after manager approval.
 *
 * Pass authenticated user IDs belonging to HR/admin users.
 */
export async function notifyHRApprovalRequired(
  hrRecipientUserIds: string[],
  details: LeaveNotificationDetails,
): Promise<number> {
  const employee = await getEmployeeNotificationRecord(details.employeeId);

  const employeeName =
    details.employeeName ??
    formatEmployeeName(employee?.first_name, employee?.last_name);

  const formattedLeaveType = formatLeaveType(details.leaveType);
  const dateRange = formatDateRange(details.startDate, details.endDate);

  return createNotificationsForUsers(hrRecipientUserIds, {
    companyId: details.companyId,
    employeeId: details.employeeId,
    actorUserId: details.actorUserId ?? null,
    notificationType: "hr_approval_required",
    title: "HR leave approval required",
    message: `${employeeName}'s ${formattedLeaveType} leave request for ${dateRange} has manager approval and is waiting for HR approval.`,
    actionUrl: getLeaveRequestActionUrl(details.employeeId),
    sourceType: "employee_leave_request",
    sourceId: details.requestId,
    metadata: {
      leaveType: details.leaveType,
      startDate: details.startDate,
      endDate: details.endDate,
      employeeName,
    },
  });
}

/**
 * Notification 3:
 * Sent to the employee after HR gives final approval.
 */
export async function notifyEmployeeLeaveApproved(
  details: LeaveNotificationDetails,
): Promise<string | null> {
  const employee = await getEmployeeNotificationRecord(details.employeeId);

  if (!employee?.user_id) {
    console.warn(
      "Approval notification skipped because employee has no linked user account",
      {
        employeeId: details.employeeId,
        requestId: details.requestId,
      },
    );

    return null;
  }

  const formattedLeaveType = formatLeaveType(details.leaveType);
  const dateRange = formatDateRange(details.startDate, details.endDate);

  return createNotification({
    companyId: details.companyId,
    recipientUserId: employee.user_id,
    employeeId: details.employeeId,
    actorUserId: details.actorUserId ?? null,
    notificationType: "leave_approved",
    title: "Leave request approved",
    message: `Your ${formattedLeaveType} leave request for ${dateRange} has been approved.`,
    actionUrl: getLeaveRequestActionUrl(details.employeeId),
    sourceType: "employee_leave_request",
    sourceId: details.requestId,
    metadata: {
      leaveType: details.leaveType,
      startDate: details.startDate,
      endDate: details.endDate,
    },
  });
}

/**
 * Notification 4:
 * Sent to the employee when the request is rejected.
 */
export async function notifyEmployeeLeaveRejected(
  details: RejectLeaveNotificationDetails,
): Promise<string | null> {
  const employee = await getEmployeeNotificationRecord(details.employeeId);

  if (!employee?.user_id) {
    console.warn(
      "Rejection notification skipped because employee has no linked user account",
      {
        employeeId: details.employeeId,
        requestId: details.requestId,
      },
    );

    return null;
  }

  const formattedLeaveType = formatLeaveType(details.leaveType);
  const dateRange = formatDateRange(details.startDate, details.endDate);

  const reason = details.rejectionReason?.trim();

  const message = reason
    ? `Your ${formattedLeaveType} leave request for ${dateRange} was rejected. Reason: ${reason}`
    : `Your ${formattedLeaveType} leave request for ${dateRange} was rejected.`;

  return createNotification({
    companyId: details.companyId,
    recipientUserId: employee.user_id,
    employeeId: details.employeeId,
    actorUserId: details.actorUserId ?? null,
    notificationType: "leave_rejected",
    title: "Leave request rejected",
    message,
    actionUrl: getLeaveRequestActionUrl(details.employeeId),
    sourceType: "employee_leave_request",
    sourceId: details.requestId,
    metadata: {
      leaveType: details.leaveType,
      startDate: details.startDate,
      endDate: details.endDate,
      rejectionReason: reason ?? null,
    },
  });
}

/**
 * Notification 5:
 * Sent before an approved leave starts.
 */
export async function notifyEmployeeOfUpcomingLeave(
  details: LeaveNotificationDetails,
  daysUntilLeave: number,
): Promise<string | null> {
  const employee = await getEmployeeNotificationRecord(details.employeeId);

  if (!employee?.user_id) {
    return null;
  }

  const formattedLeaveType = formatLeaveType(details.leaveType);
  const dateRange = formatDateRange(details.startDate, details.endDate);

  const timingMessage =
    daysUntilLeave === 1
      ? "starts tomorrow"
      : `starts in ${daysUntilLeave} days`;

  return createNotification({
    companyId: details.companyId,
    recipientUserId: employee.user_id,
    employeeId: details.employeeId,
    actorUserId: details.actorUserId ?? null,
    notificationType: "upcoming_leave_reminder",
    title: "Upcoming leave reminder",
    message: `Your ${formattedLeaveType} leave ${timingMessage}. Scheduled dates: ${dateRange}.`,
    actionUrl: getLeaveRequestActionUrl(details.employeeId),
    sourceType: "employee_leave_request",
    sourceId: details.requestId,
    metadata: {
      leaveType: details.leaveType,
      startDate: details.startDate,
      endDate: details.endDate,
      daysUntilLeave,
    },
  });
}

/**
 * Notification 6:
 * Sent when the employee is expected to return from leave.
 */
export async function notifyEmployeeOfReturnToWork(
  details: LeaveNotificationDetails,
): Promise<string | null> {
  const employee = await getEmployeeNotificationRecord(details.employeeId);

  if (!employee?.user_id) {
    return null;
  }

  const formattedLeaveType = formatLeaveType(details.leaveType);

  return createNotification({
    companyId: details.companyId,
    recipientUserId: employee.user_id,
    employeeId: details.employeeId,
    actorUserId: details.actorUserId ?? null,
    notificationType: "return_to_work_reminder",
    title: "Return-to-work reminder",
    message: `Welcome back. Your ${formattedLeaveType} leave has ended, and today is your scheduled return-to-work date.`,
    actionUrl: getLeaveRequestActionUrl(details.employeeId),
    sourceType: "employee_leave_request",
    sourceId: details.requestId,
    metadata: {
      leaveType: details.leaveType,
      startDate: details.startDate,
      endDate: details.endDate,
    },
  });
}