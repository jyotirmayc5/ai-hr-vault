export default function EmploymentForm() {
  return (
    <div className="rounded-lg border bg-white p-6">
      <h2 className="text-xl font-semibold">Employment</h2>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <input className="rounded-md border p-2" placeholder="Job title" />
        <input className="rounded-md border p-2" placeholder="Department" />
        <input className="rounded-md border p-2" placeholder="Manager" />
        <input className="rounded-md border p-2" placeholder="Employment type" />
        <input className="rounded-md border p-2" placeholder="Status" />
        <input className="rounded-md border p-2" placeholder="Work location" />
        <input className="rounded-md border p-2" type="date" />
        <input className="rounded-md border p-2" placeholder="Employee ID" />
      </div>

      <button className="mt-6 rounded-md bg-black px-4 py-2 text-white">
        Save Employment
      </button>
    </div>
  );
}