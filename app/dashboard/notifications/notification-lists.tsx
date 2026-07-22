"use client";

import { useState, useTransition } from "react";
import { BellOff, CheckCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import {
  deleteNotificationAction,
  markAllNotificationsAsReadAction,
  markNotificationAsReadAction,
  markNotificationAsUnreadAction,
} from "./actions";
import NotificationItem from "./notification-item";
import type { Notification } from "./notification.service";

interface NotificationListProps {
  notifications: Notification[];
  currentUserId: string;
}

export default function NotificationList({
  notifications,
}: NotificationListProps) {
  const router = useRouter();

  const [pendingNotificationId, setPendingNotificationId] =
    useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  function handleMarkAsRead(notificationId: string): void {
    setPendingNotificationId(notificationId);

    startTransition(async () => {
      try {
        const result =
          await markNotificationAsReadAction(notificationId);

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success(result.message);
        router.refresh();
      } catch (error) {
        console.error("Failed to mark notification as read", error);
        toast.error("Failed to mark notification as read.");
      } finally {
        setPendingNotificationId(null);
      }
    });
  }

  function handleMarkAsUnread(notificationId: string): void {
    setPendingNotificationId(notificationId);

    startTransition(async () => {
      try {
        const result =
          await markNotificationAsUnreadAction(notificationId);

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success(result.message);
        router.refresh();
      } catch (error) {
        console.error("Failed to mark notification as unread", error);
        toast.error("Failed to mark notification as unread.");
      } finally {
        setPendingNotificationId(null);
      }
    });
  }

  function handleDelete(notificationId: string): void {
    setPendingNotificationId(notificationId);

    startTransition(async () => {
      try {
        const result =
          await deleteNotificationAction(notificationId);

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success(result.message);
        router.refresh();
      } catch (error) {
        console.error("Failed to delete notification", error);
        toast.error("Failed to delete notification.");
      } finally {
        setPendingNotificationId(null);
      }
    });
  }

  function handleMarkAllAsRead(): void {
    startTransition(async () => {
      try {
        const result =
          await markAllNotificationsAsReadAction();

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success(result.message);
        router.refresh();
      } catch (error) {
        console.error(
          "Failed to mark all notifications as read",
          error,
        );

        toast.error(
          "Failed to mark all notifications as read.",
        );
      }
    });
  }

  if (notifications.length === 0) {
    return (
      <div className="rounded-xl border bg-card py-16 text-center">
        <BellOff className="mx-auto mb-4 size-10 text-muted-foreground" />

        <h2 className="text-lg font-semibold">
          You&apos;re all caught up
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          You don&apos;t have any notifications yet.
        </p>
      </div>
    );
  }

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read,
  ).length;

  return (
    <section className="overflow-hidden rounded-xl border bg-card">
      <div className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold">Notifications</h2>

          <p className="text-sm text-muted-foreground">
            {notifications.length} total · {unreadCount} unread
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending || unreadCount === 0}
          onClick={handleMarkAllAsRead}
        >
          <CheckCheck className="mr-2 size-4" />
          Mark all read
        </Button>
      </div>

      <div>
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            isPending={
              isPending &&
              pendingNotificationId === notification.id
            }
            onMarkAsRead={handleMarkAsRead}
            onMarkAsUnread={handleMarkAsUnread}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </section>
  );
}