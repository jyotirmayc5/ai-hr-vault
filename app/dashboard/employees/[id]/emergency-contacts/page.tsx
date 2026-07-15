import { notFound } from "next/navigation";

import {
  AlertTriangle,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";

import { createServerSupabaseClient } from "@/lib/supabase/server";

import EmergencyContactDialog, {
  type EmergencyContact,
} from "./emergency-contact-dialog";

import {
  deleteEmergencyContact,
  setPrimaryEmergencyContact,
} from "./actions";

type EmployeeBasicInformation = {
  id: string;
  company_id: string;
  first_name: string;
  last_name: string;
  employee_number: string | null;
  job_title: string | null;
};

function formatDateTime(value: string | null): string {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

async function getEmployee(
  employeeId: string,
): Promise<EmployeeBasicInformation | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("employees")
    .select(
      `
        id,
        company_id,
        first_name,
        last_name,
        employee_number,
        job_title
      `,
    )
    .eq("id", employeeId)
    .maybeSingle();

  if (error) {
    console.error("Unable to load employee:", error);
    return null;
  }

  return data as EmployeeBasicInformation | null;
}

async function getEmergencyContacts(
  employeeId: string,
  companyId: string,
): Promise<EmergencyContact[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("employee_emergency_contacts")
    .select(
      `
        id,
        company_id,
        employee_id,
        first_name,
        last_name,
        relationship,
        phone,
        email,
        address,
        is_primary,
        created_at,
        updated_at,
        created_by,
        updated_by
      `,
    )
    .eq("employee_id", employeeId)
    .eq("company_id", companyId)
    .order("is_primary", {
      ascending: false,
    })
    .order("first_name", {
      ascending: true,
    });

  if (error) {
    console.error("Unable to load emergency contacts:", error);
    return [];
  }

  return (data ?? []) as EmergencyContact[];
}

function DeleteContactButton({
  employeeId,
  contactId,
  contactName,
}: {
  employeeId: string;
  contactId: string;
  contactName: string;
}) {
  return (
    <form action={deleteEmergencyContact}>
      <input
        type="hidden"
        name="employee_id"
        value={employeeId}
      />

      <input
        type="hidden"
        name="contact_id"
        value={contactId}
      />

      <button
        type="submit"
        title={`Delete ${contactName}`}
        className="inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
        Delete
      </button>
    </form>
  );
}

function SetPrimaryButton({
  employeeId,
  contactId,
}: {
  employeeId: string;
  contactId: string;
}) {
  return (
    <form action={setPrimaryEmergencyContact}>
      <input
        type="hidden"
        name="employee_id"
        value={employeeId}
      />

      <input
        type="hidden"
        name="contact_id"
        value={contactId}
      />

      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition hover:bg-muted"
      >
        <ShieldCheck className="h-4 w-4" />
        Set primary
      </button>
    </form>
  );
}

export default async function EmployeeEmergencyContactsPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

  if (!id || id === "undefined") {
    notFound();
  }

  const employee = await getEmployee(id);

  if (!employee) {
    notFound();
  }

  const contacts = await getEmergencyContacts(
    employee.id,
    employee.company_id,
  );

  const primaryContact =
    contacts.find((contact) => contact.is_primary) ?? null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm text-muted-foreground">
            Employee emergency contacts
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {employee.first_name} {employee.last_name}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage the people who should be contacted in case
            of an emergency.
          </p>
        </div>

        <EmergencyContactDialog employeeId={employee.id} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Total contacts
              </p>

              <p className="mt-2 text-3xl font-semibold">
                {contacts.length}
              </p>
            </div>

            <div className="rounded-lg bg-muted p-3">
              <Users className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Primary contact
              </p>

              <p className="mt-2 font-semibold">
                {primaryContact
                  ? `${primaryContact.first_name} ${primaryContact.last_name}`
                  : "Not assigned"}
              </p>
            </div>

            <div className="rounded-lg bg-muted p-3">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Contact status
              </p>

              <p className="mt-2 font-semibold">
                {contacts.length > 0
                  ? "Emergency contact available"
                  : "Contact required"}
              </p>
            </div>

            <div className="rounded-lg bg-muted p-3">
              {contacts.length > 0 ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <AlertTriangle className="h-5 w-5" />
              )}
            </div>
          </div>
        </div>
      </div>

      {contacts.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-card px-6 py-14 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <UserRound className="h-6 w-6 text-muted-foreground" />
          </div>

          <h2 className="mt-4 text-lg font-semibold">
            No emergency contacts
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Add at least one emergency contact for this
            employee. A primary contact can be selected when
            the contact is created.
          </p>

          <div className="mt-6">
            <EmergencyContactDialog employeeId={employee.id} />
          </div>
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {contacts.map((contact) => {
            const fullName =
              `${contact.first_name} ${contact.last_name}`.trim();

            return (
              <article
                key={contact.id}
                className="rounded-xl border bg-card shadow-sm"
              >
                <div className="flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted font-semibold">
                      {contact.first_name.charAt(0).toUpperCase()}
                      {contact.last_name.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-lg font-semibold">
                          {fullName}
                        </h2>

                        {contact.is_primary && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Primary
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {contact.relationship}
                      </p>
                    </div>
                  </div>

                  <EmergencyContactDialog
                    employeeId={employee.id}
                    contact={contact}
                  />
                </div>

                <div className="space-y-4 p-5">
                  <div className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Phone
                      </p>

                      <a
                        href={`tel:${contact.phone}`}
                        className="mt-1 block text-sm font-medium hover:underline"
                      >
                        {contact.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Email
                      </p>

                      {contact.email ? (
                        <a
                          href={`mailto:${contact.email}`}
                          className="mt-1 block truncate text-sm font-medium hover:underline"
                        >
                          {contact.email}
                        </a>
                      ) : (
                        <p className="mt-1 text-sm text-muted-foreground">
                          Not provided
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Address
                      </p>

                      <p className="mt-1 whitespace-pre-line text-sm">
                        {contact.address ?? "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 border-t bg-muted/20 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-muted-foreground">
                    Last updated{" "}
                    {formatDateTime(
                      contact.updated_at ?? contact.created_at,
                    )}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {!contact.is_primary && (
                      <SetPrimaryButton
                        employeeId={employee.id}
                        contactId={contact.id}
                      />
                    )}

                    <DeleteContactButton
                      employeeId={employee.id}
                      contactId={contact.id}
                      contactName={fullName}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}