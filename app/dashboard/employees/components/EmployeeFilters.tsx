export default function EmployeeFilters() {
  return (
    <select className="w-full rounded-lg border px-3 py-2 dark:bg-slate-900">
      <option>All Departments</option>
      <option>Human Resources</option>
      <option>Finance</option>
      <option>Operations</option>
      <option>Engineering</option>
    </select>
  );
}