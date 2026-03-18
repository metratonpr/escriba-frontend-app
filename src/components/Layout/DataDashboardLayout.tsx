import type { ReactNode } from "react";
import Breadcrumbs from "./Breadcrumbs";

export type BreadcrumbItem = {
  label: string;
  to: string;
};

type DataDashboardLayoutProps = {
  breadcrumbs: BreadcrumbItem[];
  filterPanel?: ReactNode;
  children: ReactNode;
};

export default function DataDashboardLayout({
  breadcrumbs,
  filterPanel,
  children,
}: DataDashboardLayoutProps) {
  return (
    <>
      <Breadcrumbs items={breadcrumbs} />

      {filterPanel && (
        <div className="mb-4 rounded-lg bg-white p-4 shadow-sm">{filterPanel}</div>
      )}

      {children}
    </>
  );
}
