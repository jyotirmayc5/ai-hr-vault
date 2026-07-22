"use client";

import { FileDown } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import type {
  LeaveLiabilityReportRow,
  LeaveLiabilitySummary,
} from "./leave-liability-report.service";

type ExportPdfButtonProps = {
  year: number;
  rows: LeaveLiabilityReportRow[];
  summary: LeaveLiabilitySummary;
  companyName?: string;
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

function formatNumber(
  value: number,
): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatCurrency(
  value: number,
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function getGeneratedDate(): string {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  ).format(new Date());
}

function drawSummaryCard(
  doc: jsPDF,
  options: {
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    value: string;
  },
): void {
  const {
    x,
    y,
    width,
    height,
    label,
    value,
  } = options;

  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);

  doc.roundedRect(
    x,
    y,
    width,
    height,
    3,
    3,
    "FD",
  );

  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  doc.text(
    label.toUpperCase(),
    x + 5,
    y + 8,
  );

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);

  doc.text(
    value,
    x + 5,
    y + 18,
  );
}

export default function ExportPdfButton({
  year,
  rows,
  summary,
  companyName = "AI HR Vault",
}: ExportPdfButtonProps) {
  function handleExport(): void {
    if (rows.length === 0) {
      return;
    }

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pageWidth =
      doc.internal.pageSize.getWidth();

    const pageHeight =
      doc.internal.pageSize.getHeight();

    const margin = 14;

    doc.setFillColor(15, 23, 42);

    doc.rect(
      0,
      0,
      pageWidth,
      34,
      "F",
    );

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);

    doc.text(
      companyName,
      margin,
      14,
    );

    doc.setFontSize(12);

    doc.text(
      "Leave Liability Report",
      margin,
      23,
    );

    doc.setFont(
      "helvetica",
      "normal",
    );

    doc.setFontSize(9);

    doc.text(
      `Reporting year: ${year}`,
      pageWidth - margin,
      14,
      {
        align: "right",
      },
    );

    doc.text(
      `Generated: ${getGeneratedDate()}`,
      pageWidth - margin,
      22,
      {
        align: "right",
      },
    );

    const cardY = 42;
    const cardGap = 5;

    const cardWidth =
      (pageWidth -
        margin * 2 -
        cardGap * 3) /
      4;

    const cardHeight = 24;

    drawSummaryCard(doc, {
      x: margin,
      y: cardY,
      width: cardWidth,
      height: cardHeight,
      label: "Employees",
      value: String(
        summary.employeeCount,
      ),
    });

    drawSummaryCard(doc, {
      x:
        margin +
        cardWidth +
        cardGap,
      y: cardY,
      width: cardWidth,
      height: cardHeight,
      label: "Unused days",
      value: formatNumber(
        summary.unusedDays,
      ),
    });

    drawSummaryCard(doc, {
      x:
        margin +
        (cardWidth + cardGap) * 2,
      y: cardY,
      width: cardWidth,
      height: cardHeight,
      label: "Average unused",
      value: formatNumber(
        summary.averageUnusedDays,
      ),
    });

    drawSummaryCard(doc, {
      x:
        margin +
        (cardWidth + cardGap) * 3,
      y: cardY,
      width: cardWidth,
      height: cardHeight,
      label: "Estimated liability",
      value: formatCurrency(
        summary.estimatedLiability,
      ),
    });

    autoTable(doc, {
      startY: cardY + cardHeight + 9,

      margin: {
        left: margin,
        right: margin,
        bottom: 16,
      },

      head: [
        [
          "Employee",
          "Department",
          "Leave Type",
          "Allocated",
          "Used",
          "Unused",
          "Pay Type",
          "Daily Rate",
          "Liability",
        ],
      ],

      body: rows.map((row) => [
        row.employeeNumber
          ? `${row.employeeName}\n${row.employeeNumber}`
          : row.employeeName,
        row.departmentName ??
          "Unassigned",
        formatLeaveType(row.leaveType),
        formatNumber(
          row.allocatedDays,
        ),
        formatNumber(row.usedDays),
        formatNumber(row.unusedDays),
        formatPayType(row.payType),
        row.dailyRate > 0
          ? formatCurrency(
              row.dailyRate,
            )
          : "Not available",
        formatCurrency(
          row.estimatedLiability,
        ),
      ]),

      theme: "grid",

      styles: {
        font: "helvetica",
        fontSize: 7.5,
        cellPadding: 2.5,
        valign: "middle",
        lineColor: [
          226,
          232,
          240,
        ],
        lineWidth: 0.2,
        textColor: [
          51,
          65,
          85,
        ],
      },

      headStyles: {
        fillColor: [
          30,
          41,
          59,
        ],
        textColor: [
          255,
          255,
          255,
        ],
        fontStyle: "bold",
        halign: "left",
      },

      alternateRowStyles: {
        fillColor: [
          248,
          250,
          252,
        ],
      },

      columnStyles: {
        0: {
          cellWidth: 35,
        },
        1: {
          cellWidth: 28,
        },
        2: {
          cellWidth: 24,
        },
        3: {
          halign: "right",
          cellWidth: 18,
        },
        4: {
          halign: "right",
          cellWidth: 16,
        },
        5: {
          halign: "right",
          cellWidth: 18,
        },
        6: {
          cellWidth: 20,
        },
        7: {
          halign: "right",
          cellWidth: 25,
        },
        8: {
          halign: "right",
          cellWidth: 30,
          fontStyle: "bold",
        },
      },

      didDrawPage: () => {
        const pageNumber =
          doc.getNumberOfPages();

        doc.setDrawColor(
          226,
          232,
          240,
        );

        doc.line(
          margin,
          pageHeight - 11,
          pageWidth - margin,
          pageHeight - 11,
        );

        doc.setTextColor(
          100,
          116,
          139,
        );

        doc.setFont(
          "helvetica",
          "normal",
        );

        doc.setFontSize(8);

        doc.text(
          `${companyName} · Leave Liability Report`,
          margin,
          pageHeight - 6,
        );

        doc.text(
          `Page ${pageNumber}`,
          pageWidth - margin,
          pageHeight - 6,
          {
            align: "right",
          },
        );
      },
    });

    doc.save(
      `leave-liability-report-${year}.pdf`,
    );
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={rows.length === 0}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
    >
      <FileDown size={16} />
      Export PDF
    </button>
  );
}