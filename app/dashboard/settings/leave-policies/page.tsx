import { redirect } from "next/navigation";
import { CalendarRange } from "lucide-react";

import { createServerSupabaseClient } from "@/lib/supabase/server";

import { getLeavePolicies } from "./leave-policy.service";
import PolicyDialog from "./policy-dialog";
import PolicyTable from "./policy-table";

async function getCurrentCompanyId(): Promise<string> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Failed to load current user profile", {
      userId: user.id,
      message: profileError.message,
      details: profileError.details,
      hint: profileError.hint,
      code: profileError.code,
    });

    throw new Error("Unable to load your company information.");
  }

  if (!profile?.company_id) {
    throw new Error(
      "Your user profile is not connected to a company.",
    );
  }

  return profile.company_id;
}

export default async function LeavePoliciesPage() {
  const companyId = await getCurrentCompanyId();
  const policies = await getLeavePolicies(companyId);

  const activePolicyCount = policies.filter(
    (policy) => policy.active,
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-2">
            <CalendarRange className="size-6" />

            <h1 className="text-2xl font-bold tracking-tight">
              Leave Policies
            </h1>
          </div>

          <p className="mt-2 text-muted-foreground">
            Configure leave allocations, accrual rules, carry-over,
            and approval requirements.
          </p>
        </div>

        <PolicyDialog companyId={companyId} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Total policies
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {policies.length}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Active policies
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {activePolicyCount}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Inactive policies
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {policies.length - activePolicyCount}
          </p>
        </div>
      </div>

      <PolicyTable
        companyId={companyId}
        policies={policies}
      />
    </div>
  );
}