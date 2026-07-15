"use server";

import { revalidatePath } from "next/cache";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export type EmergencyContactErrors = {
  first_name?: string[];
  last_name?: string[];
  relationship?: string[];
  phone?: string[];
  email?: string[];
  address?: string[];
  is_primary?: string[];
  general?: string[];
};

export type EmergencyContactActionState = {
  success: boolean;
  message: string;
  errors?: EmergencyContactErrors;
};

type EmergencyContactPayload = {
  employeeId: string;
  contactId?: string;
  firstName: string;
  lastName: string;
  relationship: string;
  phone: string;
  email: string | null;
  address: string | null;
  isPrimary: boolean;
};

type EmployeeRecord = {
  id: string;
  company_id: string;
};

type EmergencyContactRecord = {
  id: string;
  first_name: string;
  last_name: string;
  relationship: string;
  is_primary: boolean;
};

type EmergencyContactNameRecord = {
  id: string;
  first_name: string;
  last_name: string;
};

function getRequiredString(
  formData: FormData,
  fieldName: string,
): string {
  const value = formData.get(fieldName);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function cleanOptionalValue(
  value: FormDataEntryValue | null,
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const cleanedValue = value.trim();

  return cleanedValue.length > 0 ? cleanedValue : null;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateEmergencyContact(
  payload: EmergencyContactPayload,
): EmergencyContactErrors {
  const errors: EmergencyContactErrors = {};

  if (!payload.firstName) {
    errors.first_name = ["First name is required."];
  } else if (payload.firstName.length > 100) {
    errors.first_name = [
      "First name must be 100 characters or fewer.",
    ];
  }

  if (!payload.lastName) {
    errors.last_name = ["Last name is required."];
  } else if (payload.lastName.length > 100) {
    errors.last_name = [
      "Last name must be 100 characters or fewer.",
    ];
  }

  if (!payload.relationship) {
    errors.relationship = ["Relationship is required."];
  } else if (payload.relationship.length > 100) {
    errors.relationship = [
      "Relationship must be 100 characters or fewer.",
    ];
  }

  if (!payload.phone) {
    errors.phone = ["Phone number is required."];
  } else if (payload.phone.length > 50) {
    errors.phone = [
      "Phone number must be 50 characters or fewer.",
    ];
  }

  if (payload.email) {
    if (!isValidEmail(payload.email)) {
      errors.email = ["Enter a valid email address."];
    } else if (payload.email.length > 255) {
      errors.email = [
        "Email address must be 255 characters or fewer.",
      ];
    }
  }

  if (payload.address && payload.address.length > 1000) {
    errors.address = [
      "Address must be 1,000 characters or fewer.",
    ];
  }

  return errors;
}

async function getAuthenticatedUserId(): Promise<string | null> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error(
      "Unable to get authenticated user:",
      error.message,
    );

    return null;
  }

  return user?.id ?? null;
}

async function getEmployeeRecord(
  employeeId: string,
): Promise<EmployeeRecord | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("employees")
    .select("id, company_id")
    .eq("id", employeeId)
    .maybeSingle();

  if (error) {
    console.error("Unable to load employee:", error.message);

    return null;
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    company_id: data.company_id,
  };
}

async function clearExistingPrimaryContact(
  employeeId: string,
  companyId: string,
  updatedBy: string,
  excludedContactId?: string,
): Promise<void> {
  const supabase = await createServerSupabaseClient();

  let query = supabase
    .from("employee_emergency_contacts")
    .update({
      is_primary: false,
      updated_at: new Date().toISOString(),
      updated_by: updatedBy,
    })
    .eq("employee_id", employeeId)
    .eq("company_id", companyId)
    .eq("is_primary", true);

  if (excludedContactId) {
    query = query.neq("id", excludedContactId);
  }

  const { error } = await query;

  if (error) {
    throw new Error(
      `Unable to update the existing primary contact: ${error.message}`,
    );
  }
}

async function createAuditLog({
  employeeId,
  companyId,
  userId,
  action,
  description,
  metadata,
}: {
  employeeId: string;
  companyId: string;
  userId: string;
  action: string;
  description: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("employee_audit_logs")
    .insert({
      company_id: companyId,
      employee_id: employeeId,
      action,
      description,
      metadata: metadata ?? {},
      created_by: userId,
    });

  if (error) {
    console.error(
      "Unable to create emergency-contact audit log:",
      error.message,
    );
  }
}

function refreshEmployeePages(employeeId: string): void {
  revalidatePath(
    `/dashboard/employees/${employeeId}/emergency-contacts`,
  );

  revalidatePath(`/dashboard/employees/${employeeId}`);
}

export async function createEmergencyContact(
  _previousState: EmergencyContactActionState,
  formData: FormData,
): Promise<EmergencyContactActionState> {
  try {
    const employeeId = getRequiredString(
      formData,
      "employee_id",
    );

    const payload: EmergencyContactPayload = {
      employeeId,
      firstName: getRequiredString(formData, "first_name"),
      lastName: getRequiredString(formData, "last_name"),
      relationship: getRequiredString(
        formData,
        "relationship",
      ),
      phone: getRequiredString(formData, "phone"),
      email: cleanOptionalValue(formData.get("email")),
      address: cleanOptionalValue(formData.get("address")),
      isPrimary: formData.get("is_primary") === "on",
    };

    const validationErrors =
      validateEmergencyContact(payload);

    if (!employeeId) {
      validationErrors.general = [
        "Employee ID is required.",
      ];
    }

    if (Object.keys(validationErrors).length > 0) {
      return {
        success: false,
        message: "Please correct the highlighted fields.",
        errors: validationErrors,
      };
    }

    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return {
        success: false,
        message:
          "You must be signed in to add an emergency contact.",
        errors: {
          general: ["Authentication is required."],
        },
      };
    }

    const employee = await getEmployeeRecord(employeeId);

    if (!employee) {
      return {
        success: false,
        message: "The employee could not be found.",
        errors: {
          general: ["The employee record is invalid."],
        },
      };
    }

    const supabase = await createServerSupabaseClient();

    if (payload.isPrimary) {
      await clearExistingPrimaryContact(
        employee.id,
        employee.company_id,
        userId,
      );
    }

    const { data, error } = await supabase
      .from("employee_emergency_contacts")
      .insert({
        company_id: employee.company_id,
        employee_id: employee.id,
        first_name: payload.firstName,
        last_name: payload.lastName,
        relationship: payload.relationship,
        phone: payload.phone,
        email: payload.email,
        address: payload.address,
        is_primary: payload.isPrimary,
        created_by: userId,
        updated_by: userId,
      })
      .select("id")
      .single();

    if (error) {
      console.error(
        "Unable to create emergency contact:",
        error.message,
      );

      return {
        success: false,
        message:
          "The emergency contact could not be created.",
        errors: {
          general: [error.message],
        },
      };
    }

    await createAuditLog({
      employeeId: employee.id,
      companyId: employee.company_id,
      userId,
      action: "emergency_contact.created",
      description:
        `Emergency contact ${payload.firstName} ` +
        `${payload.lastName} was added.`,
      metadata: {
        emergency_contact_id: data.id,
        relationship: payload.relationship,
        is_primary: payload.isPrimary,
      },
    });

    refreshEmployeePages(employee.id);

    return {
      success: true,
      message: "Emergency contact added successfully.",
    };
  } catch (error) {
    console.error(
      "Create emergency contact error:",
      error,
    );

    return {
      success: false,
      message: "An unexpected error occurred.",
      errors: {
        general: [
          error instanceof Error
            ? error.message
            : "Unable to create the emergency contact.",
        ],
      },
    };
  }
}

export async function updateEmergencyContact(
  _previousState: EmergencyContactActionState,
  formData: FormData,
): Promise<EmergencyContactActionState> {
  try {
    const employeeId = getRequiredString(
      formData,
      "employee_id",
    );

    const contactId = getRequiredString(
      formData,
      "contact_id",
    );

    const payload: EmergencyContactPayload = {
      employeeId,
      contactId,
      firstName: getRequiredString(formData, "first_name"),
      lastName: getRequiredString(formData, "last_name"),
      relationship: getRequiredString(
        formData,
        "relationship",
      ),
      phone: getRequiredString(formData, "phone"),
      email: cleanOptionalValue(formData.get("email")),
      address: cleanOptionalValue(formData.get("address")),
      isPrimary: formData.get("is_primary") === "on",
    };

    const validationErrors =
      validateEmergencyContact(payload);

    if (!employeeId) {
      validationErrors.general = [
        "Employee ID is required.",
      ];
    }

    if (!contactId) {
      validationErrors.general = [
        ...(validationErrors.general ?? []),
        "Emergency contact ID is required.",
      ];
    }

    if (Object.keys(validationErrors).length > 0) {
      return {
        success: false,
        message: "Please correct the highlighted fields.",
        errors: validationErrors,
      };
    }

    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return {
        success: false,
        message:
          "You must be signed in to update an emergency contact.",
        errors: {
          general: ["Authentication is required."],
        },
      };
    }

    const employee = await getEmployeeRecord(employeeId);

    if (!employee) {
      return {
        success: false,
        message: "The employee could not be found.",
        errors: {
          general: ["The employee record is invalid."],
        },
      };
    }

    const supabase = await createServerSupabaseClient();

    const {
      data: existingContactData,
      error: existingContactError,
    } = await supabase
      .from("employee_emergency_contacts")
      .select(
        "id, first_name, last_name, relationship, is_primary",
      )
      .eq("id", contactId)
      .eq("employee_id", employee.id)
      .eq("company_id", employee.company_id)
      .maybeSingle();

    if (existingContactError) {
      return {
        success: false,
        message:
          "Unable to verify the emergency contact.",
        errors: {
          general: [existingContactError.message],
        },
      };
    }

    if (!existingContactData) {
      return {
        success: false,
        message:
          "The emergency contact could not be found.",
        errors: {
          general: ["Invalid emergency contact."],
        },
      };
    }

    const existingContact: EmergencyContactRecord = {
      id: existingContactData.id,
      first_name: existingContactData.first_name,
      last_name: existingContactData.last_name,
      relationship: existingContactData.relationship,
      is_primary: existingContactData.is_primary,
    };

    if (payload.isPrimary) {
      await clearExistingPrimaryContact(
        employee.id,
        employee.company_id,
        userId,
        contactId,
      );
    }

    const { error } = await supabase
      .from("employee_emergency_contacts")
      .update({
        first_name: payload.firstName,
        last_name: payload.lastName,
        relationship: payload.relationship,
        phone: payload.phone,
        email: payload.email,
        address: payload.address,
        is_primary: payload.isPrimary,
        updated_at: new Date().toISOString(),
        updated_by: userId,
      })
      .eq("id", contactId)
      .eq("employee_id", employee.id)
      .eq("company_id", employee.company_id);

    if (error) {
      console.error(
        "Unable to update emergency contact:",
        error.message,
      );

      return {
        success: false,
        message:
          "The emergency contact could not be updated.",
        errors: {
          general: [error.message],
        },
      };
    }

    await createAuditLog({
      employeeId: employee.id,
      companyId: employee.company_id,
      userId,
      action: "emergency_contact.updated",
      description:
        `Emergency contact ${payload.firstName} ` +
        `${payload.lastName} was updated.`,
      metadata: {
        emergency_contact_id: contactId,
        previous_name:
          `${existingContact.first_name} ` +
          `${existingContact.last_name}`,
        relationship: payload.relationship,
        is_primary: payload.isPrimary,
      },
    });

    refreshEmployeePages(employee.id);

    return {
      success: true,
      message: "Emergency contact updated successfully.",
    };
  } catch (error) {
    console.error(
      "Update emergency contact error:",
      error,
    );

    return {
      success: false,
      message: "An unexpected error occurred.",
      errors: {
        general: [
          error instanceof Error
            ? error.message
            : "Unable to update the emergency contact.",
        ],
      },
    };
  }
}

export async function deleteEmergencyContact(
  formData: FormData,
): Promise<void> {
  const employeeId = getRequiredString(
    formData,
    "employee_id",
  );

  const contactId = getRequiredString(
    formData,
    "contact_id",
  );

  if (!employeeId || !contactId) {
    throw new Error(
      "Employee ID and emergency contact ID are required.",
    );
  }

  const userId = await getAuthenticatedUserId();

  if (!userId) {
    throw new Error(
      "You must be signed in to delete an emergency contact.",
    );
  }

  const employee = await getEmployeeRecord(employeeId);

  if (!employee) {
    throw new Error("The employee could not be found.");
  }

  const supabase = await createServerSupabaseClient();

  const { data: contactData, error: contactError } =
    await supabase
      .from("employee_emergency_contacts")
      .select(
        "id, first_name, last_name, relationship, is_primary",
      )
      .eq("id", contactId)
      .eq("employee_id", employee.id)
      .eq("company_id", employee.company_id)
      .maybeSingle();

  if (contactError) {
    throw new Error(contactError.message);
  }

  if (!contactData) {
    throw new Error(
      "The emergency contact could not be found.",
    );
  }

  const contact: EmergencyContactRecord = {
    id: contactData.id,
    first_name: contactData.first_name,
    last_name: contactData.last_name,
    relationship: contactData.relationship,
    is_primary: contactData.is_primary,
  };

  const { error } = await supabase
    .from("employee_emergency_contacts")
    .delete()
    .eq("id", contactId)
    .eq("employee_id", employee.id)
    .eq("company_id", employee.company_id);

  if (error) {
    throw new Error(error.message);
  }

  await createAuditLog({
    employeeId: employee.id,
    companyId: employee.company_id,
    userId,
    action: "emergency_contact.deleted",
    description:
      `Emergency contact ${contact.first_name} ` +
      `${contact.last_name} was deleted.`,
    metadata: {
      emergency_contact_id: contact.id,
      relationship: contact.relationship,
      was_primary: contact.is_primary,
    },
  });

  refreshEmployeePages(employee.id);
}

export async function setPrimaryEmergencyContact(
  formData: FormData,
): Promise<void> {
  const employeeId = getRequiredString(
    formData,
    "employee_id",
  );

  const contactId = getRequiredString(
    formData,
    "contact_id",
  );

  if (!employeeId || !contactId) {
    throw new Error(
      "Employee ID and emergency contact ID are required.",
    );
  }

  const userId = await getAuthenticatedUserId();

  if (!userId) {
    throw new Error(
      "You must be signed in to update the primary contact.",
    );
  }

  const employee = await getEmployeeRecord(employeeId);

  if (!employee) {
    throw new Error("The employee could not be found.");
  }

  const supabase = await createServerSupabaseClient();

  const { data: contactData, error: contactError } =
    await supabase
      .from("employee_emergency_contacts")
      .select("id, first_name, last_name")
      .eq("id", contactId)
      .eq("employee_id", employee.id)
      .eq("company_id", employee.company_id)
      .maybeSingle();

  if (contactError) {
    throw new Error(contactError.message);
  }

  if (!contactData) {
    throw new Error(
      "The emergency contact could not be found.",
    );
  }

  const contact: EmergencyContactNameRecord = {
    id: contactData.id,
    first_name: contactData.first_name,
    last_name: contactData.last_name,
  };

  await clearExistingPrimaryContact(
    employee.id,
    employee.company_id,
    userId,
    contactId,
  );

  const { error } = await supabase
    .from("employee_emergency_contacts")
    .update({
      is_primary: true,
      updated_at: new Date().toISOString(),
      updated_by: userId,
    })
    .eq("id", contactId)
    .eq("employee_id", employee.id)
    .eq("company_id", employee.company_id);

  if (error) {
    throw new Error(error.message);
  }

  await createAuditLog({
    employeeId: employee.id,
    companyId: employee.company_id,
    userId,
    action: "emergency_contact.primary_changed",
    description:
      `${contact.first_name} ${contact.last_name} ` +
      "was set as the primary emergency contact.",
    metadata: {
      emergency_contact_id: contact.id,
    },
  });

  refreshEmployeePages(employee.id);
}