// src/services/occurrenceService.ts
import { request } from "../api/request";
import { API_OCCURRENCES } from "../api/apiConfig";

export interface Occurrence {
  id: number;
  company_id: number;
  sector_id: number;
  employee_id: number;
  occurrence_type_id: number;
  occurrence_date: string;
  occurrence_time: string;
  location: string;
  description: string;
  probable_cause: string;
  actual_consequence: string;
  immediate_action: string;
  corrective_action: string;
  witnesses: string;
  classification: string;
  severity: string;
  status: string;
  attachment_url?: string | null;

  // Relacionamentos simplificados
  company?: { id: number; name: string };
  sector?: { id: number; name: string };
  employee?: { id: number; name: string };
  type?: { id: number; name: string };
}

export type OccurrencePayload = Omit<Occurrence, "id" | "company" | "sector" | "employee" | "type">;

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}

export interface GetOccurrencesOptions {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const getOccurrences = async (
  options: GetOccurrencesOptions = {}
): Promise<PaginatedResponse<Occurrence>> => {
  const {
    page = 1,
    perPage = 10,
    search = "",
    sortBy = "occurrence_date",
    sortOrder = "desc",
  } = options;

  return await request<PaginatedResponse<Occurrence>>(
    "GET",
    API_OCCURRENCES,
    {},
    {
      page,
      per_page: perPage,
      search,
      sort_by: sortBy,
      sort_order: sortOrder,
    }
  );
};

export const getOccurrenceById = (id: number): Promise<Occurrence> =>
  request("GET", `${API_OCCURRENCES}/${id}`);

export const createOccurrence = (data: OccurrencePayload): Promise<Occurrence> =>
  request("POST", API_OCCURRENCES, data);

export const updateOccurrence = (id: number, data: OccurrencePayload): Promise<Occurrence> =>
  request("PUT", `${API_OCCURRENCES}/${id}`, data);

export const deleteOccurrence = (id: number): Promise<void> =>
  request("DELETE", `${API_OCCURRENCES}/${id}`);
