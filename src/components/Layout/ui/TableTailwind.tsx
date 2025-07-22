// TableTailwind.tsx
// Componente genérico responsivo, visual sutil sem bordas, com hover e dark mode
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
      className={`px-3 h-8 text-sm rounded ${
        isActive ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-gray-100"
      } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {label === "prev" ? "Anterior" : label === "next" ? "Próxima" : page}
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

    return [
      createPageButton(currentPage - 1, "prev", false, currentPage === 1),
      ...(range[0] > 1 ? [createPageButton(1), range[0] > 2 ? <span key="start-ellipsis">...</span> : null] : []),
      ...range.map((page) => createPageButton(page, undefined, page === currentPage)),
      ...(range[range.length - 1] < totalPages
        ? [range[range.length - 1] < totalPages - 1 ? <span key="end-ellipsis">...</span> : null, createPageButton(totalPages)]
        : []),
      createPageButton(currentPage + 1, "next", false, currentPage === totalPages),
    ];
  };

  return (
    <div className="w-full overflow-x-auto px-2 sm:px-0 bg-white rounded-lg shadow-sm dark:bg-gray-900">
      {title && (
        <div className="flex justify-between items-center px-4 sm:px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          {createUrl && (
            <Link to={createUrl} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded">
              + Novo
            </Link>
          )}
        </div>
      )}

      <table className="w-full text-sm sm:text-base text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.field)}
                className="px-4 sm:px-6 py-2 sm:py-3 font-medium tracking-wider cursor-pointer"
                onClick={() => col.sortable && handleSort(String(col.field))}
              >
                <div className="flex items-center gap-1">
                  {col.label}
                  {col.sortable && (
                    <span>{orderBy === col.field ? (order === "asc" ? "▲" : "▼") : "↕"}</span>
                  )}
                </div>
              </th>
            ))}
            {(getEditUrl || onDelete) && (
              <th className="px-4 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium uppercase tracking-wider">Ações</th>
            )}
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="px-6 py-4 text-center text-sm text-gray-500">
                Nenhum registro encontrado.
              </td>
            </tr>
          ) : (
            sortedData.map((row) => (
              <tr
                key={row.id}
                className="odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                {columns.map((col) => (
                  <td key={String(col.field)} className="px-4 sm:px-6 py-2 sm:py-4 text-gray-900 dark:text-white">
                    {col.render ? col.render(row) : String(get(row, col.field, "-"))}
                  </td>
                ))}
                {(getEditUrl || onDelete) && (
                  <td className="px-4 sm:px-6 py-2 sm:py-4 text-right text-sm">
                    {getEditUrl && (
                      <Link to={getEditUrl(row.id)} className="font-medium text-blue-600 dark:text-blue-500 hover:underline mr-3">
                        Editar
                      </Link>
                    )}
                    {onDelete && (
                      <button onClick={() => onDelete(row.id)} className="font-medium text-red-600 hover:underline">
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 py-4">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Mostrando {Math.min((pagination.currentPage - 1) * pagination.perPage + 1, pagination.total)} - {" "}
            {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} de {pagination.total}
          </div>
          <div className="flex gap-1 flex-wrap">{renderPaginationButtons()}</div>
          <select
            value={pagination.perPage}
            onChange={(e) => pagination.onPerPageChange(Number(e.target.value))}
            className="rounded text-sm px-2 py-1 dark:bg-gray-800 dark:text-white"
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
