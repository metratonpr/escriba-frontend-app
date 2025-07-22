// src/services/documentService.ts
import { request } from "../api/request";
import { API_DOCUMENTS } from "../api/apiConfig";

export type DocumentCategory = "employee" | "company" | "general";

// Versões retornadas pelo backend (leitura)
export interface DocumentVersionResponse {
  id: number;
  document_id: number;
  code: string;
  description?: string | null;
  version: string;
  validity_days?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

// Versões manipuladas pelo formulário (envio)
export interface Version {
  code?: string;
  description?: string;
  validity_days?: number | "";
  version?: string;
}

// Documento retornado pelo backend (leitura)
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

  type?: {
    id: number;
    name: string;
  };
  issuer?: {
    id: number;
    name: string;
  };
  versions?: DocumentVersionResponse[];
}

// Payload usado para criação/edição (envio)
export type DocumentPayload = Omit<Document, "id" | "type" | "issuer" | "versions" | "version"> & {
  versions?: Version[];
  version: number; // manter o número da versão que está sendo criado ou atualizado
};

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
