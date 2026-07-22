import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function NewEmployeePage() {
  return (
    <>
      <h2 className="mb-6 text-3xl font-bold">Add Employee</h2>

      <Card className="max-w-4xl">
        <div className="grid gap-4 md:grid-cols-2">
          <Input placeholder="First name" />
          <Input placeholder="Last name" />
          <Input placeholder="Work email" />
          <Input placeholder="Phone" />
          <Input placeholder="Job title" />
          <Input placeholder="Department" />
          <Input placeholder="Manager" />
          <Input placeholder="Location" />
          <Input type="date" placeholder="Hire date" />
          <Input placeholder="Employment status" />
        </div>

        <div className="mt-6">
          <Button>Create Employee</Button>
        </div>
      </Card>
    </>
  );
}