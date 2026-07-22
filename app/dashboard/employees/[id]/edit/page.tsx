import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function EditEmployeePage() {
  return (
    <>
      <h2 className="mb-6 text-3xl font-bold">Edit Employee</h2>

      <Card className="max-w-4xl">
        <div className="grid gap-4 md:grid-cols-2">
          <Input defaultValue="Admin" />
          <Input defaultValue="User" />
          <Input defaultValue="admin@company.com" />
          <Input placeholder="Phone" />
          <Input defaultValue="HR Administrator" />
          <Input defaultValue="Human Resources" />
        </div>

        <div className="mt-6">
          <Button>Save Changes</Button>
        </div>
      </Card>
    </>
  );
}