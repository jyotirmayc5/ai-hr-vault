import Link from "next/link";
import { getEmployees } from "./actions";

export default async function EmployeesPage() {
  const employees = await getEmployees();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Employees</h1>
        <p className="text-gray-500">
          Manage employee records, profiles, and HR information.
        </p>
      </div>

      <div className="rounded-lg border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Job Title</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>

          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/dashboard/employees/${employee.id}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {employee.first_name} {employee.last_name}
                  </Link>

                  <div className="text-gray-500">{employee.email}</div>
                </td>

                <td className="px-4 py-3">{employee.job_title}</td>

                <td className="px-4 py-3">
                  {employee.department?.name ?? "—"}
                </td>

                <td className="px-4 py-3">
                  {employee.location?.name ?? "—"}
                </td>

                <td className="px-4 py-3">
                  {employee.employment_status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}