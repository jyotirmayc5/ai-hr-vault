const activities = [
  {
    date: "Jan 10, 2026",
    title: "Employee profile created",
    description: "Admin User was added to AI HR Vault.",
  },
  {
    date: "Jan 12, 2026",
    title: "Document uploaded",
    description: "Employment Agreement was uploaded.",
  },
  {
    date: "Jan 15, 2026",
    title: "Compensation updated",
    description: "Base salary information was updated.",
  },
];

export default function EmployeeTimeline() {
  return (
    <div className="rounded-lg border bg-white p-6">
      <h2 className="text-xl font-semibold">Recent Activity</h2>

      <div className="mt-6 space-y-5">
        {activities.map((activity) => (
          <div key={activity.title} className="border-l-2 pl-4">
            <p className="text-sm text-gray-500">{activity.date}</p>
            <p className="mt-1 font-medium">{activity.title}</p>
            <p className="text-sm text-gray-500">{activity.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}