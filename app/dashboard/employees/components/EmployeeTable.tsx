import Link from "next/link";
import Card from "../../../../components/ui/Card";

const employees = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@company.com",
    title: "HR Administrator",
    department: "Human Resources",
    status: "Active",
  },
];

export default function EmployeeTable() {
  return (
    <Card>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b text-sm text-gray-500">
            <th className="py-3">Name</th>
            <th>Email</th>
            <th>Title</th>
            <th>Department</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id} className="border-b">
              <td className="py-4 font-medium">{employee.name}</td>
              <td>{employee.email}</td>
              <td>{employee.title}</td>
              <td>{employee.department}</td>
              <td>{employee.status}</td>
              <td>
                <Link
                  href={`/dashboard/employees/${employee.id}`}
                  className="text-blue-600 hover:underline"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}