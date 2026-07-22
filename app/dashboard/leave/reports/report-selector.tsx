"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

type ReportMode =
  | "employee-history"
  | "monthly"
  | "department";

const REPORT_OPTIONS: Array<{
  value: ReportMode;
  label: string;
}> = [
  {
    value: "employee-history",
    label: "Employee History",
  },
  {
    value: "monthly",
    label: "Monthly Report",
  },
  {
    value: "department",
    label: "Department Report",
  },
];

export default function ReportSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isPending, startTransition] =
    useTransition();

  const selectedReport =
    (searchParams.get("report") as ReportMode | null) ??
    "employee-history";

  function handleChange(value: ReportMode) {
    const params = new URLSearchParams(
      searchParams.toString(),
    );

    params.set("report", value);

    startTransition(() => {
      router.push(
        `/dashboard/leave/reports?${params.toString()}`,
      );
    });
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <label
        htmlFor="leave-report-selector"
        className="text-sm font-medium"
      >
        Report
      </label>

      <select
        id="leave-report-selector"
        value={selectedReport}
        disabled={isPending}
        onChange={(event) =>
          handleChange(
            event.target.value as ReportMode,
          )
        }
        className="w-full rounded-md border bg-background px-3 py-2 text-sm sm:w-64"
      >
        {REPORT_OPTIONS.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}