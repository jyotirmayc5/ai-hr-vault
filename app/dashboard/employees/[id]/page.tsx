import { notFound } from "next/navigation";

import { getEmployeeOverview } from "@/app/dashboard/employees/services/employee-overview.service";

import EmployeeOverviewGrid from "./components/EmployeeOverviewGrid";

export default async function EmployeeOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id || id === "undefined") {
    notFound();
  }

  let overview;

  try {
    overview = await getEmployeeOverview(id);
  } catch (error) {
    console.error(
      "Employee overview page error:",
      error instanceof Error ? error.message : String(error),
    );

    notFound();
  }

  if (!overview) {
    notFound();
  }

  const { employee } = overview;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          Employee Overview
        </p>

        <h1 className="text-2xl font-semibold tracking-tight">
          {employee.first_name} {employee.last_name}
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          {employee.job_title ?? "Job title not assigned"}
        </p>
      </div>

      <EmployeeOverviewGrid overview={overview} />
    </div>
  );
}