import {
  Activity,
  CalendarDays,
  ClipboardCheck,
  GraduationCap,
  Plus,
  Users,
} from "lucide-react";

const stats = [
  { label: "Employees", value: "156", icon: Users },
  { label: "Open Leave", value: "7", icon: CalendarDays },
  { label: "Open Reviews", value: "14", icon: ClipboardCheck },
  { label: "Training Due", value: "19", icon: GraduationCap },
];

const activity = [
  "Admin User uploaded an employment agreement.",
  "Sarah Jones completed Security Awareness training.",
  "Mike Brown requested vacation leave.",
  "Emily Davis was added as a new employee.",
];

const quickActions = [
  "Add Employee",
  "Upload Document",
  "Assign Asset",
  "Create Review",
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500">Here&apos;s what&apos;s happening in HR today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div key={stat.label} className="rounded-lg border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{stat.label}</p>
                <Icon size={20} className="text-gray-400" />
              </div>
              <p className="mt-3 text-3xl font-bold">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Recent Activity</h2>

          <div className="mt-4 space-y-4">
            {activity.map((item) => (
              <div key={item} className="flex gap-3">
                <Activity size={18} className="mt-1 text-gray-400" />
                <p className="text-sm text-gray-600">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Quick Actions</h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {quickActions.map((action) => (
              <button
                key={action}
                className="flex items-center gap-2 rounded-md border px-4 py-3 text-sm font-medium hover:bg-gray-50"
              >
                <Plus size={16} />
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}