// src/services/employeeDocumentService.ts
import { request } from "../api/request";
import { multipartRequest } from "../api/multipartRequest";
import { API_EMPLOYEE_DOCUMENT_VERSION_UPLOADS } from "../api/apiConfig";

export interface Employee {
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
}

export interface EmployeeDocumentUpload {
  id: string;
  employee_id: string;
  document_id: string;
  document_version_id?: string | number | null;
  status: "pendente" | "enviado" | "aprovado" | "rejeitado";
  emission_date: string | null;
  due_date: string | null;
  upload_id: string | number | null;
  created_at: string;
  updated_at: string;
  employee?: Employee;
  document?: DocumentRef;
  // fallback para contrato antigo
  document_version?: DocumentRef;
  upload?: UploadFile;
}

export type EmployeeDocumentUploadPayload = {
  employee_id: string | number;
  document_id: string | number;
  document_version_id: string | number;
  status: "pendente" | "enviado" | "aprovado" | "rejeitado";
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

export interface GetEmployeeDocumentUploadOptions {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const getEmployeeDocumentUploads = async (
  options: GetEmployeeDocumentUploadOptions = {}
): Promise<PaginatedResponse<EmployeeDocumentUpload>> => {
  const {
    page = 1,
    perPage = 25,
    search = "",
    sortBy = "created_at",
    sortOrder = "desc",
  } = options;

  return request<PaginatedResponse<EmployeeDocumentUpload>>(
    "GET",
    API_EMPLOYEE_DOCUMENT_VERSION_UPLOADS,
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

export const getEmployeeDocumentUploadById = async (id: string): Promise<EmployeeDocumentUpload> => {
  return request<EmployeeDocumentUpload>("GET", `${API_EMPLOYEE_DOCUMENT_VERSION_UPLOADS}/${id}`);
};

export const createEmployeeDocumentUpload = (data: FormData): Promise<EmployeeDocumentUpload> =>
  multipartRequest<EmployeeDocumentUpload>("POST", API_EMPLOYEE_DOCUMENT_VERSION_UPLOADS, data);

export const updateEmployeeDocumentUpload = (id: string, data: FormData): Promise<EmployeeDocumentUpload> => {
  data.append("_method", "PUT");
  return multipartRequest<EmployeeDocumentUpload>("POST", `${API_EMPLOYEE_DOCUMENT_VERSION_UPLOADS}/${id}`, data);
};

export const deleteEmployeeDocumentUpload = (id: string): Promise<void> =>
  request<void>("DELETE", `${API_EMPLOYEE_DOCUMENT_VERSION_UPLOADS}/${id}`);
