import { ReactNode } from "react";

import { Button } from "@/components/ui/Button.old";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageHeader({
  title,
  description,
  action,
}: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 border-b pb-6 md:flex-row md:items-center md:justify-between">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">
          {title}
        </h1>

        {description ? (
          <p className="text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      {action ? (
        <div className="flex items-center gap-2">
          {action}
        </div>
      ) : null}
    </div>
  );
}