"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import type { LeaveStatusCount } from "./services/leave-dashboard.service";

interface LeaveStatusChartProps {
  data: LeaveStatusCount[];
}

interface ChartDataItem {
  status: LeaveStatusCount["status"];
  name: string;
  value: number;
  color: string;
}

const STATUS_COLORS: Record<LeaveStatusCount["status"], string> = {
  pending: "#f59e0b",
  manager_approved: "#3b82f6",
  approved: "#22c55e",
  hr_approved: "#14b8a6",
  rejected: "#ef4444",
  cancelled: "#64748b",
  completed: "#8b5cf6",
};

const STATUS_LABELS: Record<LeaveStatusCount["status"], string> = {
  pending: "Pending",
  manager_approved: "Manager Approved",
  approved: "Approved",
  hr_approved: "HR Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
  completed: "Completed",
};

interface TooltipPayloadItem {
  name?: string;
  value?: number;
  payload?: ChartDataItem;
}

interface LeaveStatusTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

function LeaveStatusTooltip({
  active,
  payload,
}: LeaveStatusTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0]?.payload;

  if (!item) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
      <p className="text-sm font-medium">{item.name}</p>

      <p className="text-xs text-muted-foreground">
        {item.value.toLocaleString()}{" "}
        {item.value === 1 ? "request" : "requests"}
      </p>
    </div>
  );
}

function renderLegendText(value: string) {
  return (
    <span className="text-xs text-muted-foreground">
      {value}
    </span>
  );
}

export default function LeaveStatusChart({
  data,
}: LeaveStatusChartProps) {
  const chartData: ChartDataItem[] = data
    .filter((item) => item.count > 0)
    .map((item) => ({
      status: item.status,
      name: STATUS_LABELS[item.status] ?? item.label,
      value: item.count,
      color: STATUS_COLORS[item.status],
    }));

  const totalRequests = chartData.reduce(
    (total, item) => total + item.value,
    0,
  );

  return (
    <section
      aria-labelledby="leave-status-chart-heading"
      className="rounded-xl border bg-card p-5 text-card-foreground shadow-sm"
    >
      <div className="mb-4">
        <h2
          id="leave-status-chart-heading"
          className="text-lg font-semibold tracking-tight"
        >
          Leave Request Status
        </h2>

        <p className="text-sm text-muted-foreground">
          Distribution of leave requests by approval status.
        </p>
      </div>

      {chartData.length === 0 ? (
        <div className="flex h-[320px] items-center justify-center rounded-lg border border-dashed">
          <div className="text-center">
            <p className="text-sm font-medium">
              No leave request data
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Status information will appear after leave requests are
              submitted.
            </p>
          </div>
        </div>
      ) : (
        <div className="relative h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="45%"
                innerRadius={70}
                outerRadius={105}
                paddingAngle={3}
                strokeWidth={0}
              >
                {chartData.map((item) => (
                  <Cell
                    key={item.status}
                    fill={item.color}
                  />
                ))}
              </Pie>

              <Tooltip content={<LeaveStatusTooltip />} />

              <Legend
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                formatter={renderLegendText}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 text-center">
            <p className="text-3xl font-bold tracking-tight">
              {totalRequests.toLocaleString()}
            </p>

            <p className="text-xs text-muted-foreground">
              Total requests
            </p>
          </div>
        </div>
      )}
    </section>
  );
}