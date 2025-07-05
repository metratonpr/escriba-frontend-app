// src/services/documentVersionService.ts
import { request } from "../api/request";
import { API_DOCUMENT_VERSIONS } from "../api/apiConfig";

export interface DocumentVersion {
  id: string;
  document_id: string;
  version: string;
  description?: string;
  file_url?: string; // URL do arquivo já armazenado
  created_at: string;
}

export type DocumentVersionPayload = {
  version: string;
  description?: string;
  file_url?: string; // Referência ao arquivo armazenado, não arquivo binário
};

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}

export interface GetDocumentVersionsOptions {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const getDocumentVersions = async (
  documentId: string,
  options: GetDocumentVersionsOptions = {}
): Promise<PaginatedResponse<DocumentVersion>> => {
  const {
    page = 1,
    perPage = 25,
    search = "",
    sortBy = "created_at",
    sortOrder = "desc",
  } = options;

  return request<PaginatedResponse<DocumentVersion>>(
    "GET",
    `${API_DOCUMENT_VERSIONS}/${documentId}/versions`,
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

export const getDocumentVersionById = (
  documentId: string,
  versionId: string
): Promise<DocumentVersion> =>
  request<DocumentVersion>(
    "GET",
    `${API_DOCUMENT_VERSIONS}/${documentId}/versions/${versionId}`
  );

export const createDocumentVersion = (
  documentId: string,
  data: DocumentVersionPayload
): Promise<DocumentVersion> =>
  request<DocumentVersion>(
    "POST",
    `${API_DOCUMENT_VERSIONS}/${documentId}/versions`,
    data
  );

export const deleteDocumentVersion = (
  documentId: string,
  versionId: string
): Promise<void> =>
  request<void>(
    "DELETE",
    `${API_DOCUMENT_VERSIONS}/${documentId}/versions/${versionId}`
  );
