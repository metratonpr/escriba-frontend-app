// src/services/documentService.ts
import { request } from "../api/request";
import { API_DOCUMENTS } from "../api/apiConfig";

export type DocumentCategory = "employee" | "company" | "general";

export interface Document {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: DocumentCategory;
  is_required: boolean;
  validity_days?: number;
  version: number;
  document_type_id: string;
  document_issuer_id: string;
}

export type DocumentPayload = Omit<Document, "id">;

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}

export interface GetDocumentsOptions {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const getDocuments = async (
  options: GetDocumentsOptions = {}
): Promise<PaginatedResponse<Document>> => {
  const {
    page = 1,
    perPage = 25,
    search = "",
    sortBy = "name",
    sortOrder = "asc",
  } = options;

  return await request<PaginatedResponse<Document>>(
    "GET",
    API_DOCUMENTS,
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

export const getDocumentById = (id: string): Promise<Document> =>
  request<Document>("GET", `${API_DOCUMENTS}/${id}`);

export const createDocument = (
  data: DocumentPayload
): Promise<Document> =>
  request<Document>("POST", API_DOCUMENTS, data);

export const updateDocument = (
  id: string,
  data: DocumentPayload
): Promise<Document> =>
  request<Document>("PUT", `${API_DOCUMENTS}/${id}`, data);

export const deleteDocument = (id: string): Promise<void> =>
  request<void>("DELETE", `${API_DOCUMENTS}/${id}`);
