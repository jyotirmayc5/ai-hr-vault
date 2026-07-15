import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import EmployeeStatusBadge from "./EmployeeStatusBadge";

type EmployeeHeaderProps = {
  employee: {
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
    job_title: string | null;
    employment_status: string | null;
    department: {
      name: string;
    } | null;
    location: {
      name: string;
    } | null;
  };
};

export default function EmployeeHeader({ employee }: EmployeeHeaderProps) {
  const initials = `${employee.first_name?.[0] ?? ""}${employee.last_name?.[0] ?? ""}`;

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-xl font-semibold text-gray-700">
            {initials}
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold">
                {employee.first_name} {employee.last_name}
              </h1>

              <EmployeeStatusBadge status={employee.employment_status ?? "unknown"} />
            </div>

            <p className="mt-1 text-gray-500">
              {employee.job_title ?? "—"} · {employee.department?.name ?? "—"}
            </p>

            <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Mail size={16} />
                {employee.email ?? "—"}
              </span>

              <span className="flex items-center gap-1">
                <Phone size={16} />
                {employee.phone ?? "—"}
              </span>

              <span className="flex items-center gap-1">
                <MapPin size={16} />
                {employee.location?.name ?? "—"}
              </span>
            </div>
          </div>
        </div>

        <Link
          href={`/dashboard/employees/${employee.id}/edit`}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Edit Employee
        </Link>
      </div>
    </div>
  );
}