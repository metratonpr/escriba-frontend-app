import type { ReactNode } from "react";

type DashboardSectionCardProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export default function DashboardSectionCard({
  title,
  subtitle = "",
  action,
  children,
  className = "",
}: DashboardSectionCardProps) {
  return (
    <section className={`rounded-xl border border-gray-200 bg-white p-4 shadow-sm ${className}`}>
      <header className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        {action ? <div>{action}</div> : null}
      </header>

      {children}
    </section>
  );
}
