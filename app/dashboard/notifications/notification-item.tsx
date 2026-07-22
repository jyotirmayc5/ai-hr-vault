"use client";

import Link from "next/link";
import {
  Archive,
  Bell,
  BriefcaseBusiness,
  Check,
  CircleAlert,
  FileText,
  GraduationCap,
  Package,
  ShieldAlert,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type {
  Notification,
  NotificationPriority,
  NotificationType,
} from "./notification.service";

interface NotificationItemProps {
  notification: Notification;
  isPending?: boolean;
  onMarkAsRead: (notificationId: string) => void;
  onMarkAsUnread: (notificationId: string) => void;
  onDelete: (notificationId: string) => void;
}

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "leave":
      return BriefcaseBusiness;

    case "performance":
      return Archive;

    case "training":
      return GraduationCap;

    case "document":
      return FileText;

    case "asset":
      return Package;

    case "system":
    default:
      return Bell;
  }
}

function getPriorityIcon(priority: NotificationPriority) {
  switch (priority) {
    case "high":
      return ShieldAlert;

    case "low":
      return Check;

    case "normal":
    default:
      return CircleAlert;
  }
}

function formatNotificationDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();
  const differenceInSeconds = Math.floor(
    (now.getTime() - date.getTime()) / 1000,
  );

  if (differenceInSeconds < 60) {
    return "Just now";
  }

  const differenceInMinutes = Math.floor(differenceInSeconds / 60);

  if (differenceInMinutes < 60) {
    return `${differenceInMinutes}m ago`;
  }

  const differenceInHours = Math.floor(differenceInMinutes / 60);

  if (differenceInHours < 24) {
    return `${differenceInHours}h ago`;
  }

  const differenceInDays = Math.floor(differenceInHours / 24);

  if (differenceInDays < 7) {
    return `${differenceInDays}d ago`;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year:
      date.getFullYear() !== now.getFullYear()
        ? "numeric"
        : undefined,
  }).format(date);
}

function NotificationContent({
  notification,
}: {
  notification: Notification;
}) {
  const NotificationIcon = getNotificationIcon(notification.type);
  const PriorityIcon = getPriorityIcon(notification.priority);

  return (
    <>
      <div
        className={cn(
          "mt-1 flex size-10 shrink-0 items-center justify-center rounded-full border",
          notification.is_read
            ? "bg-muted text-muted-foreground"
            : "bg-primary/10 text-primary",
        )}
      >
        <NotificationIcon className="size-5" />
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <h2
              className={cn(
                "truncate text-sm",
                notification.is_read
                  ? "font-medium"
                  : "font-semibold",
              )}
            >
              {notification.title}
            </h2>

            {!notification.is_read && (
              <span
                aria-label="Unread notification"
                className="size-2 shrink-0 rounded-full bg-primary"
              />
            )}
          </div>

          <time
            className="shrink-0 text-xs text-muted-foreground"
            dateTime={notification.created_at}
          >
            {formatNotificationDate(notification.created_at)}
          </time>
        </div>

        <p className="text-sm leading-6 text-muted-foreground">
          {notification.message}
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize text-muted-foreground">
            {notification.type}
          </span>

          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs capitalize",
              notification.priority === "high" &&
                "bg-destructive/10 text-destructive",
              notification.priority === "normal" &&
                "bg-muted text-muted-foreground",
              notification.priority === "low" &&
                "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
            )}
          >
            <PriorityIcon className="size-3" />
            {notification.priority}
          </span>
        </div>
      </div>
    </>
  );
}

export default function NotificationItem({
  notification,
  isPending = false,
  onMarkAsRead,
  onMarkAsUnread,
  onDelete,
}: NotificationItemProps) {
  return (
    <article
      className={cn(
        "group relative flex gap-4 border-b p-4 transition-colors last:border-b-0 sm:p-5",
        notification.is_read
          ? "bg-background hover:bg-muted/30"
          : "bg-primary/[0.03] hover:bg-primary/[0.06]",
        isPending && "pointer-events-none opacity-60",
      )}
    >
      {notification.link ? (
        <Link
          href={notification.link}
          className="flex min-w-0 flex-1 gap-4"
          aria-label={`Open notification: ${notification.title}`}
        >
          <NotificationContent notification={notification} />
        </Link>
      ) : (
        <div className="flex min-w-0 flex-1 gap-4">
          <NotificationContent notification={notification} />
        </div>
      )}

      <div className="flex shrink-0 items-start gap-1">
        {notification.is_read ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            disabled={isPending}
            onClick={() => onMarkAsUnread(notification.id)}
            aria-label="Mark notification as unread"
            title="Mark as unread"
          >
            <Bell className="size-4" />
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            disabled={isPending}
            onClick={() => onMarkAsRead(notification.id)}
            aria-label="Mark notification as read"
            title="Mark as read"
          >
            <Check className="size-4" />
          </Button>
        )}

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:text-destructive"
          disabled={isPending}
          onClick={() => onDelete(notification.id)}
          aria-label="Delete notification"
          title="Delete notification"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </article>
  );
}