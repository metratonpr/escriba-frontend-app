// src/services/documentTypeService.ts
import { request } from "../api/request";
import { API_DOCUMENT_TYPES } from "../api/apiConfig";

export interface DocumentType {
  id: string;
  name: string;
}

export type DocumentTypePayload = {
  name: string;
};

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}

export interface GetDocumentTypesOptions {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const getDocumentTypes = async (
  options: GetDocumentTypesOptions = {}
): Promise<PaginatedResponse<DocumentType>> => {
  const {
    page = 1,
    perPage = 25,
    search = "",
    sortBy = "name",
    sortOrder = "asc",
  } = options;

  return await request<PaginatedResponse<DocumentType>>(
    "GET",
    API_DOCUMENT_TYPES,
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

export const getDocumentTypeById = (id: string): Promise<DocumentType> =>
  request<DocumentType>("GET", `${API_DOCUMENT_TYPES}/${id}`);

export const createDocumentType = (
  data: DocumentTypePayload
): Promise<DocumentType> =>
  request<DocumentType>("POST", API_DOCUMENT_TYPES, data);

export const updateDocumentType = (
  id: string,
  data: DocumentTypePayload
): Promise<DocumentType> =>
  request<DocumentType>("PUT", `${API_DOCUMENT_TYPES}/${id}`, data);

export const deleteDocumentType = (id: string): Promise<void> =>
  request<void>("DELETE", `${API_DOCUMENT_TYPES}/${id}`);
