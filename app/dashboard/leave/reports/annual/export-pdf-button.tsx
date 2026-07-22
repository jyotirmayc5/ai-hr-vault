"use client";

import { useMemo, useState } from "react";
import { Download, LoaderCircle } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

type AnnualLeaveReportRow = {
  employeeId: string;
  employeeName: string;
  departmentName: string | null;
  leaveType: string;
  allocatedDays: number;
  usedDays: number;
  remainingDays: number;
  utilizationPercentage: number;
};

type ExportPdfButtonProps = {
  year: number;
  rows: AnnualLeaveReportRow[];
  companyName?: string;
};

function formatLeaveType(value: string): string {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercentage(value: number): string {
  return `${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value)}%`;
}

function formatGeneratedDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function createFileName(
  companyName: string,
  year: number,
): string {
  const safeCompanyName = companyName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${safeCompanyName || "company"}-annual-leave-utilization-${year}.pdf`;
}

export default function ExportPdfButton({
  year,
  rows,
  companyName = "AI HR Vault",
}: ExportPdfButtonProps) {
  const [isExporting, setIsExporting] =
    useState(false);

  const summary = useMemo(() => {
    const employeeIds = new Set(
      rows.map((row) => row.employeeId),
    );

    const allocatedDays = rows.reduce(
      (total, row) =>
        total + Number(row.allocatedDays || 0),
      0,
    );

    const usedDays = rows.reduce(
      (total, row) =>
        total + Number(row.usedDays || 0),
      0,
    );

    const overallUtilization =
      allocatedDays > 0
        ? (usedDays / allocatedDays) * 100
        : 0;

    return {
      employeeCount: employeeIds.size,
      allocatedDays,
      usedDays,
      overallUtilization,
    };
  }, [rows]);

  function handleExportPdf() {
    if (rows.length === 0 || isExporting) {
      return;
    }

    setIsExporting(true);

    try {
      const generatedAt = new Date();

      const document = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: "a4",
      });

      const pageWidth =
        document.internal.pageSize.getWidth();

      const pageHeight =
        document.internal.pageSize.getHeight();

      const marginX = 40;
      const contentWidth =
        pageWidth - marginX * 2;

      /*
       * Report header
       */
      document.setFillColor(15, 23, 42);
      document.rect(
        0,
        0,
        pageWidth,
        92,
        "F",
      );

      document.setTextColor(255, 255, 255);
      document.setFont("helvetica", "bold");
      document.setFontSize(18);
      document.text(
        "Annual Leave Utilization Report",
        marginX,
        38,
      );

      document.setFont(
        "helvetica",
        "normal",
      );
      document.setFontSize(10);
      document.setTextColor(
        203,
        213,
        225,
      );
      document.text(companyName, marginX, 58);

      document.text(
        `Year: ${year}`,
        pageWidth - marginX,
        38,
        {
          align: "right",
        },
      );

      document.text(
        `Generated: ${formatGeneratedDate(
          generatedAt,
        )}`,
        pageWidth - marginX,
        58,
        {
          align: "right",
        },
      );

      /*
       * Summary cards
       */
      const cardTop = 112;
      const cardHeight = 64;
      const cardGap = 12;
      const cardWidth =
        (contentWidth - cardGap * 3) / 4;

      const cards = [
        {
          label: "Employees",
          value: formatNumber(
            summary.employeeCount,
          ),
        },
        {
          label: "Allocated Days",
          value: formatNumber(
            summary.allocatedDays,
          ),
        },
        {
          label: "Used Days",
          value: formatNumber(
            summary.usedDays,
          ),
        },
        {
          label: "Overall Utilization",
          value: formatPercentage(
            summary.overallUtilization,
          ),
        },
      ];

      cards.forEach((card, index) => {
        const x =
          marginX +
          index * (cardWidth + cardGap);

        document.setFillColor(
          248,
          250,
          252,
        );

        document.setDrawColor(
          226,
          232,
          240,
        );

        document.roundedRect(
          x,
          cardTop,
          cardWidth,
          cardHeight,
          6,
          6,
          "FD",
        );

        document.setFont(
          "helvetica",
          "normal",
        );
        document.setFontSize(9);
        document.setTextColor(
          100,
          116,
          139,
        );
        document.text(
          card.label,
          x + 14,
          cardTop + 22,
        );

        document.setFont(
          "helvetica",
          "bold",
        );
        document.setFontSize(17);
        document.setTextColor(
          15,
          23,
          42,
        );
        document.text(
          card.value,
          x + 14,
          cardTop + 47,
        );
      });

      /*
       * Report table
       */
      autoTable(document, {
        startY: cardTop + cardHeight + 28,
        margin: {
          left: marginX,
          right: marginX,
          bottom: 42,
        },
        head: [
          [
            "Employee",
            "Department",
            "Leave Type",
            "Allocated",
            "Used",
            "Remaining",
            "Utilization",
          ],
        ],
        body: rows.map((row) => [
          row.employeeName,
          row.departmentName ||
            "Not assigned",
          formatLeaveType(row.leaveType),
          formatNumber(row.allocatedDays),
          formatNumber(row.usedDays),
          formatNumber(row.remainingDays),
          formatPercentage(
            row.utilizationPercentage,
          ),
        ]),
        theme: "grid",
        styles: {
          font: "helvetica",
          fontSize: 8,
          textColor: [30, 41, 59],
          lineColor: [226, 232, 240],
          lineWidth: 0.5,
          cellPadding: {
            top: 7,
            right: 6,
            bottom: 7,
            left: 6,
          },
          valign: "middle",
          overflow: "linebreak",
        },
        headStyles: {
          fillColor: [30, 41, 59],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "left",
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        columnStyles: {
          0: {
            cellWidth: 135,
          },
          1: {
            cellWidth: 110,
          },
          2: {
            cellWidth: 90,
          },
          3: {
            halign: "right",
          },
          4: {
            halign: "right",
          },
          5: {
            halign: "right",
          },
          6: {
            halign: "right",
          },
        },
        didDrawPage: () => {
          const currentPage =
            document.getCurrentPageInfo()
              .pageNumber;

          const totalPages =
            document.getNumberOfPages();

          document.setDrawColor(
            226,
            232,
            240,
          );

          document.line(
            marginX,
            pageHeight - 28,
            pageWidth - marginX,
            pageHeight - 28,
          );

          document.setFont(
            "helvetica",
            "normal",
          );

          document.setFontSize(8);
          document.setTextColor(
            100,
            116,
            139,
          );

          document.text(
            `${companyName} - Annual Leave Utilization`,
            marginX,
            pageHeight - 14,
          );

          document.text(
            `Page ${currentPage} of ${totalPages}`,
            pageWidth - marginX,
            pageHeight - 14,
            {
              align: "right",
            },
          );
        },
      });

      /*
       * Reapply page numbering after the table has
       * finished creating all pages.
       */
      const pageCount =
        document.getNumberOfPages();

      for (
        let pageNumber = 1;
        pageNumber <= pageCount;
        pageNumber += 1
      ) {
        document.setPage(pageNumber);

        document.setFillColor(
          255,
          255,
          255,
        );

        document.rect(
          pageWidth - marginX - 90,
          pageHeight - 24,
          90,
          14,
          "F",
        );

        document.setFont(
          "helvetica",
          "normal",
        );

        document.setFontSize(8);
        document.setTextColor(
          100,
          116,
          139,
        );

        document.text(
          `Page ${pageNumber} of ${pageCount}`,
          pageWidth - marginX,
          pageHeight - 14,
          {
            align: "right",
          },
        );
      }

      document.save(
        createFileName(companyName, year),
      );
    } catch (error) {
      console.error(
        "Failed to export annual leave report PDF",
        error,
      );
    } finally {
      setIsExporting(false);
    }
  }

  const disabled =
    rows.length === 0 || isExporting;

  return (
    <button
      type="button"
      onClick={handleExportPdf}
      disabled={disabled}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
    >
      {isExporting ? (
        <LoaderCircle
          size={16}
          className="animate-spin"
        />
      ) : (
        <Download size={16} />
      )}

      {isExporting
        ? "Generating PDF..."
        : "Export PDF"}
    </button>
  );
}