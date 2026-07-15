import { EmployeeProfileNav } from "../profile";

export default async function EmployeeProfileLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <EmployeeProfileNav employeeId={id} />
      <div className="px-6">{children}</div>
    </div>
  );
}