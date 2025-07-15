// src/services/employeeDocumentService.ts
import { request } from "../api/request";
import { multipartRequest } from "../api/multipartRequest";
import { API_EMPLOYEE_DOCUMENT_VERSION_UPLOADS } from "../api/apiConfig";

export interface Employee {
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

export interface EmployeeDocumentUpload {
  id: string;
  employee_id: string;
  document_version_id: string;
  status: "pendente" | "enviado" | "aprovado" | "rejeitado";
  emission_date: string | null;
  due_date: string | null;
  upload_id: string;
  created_at: string;
  updated_at: string;
  employee?: Employee;
  document_version?: DocumentVersion;
  upload?: UploadFile;
}

export type EmployeeDocumentUploadPayload = {
  employee_id: string;
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

export const getEmployeeDocumentUploadById = (id: string): Promise<EmployeeDocumentUpload> =>
  request<EmployeeDocumentUpload>("GET", `${API_EMPLOYEE_DOCUMENT_VERSION_UPLOADS}/${id}`);

export const createEmployeeDocumentUpload = (data: FormData): Promise<EmployeeDocumentUpload> =>
  multipartRequest<EmployeeDocumentUpload>("POST", API_EMPLOYEE_DOCUMENT_VERSION_UPLOADS, data);

export const updateEmployeeDocumentUpload = (id: string, data: FormData): Promise<EmployeeDocumentUpload> => {
  data.append("_method", "PUT");
  return multipartRequest<EmployeeDocumentUpload>("POST", `${API_EMPLOYEE_DOCUMENT_VERSION_UPLOADS}/${id}`, data);
};

export const deleteEmployeeDocumentUpload = (id: string): Promise<void> =>
  request<void>("DELETE", `${API_EMPLOYEE_DOCUMENT_VERSION_UPLOADS}/${id}`);
