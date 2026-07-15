import { notFound } from "next/navigation";

import { getEmployeeProfile } from "@/app/dashboard/employees/services/employee-profile.service";
import { getEmployeeCompensation } from "@/app/dashboard/employees/services/employee-compensation.service";
import { canManageCompensation } from "@/app/dashboard/employees/utils/permissions";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatHourlyRate,
} from "@/app/dashboard/employees/utils";

import CompensationDialog from "./compensation-dialog";

export default async function EmployeeCompensationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id || id === "undefined") {
    notFound();
  }

  const employee = await getEmployeeProfile(id);

  if (!employee) {
    notFound();
  }

  const compensation = await getEmployeeCompensation(id);

  const userRole = "admin";
  const canManage = canManageCompensation(userRole);

  const currentCompensation =
    compensation.find((item) => item.effective_end_date === null) ??
    compensation[0] ??
    null;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            Employee Compensation
          </p>
          <h1 className="text-2xl font-semibold">
            {employee.employee.first_name} {employee.employee.last_name}
          </h1>
        </div>

        <CompensationDialog employeeId={id} mode="add" canManage={canManage} />
      </div>

      <div className="rounded-lg border bg-white p-5">
        <p className="text-sm text-muted-foreground">Current Compensation</p>

        {currentCompensation ? (
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-xl font-semibold capitalize">
                {currentCompensation.pay_type}
              </p>

              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                Current
              </span>
            </div>

            <p className="text-2xl font-semibold">
              {currentCompensation.pay_type === "salary"
                ? `${formatCurrency(currentCompensation.annual_salary)}/year`
                : `${formatHourlyRate(currentCompensation.hourly_rate)}/hour`}
            </p>

            <p className="text-sm text-muted-foreground capitalize">
              {currentCompensation.pay_frequency}
            </p>

            <p className="text-sm text-muted-foreground">
              Effective {formatDate(currentCompensation.effective_start_date)}
            </p>

            <span
              className={
                currentCompensation.bonus_eligible
                  ? "inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700"
                  : "inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700"
              }
            >
              {currentCompensation.bonus_eligible
                ? "Bonus Eligible"
                : "Not Bonus Eligible"}
            </span>
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            No current compensation found.
          </p>
        )}
      </div>

      <div className="rounded-lg border bg-white">
        <div className="border-b px-4 py-3">
          <h2 className="font-semibold">Salary History</h2>
          <p className="text-sm text-muted-foreground">
            Compensation records are preserved as history.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left">Effective</th>
                <th className="px-4 py-3 text-left">End Date</th>
                <th className="px-4 py-3 text-left">Pay Type</th>
                <th className="px-4 py-3 text-left">Frequency</th>
                <th className="px-4 py-3 text-right">Annual Salary</th>
                <th className="px-4 py-3 text-right">Hourly Rate</th>
                <th className="px-4 py-3 text-center">Bonus</th>
                <th className="px-4 py-3 text-left">Created</th>
                <th className="px-4 py-3 text-left">Last Updated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {compensation.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    No compensation history found.
                  </td>
                </tr>
              ) : (
                compensation.map((item) => (
                  <tr key={item.id} className="border-b last:border-b-0">
                    <td className="px-4 py-3">
                      {formatDate(item.effective_start_date)}
                    </td>

                    <td className="px-4 py-3">
                      {item.effective_end_date ? (
                        formatDate(item.effective_end_date)
                      ) : (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          Current
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 capitalize">{item.pay_type}</td>

                    <td className="px-4 py-3 capitalize">
                      {item.pay_frequency}
                    </td>

                    <td className="px-4 py-3 text-right">
                      {item.annual_salary == null
                        ? "N/A"
                        : formatCurrency(item.annual_salary)}
                    </td>

                    <td className="px-4 py-3 text-right">
                      {item.hourly_rate == null
                        ? "N/A"
                        : formatHourlyRate(item.hourly_rate)}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span
                        className={
                          item.bonus_eligible
                            ? "rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700"
                            : "rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700"
                        }
                      >
                        {item.bonus_eligible ? "Eligible" : "Not Eligible"}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      {formatDateTime(item.created_at)}
                    </td>

                    <td className="px-4 py-3">
                      {formatDateTime(item.updated_at)}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <CompensationDialog
                        employeeId={id}
                        compensation={item}
                        mode="edit"
                        canManage={canManage}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}