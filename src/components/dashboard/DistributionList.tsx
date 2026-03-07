import { useMemo } from "react";
import InlinePagination from "../Layout/ui/InlinePagination";
import { useClientPagination } from "../../hooks/useClientPagination";

export interface DistributionListItem {
  id: string;
  label: string;
  total: number;
}

type DistributionListProps = {
  items: DistributionListItem[];
  emptyMessage?: string;
  barClassName?: string;
};

export default function DistributionList({
  items,
  emptyMessage = "Sem dados para exibir.",
  barClassName = "bg-blue-500",
}: DistributionListProps) {
  const maxTotal = useMemo(
    () => items.reduce((max, item) => (item.total > max ? item.total : max), 0),
    [items]
  );
  const pagination = useClientPagination(items, { initialPerPage: 5 });

  if (items.length === 0) {
    return <p className="text-sm text-gray-500">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-3">
        {pagination.paginatedItems.map((item) => {
          const widthPercent = maxTotal > 0 ? (item.total / maxTotal) * 100 : 0;

          return (
            <li key={item.id}>
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm text-gray-700">{item.label}</span>
                <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
                  {item.total}
                </span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-gray-100">
                <div
                  className={`h-2 rounded-full ${barClassName}`}
                  style={{ width: `${widthPercent}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <InlinePagination
        total={pagination.total}
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        perPage={pagination.perPage}
        onPageChange={pagination.setCurrentPage}
        onPerPageChange={pagination.setPerPage}
      />
    </div>
  );
}
