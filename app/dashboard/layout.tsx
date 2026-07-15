"use client";

import { useState } from "react";

import Sidebar from "../../components/dashboard/Sidebar";
import TopNavbar from "../../components/dashboard/TopNavbar";
import CommandPalette from "../../components/dashboard/CommandPalette";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="flex min-h-screen bg-gray-100 text-gray-900 dark:bg-slate-950 dark:text-white">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="flex flex-1 flex-col">
          <TopNavbar
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            notificationsOpen={notificationsOpen}
            setNotificationsOpen={setNotificationsOpen}
            profileOpen={profileOpen}
            setProfileOpen={setProfileOpen}
            setCommandOpen={setCommandOpen}
          />

          <main className="flex-1 p-6">{children}</main>
        </div>

        <CommandPalette open={commandOpen} setOpen={setCommandOpen} />
      </div>
    </div>
  );
}