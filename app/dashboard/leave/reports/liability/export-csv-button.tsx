"use client";

import { Download } from "lucide-react";

import type { LeaveLiabilityReportRow } from "./leave-liability-report.service";

type ExportCsvButtonProps = {
  year: number;
  rows: LeaveLiabilityReportRow[];
};

function formatLeaveType(
  value: string,
): string {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function formatPayType(
  value: "salary" | "hourly" | null,
): string {
  if (value === "salary") {
    return "Salary";
  }

  if (value === "hourly") {
    return "Hourly";
  }

  return "Not available";
}

function escapeCsvValue(
  value:
    | string
    | number
    | null
    | undefined,
): string {
  const normalizedValue =
    value === null ||
    value === undefined
      ? ""
      : String(value);

  const escapedValue =
    normalizedValue.replaceAll(
      '"',
      '""',
    );

  return `"${escapedValue}"`;
}

function formatDecimal(
  value: number,
): string {
  return value.toFixed(2);
}

function buildCsv(
  rows: LeaveLiabilityReportRow[],
): string {
  const headers = [
    "Employee Number",
    "Employee Name",
    "Department",
    "Leave Type",
    "Allocated Days",
    "Used Days",
    "Unused Days",
    "Pay Type",
    "Annual Salary",
    "Hourly Rate",
    "Daily Rate",
    "Estimated Liability",
  ];

  const lines = [
    headers
      .map(escapeCsvValue)
      .join(","),
  ];

  for (const row of rows) {
    const values = [
      row.employeeNumber,
      row.employeeName,
      row.departmentName ??
        "Unassigned",
      formatLeaveType(row.leaveType),
      formatDecimal(
        row.allocatedDays,
      ),
      formatDecimal(row.usedDays),
      formatDecimal(row.unusedDays),
      formatPayType(row.payType),
      row.annualSalary !== null
        ? formatDecimal(
            row.annualSalary,
          )
        : "",
      row.hourlyRate !== null
        ? formatDecimal(
            row.hourlyRate,
          )
        : "",
      formatDecimal(row.dailyRate),
      formatDecimal(
        row.estimatedLiability,
      ),
    ];

    lines.push(
      values
        .map(escapeCsvValue)
        .join(","),
    );
  }

  return lines.join("\n");
}

function downloadCsv(
  content: string,
  filename: string,
): void {
  const csvWithBom = `\uFEFF${content}`;

  const blob = new Blob(
    [csvWithBom],
    {
      type: "text/csv;charset=utf-8;",
    },
  );

  const url =
    URL.createObjectURL(blob);

  const anchor =
    document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = "none";

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
}

export default function ExportCsvButton({
  year,
  rows,
}: ExportCsvButtonProps) {
  function handleExport(): void {
    if (rows.length === 0) {
      return;
    }

    const csv = buildCsv(rows);

    downloadCsv(
      csv,
      `leave-liability-report-${year}.csv`,
    );
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={rows.length === 0}
      className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
    >
      <Download size={16} />
      Export CSV
    </button>
  );
}