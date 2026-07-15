"use client";

import {
  useActionState,
  useEffect,
  useState,
} from "react";

import {
  AlertCircle,
  Loader2,
  Pencil,
  Plus,
  X,
} from "lucide-react";

import {
  createEmergencyContact,
  updateEmergencyContact,
  type EmergencyContactActionState,
} from "./actions";

export type EmergencyContact = {
  id: string;
  company_id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  relationship: string;
  phone: string;
  email: string | null;
  address: string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string | null;
  created_by: string | null;
  updated_by: string | null;
};

type EmergencyContactDialogProps = {
  employeeId: string;
  contact?: EmergencyContact;
};

const initialState: EmergencyContactActionState = {
  success: false,
  message: "",
};

function FieldError({
  messages,
}: {
  messages?: string[];
}) {
  if (!messages || messages.length === 0) {
    return null;
  }

  return (
    <p className="mt-1 text-sm text-red-600">
      {messages[0]}
    </p>
  );
}

export default function EmergencyContactDialog({
  employeeId,
  contact,
}: EmergencyContactDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const isEditing = Boolean(contact);

  const action = isEditing
    ? updateEmergencyContact
    : createEmergencyContact;

  const [state, formAction, isPending] = useActionState(
    action,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      setIsOpen(false);
    }
  }, [state.success]);

  function openDialog() {
    setIsOpen(true);
  }

  function closeDialog() {
    if (!isPending) {
      setIsOpen(false);
    }
  }

  return (
    <>
      {isEditing ? (
        <button
          type="button"
          onClick={openDialog}
          className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition hover:bg-muted"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </button>
      ) : (
        <button
          type="button"
          onClick={openDialog}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add emergency contact
        </button>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="emergency-contact-dialog-title"
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-background shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2
                  id="emergency-contact-dialog-title"
                  className="text-xl font-semibold"
                >
                  {isEditing
                    ? "Edit emergency contact"
                    : "Add emergency contact"}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {isEditing
                    ? "Update this employee’s emergency contact information."
                    : "Add someone who should be contacted during an emergency."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeDialog}
                disabled={isPending}
                className="rounded-md p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form action={formAction}>
              <input
                type="hidden"
                name="employee_id"
                value={employeeId}
              />

              {contact && (
                <input
                  type="hidden"
                  name="contact_id"
                  value={contact.id}
                />
              )}

              <div className="space-y-5 px-6 py-6">
                {!state.success &&
                  state.errors?.general &&
                  state.errors.general.length > 0 && (
                    <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
                      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                      <div>
                        <p className="font-medium">
                          Unable to save contact
                        </p>

                        <p className="mt-1 text-sm">
                          {state.errors.general[0]}
                        </p>
                      </div>
                    </div>
                  )}

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor={`first-name-${contact?.id ?? "new"}`}
                      className="mb-2 block text-sm font-medium"
                    >
                      First name
                      <span className="ml-1 text-red-600">
                        *
                      </span>
                    </label>

                    <input
                      id={`first-name-${contact?.id ?? "new"}`}
                      name="first_name"
                      type="text"
                      required
                      maxLength={100}
                      defaultValue={contact?.first_name ?? ""}
                      disabled={isPending}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                    />

                    <FieldError
                      messages={state.errors?.first_name}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`last-name-${contact?.id ?? "new"}`}
                      className="mb-2 block text-sm font-medium"
                    >
                      Last name
                      <span className="ml-1 text-red-600">
                        *
                      </span>
                    </label>

                    <input
                      id={`last-name-${contact?.id ?? "new"}`}
                      name="last_name"
                      type="text"
                      required
                      maxLength={100}
                      defaultValue={contact?.last_name ?? ""}
                      disabled={isPending}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                    />

                    <FieldError
                      messages={state.errors?.last_name}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor={`relationship-${contact?.id ?? "new"}`}
                    className="mb-2 block text-sm font-medium"
                  >
                    Relationship
                    <span className="ml-1 text-red-600">
                      *
                    </span>
                  </label>

                  <select
                    id={`relationship-${contact?.id ?? "new"}`}
                    name="relationship"
                    required
                    defaultValue={contact?.relationship ?? ""}
                    disabled={isPending}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">
                      Select a relationship
                    </option>
                    <option value="Spouse">Spouse</option>
                    <option value="Partner">Partner</option>
                    <option value="Parent">Parent</option>
                    <option value="Child">Child</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Relative">Relative</option>
                    <option value="Friend">Friend</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Other">Other</option>
                  </select>

                  <FieldError
                    messages={state.errors?.relationship}
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor={`phone-${contact?.id ?? "new"}`}
                      className="mb-2 block text-sm font-medium"
                    >
                      Phone number
                      <span className="ml-1 text-red-600">
                        *
                      </span>
                    </label>

                    <input
                      id={`phone-${contact?.id ?? "new"}`}
                      name="phone"
                      type="tel"
                      required
                      maxLength={50}
                      placeholder="(555) 123-4567"
                      defaultValue={contact?.phone ?? ""}
                      disabled={isPending}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                    />

                    <FieldError
                      messages={state.errors?.phone}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`email-${contact?.id ?? "new"}`}
                      className="mb-2 block text-sm font-medium"
                    >
                      Email address
                    </label>

                    <input
                      id={`email-${contact?.id ?? "new"}`}
                      name="email"
                      type="email"
                      maxLength={255}
                      placeholder="contact@example.com"
                      defaultValue={contact?.email ?? ""}
                      disabled={isPending}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                    />

                    <FieldError
                      messages={state.errors?.email}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor={`address-${contact?.id ?? "new"}`}
                    className="mb-2 block text-sm font-medium"
                  >
                    Address
                  </label>

                  <textarea
                    id={`address-${contact?.id ?? "new"}`}
                    name="address"
                    rows={3}
                    maxLength={1000}
                    placeholder="Street address, city, state and ZIP code"
                    defaultValue={contact?.address ?? ""}
                    disabled={isPending}
                    className="w-full resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                  />

                  <FieldError
                    messages={state.errors?.address}
                  />
                </div>

                <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-4">
                  <input
                    name="is_primary"
                    type="checkbox"
                    defaultChecked={contact?.is_primary ?? false}
                    disabled={isPending}
                    className="mt-1 h-4 w-4 rounded border"
                  />

                  <span>
                    <span className="block text-sm font-medium">
                      Primary emergency contact
                    </span>

                    <span className="mt-1 block text-sm text-muted-foreground">
                      Selecting this option will remove the
                      primary designation from any other contact.
                    </span>
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
                <button
                  type="button"
                  onClick={closeDialog}
                  disabled={isPending}
                  className="rounded-md border px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex min-w-32 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPending && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}

                  {isPending
                    ? "Saving..."
                    : isEditing
                      ? "Save changes"
                      : "Add contact"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}