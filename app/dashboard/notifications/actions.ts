"use server";

import { revalidatePath } from "next/cache";

import { createServerSupabaseClient } from "@/lib/supabase/server";

import {
  deleteAllNotifications,
  deleteNotification,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  markNotificationAsUnread,
} from "./notification.service";

export interface NotificationActionState {
  success: boolean;
  message: string;
}

function getErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  return error instanceof Error ? error.message : fallbackMessage;
}

async function getCurrentUserId(): Promise<string> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Failed to get notification user", {
      message: error.message,
      status: error.status,
    });

    throw new Error("Unable to verify the current user.");
  }

  if (!user) {
    throw new Error("You must be signed in.");
  }

  return user.id;
}

function revalidateNotificationPaths(): void {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/notifications");
}

export async function markNotificationAsReadAction(
  notificationId: string,
): Promise<NotificationActionState> {
  const normalizedNotificationId = notificationId.trim();

  if (!normalizedNotificationId) {
    return {
      success: false,
      message: "Notification ID is required.",
    };
  }

  try {
    const userId = await getCurrentUserId();

    await markNotificationAsRead(
      normalizedNotificationId,
      userId,
    );

    revalidateNotificationPaths();

    return {
      success: true,
      message: "Notification marked as read.",
    };
  } catch (error) {
    const message = getErrorMessage(
      error,
      "Failed to mark notification as read.",
    );

    console.error("markNotificationAsReadAction failed", {
      notificationId: normalizedNotificationId,
      message,
    });

    return {
      success: false,
      message,
    };
  }
}

export async function markNotificationAsUnreadAction(
  notificationId: string,
): Promise<NotificationActionState> {
  const normalizedNotificationId = notificationId.trim();

  if (!normalizedNotificationId) {
    return {
      success: false,
      message: "Notification ID is required.",
    };
  }

  try {
    const userId = await getCurrentUserId();

    await markNotificationAsUnread(
      normalizedNotificationId,
      userId,
    );

    revalidateNotificationPaths();

    return {
      success: true,
      message: "Notification marked as unread.",
    };
  } catch (error) {
    const message = getErrorMessage(
      error,
      "Failed to mark notification as unread.",
    );

    console.error("markNotificationAsUnreadAction failed", {
      notificationId: normalizedNotificationId,
      message,
    });

    return {
      success: false,
      message,
    };
  }
}

export async function markAllNotificationsAsReadAction(): Promise<NotificationActionState> {
  try {
    const userId = await getCurrentUserId();

    await markAllNotificationsAsRead(userId);

    revalidateNotificationPaths();

    return {
      success: true,
      message: "All notifications marked as read.",
    };
  } catch (error) {
    const message = getErrorMessage(
      error,
      "Failed to mark all notifications as read.",
    );

    console.error("markAllNotificationsAsReadAction failed", {
      message,
    });

    return {
      success: false,
      message,
    };
  }
}

export async function deleteNotificationAction(
  notificationId: string,
): Promise<NotificationActionState> {
  const normalizedNotificationId = notificationId.trim();

  if (!normalizedNotificationId) {
    return {
      success: false,
      message: "Notification ID is required.",
    };
  }

  try {
    const userId = await getCurrentUserId();

    await deleteNotification(
      normalizedNotificationId,
      userId,
    );

    revalidateNotificationPaths();

    return {
      success: true,
      message: "Notification deleted.",
    };
  } catch (error) {
    const message = getErrorMessage(
      error,
      "Failed to delete notification.",
    );

    console.error("deleteNotificationAction failed", {
      notificationId: normalizedNotificationId,
      message,
    });

    return {
      success: false,
      message,
    };
  }
}

export async function deleteAllNotificationsAction(): Promise<NotificationActionState> {
  try {
    const userId = await getCurrentUserId();

    await deleteAllNotifications(userId);

    revalidateNotificationPaths();

    return {
      success: true,
      message: "All notifications deleted.",
    };
  } catch (error) {
    const message = getErrorMessage(
      error,
      "Failed to delete all notifications.",
    );

    console.error("deleteAllNotificationsAction failed", {
      message,
    });

    return {
      success: false,
      message,
    };
  }
}