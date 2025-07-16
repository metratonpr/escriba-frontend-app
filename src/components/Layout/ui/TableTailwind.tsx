// src/components/Layout/ui/TableTailwind.tsx
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import get from "lodash.get";

export type Column<T> = {
  label: string;
  field: keyof T | string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
};

type Pagination = {
  total: number;
  perPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
};

type TableTailwindProps<T> = {
  title?: string;
  createUrl?: string;
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  error?: string | null;
  pagination?: Pagination;
  getEditUrl?: (id: any) => string;
  onDelete?: (id: any) => void;
  onSortChange?: (field: string, order: "asc" | "desc") => void;
};

export default function TableTailwind<T extends { id: any }>({
  title,
  createUrl,
  columns,
  data,
  loading = false,
  error = null,
  pagination,
  getEditUrl,
  onDelete,
  onSortChange,
}: TableTailwindProps<T>) {
  const [orderBy, setOrderBy] = useState<string>(String(columns[0].field));
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  const sortedData = useMemo(() => {
    if (onSortChange) return data;
    return [...data].sort((a, b) => {
      const aVal = get(a, orderBy);
      const bVal = get(b, orderBy);
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === "string" && typeof bVal === "string") {
        return order === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === "number" && typeof bVal === "number") {
        return order === "asc" ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
  }, [data, orderBy, order, onSortChange]);

  const handleSort = (field: string) => {
    let newOrder: "asc" | "desc" = "asc";
    if (orderBy === field) {
      newOrder = order === "asc" ? "desc" : "asc";
      setOrder(newOrder);
    } else {
      setOrderBy(field);
      setOrder("asc");
    }
    onSortChange?.(field, newOrder);
  };

  const totalPages = pagination ? Math.ceil(pagination.total / pagination.perPage) : 0;

  const createPageButton = (page: number, label?: string, isActive = false, isDisabled = false) => (
    <button
      key={label || page}
      onClick={() => !isDisabled && pagination?.onPageChange(page)}
      disabled={isDisabled}
      aria-current={isActive ? "page" : undefined}
      className={`px-3 h-8 border ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-500"} ${isDisabled ? "opacity-50" : ""}`}
    >
      {label === "prev" ? "‹" : label === "next" ? "›" : page}
    </button>
  );

  const renderPaginationButtons = () => {
    if (!pagination) return null;
    const { currentPage } = pagination;
    const delta = 2;
    const range = [];

    for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
      range.push(i);
    }

    const buttons = [
      createPageButton(currentPage - 1, "prev", false, currentPage === 1),
      ...(range[0] > 1 ? [createPageButton(1), range[0] > 2 ? <span key="start-ellipsis">...</span> : null] : []),
      ...range.map((page) => createPageButton(page, undefined, page === currentPage)),
      ...(range[range.length - 1] < totalPages
        ? [range[range.length - 1] < totalPages - 1 ? <span key="end-ellipsis">...</span> : null, createPageButton(totalPages)]
        : []),
      createPageButton(currentPage + 1, "next", false, currentPage === totalPages),
    ];

    return buttons;
  };

  return (
    <div className="overflow-x-auto shadow rounded-lg">
      {title && (
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          {createUrl && (
            <Link to={createUrl} className="bg-blue-600 text-white px-3 py-2 rounded text-sm">
              + Novo
            </Link>
          )}
        </div>
      )}

      {loading && (
        <div className="text-center py-4 text-sm text-gray-500">Carregando...</div>
      )}

      {error && (
        <div className="text-center py-4 text-sm text-red-600">{error}</div>
      )}

      <table className="min-w-full text-sm text-left text-gray-700">
        <thead className="text-xs uppercase bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.field)}
                className="px-6 py-3 cursor-pointer"
                onClick={() => col.sortable && handleSort(String(col.field))}
              >
                <div className="flex items-center gap-1">
                  {col.label}
                  {col.sortable && (
                    <span>
                      {orderBy === col.field ? (order === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  )}
                </div>
              </th>
            ))}
            {(getEditUrl || onDelete) && <th className="px-6 py-3 text-right">Ações</th>}
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="px-6 py-4 text-center">
                Nenhum registro encontrado.
              </td>
            </tr>
          ) : (
            sortedData.map((row) => (
              <tr key={row.id} className="border-b hover:bg-gray-50">
                {columns.map((col) => (
                  <td key={String(col.field)} className="px-6 py-4">
                    {col.render ? col.render(row) : String(get(row, col.field, "-"))}
                  </td>
                ))}
                {(getEditUrl || onDelete) && (
                  <td className="px-6 py-4 text-right">
                    {getEditUrl && (
                      <Link to={getEditUrl(row.id)} className="text-blue-600 hover:underline mr-3">
                        Editar
                      </Link>
                    )}
                    {onDelete && (
                      <button onClick={() => onDelete(row.id)} className="text-red-600 hover:underline">
                        Excluir
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {pagination && (
        <div className="flex items-center justify-between p-4 border-t">
          <div className="text-sm">
            Mostrando {Math.min((pagination.currentPage - 1) * pagination.perPage + 1, pagination.total)} -{" "}
            {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} de {pagination.total}
          </div>
          <div className="flex space-x-1">{renderPaginationButtons()}</div>
          <select
            value={pagination.perPage}
            onChange={(e) => pagination.onPerPageChange(Number(e.target.value))}
            className="border p-1 rounded text-sm"
          >
            {[10, 25, 50, 100].map((num) => (
              <option key={num} value={num}>
                {num} / página
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
