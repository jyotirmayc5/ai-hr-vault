import {
  Building2,
  Calendar,
  Lock,
  Plug,
  ShieldCheck,
  Users,
} from "lucide-react";

const settings = [
  {
    title: "Company Settings",
    description: "Manage company name, address, departments, and locations.",
    icon: Building2,
  },
  {
    title: "Users & Roles",
    description: "Control admin users, HR managers, and employee access.",
    icon: Users,
  },
  {
    title: "Permissions",
    description: "Configure role-based access and security controls.",
    icon: ShieldCheck,
  },
  {
    title: "Leave Policies",
    description: "Set PTO, sick leave, holidays, and approval rules.",
    icon: Calendar,
  },
  {
    title: "Integrations",
    description: "Connect payroll, email, storage, and automation tools.",
    icon: Plug,
  },
  {
    title: "Security",
    description: "Manage authentication, audit logging, and compliance settings.",
    icon: Lock,
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-500">
          Configure company-wide HR system preferences.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {settings.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-lg border bg-white p-6 shadow-sm hover:bg-gray-50"
            >
              <Icon size={24} className="text-gray-500" />
              <h2 className="mt-4 text-lg font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm text-gray-500">{item.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}