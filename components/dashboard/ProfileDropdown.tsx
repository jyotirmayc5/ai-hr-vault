import Link from "next/link";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";

export default function ProfileDropdown({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
}) {
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border px-3 py-2"
      >
        <User size={18} />
        <span className="hidden md:block">Admin</span>
        <ChevronDown size={16} />
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-56 rounded-lg border bg-white p-2 shadow dark:bg-slate-900">
          <Link
            href="/dashboard/profile"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 rounded px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            <User size={16} />
            Profile
          </Link>

          <Link
            href="/dashboard/settings"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 rounded px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            <Settings size={16} />
            Settings
          </Link>

          <button className="flex w-full items-center gap-2 rounded px-3 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-slate-800">
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}