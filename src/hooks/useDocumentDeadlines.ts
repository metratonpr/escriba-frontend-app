import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getDocumentsExpiringSoon,
  getExpiredDocuments,
  type DocumentDeadlineIndicator,
} from "../services/documentReportService";
import { EXPIRING_RANGE_OPTIONS, getDaysUntil, matchesExpiringRange } from "../utils/deadlineUtils";
import type { ExpiringRangeKey } from "../utils/deadlineUtils";

export type DeadlineEndpointFilter = "all" | "expired" | "expiring";

export interface UseDocumentDeadlinesParams {
  endpointFilter: DeadlineEndpointFilter;
  rangeKey: ExpiringRangeKey;
}

export interface UseDocumentDeadlinesResult {
  rows: DocumentDeadlineIndicator[];
  isLoading: boolean;
  error: unknown;
  selectedRange: (typeof EXPIRING_RANGE_OPTIONS)[number];
}

const filterExpiringRowsByRange = (
  rows: DocumentDeadlineIndicator[],
  rangeKey: ExpiringRangeKey
): DocumentDeadlineIndicator[] => {
  return rows.filter((row) => matchesExpiringRange(getDaysUntil(row.due_date), rangeKey));
};

const sortByDueDate = (rows: DocumentDeadlineIndicator[]): DocumentDeadlineIndicator[] =>
  [...rows].sort((a, b) => (a.due_date ?? "").localeCompare(b.due_date ?? ""));

const getSelectedRangeOption = (rangeKey: ExpiringRangeKey) =>
  EXPIRING_RANGE_OPTIONS.find((option) => option.key === rangeKey) ??
  EXPIRING_RANGE_OPTIONS[0];

export const useDocumentDeadlines = ({
  endpointFilter,
  rangeKey,
}: UseDocumentDeadlinesParams): UseDocumentDeadlinesResult => {
  const selectedRange = useMemo(() => getSelectedRangeOption(rangeKey), [rangeKey]);

  const expiringQuery = useQuery({
    queryKey: ["documents-deadlines", "expiring", selectedRange.queryDays],
    queryFn: () => getDocumentsExpiringSoon({ days: selectedRange.queryDays }),
    enabled: endpointFilter !== "expired",
    staleTime: 1000 * 60 * 5,
  });

  const expiredQuery = useQuery({
    queryKey: ["documents-deadlines", "expired"],
    queryFn: getExpiredDocuments,
    enabled: endpointFilter !== "expiring",
    staleTime: 1000 * 60 * 5,
  });

  const rows = useMemo(() => {
    const expiringRows = expiringQuery.data ?? [];
    const expiredRows = expiredQuery.data ?? [];

    let combinedRows: DocumentDeadlineIndicator[];

    if (endpointFilter === "expired") {
      combinedRows = expiredRows;
    } else if (endpointFilter === "expiring") {
      combinedRows = filterExpiringRowsByRange(expiringRows, rangeKey);
    } else {
      combinedRows = [...expiredRows, ...filterExpiringRowsByRange(expiringRows, rangeKey)];
    }

    return sortByDueDate(combinedRows);
  }, [endpointFilter, expiringQuery.data, expiredQuery.data, rangeKey]);

  const isLoading = useMemo(() => {
    if (endpointFilter === "expired") {
      return expiredQuery.isLoading;
    }

    if (endpointFilter === "expiring") {
      return expiringQuery.isLoading;
    }

    return expiringQuery.isLoading || expiredQuery.isLoading;
  }, [endpointFilter, expiringQuery.isLoading, expiredQuery.isLoading]);

  const error = expiringQuery.error ?? expiredQuery.error;

  return { rows, isLoading, error, selectedRange };
};
