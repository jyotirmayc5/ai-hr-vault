"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { LeaveTypeCount } from "./services/leave-dashboard.service";

interface LeaveTypeChartProps {
  data: LeaveTypeCount[];
}

interface LeaveTypeChartItem {
  leaveType: string;
  name: string;
  requests: number;
  days: number;
}

interface TooltipPayloadItem {
  dataKey?: string;
  name?: string;
  value?: number;
  payload?: LeaveTypeChartItem;
}

interface LeaveTypeTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function LeaveTypeTooltip({
  active,
  payload,
  label,
}: LeaveTypeTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0]?.payload;

  if (!item) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
      <p className="text-sm font-medium">{label}</p>

      <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
        <p>
          {item.requests.toLocaleString()}{" "}
          {item.requests === 1 ? "request" : "requests"}
        </p>

        <p>
          {item.days.toLocaleString()}{" "}
          {item.days === 1 ? "day" : "days"}
        </p>
      </div>
    </div>
  );
}

function formatLeaveTypeLabel(value: string): string {
  if (value.length <= 12) {
    return value;
  }

  return `${value.slice(0, 11)}…`;
}

export default function LeaveTypeChart({
  data,
}: LeaveTypeChartProps) {
  const chartData: LeaveTypeChartItem[] = data
    .filter((item) => item.count > 0)
    .map((item) => ({
      leaveType: item.leaveType,
      name: item.label,
      requests: item.count,
      days: item.totalDays,
    }))
    .sort((a, b) => b.requests - a.requests);

  return (
    <section
      aria-labelledby="leave-type-chart-heading"
      className="rounded-xl border bg-card p-5 text-card-foreground shadow-sm"
    >
      <div className="mb-4">
        <h2
          id="leave-type-chart-heading"
          className="text-lg font-semibold tracking-tight"
        >
          Leave by Type
        </h2>

        <p className="text-sm text-muted-foreground">
          Number of submitted requests grouped by leave category.
        </p>
      </div>

      {chartData.length === 0 ? (
        <div className="flex h-[320px] items-center justify-center rounded-lg border border-dashed">
          <div className="text-center">
            <p className="text-sm font-medium">
              No leave type data
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Leave categories will appear after requests are submitted.
            </p>
          </div>
        </div>
      ) : (
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 12,
                right: 12,
                left: -12,
                bottom: 8,
              }}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                className="stroke-muted"
              />

              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 12,
                }}
                tickFormatter={formatLeaveTypeLabel}
                interval={0}
              />

              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 12,
                }}
                width={40}
              />

              <Tooltip
                cursor={{
                  fill: "hsl(var(--muted))",
                  opacity: 0.35,
                }}
                content={<LeaveTypeTooltip />}
              />

              <Bar
                dataKey="requests"
                name="Requests"
                fill="hsl(var(--primary))"
                radius={[6, 6, 0, 0]}
                maxBarSize={54}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}