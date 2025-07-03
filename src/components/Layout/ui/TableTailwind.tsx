import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";

export type Column<T> = {
  label: string;
  field: keyof T;
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
}: TableTailwindProps<T>) {
  const [orderBy, setOrderBy] = useState<keyof T>(columns[0].field);
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  const sortedData = useMemo(() => {
    if (!orderBy) return data;
    return [...data].sort((a, b) => {
      const aVal = a[orderBy];
      const bVal = b[orderBy];
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
  }, [data, orderBy, order]);

  const handleSort = (field: keyof T) => {
    if (orderBy === field) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setOrderBy(field);
      setOrder("asc");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10" role="status" aria-live="polite">
        <svg
          className="animate-spin h-8 w-8 text-blue-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          />
        </svg>
        <span className="sr-only">Carregando...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-4" role="alert">
        {error}
      </div>
    );
  }

  const totalPages = pagination ? Math.ceil(pagination.total / pagination.perPage) : 0;

  const createPageButton = (page: number, label?: string, isActive = false, isDisabled = false) => (
    <button
      key={label || page}
      onClick={() => !isDisabled && pagination?.onPageChange(page)}
      disabled={isDisabled}
      aria-current={isActive ? "page" : undefined}
      className={`flex items-center justify-center px-3 h-8 leading-tight border border-gray-300 
        ${isActive
          ? "z-10 text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
          : "text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
        }
        ${isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
        ${label === "prev" ? "rounded-l-lg" : ""}
        ${label === "next" ? "rounded-r-lg" : ""}
      `}
      aria-label={
        label === "prev"
          ? "Página anterior"
          : label === "next"
            ? "Próxima página"
            : `Página ${page}`
      }
    >
      {label === "prev" ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      ) : label === "next" ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      ) : (
        page
      )}
    </button>
  );

  // Gera lista de páginas, com elipses se necessário
  const renderPaginationButtons = () => {
    if (!pagination) return null;
    const { currentPage } = pagination;
    const delta = 2;
    const range = [];

    for (
      let i = Math.max(1, currentPage - delta);
      i <= Math.min(totalPages, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    const buttons = [];

    // Botão anterior
    buttons.push(createPageButton(currentPage - 1, "prev", false, currentPage === 1));

    // Primeira página + elipse se necessário
    if (range[0] > 1) {
      buttons.push(createPageButton(1));
      if (range[0] > 2) {
        buttons.push(
          <span key="start-ellipsis" className="flex items-center justify-center px-3 h-8 border-t border-b border-gray-300 select-none">
            ...
          </span>
        );
      }
    }

    // Páginas do range
    range.forEach((page) => {
      buttons.push(createPageButton(page, undefined, page === currentPage));
    });

    // Última página + elipse se necessário
    if (range[range.length - 1] < totalPages) {
      if (range[range.length - 1] < totalPages - 1) {
        buttons.push(
          <span key="end-ellipsis" className="flex items-center justify-center px-3 h-8 border-t border-b border-gray-300 select-none">
            ...
          </span>
        );
      }
      buttons.push(createPageButton(totalPages));
    }

    // Botão próximo
    buttons.push(createPageButton(currentPage + 1, "next", false, currentPage === totalPages));

    return buttons;
  };

  return (
    <div className="overflow-x-auto shadow-md rounded-lg">
      {title && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
          {createUrl && (
            <Link
              to={createUrl}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              + Novo
            </Link>
          )}
        </div>
      )}


      <table className="min-w-full text-sm text-left text-gray-700 dark:text-gray-300">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.field)}
                scope="col"
                className=" px-6 py-3 font-medium select-none cursor-pointer"
                onClick={() => col.sortable && handleSort(col.field)}
                aria-sort={
                  orderBy === col.field
                    ? order === "asc"
                      ? "ascending"
                      : "descending"
                    : "none"
                }
                tabIndex={col.sortable ? 0 : undefined}
                onKeyDown={(e) => {
                  if (col.sortable && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    handleSort(col.field);
                  }
                }}
              >
                <div className="flex items-center gap-1">
                  {col.label}
                  {col.sortable && (
                    <svg
                      className={`w-4 h-4 transition-transform ${orderBy === col.field && order === "desc" ? "rotate-180" : ""
                        }`}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  )}
                </div>
              </th>
            ))}
            {(getEditUrl || onDelete) && (
              <th scope="col" className="px-6 py-3 text-center">
                Ações
              </th>
            )}
          </tr>
        </thead>

        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (getEditUrl || onDelete ? 1 : 0)} className="px-6 py-4 text-center">
                Nenhum registro encontrado.
              </td>
            </tr>
          ) : (
            sortedData.map((row) => (
              <tr key={row.id} className="border-b border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                {columns.map((col) => (
                  <td key={String(col.field)} className="px-6 py-4 align-top">
                    {col.render ? col.render(row) : String(row[col.field] ?? "-")}
                  </td>
                ))}
                {(getEditUrl || onDelete) && (
                  <td className="px-6 py-4 text-right space-x-2">
                    {getEditUrl && (
                      <Link
                        to={getEditUrl(row.id)}
                        className="text-blue-600 hover:underline"
                        aria-label={`Editar ${String(row.id)}`}
                      >
                        Editar
                      </Link>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(row.id)}
                        className="text-red-600 hover:underline"
                        aria-label={`Excluir ${String(row.id)}`}
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

      {/* Paginação */}
      {pagination && (
        <nav
          className="flex flex-col md:flex-row items-center justify-between p-4 border-t border-gray-200 bg-white dark:bg-gray-800"
          aria-label="Navegação da página"
        >
          <div className="text-sm text-gray-700 dark:text-gray-300 mb-2 md:mb-0 w-full md:w-auto">
            Mostrando {(pagination.currentPage - 1) * pagination.perPage + 1} até{" "}
            {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} de{" "}
            {pagination.total} registros
          </div>
          <ul className="inline-flex -space-x-px rtl:space-x-reverse text-sm h-8 overflow-x-auto">
            {renderPaginationButtons()}
          </ul>
          <select
            value={pagination.perPage}
            onChange={(e) => pagination.onPerPageChange(parseInt(e.target.value, 10))}
            className="mt-2 md:mt-0 ml-0 md:ml-4 rounded border border-gray-300 p-1 text-sm dark:bg-gray-700 dark:text-gray-200"
            aria-label="Linhas por página"
          >
            {[10, 25, 50, 100].map((num) => (
              <option key={num} value={num}>
                {num} / página
              </option>
            ))}
          </select>
        </nav>
      )}
    </div>
  );
}
