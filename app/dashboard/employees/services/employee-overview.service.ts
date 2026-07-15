import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

import type {
  Employee,
  EmployeeAsset,
  EmployeeCompensation,
  EmployeeDocument,
  EmployeeLeave,
  EmployeeReview,
} from "@/types/employee";

/* ============================================================
   Overview Types
============================================================ */

export interface EmployeeOverviewManager {
  id: string;
  first_name: string;
  last_name: string;
  job_title: string | null;
  email: string | null;
}

export interface EmployeeOverviewEmergencyContact {
  id: string;
  first_name: string;
  last_name: string;
  relationship: string;
  phone: string;
  email: string | null;
  address: string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface EmployeeOverviewTraining {
  id: string;
  company_id: string;
  employee_id: string;

  training_name?: string | null;
  course_name?: string | null;
  provider?: string | null;

  status?: string | null;

  assigned_date?: string | null;
  start_date?: string | null;
  completion_date?: string | null;
  expiration_date?: string | null;

  certificate_url?: string | null;
  notes?: string | null;

  created_at?: string | null;
  updated_at?: string | null;
}

export interface EmployeeOverviewActivity {
  id: string;
  action: string;
  description: string | null;
  created_at: string;

  performed_by: {
    id: string;
    full_name: string;
  } | null;
}

export interface EmployeeOverviewData {
  employee: Employee;
  manager: EmployeeOverviewManager | null;

  latestCompensation: EmployeeCompensation | null;
  recentDocuments: EmployeeDocument[];
  upcomingLeave: EmployeeLeave[];
  assignedAssets: EmployeeAsset[];
  recentTraining: EmployeeOverviewTraining[];
  latestReview: EmployeeReview | null;

  emergencyContacts: EmployeeOverviewEmergencyContact[];
  recentActivity: EmployeeOverviewActivity[];
}

/* ============================================================
   Database Row Types
============================================================ */

interface LookupRow {
  id: string;
  name: string;
}

interface EmployeeRow {
  id: string;
  company_id: string;
  employee_number: string | null;

  first_name: string;
  last_name: string;

  email: string | null;
  phone: string | null;

  job_title: string | null;
  employment_status: string | null;

  start_date: string | null;
  termination_date: string | null;

  manager_id: string | null;
  department_id: string | null;
  location_id: string | null;

  created_at: string;
  updated_at: string | null;

  department: LookupRow | LookupRow[] | null;
  location: LookupRow | LookupRow[] | null;
}

interface ManagerRow {
  id: string;
  first_name: string;
  last_name: string;
  job_title: string | null;
  email: string | null;
}

interface EmergencyContactRow {
  id: string;
  first_name: string;
  last_name: string;
  relationship: string;
  phone: string;
  email: string | null;
  address: string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string | null;
}

interface AuditLogRow {
  id: string;
  action: string;
  description: string | null;
  created_at: string;
}

/* ============================================================
   Helpers
============================================================ */

function firstOrNull<T>(
  value: T | T[] | null | undefined,
): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function mapEmployee(
  row: EmployeeRow,
  manager: EmployeeOverviewManager | null,
): Employee {
  const department = firstOrNull(row.department);
  const location = firstOrNull(row.location);

  return {
    id: row.id,
    company_id: row.company_id,
    employee_number: row.employee_number,

    first_name: row.first_name,
    last_name: row.last_name,

    email: row.email,
    phone: row.phone,

    job_title: row.job_title,
    employment_type: null,
    employment_status: row.employment_status,

    start_date: row.start_date,
    termination_date: row.termination_date,

    manager_id: row.manager_id,
    department_id: row.department_id,
    location_id: row.location_id,

    created_at: row.created_at,
    updated_at: row.updated_at,

    department: department
      ? {
          id: department.id,
          name: department.name,
        }
      : null,

    location: location
      ? {
          id: location.id,
          name: location.name,
        }
      : null,

    manager: manager
      ? {
          id: manager.id,
          first_name: manager.first_name,
          last_name: manager.last_name,
          job_title: manager.job_title,
        }
      : null,
  };
}

/* ============================================================
   Employee Overview Service
============================================================ */

export async function getEmployeeOverview(
  employeeId: string,
): Promise<EmployeeOverviewData | null> {
  if (!employeeId || employeeId === "undefined") {
    return null;
  }

  const supabase = await createServerSupabaseClient();

  /*
   * Load the employee without performing the self-referencing
   * manager join. The manager is loaded separately below.
   */
  const { data: employeeData, error: employeeError } =
    await supabase
      .from("employees")
      .select(
        `
          id,
          company_id,
          employee_number,
          first_name,
          last_name,
          email,
          phone,
          job_title,
          employment_status,
          start_date,
          termination_date,
          manager_id,
          department_id,
          location_id,
          created_at,
          updated_at,

          department:departments!employees_department_id_fkey (
            id,
            name
          ),

          location:locations!employees_location_id_fkey (
            id,
            name
          )
        `,
      )
      .eq("id", employeeId)
      .maybeSingle();

  if (employeeError) {
    console.error("Employee overview employee query failed:", {
      employeeId,
      message: employeeError.message,
      details: employeeError.details,
      hint: employeeError.hint,
      code: employeeError.code,
    });

    throw new Error(
      `Failed to load employee: ${employeeError.message}`,
    );
  }

  if (!employeeData) {
    return null;
  }

  const employeeRow = employeeData as unknown as EmployeeRow;
  const companyId = employeeRow.company_id;

  /* ============================================================
     Load Manager Separately
  ============================================================ */

  let managerData: EmployeeOverviewManager | null = null;

  if (employeeRow.manager_id) {
    const { data, error } = await supabase
      .from("employees")
      .select(
        `
          id,
          first_name,
          last_name,
          job_title,
          email
        `,
      )
      .eq("id", employeeRow.manager_id)
      .eq("company_id", companyId)
      .maybeSingle();

    if (error) {
      console.error("Employee overview manager query failed:", {
        employeeId,
        managerId: employeeRow.manager_id,
        companyId,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
    } else if (data) {
      const managerRow = data as ManagerRow;

      managerData = {
        id: managerRow.id,
        first_name: managerRow.first_name,
        last_name: managerRow.last_name,
        job_title: managerRow.job_title,
        email: managerRow.email,
      };
    }
  }

  const today = new Date().toISOString().slice(0, 10);

  /* ============================================================
     Load Dashboard Sections Concurrently
  ============================================================ */

  const [
    compensationResult,
    documentsResult,
    leaveResult,
    assetsResult,
    trainingResult,
    emergencyContactsResult,
    activityResult,
  ] = await Promise.all([
    supabase
      .from("employee_compensation")
      .select("*")
      .eq("company_id", companyId)
      .eq("employee_id", employeeId)
      .order("effective_start_date", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle(),

    supabase
      .from("employee_documents")
      .select("*")
      .eq("company_id", companyId)
      .eq("employee_id", employeeId)
      .order("created_at", {
        ascending: false,
      })
      .limit(5),

    supabase
      .from("employee_leave_requests")
      .select("*")
      .eq("company_id", companyId)
      .eq("employee_id", employeeId)
      .gte("end_date", today)
      .order("start_date", {
        ascending: true,
      })
      .limit(5),

    supabase
      .from("employee_assets")
      .select("*")
      .eq("company_id", companyId)
      .eq("employee_id", employeeId)
      .is("returned_date", null)
      .order("assigned_date", {
        ascending: false,
      })
      .limit(5),

    supabase
      .from("employee_training")
      .select("*")
      .eq("company_id", companyId)
      .eq("employee_id", employeeId)
      .order("created_at", {
        ascending: false,
      })
      .limit(5),

    supabase
      .from("employee_emergency_contacts")
      .select(
        `
          id,
          first_name,
          last_name,
          relationship,
          phone,
          email,
          address,
          is_primary,
          created_at,
          updated_at
        `,
      )
      .eq("company_id", companyId)
      .eq("employee_id", employeeId)
      .order("is_primary", {
        ascending: false,
      })
      .order("created_at", {
        ascending: false,
      })
      .limit(5),

    /*
     * Do not join profiles here. Your exact audit-log foreign-key
     * name has not been confirmed, so this avoids another schema
     * relationship error.
     */
    supabase
    .from("employee_audit_logs")
    .select(
        `
        id,
        action,
        description,
        created_at
        `,
    )
    .eq("employee_id", employeeId)
    .order("created_at", {
        ascending: false,
    })
    .limit(10),
  ]);

  /* ============================================================
     Report Query Errors
  ============================================================ */

  const sectionErrors = [
  {
    section: "compensation",
    error: compensationResult.error,
  },
  {
    section: "documents",
    error: documentsResult.error,
  },
  {
    section: "leave",
    error: leaveResult.error,
  },
  {
    section: "assets",
    error: assetsResult.error,
  },
  {
    section: "training",
    error: trainingResult.error,
  },

  {
    section: "emergencyContacts",
    error: emergencyContactsResult.error,
  },
  {
    section: "activity",
    error: activityResult.error,
  },
].filter(({ error }) => Boolean(error));

for (const { section, error } of sectionErrors) {
  console.error(
    [
      `Employee overview ${section} query failed`,
      `employeeId: ${employeeId}`,
      `companyId: ${companyId}`,
      `message: ${error?.message ?? "Unknown error"}`,
      `details: ${error?.details ?? "None"}`,
      `hint: ${error?.hint ?? "None"}`,
      `code: ${error?.code ?? "None"}`,
    ].join(" | "),
  );
}

  /* ============================================================
     Map Emergency Contacts
  ============================================================ */

const emergencyContacts: EmployeeOverviewEmergencyContact[] =
  emergencyContactsResult.error
    ? []
    : (emergencyContactsResult.data ?? []).map((contact) => {
    const row = contact as EmergencyContactRow;

      return {
        id: row.id,
        first_name: row.first_name,
        last_name: row.last_name,
        relationship: row.relationship,
        phone: row.phone,
        email: row.email,
        address: row.address,
        is_primary: row.is_primary,
        created_at: row.created_at,
        updated_at: row.updated_at,
      };
    });

  /* ============================================================
     Map Recent Activity
  ============================================================ */

const recentActivity: EmployeeOverviewActivity[] =
  activityResult.error
    ? []
    : (activityResult.data ?? []).map((activity) => {
        const row = activity as AuditLogRow;

        return {
          id: row.id,
          action: row.action,
          description: row.description,
          created_at: row.created_at,
          performed_by: null,
        };
      });

  /* ============================================================
     Return Overview
  ============================================================ */

  return {
  employee: mapEmployee(employeeRow, managerData),
  manager: managerData,

  latestCompensation: compensationResult.error
    ? null
    : ((compensationResult.data as EmployeeCompensation | null) ??
      null),

  recentDocuments: documentsResult.error
    ? []
    : ((documentsResult.data as EmployeeDocument[] | null) ?? []),

  upcomingLeave: leaveResult.error
    ? []
    : ((leaveResult.data as EmployeeLeave[] | null) ?? []),

  assignedAssets: assetsResult.error
    ? []
    : ((assetsResult.data as EmployeeAsset[] | null) ?? []),

  recentTraining: trainingResult.error
    ? []
    : ((trainingResult.data as EmployeeOverviewTraining[] | null) ??
      []),

  latestReview: null,

  emergencyContacts,
  recentActivity,
};
}