"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Overview", href: "" },
  { label: "Personal Information", href: "personal" },
  { label: "Employment", href: "employment" },
  { label: "Compensation", href: "compensation" },
  { label: "Documents", href: "documents" },
  { label: "Leave", href: "leave" },
  { label: "Performance", href: "performance" },
  { label: "Training", href: "training" },
  { label: "Assets", href: "assets" },
  { label: "Emergency Contacts", href: "emergency-contacts" },
  { label: "Audit Log", href: "audit-log" },
];

export default function EmployeeProfileNav({ employeeId }: { employeeId: string }) {
  const pathname = usePathname();

  return (
    <div className="border-b bg-white">
      <div className="flex gap-2 overflow-x-auto px-6">
        {tabs.map((tab) => {
          const url = `/dashboard/employees/${employeeId}/${tab.href}`;
          const overviewUrl = `/dashboard/employees/${employeeId}`;
          const finalUrl = tab.href ? url : overviewUrl;

          const active =
            tab.href === ""
              ? pathname === overviewUrl
              : pathname === finalUrl;

          return (
            <Link
              key={tab.label}
              href={finalUrl}
              className={`whitespace-nowrap border-b-2 px-3 py-4 text-sm font-medium ${
                active
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-black"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}