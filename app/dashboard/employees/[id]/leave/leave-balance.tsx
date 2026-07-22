import {
  BriefcaseBusiness,
  CalendarClock,
  HeartPulse,
  UserRound,
} from "lucide-react";

import type {
  EmployeeLeaveBalance,
  LeaveType,
} from "@/app/dashboard/employees/services/employee-leave.service";

interface LeaveBalanceProps {
  balances: EmployeeLeaveBalance[];
}

function getLeaveIcon(leaveType: LeaveType) {
  switch (leaveType) {
    case "vacation":
      return BriefcaseBusiness;

    case "sick":
      return HeartPulse;

    case "personal":
      return UserRound;

    default:
      return CalendarClock;
  }
}

function getProgressPercentage(balance: EmployeeLeaveBalance): number {
  if (balance.allocated <= 0) {
    return 0;
  }

  return Math.min(
    Math.round((balance.used / balance.allocated) * 100),
    100,
  );
}

export default function LeaveBalance({ balances }: LeaveBalanceProps) {
  if (balances.length === 0) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-slate-100 p-2">
            <CalendarClock className="h-5 w-5 text-slate-600" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Leave balance
            </h2>

            <p className="text-sm text-slate-500">
              No leave balance information is available.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Leave balance
        </h2>

        <p className="text-sm text-slate-500">
          Current annual allocation and usage by leave type.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {balances.map((balance) => {
          const Icon = getLeaveIcon(balance.leaveType);
          const progressPercentage = getProgressPercentage(balance);

          return (
            <article
              key={balance.leaveType}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-slate-100 p-2.5">
                    <Icon className="h-5 w-5 text-slate-700" />
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {balance.label}
                    </h3>

                    <p className="text-xs text-slate-500">
                      Annual allowance
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                  {balance.remaining} remaining
                </span>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Allocated
                  </p>

                  <p className="mt-1 text-xl font-semibold text-slate-900">
                    {balance.allocated}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Used
                  </p>

                  <p className="mt-1 text-xl font-semibold text-slate-900">
                    {balance.used}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Remaining
                  </p>

                  <p className="mt-1 text-xl font-semibold text-slate-900">
                    {balance.remaining}
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    {progressPercentage}% used
                  </span>

                  {balance.pending > 0 ? (
                    <span className="font-medium text-amber-700">
                      {balance.pending} pending
                    </span>
                  ) : (
                    <span className="text-slate-400">No pending days</span>
                  )}
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-slate-900 transition-all"
                    style={{
                      width: `${progressPercentage}%`,
                    }}
                  />
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}