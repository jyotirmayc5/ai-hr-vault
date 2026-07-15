import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { EmployeeAsset } from "@/types/employee";

/**
 * Returns all assets assigned to an employee.
 *
 * The newest assigned assets are returned first.
 */
export async function getEmployeeAssets(
  employeeId: string,
): Promise<EmployeeAsset[]> {
  if (!employeeId || employeeId === "undefined") {
    return [];
  }

  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("employee_assets")
    .select("*")
    .eq("employee_id", employeeId)
    .order("assigned_date", {
      ascending: false,
      nullsFirst: false,
    })
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error("Failed to load employee assets:", {
      employeeId,
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    throw new Error(`Failed to load employee assets: ${error.message}`);
  }

  return (data ?? []) as EmployeeAsset[];
}

/**
 * Returns only assets that are currently assigned to the employee.
 *
 * This function intentionally checks multiple indicators because older
 * rows may use status while newer rows may rely on returned_date.
 */
export async function getEmployeeCurrentAssets(
  employeeId: string,
): Promise<EmployeeAsset[]> {
  const assets = await getEmployeeAssets(employeeId);

  return assets.filter((asset) => {
    const status = asset.status?.toLowerCase().trim();

    const isReturnedStatus =
      status === "returned" ||
      status === "retired" ||
      status === "lost" ||
      status === "disposed";

    return !asset.returned_date && !isReturnedStatus;
  });
}

/**
 * Returns a single asset by ID.
 */
export async function getEmployeeAssetById(
  assetId: string,
): Promise<EmployeeAsset | null> {
  if (!assetId || assetId === "undefined") {
    return null;
  }

  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("employee_assets")
    .select("*")
    .eq("id", assetId)
    .maybeSingle();

  if (error) {
    console.error("Failed to load employee asset:", {
      assetId,
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    throw new Error(`Failed to load employee asset: ${error.message}`);
  }

  return data ? (data as EmployeeAsset) : null;
}