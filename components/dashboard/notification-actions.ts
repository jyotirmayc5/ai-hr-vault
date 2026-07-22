"use server";

import { revalidatePath } from "next/cache";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: string | null;
  priority: string | null;
  link: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
};

export async function getMyNotifications(): Promise<
  NotificationItem[]
> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return [];
  }

  const { data, error } = await supabase
    .from("notifications")
    .select(`
      id,
      title,
      message,
      type,
      priority,
      link,
      is_read,
      read_at,
      created_at
    `)
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: false,
    })
    .limit(20);

  if (error) {
    console.error("Failed to fetch notifications", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    return [];
  }

  return (data ?? []) as NotificationItem[];
}

export async function markNotificationAsRead(
  notificationId: string,
): Promise<void> {
  if (!notificationId) {
    throw new Error("Notification ID is required.");
  }

  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be signed in.");
  }

  const { error } = await supabase
    .from("notifications")
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Failed to mark notification as read", {
      notificationId,
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    throw new Error("Unable to update the notification.");
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/notifications");
}

export async function markAllNotificationsAsRead(): Promise<void> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be signed in.");
  }

  const { error } = await supabase
    .from("notifications")
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) {
    console.error("Failed to mark notifications as read", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    throw new Error("Unable to update notifications.");
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/notifications");
}