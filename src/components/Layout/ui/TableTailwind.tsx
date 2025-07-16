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
        return order === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      if (typeof aVal === "number" && typeof bVal === "number") {
        return order === "asc" ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
  }, [data, orderBy, order, onSortChange]);

  const handleSort = (field: string) => {
    let nextOrder: "asc" | "desc" = "asc";
    if (orderBy === field) {
      nextOrder = order === "asc" ? "desc" : "asc";
      setOrder(nextOrder);
    } else {
      setOrderBy(field);
      setOrder("asc");
    }
    onSortChange?.(field, nextOrder);
  };

  const totalPages = pagination
    ? Math.ceil(pagination.total / pagination.perPage)
    : 0;

  const pageBtn = (
    page: number,
    label?: string,
    isActive = false,
    isDisabled = false
  ) => (
    <button
      key={label ?? page}
      onClick={() => pagination?.onPageChange(page)}
      disabled={isDisabled}
      aria-current={isActive ? "page" : undefined}
      className={`px-3 h-9 border rounded-md text-sm transition ${
        isActive
          ? "bg-blue-600 text-white dark:bg-blue-500"
          : "text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
      } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {label === "prev" ? "‹" : label === "next" ? "›" : page}
    </button>
  );

  const paginationControls = () => {
    if (!pagination) return null;
    const { currentPage } = pagination;
    const delta = 2;
    const pages = [];
    for (
      let i = Math.max(1, currentPage - delta);
      i <= Math.min(totalPages, currentPage + delta);
      i++
    )
      pages.push(i);

    return (
      <nav
        aria-label="Pagination"
        className="flex items-center justify-center space-x-1 py-2"
      >
        {pageBtn(currentPage - 1, "prev", false, currentPage === 1)}
        {pages[0] > 1 && (
          <>
            {pageBtn(1)}
            {pages[0] > 2 && (
              <span className="px-2 text-gray-400">…</span>
            )}
          </>
        )}
        {pages.map((p) => pageBtn(p, undefined, p === currentPage))}
        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && (
              <span className="px-2 text-gray-400">…</span>
            )}
            {pageBtn(totalPages)}
          </>
        )}
        {pageBtn(currentPage + 1, "next", false, currentPage === totalPages)}
        <select
          value={pagination.perPage}
          onChange={(e) =>
            pagination.onPerPageChange(Number(e.target.value))
          }
          className="ml-4 border rounded px-2 py-1 text-sm"
        >
          {[10, 25, 50, 100].map((n) => (
            <option key={n} value={n}>
              {n} / página
            </option>
          ))}
        </select>
      </nav>
    );
  };

  return (
    <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {title && (
        <div className="flex justify-between items-center px-6 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 rounded-t-lg">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {title}
          </h2>
          {createUrl && (
            <Link
              to={createUrl}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
            >
              + Novo
            </Link>
          )}
        </div>
      )}

      {loading && (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
          Carregando...
        </div>
      )}

      {error && (
        <div className="text-center py-6 text-red-600">{error}</div>
      )}

      <table className="min-w-full table-auto text-sm text-gray-700 dark:text-gray-300">
        <thead className="text-xs uppercase text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.field)}
                className="px-6 py-3 cursor-pointer select-none whitespace-nowrap"
                onClick={() => col.sortable && handleSort(String(col.field))}
              >
                <div className="flex items-center gap-1">
                  {col.label}
                  {col.sortable && (
                    <span>
                      {orderBy === col.field
                        ? order === "asc"
                          ? "▲"
                          : "▼"
                        : "↕"}
                    </span>
                  )}
                </div>
              </th>
            ))}
            {(getEditUrl || onDelete) && (
              <th className="px-6 py-3 text-right">Ações</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {sortedData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + 1}
                className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
              >
                Nenhum registro encontrado.
              </td>
            </tr>
          ) : (
            sortedData.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                {columns.map((col) => (
                  <td
                    key={String(col.field)}
                    className="px-6 py-4 whitespace-nowrap"
                  >
                    {col.render
                      ? col.render(row)
                      : String(get(row, col.field, "-"))}
                  </td>
                ))}
                {(getEditUrl || onDelete) && (
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {getEditUrl && (
                      <Link
                        to={getEditUrl(row.id)}
                        className="text-blue-600 hover:underline mr-3"
                      >
                        Editar
                      </Link>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(row.id)}
                        className="text-red-600 hover:underline"
                      >
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
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 rounded-b-lg">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Mostrando{" "}
              {Math.min(
                (pagination.currentPage - 1) * pagination.perPage + 1,
                pagination.total
              )}{" "}
              -{" "}
              {Math.min(
                pagination.currentPage * pagination.perPage,
                pagination.total
              )}{" "}
              de {pagination.total} registros
            </div>
            {paginationControls()}
          </div>
        </div>
      )}
    </div>
  );
}
