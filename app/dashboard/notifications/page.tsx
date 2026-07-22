import { Bell, CheckCheck } from "lucide-react";
import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";

import NotificationList from "./notification-lists";
import {
  getUnreadNotificationCount,
  getUserNotifications,
} from "./notification.service";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const [notifications, unreadCount] = await Promise.all([
    getUserNotifications(user.id, {
      limit: 100,
    }),
    getUnreadNotificationCount(user.id),
  ]);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg border bg-card">
              <Bell className="size-5 text-muted-foreground" />
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Notifications
              </h1>

              <p className="text-sm text-muted-foreground">
                View updates, reminders, approvals, and system alerts.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2">
          <CheckCheck className="size-4 text-muted-foreground" />

          <span className="text-sm font-medium">
            {unreadCount === 0
              ? "No unread notifications"
              : `${unreadCount} unread ${
                  unreadCount === 1 ? "notification" : "notifications"
                }`}
          </span>
        </div>
      </header>

      <NotificationList
        notifications={notifications}
        currentUserId={user.id}
      />
    </div>
  );
}