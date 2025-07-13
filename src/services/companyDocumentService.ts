// src/services/companyDocumentService.ts
import { request } from "../api/request";
import { multipartRequest } from "../api/multipartRequest";
import { API_COMPANY_DOCUMENT_VERSION_UPLOADS } from "../api/apiConfig";

export interface Company {
  id: number;
  name: string;
}

export interface DocumentVersion {
  id: number;
  code: string;
  version: string;
}

export interface UploadFile {
  id: number;
  nome_arquivo: string;
  url_arquivo: string;
}

export interface CompanyDocumentUpload {
  id: string;
  company_id: string;
  document_version_id: string;
  status: "pendente" | "enviado" | "aprovado" | "rejeitado";
  emission_date: string | null;
  due_date: string | null;
  upload_id: string;
  created_at: string;
  updated_at: string;
  company?: Company;
  document_version?: DocumentVersion;
  upload?: UploadFile;
}

export type CompanyDocumentUploadPayload = {
  company_id: string;
  document_version_id: string;
  status: "pendente" | "enviado" | "aprovado" | "rejeitado";
  emission_date: string;
  due_date?: string;
  upload: File;
};

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}

export interface GetCompanyDocumentUploadOptions {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const getCompanyDocumentUploads = async (
  options: GetCompanyDocumentUploadOptions = {}
): Promise<PaginatedResponse<CompanyDocumentUpload>> => {
  const {
    page = 1,
    perPage = 25,
    search = "",
    sortBy = "created_at",
    sortOrder = "desc",
  } = options;

  return request<PaginatedResponse<CompanyDocumentUpload>>(
    "GET",
    API_COMPANY_DOCUMENT_VERSION_UPLOADS,
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

export const getCompanyDocumentUploadById = (id: string): Promise<CompanyDocumentUpload> =>
  request<CompanyDocumentUpload>("GET", `${API_COMPANY_DOCUMENT_VERSION_UPLOADS}/${id}`);

export const createCompanyDocumentUpload = (data: FormData): Promise<CompanyDocumentUpload> =>
  multipartRequest<CompanyDocumentUpload>("POST", API_COMPANY_DOCUMENT_VERSION_UPLOADS, data);

export const updateCompanyDocumentUpload = (id: string, data: FormData): Promise<CompanyDocumentUpload> => {
  data.append("_method", "PUT");
  return multipartRequest<CompanyDocumentUpload>("POST", `${API_COMPANY_DOCUMENT_VERSION_UPLOADS}/${id}`, data);
};

export const deleteCompanyDocumentUpload = (id: string): Promise<void> =>
  request<void>("DELETE", `${API_COMPANY_DOCUMENT_VERSION_UPLOADS}/${id}`);
