import { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SummaryCardProps {
  title: string;
  value: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  footer,
  className,
}: SummaryCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>

        {icon}
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold">
          {value}
        </div>

        {subtitle ? (
          <p className="mt-1 text-sm text-muted-foreground">
            {subtitle}
          </p>
        ) : null}

        {footer ? (
          <div className="mt-4">
            {footer}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}