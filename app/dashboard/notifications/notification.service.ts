import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export type NotificationType =
  | "leave"
  | "performance"
  | "training"
  | "document"
  | "asset"
  | "system";

export type NotificationPriority = "low" | "normal" | "high";

export type NotificationMetadataValue =
  | string
  | number
  | boolean
  | null
  | NotificationMetadataValue[]
  | { [key: string]: NotificationMetadataValue };

export type NotificationMetadata = Record<
  string,
  NotificationMetadataValue
>;

export interface Notification {
  id: string;
  company_id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  link: string | null;
  is_read: boolean;
  read_at: string | null;
  metadata: NotificationMetadata;
  created_at: string;
  updated_at: string;
}

export interface CreateNotificationInput {
  companyId: string;
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  priority?: NotificationPriority;
  link?: string | null;
  metadata?: NotificationMetadata;
}

export interface CreateNotificationsInput {
  companyId: string;
  userIds: string[];
  title: string;
  message: string;
  type?: NotificationType;
  priority?: NotificationPriority;
  link?: string | null;
  metadata?: NotificationMetadata;
}

export interface LeaveNotificationInput {
  companyId: string;
  recipientUserId: string;
  employeeId: string;
  employeeName: string;
  leaveRequestId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
}

export interface LeaveRejectedNotificationInput
  extends LeaveNotificationInput {
  rejectionReason?: string | null;
}

export interface GetNotificationsOptions {
  unreadOnly?: boolean;
  limit?: number;
}

function logNotificationServiceError(
  label: string,
  error: unknown,
  context?: Record<string, unknown>,
): void {
  const supabaseError =
    typeof error === "object" && error !== null
      ? (error as {
          message?: string;
          details?: string;
          hint?: string;
          code?: string;
        })
      : null;

  console.error(label, {
    ...context,
    message: supabaseError?.message ?? "Unknown notification service error",
    details: supabaseError?.details ?? null,
    hint: supabaseError?.hint ?? null,
    code: supabaseError?.code ?? null,
  });
}

function normalizeLimit(limit?: number): number {
  if (!limit || Number.isNaN(limit)) {
    return 25;
  }

  return Math.min(Math.max(Math.floor(limit), 1), 100);
}

function formatLeaveType(leaveType: string): string {
  return leaveType
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
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

function getLeaveRequestLink(
  employeeId: string,
  leaveRequestId: string,
): string {
  return `/dashboard/employees/${employeeId}/leave?request=${leaveRequestId}`;
}

function getLeaveMetadata(
  input: LeaveNotificationInput,
): NotificationMetadata {
  return {
    entityType: "leave_request",
    leaveRequestId: input.leaveRequestId,
    employeeId: input.employeeId,
    employeeName: input.employeeName,
    leaveType: input.leaveType,
    startDate: input.startDate,
    endDate: input.endDate,
  };
}

/**
 * Creates one notification.
 *
 * All application modules should use this function instead of inserting
 * directly into the notifications table.
 */
export async function createNotification(
  input: CreateNotificationInput,
): Promise<Notification> {
  const supabase = await createServerSupabaseClient();

  const payload = {
    company_id: input.companyId,
    user_id: input.userId,
    title: input.title.trim(),
    message: input.message.trim(),
    type: input.type ?? "system",
    priority: input.priority ?? "normal",
    link: input.link ?? null,
    metadata: input.metadata ?? {},
    is_read: false,
    read_at: null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("notifications")
    .insert(payload)
    .select(
      `
        id,
        company_id,
        user_id,
        title,
        message,
        type,
        priority,
        link,
        is_read,
        read_at,
        metadata,
        created_at,
        updated_at
      `,
    )
    .single();

  if (error) {
    logNotificationServiceError(
      "Failed to create notification",
      error,
      {
        companyId: input.companyId,
        userId: input.userId,
        type: input.type ?? "system",
      },
    );

    throw new Error("Failed to create notification.");
  }

  return data as Notification;
}

/**
 * Creates the same notification for multiple users.
 */
export async function createNotifications(
  input: CreateNotificationsInput,
): Promise<Notification[]> {
  const uniqueUserIds = [...new Set(input.userIds)].filter(Boolean);

  if (uniqueUserIds.length === 0) {
    return [];
  }

  const supabase = await createServerSupabaseClient();
  const now = new Date().toISOString();

  const payload = uniqueUserIds.map((userId) => ({
    company_id: input.companyId,
    user_id: userId,
    title: input.title.trim(),
    message: input.message.trim(),
    type: input.type ?? "system",
    priority: input.priority ?? "normal",
    link: input.link ?? null,
    metadata: input.metadata ?? {},
    is_read: false,
    read_at: null,
    updated_at: now,
  }));

  const { data, error } = await supabase
    .from("notifications")
    .insert(payload)
    .select(
      `
        id,
        company_id,
        user_id,
        title,
        message,
        type,
        priority,
        link,
        is_read,
        read_at,
        metadata,
        created_at,
        updated_at
      `,
    );

  if (error) {
    logNotificationServiceError(
      "Failed to create notifications",
      error,
      {
        companyId: input.companyId,
        recipientCount: uniqueUserIds.length,
        type: input.type ?? "system",
      },
    );

    throw new Error("Failed to create notifications.");
  }

  return (data ?? []) as Notification[];
}

/**
 * Gets notifications for one user.
 */
export async function getUserNotifications(
  userId: string,
  options: GetNotificationsOptions = {},
): Promise<Notification[]> {
  const supabase = await createServerSupabaseClient();

  let query = supabase
    .from("notifications")
    .select(
      `
        id,
        company_id,
        user_id,
        title,
        message,
        type,
        priority,
        link,
        is_read,
        read_at,
        metadata,
        created_at,
        updated_at
      `,
    )
    .eq("user_id", userId)
    .order("created_at", {
      ascending: false,
    })
    .limit(normalizeLimit(options.limit));

  if (options.unreadOnly) {
    query = query.eq("is_read", false);
  }

  const { data, error } = await query;

  if (error) {
    logNotificationServiceError(
      "Failed to fetch user notifications",
      error,
      {
        userId,
        unreadOnly: options.unreadOnly ?? false,
      },
    );

    return [];
  }

  return (data ?? []) as Notification[];
}

/**
 * Gets only unread notifications for one user.
 */
export async function getUnreadNotifications(
  userId: string,
  limit = 25,
): Promise<Notification[]> {
  return getUserNotifications(userId, {
    unreadOnly: true,
    limit,
  });
}

/**
 * Returns the unread notification count for one user.
 */
export async function getUnreadNotificationCount(
  userId: string,
): Promise<number> {
  const supabase = await createServerSupabaseClient();

  const { count, error } = await supabase
    .from("notifications")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) {
    logNotificationServiceError(
      "Failed to count unread notifications",
      error,
      {
        userId,
      },
    );

    return 0;
  }

  return count ?? 0;
}

/**
 * Marks one notification as read.
 *
 * The user ID is included to prevent one user from changing another
 * user's notification.
 */
export async function markNotificationAsRead(
  notificationId: string,
  userId: string,
): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("notifications")
    .update({
      is_read: true,
      read_at: now,
      updated_at: now,
    })
    .eq("id", notificationId)
    .eq("user_id", userId);

  if (error) {
    logNotificationServiceError(
      "Failed to mark notification as read",
      error,
      {
        notificationId,
        userId,
      },
    );

    throw new Error("Failed to mark notification as read.");
  }
}

/**
 * Marks one notification as unread.
 */
export async function markNotificationAsUnread(
  notificationId: string,
  userId: string,
): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("notifications")
    .update({
      is_read: false,
      read_at: null,
      updated_at: now,
    })
    .eq("id", notificationId)
    .eq("user_id", userId);

  if (error) {
    logNotificationServiceError(
      "Failed to mark notification as unread",
      error,
      {
        notificationId,
        userId,
      },
    );

    throw new Error("Failed to mark notification as unread.");
  }
}

/**
 * Marks all notifications belonging to one user as read.
 */
export async function markAllNotificationsAsRead(
  userId: string,
): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("notifications")
    .update({
      is_read: true,
      read_at: now,
      updated_at: now,
    })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) {
    logNotificationServiceError(
      "Failed to mark all notifications as read",
      error,
      {
        userId,
      },
    );

    throw new Error("Failed to mark all notifications as read.");
  }
}

/**
 * Deletes one notification belonging to one user.
 */
export async function deleteNotification(
  notificationId: string,
  userId: string,
): Promise<void> {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId)
    .eq("user_id", userId);

  if (error) {
    logNotificationServiceError(
      "Failed to delete notification",
      error,
      {
        notificationId,
        userId,
      },
    );

    throw new Error("Failed to delete notification.");
  }
}

/**
 * Deletes every notification belonging to one user.
 */
export async function deleteAllNotifications(
  userId: string,
): Promise<void> {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("user_id", userId);

  if (error) {
    logNotificationServiceError(
      "Failed to delete all notifications",
      error,
      {
        userId,
      },
    );

    throw new Error("Failed to delete all notifications.");
  }
}

/**
 * Notifies a manager that an employee submitted a new leave request.
 */
export async function notifyLeaveSubmitted(
  input: LeaveNotificationInput,
): Promise<Notification> {
  const leaveType = formatLeaveType(input.leaveType);
  const dateRange = formatDateRange(input.startDate, input.endDate);

  return createNotification({
    companyId: input.companyId,
    userId: input.recipientUserId,
    title: "New Leave Request",
    message: `${input.employeeName} requested ${leaveType} leave from ${dateRange}.`,
    type: "leave",
    priority: "high",
    link: getLeaveRequestLink(
      input.employeeId,
      input.leaveRequestId,
    ),
    metadata: {
      ...getLeaveMetadata(input),
      event: "leave_submitted",
    },
  });
}

/**
 * Notifies a manager that their approval is required.
 */
export async function notifyManagerApprovalRequired(
  input: LeaveNotificationInput,
): Promise<Notification> {
  const leaveType = formatLeaveType(input.leaveType);
  const dateRange = formatDateRange(input.startDate, input.endDate);

  return createNotification({
    companyId: input.companyId,
    userId: input.recipientUserId,
    title: "Manager Approval Required",
    message: `${input.employeeName}'s ${leaveType} leave request for ${dateRange} requires your approval.`,
    type: "leave",
    priority: "high",
    link: getLeaveRequestLink(
      input.employeeId,
      input.leaveRequestId,
    ),
    metadata: {
      ...getLeaveMetadata(input),
      event: "manager_approval_required",
    },
  });
}

/**
 * Notifies HR after a manager approves a leave request.
 */
export async function notifyHrApprovalRequired(
  input: LeaveNotificationInput,
): Promise<Notification> {
  const leaveType = formatLeaveType(input.leaveType);
  const dateRange = formatDateRange(input.startDate, input.endDate);

  return createNotification({
    companyId: input.companyId,
    userId: input.recipientUserId,
    title: "HR Approval Required",
    message: `${input.employeeName}'s ${leaveType} leave request for ${dateRange} was approved by the manager and requires HR approval.`,
    type: "leave",
    priority: "high",
    link: getLeaveRequestLink(
      input.employeeId,
      input.leaveRequestId,
    ),
    metadata: {
      ...getLeaveMetadata(input),
      event: "hr_approval_required",
    },
  });
}

/**
 * Notifies an employee that their leave request received manager approval.
 */
export async function notifyLeaveManagerApproved(
  input: LeaveNotificationInput,
): Promise<Notification> {
  const leaveType = formatLeaveType(input.leaveType);

  return createNotification({
    companyId: input.companyId,
    userId: input.recipientUserId,
    title: "Leave Approved by Manager",
    message: `Your ${leaveType} leave request was approved by your manager and is awaiting HR approval.`,
    type: "leave",
    priority: "normal",
    link: getLeaveRequestLink(
      input.employeeId,
      input.leaveRequestId,
    ),
    metadata: {
      ...getLeaveMetadata(input),
      event: "leave_manager_approved",
    },
  });
}

/**
 * Notifies an employee that their leave request is fully approved.
 */
export async function notifyLeaveApproved(
  input: LeaveNotificationInput,
): Promise<Notification> {
  const leaveType = formatLeaveType(input.leaveType);
  const dateRange = formatDateRange(input.startDate, input.endDate);

  return createNotification({
    companyId: input.companyId,
    userId: input.recipientUserId,
    title: "Leave Request Approved",
    message: `Your ${leaveType} leave request for ${dateRange} has been approved.`,
    type: "leave",
    priority: "normal",
    link: getLeaveRequestLink(
      input.employeeId,
      input.leaveRequestId,
    ),
    metadata: {
      ...getLeaveMetadata(input),
      event: "leave_approved",
    },
  });
}

/**
 * Notifies an employee that their leave request was rejected.
 */
export async function notifyLeaveRejected(
  input: LeaveRejectedNotificationInput,
): Promise<Notification> {
  const leaveType = formatLeaveType(input.leaveType);
  const rejectionReason = input.rejectionReason?.trim();

  const message = rejectionReason
    ? `Your ${leaveType} leave request was rejected. Reason: ${rejectionReason}`
    : `Your ${leaveType} leave request was rejected.`;

  return createNotification({
    companyId: input.companyId,
    userId: input.recipientUserId,
    title: "Leave Request Rejected",
    message,
    type: "leave",
    priority: "high",
    link: getLeaveRequestLink(
      input.employeeId,
      input.leaveRequestId,
    ),
    metadata: {
      ...getLeaveMetadata(input),
      event: "leave_rejected",
      rejectionReason: rejectionReason ?? null,
    },
  });
}

/**
 * Notifies an employee that approved leave is approaching.
 */
export async function notifyUpcomingLeave(
  input: LeaveNotificationInput,
): Promise<Notification> {
  const leaveType = formatLeaveType(input.leaveType);
  const dateRange = formatDateRange(input.startDate, input.endDate);

  return createNotification({
    companyId: input.companyId,
    userId: input.recipientUserId,
    title: "Upcoming Leave Reminder",
    message: `Your ${leaveType} leave is scheduled for ${dateRange}.`,
    type: "leave",
    priority: "normal",
    link: getLeaveRequestLink(
      input.employeeId,
      input.leaveRequestId,
    ),
    metadata: {
      ...getLeaveMetadata(input),
      event: "upcoming_leave_reminder",
    },
  });
}

/**
 * Notifies an employee that their scheduled return date is approaching.
 */
export async function notifyReturnToWork(
  input: LeaveNotificationInput,
): Promise<Notification> {
  const leaveType = formatLeaveType(input.leaveType);

  return createNotification({
    companyId: input.companyId,
    userId: input.recipientUserId,
    title: "Return-to-Work Reminder",
    message: `Your ${leaveType} leave ends on ${formatDateRange(
      input.endDate,
      input.endDate,
    )}.`,
    type: "leave",
    priority: "normal",
    link: getLeaveRequestLink(
      input.employeeId,
      input.leaveRequestId,
    ),
    metadata: {
      ...getLeaveMetadata(input),
      event: "return_to_work_reminder",
    },
  });
}