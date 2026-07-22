import Link from "next/link";
import {
  BarChart3,
  CalendarDays,
  LayoutDashboard,
  Menu,
  Settings,
  Users,
  CalendarRange,
} from "lucide-react";

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (value: boolean) => void;
}) {
  return (
    <aside
      className={`hidden border-r bg-white dark:bg-slate-900 md:block ${
        sidebarOpen ? "w-64" : "w-20"
      }`}
    >
      <div className="flex h-16 items-center justify-between px-4">
        {sidebarOpen && <span className="font-bold">AI HR Vault</span>}

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle sidebar"
        >
          <Menu size={22} />
        </button>
      </div>

      <nav className="space-y-1 px-3">
        <NavItem
          href="/dashboard"
          icon={<LayoutDashboard />}
          label="Dashboard"
          open={sidebarOpen}
        />

        <NavItem
          href="/dashboard/employees"
          icon={<Users />}
          label="Employees"
          open={sidebarOpen}
        />

        <NavItem
          href="/dashboard/leave"
          icon={<CalendarDays />}
          label="Leave"
          open={sidebarOpen}
        />

        <NavItem
          href="/dashboard/reports"
          icon={<BarChart3 />}
          label="Reports"
          open={sidebarOpen}
        />

        {/* Settings */}
        <div className="pt-4">
          {sidebarOpen && (
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Settings
            </p>
          )}

          <NavItem
            href="/dashboard/settings"
            icon={<Settings />}
            label="Settings"
            open={sidebarOpen}
          />

          <NavItem
            href="/dashboard/settings/leave-policies"
            icon={<CalendarRange />}
            label="Leave Policies"
            open={sidebarOpen}
          />
        </div>
      </nav>
    </aside>
  );
}

function NavItem({
  href,
  icon,
  label,
  open,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  open: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-gray-100 dark:hover:bg-slate-800"
    >
      <span className="flex h-5 w-5 items-center justify-center">
        {icon}
      </span>

      {open && <span>{label}</span>}
    </Link>
  );
}