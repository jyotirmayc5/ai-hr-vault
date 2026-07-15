import { Search } from "lucide-react";

export default function CommandPalette({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-24">
      <div className="w-full max-w-xl rounded-xl bg-white p-4 shadow-xl dark:bg-slate-900">
        <div className="flex items-center gap-2 border-b pb-3">
          <Search size={20} />

          <input
            autoFocus
            placeholder="Search employees, documents, payroll..."
            className="w-full bg-transparent outline-none"
          />

          <button onClick={() => setOpen(false)}>Esc</button>
        </div>

        <div className="pt-4 text-sm text-gray-500">
          Start typing to search.
        </div>
      </div>
    </div>
  );
}