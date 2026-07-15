import {
  Building2,
  ChevronDown,
  Menu,
  Moon,
  Plus,
  Search,
  Sun,
} from "lucide-react";
import Breadcrumbs from "./Breadcrumbs";
import NotificationDropdown from "./NotificationDropdown";
import ProfileDropdown from "./ProfileDropdown";

export default function TopNavbar({
  darkMode,
  setDarkMode,
  notificationsOpen,
  setNotificationsOpen,
  profileOpen,
  setProfileOpen,
  setCommandOpen,
}: {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  notificationsOpen: boolean;
  setNotificationsOpen: (value: boolean) => void;
  profileOpen: boolean;
  setProfileOpen: (value: boolean) => void;
  setCommandOpen: (value: boolean) => void;
}) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-4 dark:bg-slate-900 md:px-6">
      <div className="flex items-center gap-4">
        <button className="md:hidden">
          <Menu />
        </button>

        <Breadcrumbs />
      </div>

      <div className="hidden w-80 items-center gap-2 rounded-lg border px-3 py-2 md:flex">
        <Search size={18} />
        <input
          onFocus={() => setCommandOpen(true)}
          placeholder="Search or press Ctrl+K"
          className="w-full bg-transparent outline-none"
        />
      </div>

      <div className="flex items-center gap-3">
        <button className="hidden items-center gap-2 rounded-lg border px-3 py-2 md:flex">
          <Building2 size={18} />
          Acme Corp
          <ChevronDown size={16} />
        </button>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="rounded-lg border p-2"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <NotificationDropdown
          open={notificationsOpen}
          setOpen={setNotificationsOpen}
        />

        <button className="hidden items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-white md:flex">
          <Plus size={18} />
          New
        </button>

        <ProfileDropdown open={profileOpen} setOpen={setProfileOpen} />
      </div>
    </header>
  );
}