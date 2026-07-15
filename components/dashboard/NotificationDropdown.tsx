import { Bell } from "lucide-react";

export default function NotificationDropdown({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
}) {
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="rounded-lg border p-2">
        <Bell size={18} />
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-72 rounded-lg border bg-white p-4 shadow dark:bg-slate-900">
          <h3 className="mb-3 font-semibold">Notifications</h3>
          <p className="text-sm text-gray-500">No new notifications.</p>
        </div>
      )}
    </div>
  );
}