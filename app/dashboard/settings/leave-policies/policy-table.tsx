import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { LeavePolicy } from "./leave-policy.service";
import PolicyDialog from "./policy-dialog";

type PolicyTableProps = {
  companyId: string;
  policies: LeavePolicy[];
};

function formatLeaveType(value: string): string {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatNumber(value: number | null): string {
  if (value === null) {
    return "—";
  }

  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(1);
}

function formatAccrualMethod(value: string): string {
  const labels: Record<string, string> = {
    annual: "Annual",
    monthly: "Monthly",
    biweekly: "Biweekly",
    weekly: "Weekly",
    none: "No accrual",
  };

  return labels[value] ?? formatLeaveType(value);
}

export default function PolicyTable({
  companyId,
  policies,
}: PolicyTableProps) {
  if (policies.length === 0) {
    return (
      <div className="rounded-lg border border-dashed px-6 py-12 text-center">
        <h2 className="text-lg font-semibold">
          No leave policies configured
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Create your first leave policy to configure employee
          allocations and approval requirements.
        </p>

        <div className="mt-6 flex justify-center">
          <PolicyDialog companyId={companyId} />
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Policy</TableHead>
            <TableHead>Allocation</TableHead>
            <TableHead>Accrual</TableHead>
            <TableHead>Carry-over</TableHead>
            <TableHead>Maximum balance</TableHead>
            <TableHead>Approvals</TableHead>
            <TableHead>Status</TableHead>

            <TableHead className="w-[100px] text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {policies.map((policy) => {
            const approvals: string[] = [];

            if (policy.requiresManagerApproval) {
              approvals.push("Manager");
            }

            if (policy.requiresHrApproval) {
              approvals.push("HR");
            }

            return (
              <TableRow key={policy.id}>
                <TableCell>
                  <p className="font-medium">
                    {formatLeaveType(policy.leaveType)}
                  </p>
                </TableCell>

                <TableCell>
                  {formatNumber(policy.annualAllocation)} days
                </TableCell>

                <TableCell>
                  {formatAccrualMethod(
                    policy.accrualMethod,
                  )}
                </TableCell>

                <TableCell>
                  {policy.carryOverAllowed ? (
                    <div className="space-y-1">
                      <Badge variant="secondary">
                        Allowed
                      </Badge>

                      <p className="text-xs text-muted-foreground">
                        Maximum{" "}
                        {formatNumber(
                          policy.maxCarryOver,
                        )}{" "}
                        days
                      </p>
                    </div>
                  ) : (
                    <Badge variant="outline">
                      Not allowed
                    </Badge>
                  )}
                </TableCell>

                <TableCell>
                  {policy.maxAccrual === null
                    ? "No maximum"
                    : `${formatNumber(
                        policy.maxAccrual,
                      )} days`}
                </TableCell>

                <TableCell>
                  {approvals.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {approvals.map((approval) => (
                        <Badge
                          key={approval}
                          variant="outline"
                        >
                          {approval}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      None
                    </span>
                  )}
                </TableCell>

                <TableCell>
                  <Badge
                    variant={
                      policy.active
                        ? "default"
                        : "secondary"
                    }
                  >
                    {policy.active
                      ? "Active"
                      : "Inactive"}
                  </Badge>
                </TableCell>

                <TableCell className="text-right">
                  <PolicyDialog
                    companyId={companyId}
                    policy={policy}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}