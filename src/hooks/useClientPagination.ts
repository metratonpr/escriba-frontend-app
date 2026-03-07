import { useEffect, useMemo, useState } from "react";

type UseClientPaginationOptions = {
  initialPerPage?: number;
};

export function useClientPagination<T>(
  items: T[],
  options: UseClientPaginationOptions = {}
) {
  const { initialPerPage = 10 } = options;

  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPageState] = useState(initialPerPage);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    const end = start + perPage;
    return items.slice(start, end);
  }, [items, currentPage, perPage]);

  const setPerPage = (value: number) => {
    setPerPageState(value);
    setCurrentPage(1);
  };

  const pageStart = total === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const pageEnd = Math.min(currentPage * perPage, total);

  return {
    currentPage,
    perPage,
    total,
    totalPages,
    paginatedItems,
    pageStart,
    pageEnd,
    setCurrentPage,
    setPerPage,
  };
}

