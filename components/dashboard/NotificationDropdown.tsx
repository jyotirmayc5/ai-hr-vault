"use client";

import Link from "next/link";
import {
  Bell,
  CheckCheck,
  CircleAlert,
  CircleCheck,
  Clock3,
  LoaderCircle,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";

import {
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type NotificationItem,
} from "./notification-actions";

type NotificationDropdownProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
};

export default function NotificationDropdown({
  open,
  setOpen,
}: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<
    NotificationItem[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<
    string | null
  >(null);

  const [isUpdating, startTransition] = useTransition();

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (notification) => !notification.is_read,
      ).length,
    [notifications],
  );

  const loadNotifications = useCallback(async () => {
    setErrorMessage(null);

    try {
      const data = await getMyNotifications();
      setNotifications(data);
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
          "Unable to load notifications.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (open) {
      void loadNotifications();
    }
  }, [open, loadNotifications]);

  function handleMarkAsRead(
    notification: NotificationItem,
  ): void {
    if (notification.is_read) {
      return;
    }

    setNotifications((currentNotifications) =>
      currentNotifications.map((currentNotification) =>
        currentNotification.id === notification.id
          ? {
              ...currentNotification,
              is_read: true,
              read_at: new Date().toISOString(),
            }
          : currentNotification,
      ),
    );

    startTransition(async () => {
      try {
        await markNotificationAsRead(notification.id);
      } catch (error) {
        setErrorMessage(
          getErrorMessage(
            error,
            "Unable to mark the notification as read.",
          ),
        );

        await loadNotifications();
      }
    });
  }

  function handleMarkAllAsRead(): void {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => ({
        ...notification,
        is_read: true,
        read_at:
          notification.read_at ??
          new Date().toISOString(),
      })),
    );

    startTransition(async () => {
      try {
        await markAllNotificationsAsRead();
      } catch (error) {
        setErrorMessage(
          getErrorMessage(
            error,
            "Unable to mark notifications as read.",
          ),
        );

        await loadNotifications();
      }
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={
          unreadCount > 0
            ? `Open notifications. ${unreadCount} unread.`
            : "Open notifications"
        }
        aria-expanded={open}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-background text-foreground transition-colors hover:bg-muted"
      >
        <Bell className="h-4.5 w-4.5" />

        {unreadCount > 0 ? (
          <span className="absolute -right-1.5 -top-1.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold leading-none text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />

          <div className="absolute right-0 top-12 z-50 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-xl border bg-background shadow-xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <h3 className="font-semibold text-foreground">
                  Notifications
                </h3>

                <p className="text-xs text-muted-foreground">
                  {unreadCount > 0
                    ? `${unreadCount} unread notification${
                        unreadCount === 1 ? "" : "s"
                      }`
                    : "You’re all caught up"}
                </p>
              </div>

              {unreadCount > 0 ? (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  disabled={isUpdating}
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              ) : null}
            </div>

            <div className="max-h-[28rem] overflow-y-auto">
              {loading ? (
                <div className="flex min-h-48 items-center justify-center">
                  <LoaderCircle className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : errorMessage ? (
                <div className="px-4 py-8 text-center">
                  <CircleAlert className="mx-auto h-7 w-7 text-red-500" />

                  <p
                    role="alert"
                    className="mt-2 text-sm text-red-600"
                  >
                    {errorMessage}
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setLoading(true);
                      void loadNotifications();
                    }}
                    className="mt-3 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                  >
                    Try again
                  </button>
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <CircleCheck className="mx-auto h-8 w-8 text-muted-foreground" />

                  <p className="mt-3 text-sm font-medium text-foreground">
                    No notifications
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    New leave and approval updates will
                    appear here.
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <NotificationRow
                      key={notification.id}
                      notification={notification}
                      onRead={handleMarkAsRead}
                      onClose={() => setOpen(false)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="border-t bg-muted/30 px-4 py-3">
              <Link
                href="/dashboard/notifications"
                onClick={() => setOpen(false)}
                className="block text-center text-sm font-medium text-primary hover:underline"
              >
                View all notifications
              </Link>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function NotificationRow({
  notification,
  onRead,
  onClose,
}: {
  notification: NotificationItem;
  onRead: (notification: NotificationItem) => void;
  onClose: () => void;
}) {
  const content = (
    <div
      className={`relative flex gap-3 px-4 py-3 transition-colors hover:bg-muted/60 ${
        notification.is_read
          ? "bg-background"
          : "bg-blue-50/60 dark:bg-blue-950/20"
      }`}
    >
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
        <NotificationIcon
          title={notification.title}
          type={notification.type}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <p className="flex-1 text-sm font-medium text-foreground">
            {notification.title}
          </p>

          {!notification.is_read ? (
            <span
              aria-label="Unread"
              className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600"
            />
          ) : null}
        </div>

        <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
          {notification.message}
        </p>

        <div className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
          <Clock3 className="h-3 w-3" />
          {formatRelativeDate(notification.created_at)}
        </div>
      </div>
    </div>
  );

  if (notification.link) {
    return (
      <Link
        href={notification.link}
        onClick={() => {
          onRead(notification);
          onClose();
        }}
        className="block"
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onRead(notification)}
      className="block w-full text-left"
    >
      {content}
    </button>
  );
}

function NotificationIcon({
  title,
  type,
}: {
  title: string;
  type: string | null;
}) {
  const normalizedValue =
    `${title} ${type ?? ""}`.toLowerCase();

  if (
    normalizedValue.includes("approved") ||
    normalizedValue.includes("completed")
  ) {
    return (
      <CircleCheck className="h-4 w-4 text-green-600" />
    );
  }

  if (
    normalizedValue.includes("required") ||
    normalizedValue.includes("pending")
  ) {
    return (
      <Clock3 className="h-4 w-4 text-amber-600" />
    );
  }

  if (
    normalizedValue.includes("rejected") ||
    normalizedValue.includes("cancelled")
  ) {
    return (
      <CircleAlert className="h-4 w-4 text-red-600" />
    );
  }

  return <Bell className="h-4 w-4 text-blue-600" />;
}

function formatRelativeDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const differenceInSeconds = Math.round(
    (date.getTime() - Date.now()) / 1000,
  );

  const formatter = new Intl.RelativeTimeFormat("en", {
    numeric: "auto",
  });

  const ranges: Array<{
    limit: number;
    divisor: number;
    unit: Intl.RelativeTimeFormatUnit;
  }> = [
    {
      limit: 60,
      divisor: 1,
      unit: "second",
    },
    {
      limit: 3_600,
      divisor: 60,
      unit: "minute",
    },
    {
      limit: 86_400,
      divisor: 3_600,
      unit: "hour",
    },
    {
      limit: 604_800,
      divisor: 86_400,
      unit: "day",
    },
    {
      limit: 2_629_800,
      divisor: 604_800,
      unit: "week",
    },
    {
      limit: 31_557_600,
      divisor: 2_629_800,
      unit: "month",
    },
  ];

  const absoluteDifference = Math.abs(
    differenceInSeconds,
  );

  for (const range of ranges) {
    if (absoluteDifference < range.limit) {
      return formatter.format(
        Math.round(
          differenceInSeconds / range.divisor,
        ),
        range.unit,
      );
    }
  }

  return formatter.format(
    Math.round(differenceInSeconds / 31_557_600),
    "year",
  );
}

function getErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}