export default function EmployeeStatusBadge({
  status,
}: {
  status: string;
}) {
  return (
    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
      {status}
    </span>
  );
}