import Link from "next/link";

const reports = [
  {
    title: "Headcount by Department",
    description:
      "View employee distribution across departments.",
    metric: "156 employees",
    href: "/dashboard/reports/headcount",
  },
  {
    title: "Leave Summary",
    description:
      "Track approved, pending, and rejected leave requests.",
    metric: "7 pending",
    href: "/dashboard/leave/reports",
  },
  {
    title: "Training Completion",
    description:
      "Monitor required training and certification progress.",
    metric: "88% complete",
    href: "/dashboard/reports/training",
  },
  {
    title: "Performance Reviews",
    description:
      "Review completed and upcoming performance cycles.",
    metric: "14 open",
    href: "/dashboard/reports/performance",
  },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Reports
        </h1>

        <p className="text-gray-500">
          Review workforce analytics,
          compliance metrics, and HR
          trends.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {reports.map((report) => (
          <div
            key={report.title}
            className="rounded-lg border bg-white p-6 shadow-sm"
          >
            <p className="text-sm font-medium text-gray-500">
              {report.metric}
            </p>

            <h2 className="mt-3 text-xl font-semibold">
              {report.title}
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {report.description}
            </p>

            <Link
              href={report.href}
              className="mt-5 inline-flex rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              View Report
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}