"use client";

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

type TopNavbarProps = {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  notificationsOpen: boolean;
  setNotificationsOpen: (value: boolean) => void;
  profileOpen: boolean;
  setProfileOpen: (value: boolean) => void;
  setCommandOpen: (value: boolean) => void;
};

export default function TopNavbar({
  darkMode,
  setDarkMode,
  notificationsOpen,
  setNotificationsOpen,
  profileOpen,
  setProfileOpen,
  setCommandOpen,
}: TopNavbarProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-4 dark:border-slate-800 dark:bg-slate-900 md:px-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Open navigation menu"
          className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-slate-800 md:hidden"
        >
          <Menu size={20} />
        </button>

        <Breadcrumbs />
      </div>

      <div className="hidden w-80 items-center gap-2 rounded-lg border px-3 py-2 dark:border-slate-700 md:flex">
        <Search size={18} />

        <input
          type="text"
          onFocus={() => setCommandOpen(true)}
          placeholder="Search or press Ctrl+K"
          aria-label="Search"
          className="w-full bg-transparent outline-none"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="hidden items-center gap-2 rounded-lg border px-3 py-2 hover:bg-gray-100 dark:border-slate-700 dark:hover:bg-slate-800 md:flex"
        >
          <Building2 size={18} />
          <span>Acme Corp</span>
          <ChevronDown size={16} />
        </button>

        <button
          type="button"
          onClick={() => setDarkMode(!darkMode)}
          aria-label={
            darkMode
              ? "Switch to light mode"
              : "Switch to dark mode"
          }
          className="rounded-lg border p-2 hover:bg-gray-100 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          {darkMode ? (
            <Sun size={18} />
          ) : (
            <Moon size={18} />
          )}
        </button>

        <NotificationDropdown
          open={notificationsOpen}
          setOpen={setNotificationsOpen}
        />

        <button
          type="button"
          className="hidden items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700 md:flex"
        >
          <Plus size={18} />
          <span>New</span>
        </button>

        <ProfileDropdown
          open={profileOpen}
          setOpen={setProfileOpen}
        />
      </div>
    </header>
  );
}