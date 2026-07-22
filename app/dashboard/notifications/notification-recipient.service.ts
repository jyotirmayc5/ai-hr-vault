import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export type NotificationRecipientRole =
  | "employee"
  | "manager"
  | "hr"
  | "admin";

export interface NotificationRecipient {
  userId: string;
  employeeId: string | null;
  companyId: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  role: NotificationRecipientRole;
}

interface EmployeeRecipientRow {
  id: string;
  company_id: string;
  user_id: string | null;
  manager_id: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

interface ProfileRecipientRow {
  id: string;
  company_id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  is_active: boolean;
}

function logRecipientServiceError(
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
    message:
      supabaseError?.message ??
      "Unknown notification recipient service error",
    details: supabaseError?.details ?? null,
    hint: supabaseError?.hint ?? null,
    code: supabaseError?.code ?? null,
  });
}

function normalizeRole(
  role: string | null,
): NotificationRecipientRole {
  const normalizedRole = role?.trim().toLowerCase();

  if (
    normalizedRole === "hr" ||
    normalizedRole === "human_resources" ||
    normalizedRole === "human resources"
  ) {
    return "hr";
  }

  if (
    normalizedRole === "admin" ||
    normalizedRole === "super_admin" ||
    normalizedRole === "company_admin"
  ) {
    return "admin";
  }

  if (normalizedRole === "manager") {
    return "manager";
  }

  return "employee";
}

function splitFullName(fullName: string | null): {
  firstName: string | null;
  lastName: string | null;
} {
  const normalizedName = fullName?.trim();

  if (!normalizedName) {
    return {
      firstName: null,
      lastName: null,
    };
  }

  const [firstName, ...remainingNames] =
    normalizedName.split(/\s+/);

  return {
    firstName,
    lastName:
      remainingNames.length > 0
        ? remainingNames.join(" ")
        : null,
  };
}

function removeDuplicateRecipients(
  recipients: NotificationRecipient[],
): NotificationRecipient[] {
  const recipientsByUserId = new Map<
    string,
    NotificationRecipient
  >();

  for (const recipient of recipients) {
    if (!recipient.userId) {
      continue;
    }

    if (!recipientsByUserId.has(recipient.userId)) {
      recipientsByUserId.set(
        recipient.userId,
        recipient,
      );
    }
  }

  return [...recipientsByUserId.values()];
}

function employeeRowToRecipient(
  employee: EmployeeRecipientRow,
  role: NotificationRecipientRole,
): NotificationRecipient | null {
  if (!employee.user_id) {
    return null;
  }

  return {
    userId: employee.user_id,
    employeeId: employee.id,
    companyId: employee.company_id,
    firstName: employee.first_name,
    lastName: employee.last_name,
    email: employee.email,
    role,
  };
}

/**
 * Gets the employee row needed for notification recipient resolution.
 */
async function getEmployeeRecipientRow(
  employeeId: string,
): Promise<EmployeeRecipientRow | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("employees")
    .select(
      `
        id,
        company_id,
        user_id,
        manager_id,
        first_name,
        last_name,
        email
      `,
    )
    .eq("id", employeeId)
    .maybeSingle();

  if (error) {
    logRecipientServiceError(
      "Failed to resolve employee notification recipient",
      error,
      {
        employeeId,
      },
    );

    return null;
  }

  return data as EmployeeRecipientRow | null;
}

/**
 * Returns the authenticated user ID linked to an employee.
 *
 * employees.user_id -> auth.users.id
 */
export async function getEmployeeNotificationUserId(
  employeeId: string,
): Promise<string | null> {
  const employee =
    await getEmployeeRecipientRow(employeeId);

  return employee?.user_id ?? null;
}

/**
 * Returns full recipient information for an employee.
 */
export async function getEmployeeNotificationRecipient(
  employeeId: string,
): Promise<NotificationRecipient | null> {
  const employee =
    await getEmployeeRecipientRow(employeeId);

  if (!employee) {
    return null;
  }

  return employeeRowToRecipient(employee, "employee");
}

/**
 * Returns the authenticated user ID linked to an
 * employee's manager.
 */
export async function getManagerNotificationUserId(
  employeeId: string,
): Promise<string | null> {
  const employee =
    await getEmployeeRecipientRow(employeeId);

  if (!employee?.manager_id) {
    return null;
  }

  const manager = await getEmployeeRecipientRow(
    employee.manager_id,
  );

  return manager?.user_id ?? null;
}

/**
 * Returns full recipient information for an
 * employee's manager.
 */
export async function getManagerNotificationRecipient(
  employeeId: string,
): Promise<NotificationRecipient | null> {
  const employee =
    await getEmployeeRecipientRow(employeeId);

  if (!employee?.manager_id) {
    return null;
  }

  const manager = await getEmployeeRecipientRow(
    employee.manager_id,
  );

  if (!manager) {
    return null;
  }

  if (manager.company_id !== employee.company_id) {
    return null;
  }

  return employeeRowToRecipient(manager, "manager");
}

/**
 * Returns all active HR recipients for a company.
 *
 * profiles.id -> auth.users.id
 */
export async function getHrNotificationRecipients(
  companyId: string,
): Promise<NotificationRecipient[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
        id,
        company_id,
        full_name,
        email,
        role,
        is_active
      `,
    )
    .eq("company_id", companyId)
    .eq("is_active", true)
    .in("role", [
      "hr",
      "HR",
      "human_resources",
      "human resources",
    ]);

  if (error) {
    logRecipientServiceError(
      "Failed to resolve HR notification recipients",
      error,
      {
        companyId,
      },
    );

    return [];
  }

  const recipients = (
    (data ?? []) as ProfileRecipientRow[]
  )
    .filter((profile) => Boolean(profile.id))
    .map((profile): NotificationRecipient => {
      const { firstName, lastName } =
        splitFullName(profile.full_name);

      return {
        userId: profile.id,
        employeeId: null,
        companyId: profile.company_id,
        firstName,
        lastName,
        email: profile.email,
        role: normalizeRole(profile.role),
      };
    });

  return removeDuplicateRecipients(recipients);
}

/**
 * Returns all HR authenticated user IDs for a company.
 */
export async function getHrNotificationUserIds(
  companyId: string,
): Promise<string[]> {
  const recipients =
    await getHrNotificationRecipients(companyId);

  return recipients.map(
    (recipient) => recipient.userId,
  );
}

/**
 * Returns all active admin recipients for a company.
 *
 * profiles.id -> auth.users.id
 */
export async function getAdminNotificationRecipients(
  companyId: string,
): Promise<NotificationRecipient[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
        id,
        company_id,
        full_name,
        email,
        role,
        is_active
      `,
    )
    .eq("company_id", companyId)
    .eq("is_active", true)
    .in("role", [
      "admin",
      "super_admin",
      "company_admin",
    ]);

  if (error) {
    logRecipientServiceError(
      "Failed to resolve admin notification recipients",
      error,
      {
        companyId,
      },
    );

    return [];
  }

  const recipients = (
    (data ?? []) as ProfileRecipientRow[]
  )
    .filter((profile) => Boolean(profile.id))
    .map((profile): NotificationRecipient => {
      const { firstName, lastName } =
        splitFullName(profile.full_name);

      return {
        userId: profile.id,
        employeeId: null,
        companyId: profile.company_id,
        firstName,
        lastName,
        email: profile.email,
        role: normalizeRole(profile.role),
      };
    });

  return removeDuplicateRecipients(recipients);
}

/**
 * Returns all admin authenticated user IDs for a company.
 */
export async function getAdminNotificationUserIds(
  companyId: string,
): Promise<string[]> {
  const recipients =
    await getAdminNotificationRecipients(companyId);

  return recipients.map(
    (recipient) => recipient.userId,
  );
}

/**
 * Returns both HR and admin recipients for a company.
 *
 * This is useful when either role can perform HR approval.
 */
export async function getHrAndAdminNotificationRecipients(
  companyId: string,
): Promise<NotificationRecipient[]> {
  const [hrRecipients, adminRecipients] =
    await Promise.all([
      getHrNotificationRecipients(companyId),
      getAdminNotificationRecipients(companyId),
    ]);

  return removeDuplicateRecipients([
    ...hrRecipients,
    ...adminRecipients,
  ]);
}

/**
 * Returns both HR and admin user IDs for a company.
 */
export async function getHrAndAdminNotificationUserIds(
  companyId: string,
): Promise<string[]> {
  const recipients =
    await getHrAndAdminNotificationRecipients(companyId);

  return recipients.map(
    (recipient) => recipient.userId,
  );
}

/**
 * Resolves recipients who should receive a new leave request.
 *
 * Primary recipient:
 * - employee's manager
 *
 * Fallback recipients:
 * - HR and admins when no linked manager account exists
 */
export async function getLeaveSubmissionRecipients(
  employeeId: string,
  companyId: string,
): Promise<NotificationRecipient[]> {
  const manager =
    await getManagerNotificationRecipient(employeeId);

  if (
    manager &&
    manager.companyId === companyId
  ) {
    return [manager];
  }

  return getHrAndAdminNotificationRecipients(
    companyId,
  );
}

/**
 * Resolves recipients who can perform HR approval.
 */
export async function getLeaveHrApprovalRecipients(
  companyId: string,
): Promise<NotificationRecipient[]> {
  return getHrAndAdminNotificationRecipients(
    companyId,
  );
}

/**
 * Resolves the employee, manager, and HR/admin recipients
 * for the complete leave workflow.
 */
export async function getLeaveApprovalRecipients(
  employeeId: string,
  companyId: string,
): Promise<{
  employee: NotificationRecipient | null;
  manager: NotificationRecipient | null;
  hrAndAdmins: NotificationRecipient[];
}> {
  const [employee, manager, hrAndAdmins] =
    await Promise.all([
      getEmployeeNotificationRecipient(employeeId),
      getManagerNotificationRecipient(employeeId),
      getHrAndAdminNotificationRecipients(companyId),
    ]);

  return {
    employee:
      employee?.companyId === companyId
        ? employee
        : null,
    manager:
      manager?.companyId === companyId
        ? manager
        : null,
    hrAndAdmins,
  };
}