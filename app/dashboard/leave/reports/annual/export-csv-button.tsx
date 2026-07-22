"use client";

import { Download } from "lucide-react";

import type { AnnualLeaveUtilizationRow } from "./annual-leave-report.service";

type ExportCsvButtonProps = {
  rows: AnnualLeaveUtilizationRow[];
  year: number;
};

function escapeCsvValue(
  value: string | number,
): string {
  const stringValue = String(value);

  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }

  return stringValue;
}

function formatLeaveType(value: string): string {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function createCsvContent(
  rows: AnnualLeaveUtilizationRow[],
): string {
  const headers = [
    "Employee",
    "Department",
    "Leave Type",
    "Allocated Days",
    "Used Days",
    "Remaining Days",
    "Request Count",
    "Utilization Percentage",
  ];

  const csvRows = rows.map((row) => [
    row.employeeName,
    row.departmentName,
    formatLeaveType(row.leaveType),
    row.allocatedDays,
    row.usedDays,
    row.remainingDays,
    row.requestCount,
    `${row.utilizationPercentage}%`,
  ]);

  return [headers, ...csvRows]
    .map((row) =>
      row
        .map((value) =>
          escapeCsvValue(value),
        )
        .join(","),
    )
    .join("\n");
}

export default function ExportCsvButton({
  rows,
  year,
}: ExportCsvButtonProps) {
  function handleExport() {
    if (rows.length === 0) {
      return;
    }

    const csvContent =
      createCsvContent(rows);

    const csvWithByteOrderMark =
      `\uFEFF${csvContent}`;

    const blob = new Blob(
      [csvWithByteOrderMark],
      {
        type: "text/csv;charset=utf-8;",
      },
    );

    const objectUrl =
      URL.createObjectURL(blob);

    const downloadLink =
      document.createElement("a");

    downloadLink.href = objectUrl;
    downloadLink.download =
      `annual-leave-utilization-${year}.csv`;

    document.body.appendChild(
      downloadLink,
    );

    downloadLink.click();
    downloadLink.remove();

    URL.revokeObjectURL(objectUrl);
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={rows.length === 0}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
    >
      <Download size={16} />

      Export CSV
    </button>
  );
}