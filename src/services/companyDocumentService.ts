// src/services/companyDocumentService.ts
import { request } from "../api/request";
import { multipartRequest } from "../api/multipartRequest";
import { API_COMPANY_DOCUMENT_VERSION_UPLOADS } from "../api/apiConfig";

export interface Company {
  id: number;
  name: string;
}

export interface DocumentRef {
  id: number;
  code: string;
  name?: string;
  version?: string;
  validity_days?: number | null;
}

export interface UploadFile {
  id: number;
  nome_arquivo: string;
  url_arquivo: string;
  has_file?: boolean | null;
  descricao?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type Status = "pendente" | "enviado" | "aprovado" | "rejeitado";

export interface CompanyDocumentUpload {
  id: number;
  company_id: number;
  document_id: number;
  document_version_id?: string | number | null;
  status: Status;
  emission_date: string | null;
  due_date: string | null;
  upload_id: number | null;
  created_at: string;
  updated_at: string;
  company?: Company;
  document?: DocumentRef;
  // fallback para contrato antigo
  document_version?: DocumentRef;
  upload?: UploadFile;
}

export type CompanyDocumentUploadPayload = {
  company_id: string | number;
  document_id: string | number;
  document_version_id: string | number;
  status: Status;
  emission_date: string;
  due_date?: string;
  upload_id?: string | number;
  upload?: File;
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

export const getCompanyDocumentUploadById = async (
  id: string | number
): Promise<CompanyDocumentUpload> => {
  return request<CompanyDocumentUpload>(
    "GET",
    `${API_COMPANY_DOCUMENT_VERSION_UPLOADS}/${id}`
  );
};

export const createCompanyDocumentUpload = async (
  data: FormData
): Promise<CompanyDocumentUpload> => {
  return multipartRequest<CompanyDocumentUpload>(
    "POST",
    API_COMPANY_DOCUMENT_VERSION_UPLOADS,
    data
  );
};

export const updateCompanyDocumentUpload = async (
  id: string | number,
  data: FormData
): Promise<CompanyDocumentUpload> => {
  data.append("_method", "PUT");
  return multipartRequest<CompanyDocumentUpload>(
    "POST",
    `${API_COMPANY_DOCUMENT_VERSION_UPLOADS}/${id}`,
    data
  );
};

export const deleteCompanyDocumentUpload = (id: string | number): Promise<void> =>
  request<void>("DELETE", `${API_COMPANY_DOCUMENT_VERSION_UPLOADS}/${id}`);
