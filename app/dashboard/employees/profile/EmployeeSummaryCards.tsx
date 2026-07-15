type EmployeeSummaryCardsProps = {
  employee: {
    department: { name: string } | null;
    location: { name: string } | null;
    manager: {
      first_name: string;
      last_name: string;
    } | null;
    start_date: string | null;
    employment_status: string | null;
  };
  latestCompensation: {
    salary_amount: number | null;
    currency: string | null;
  } | null;
  summary: {
    documentCount: number;
    leaveRequestCount: number;
    approvedLeaveCount: number;
    assetCount: number;
    trainingCount: number;
    completedTrainingCount: number;
    performanceReviewCount: number;
  };
};

export default function EmployeeSummaryCards({
  employee,
  latestCompensation,
  summary,
}: EmployeeSummaryCardsProps) {
  const salary =
    latestCompensation?.salary_amount != null
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: latestCompensation.currency ?? "USD",
          maximumFractionDigits: 0,
        }).format(Number(latestCompensation.salary_amount))
      : "—";

  const cards = [
    { label: "Department", value: employee.department?.name ?? "—" },
    {
      label: "Manager",
      value: employee.manager
        ? `${employee.manager.first_name} ${employee.manager.last_name}`
        : "—",
    },
    { label: "Hire Date", value: employee.start_date ?? "—" },
    { label: "Location", value: employee.location?.name ?? "—" },
    { label: "Status", value: employee.employment_status ?? "—" },
    { label: "Salary", value: salary },
    { label: "Documents", value: String(summary.documentCount) },
    {
      label: "Training",
      value: `${summary.completedTrainingCount}/${summary.trainingCount}`,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-lg border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">{card.label}</p>
          <p className="mt-2 text-lg font-semibold">{card.value}</p>
        </div>
      ))}
    </div>
  );
}