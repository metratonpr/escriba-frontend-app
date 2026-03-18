import { useState } from "react";

export type TableOrder = "asc" | "desc";

export interface UseTableStateOptions {
  defaultOrderBy: string;
  defaultOrder?: TableOrder;
  initialPage?: number;
  initialPerPage?: number;
}

export interface UseTableStateResult {
  orderBy: string;
  order: TableOrder;
  currentPage: number;
  perPage: number;
  handleSort: (field: string, onSortChange?: (field: string, order: TableOrder) => void) => void;
  setCurrentPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
}

export function useTableState({
  defaultOrderBy,
  defaultOrder = "asc",
  initialPage = 1,
  initialPerPage = 10,
}: UseTableStateOptions): UseTableStateResult {
  const [orderBy, setOrderBy] = useState(defaultOrderBy);
  const [order, setOrder] = useState<TableOrder>(defaultOrder);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [perPage, setPerPage] = useState(initialPerPage);

  const handleSort = (field: string, onSortChange?: (field: string, order: TableOrder) => void) => {
    let nextOrder: TableOrder = "asc";

    if (orderBy === field) {
      nextOrder = order === "asc" ? "desc" : "asc";
      setOrder(nextOrder);
    } else {
      setOrderBy(field);
      setOrder("asc");
    }

    onSortChange?.(field, nextOrder);
  };

  return {
    orderBy,
    order,
    currentPage,
    perPage,
    handleSort,
    setCurrentPage,
    setPerPage,
  };
}
