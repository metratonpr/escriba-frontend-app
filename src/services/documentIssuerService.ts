// src/services/documentIssuerService.ts
import { request } from "../api/request";
import { API_DOCUMENT_ISSUERS } from "../api/apiConfig";

export interface DocumentIssuer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  number?: string;
  complement?: string;
  city?: string;
  state?: string;
  postal_code?: string;
}

export type DocumentIssuerPayload = Omit<DocumentIssuer, "id">;

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}

interface LaravelMetaPagination {
  current_page?: number;
  per_page?: number;
  total?: number;
}

interface LaravelPaginatedResponse<T> {
  data: T[];
  meta?: LaravelMetaPagination;
  total?: number;
  page?: number;
  per_page?: number;
}

export interface GetDocumentIssuersOptions {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const getDocumentIssuers = async (
  options: GetDocumentIssuersOptions = {}
): Promise<PaginatedResponse<DocumentIssuer>> => {
  const {
    page = 1,
    perPage = 25,
    search = "",
    sortBy = "name",
    sortOrder = "asc",
  } = options;

  const response = await request<LaravelPaginatedResponse<DocumentIssuer>>(
    "GET",
    API_DOCUMENT_ISSUERS,
    {},
    {
      page,
      per_page: perPage,
      search,
      sort_by: sortBy,
      sort_order: sortOrder,
    }
  );

  return {
    data: Array.isArray(response.data) ? response.data : [],
    total: Number(response.total ?? response.meta?.total ?? 0),
    page: Number(response.page ?? response.meta?.current_page ?? page),
    per_page: Number(response.per_page ?? response.meta?.per_page ?? perPage),
  };
};

export const getDocumentIssuerById = (id: string): Promise<DocumentIssuer> =>
  request<DocumentIssuer>("GET", `${API_DOCUMENT_ISSUERS}/${id}`);

export const createDocumentIssuer = (
  data: DocumentIssuerPayload
): Promise<DocumentIssuer> =>
  request<DocumentIssuer>("POST", API_DOCUMENT_ISSUERS, data);

export const updateDocumentIssuer = (
  id: string,
  data: DocumentIssuerPayload
): Promise<DocumentIssuer> =>
  request<DocumentIssuer>("PUT", `${API_DOCUMENT_ISSUERS}/${id}`, data);

export const deleteDocumentIssuer = (id: string): Promise<void> =>
  request<void>("DELETE", `${API_DOCUMENT_ISSUERS}/${id}`);
