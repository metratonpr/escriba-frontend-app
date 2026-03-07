import { useEffect, useMemo, useState } from "react";
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
  const [localPage, setLocalPage] = useState(1);
  const [localPerPage, setLocalPerPage] = useState(10);

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
  }, [data, onSortChange, order, orderBy]);

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

  const effectivePagination: Pagination = pagination ?? {
    total: sortedData.length,
    perPage: localPerPage,
    currentPage: localPage,
    onPageChange: setLocalPage,
    onPerPageChange: (nextPerPage) => {
      setLocalPerPage(nextPerPage);
      setLocalPage(1);
    },
  };

  const totalPages = Math.max(1, Math.ceil(effectivePagination.total / effectivePagination.perPage));
  const effectiveCurrentPage = effectivePagination.currentPage;
  const handleEffectivePageChange = effectivePagination.onPageChange;

  useEffect(() => {
    if (effectiveCurrentPage > totalPages) {
      handleEffectivePageChange(totalPages);
    }
  }, [effectiveCurrentPage, handleEffectivePageChange, totalPages]);

  const visibleData = pagination
    ? sortedData
    : sortedData.slice(
      (effectivePagination.currentPage - 1) * effectivePagination.perPage,
      effectivePagination.currentPage * effectivePagination.perPage
    );

  const createPageButton = (page: number, label?: string, isActive = false, isDisabled = false) => (
    <button
      key={label || page}
      onClick={() => !isDisabled && effectivePagination.onPageChange(page)}
      disabled={isDisabled}
      aria-current={isActive ? "page" : undefined}
      className={`h-8 rounded px-3 text-sm ${
        isActive ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-gray-100"
      } ${isDisabled ? "cursor-not-allowed opacity-50" : ""}`}
    >
      {label === "prev" ? "Anterior" : label === "next" ? "Proxima" : page}
    </button>
  );

  const renderPaginationButtons = () => {
    const { currentPage } = effectivePagination;
    const delta = 2;
    const range: number[] = [];

    for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i += 1) {
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
    <div className="w-full overflow-x-auto rounded-lg bg-white px-2 shadow-sm sm:px-0 dark:bg-gray-900">
      {title && (
        <div className="flex items-center justify-between px-4 py-4 sm:px-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          {createUrl && (
            <Link to={createUrl} className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
              + Novo
            </Link>
          )}
        </div>
      )}

      <table className="w-full text-left text-sm text-gray-500 rtl:text-right sm:text-base dark:text-gray-400">
        <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.field)}
                className="cursor-pointer px-4 py-2 font-medium tracking-wider sm:px-6 sm:py-3"
                onClick={() => col.sortable && handleSort(String(col.field))}
              >
                <div className="flex items-center gap-1">
                  {col.label}
                  {col.sortable && <span>{orderBy === col.field ? (order === "asc" ? "^" : "v") : "<>"}</span>}
                </div>
              </th>
            ))}
            {(getEditUrl || onDelete) && (
              <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider sm:px-6 sm:py-3">
                Acoes
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {visibleData.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="px-6 py-4 text-center text-sm text-gray-500">
                Nenhum registro encontrado.
              </td>
            </tr>
          ) : (
            visibleData.map((row) => (
              <tr
                key={row.id}
                className="odd:bg-white even:bg-gray-50 transition hover:bg-gray-100 odd:dark:bg-gray-900 even:dark:bg-gray-800 dark:hover:bg-gray-700"
              >
                {columns.map((col) => {
                  const value = get(row, col.field);
                  const textValue = value == null ? "" : String(value);

                  return (
                    <td key={String(col.field)} className="px-4 py-2 text-gray-900 sm:px-6 sm:py-4 dark:text-white">
                      {col.render ? col.render(row) : textValue}
                    </td>
                  );
                })}
                {(getEditUrl || onDelete) && (
                  <td className="px-4 py-2 text-right text-sm sm:px-6 sm:py-4">
                    {getEditUrl && (
                      <Link to={getEditUrl(row.id)} className="mr-3 font-medium text-blue-600 hover:underline dark:text-blue-500">
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

      {effectivePagination.total > 0 && (
        <div className="flex flex-col items-center justify-between gap-4 px-4 py-4 sm:flex-row sm:px-6">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Mostrando {Math.min((effectivePagination.currentPage - 1) * effectivePagination.perPage + 1, effectivePagination.total)} -{" "}
            {Math.min(effectivePagination.currentPage * effectivePagination.perPage, effectivePagination.total)} de {effectivePagination.total}
          </div>

          <div className="flex flex-wrap gap-1">{renderPaginationButtons()}</div>

          <select
            value={effectivePagination.perPage}
            onChange={(e) => effectivePagination.onPerPageChange(Number(e.target.value))}
            className="rounded px-2 py-1 text-sm dark:bg-gray-800 dark:text-white"
          >
            {[10, 25, 50, 100].map((num) => (
              <option key={num} value={num}>
                {num} / pagina
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
