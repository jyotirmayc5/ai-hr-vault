import Link from "next/link";
import {
  BarChart3,
  LayoutDashboard,
  Menu,
  Settings,
  Users,
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

        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
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
          href="/dashboard/reports"
          icon={<BarChart3 />}
          label="Reports"
          open={sidebarOpen}
        />

        <NavItem
          href="/dashboard/settings"
          icon={<Settings />}
          label="Settings"
          open={sidebarOpen}
        />
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
      className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-800"
    >
      <span className="h-5 w-5">{icon}</span>
      {open && <span>{label}</span>}
    </Link>
  );
}