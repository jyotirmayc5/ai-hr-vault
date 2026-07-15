import type { ReactNode } from "react";

interface EmployeeOverviewCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function EmployeeOverviewCard({
  title,
  description,
  icon,
  action,
  children,
  className = "",
}: EmployeeOverviewCardProps) {
  return (
    <section
      className={[
        "overflow-hidden rounded-xl border bg-white shadow-sm",
        "dark:border-slate-800 dark:bg-slate-950",
        className,
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4 border-b px-5 py-4 dark:border-slate-800">
        <div className="flex min-w-0 items-start gap-3">
          {icon ? (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300">
              {icon}
            </div>
          ) : null}

          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-slate-900 dark:text-slate-100">
              {title}
            </h2>

            {description ? (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      <div className="p-5">{children}</div>
    </section>
  );
}