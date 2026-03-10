// src/services/employeeService.ts
import { request } from "../api/request";
import { multipartRequest } from "../api/multipartRequest";
import { API_EMPLOYEES } from "../api/apiConfig";

export interface EmployeeJobTitle {
  id: number | string;
  name: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface EmployeeSector {
  id: number | string;
  name: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface EmployeeCompanyGroup {
  id: number | string;
  name: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface EmployeeCompanyType {
  id: number | string;
  name: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface EmployeeCompany {
  id: number | string;
  company_group_id?: number | string;
  company_type_id?: number | string;
  name: string;
  cnpj?: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  responsible?: string | null;
  email?: string | null;
  logo_path?: string | null;
  logo_url?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  group?: EmployeeCompanyGroup | null;
  type?: EmployeeCompanyType | null;
}

export interface EmployeeAssignmentRelation {
  id: number | string;
  name: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface EmployeeCompanySectorRelation {
  id: number;
  company_id?: number | string;
  sector_id?: number | string;
  created_at?: string;
  updated_at?: string;
  company?: EmployeeAssignmentRelation | null;
  sector?: EmployeeAssignmentRelation | null;
}

export interface EmployeeAssignment {
  id?: number | string;
  employee_id?: number | string;
  company_sector_id: number;
  job_title_id: number;
  status?: string;
  start_date: string;
  end_date?: string | null;
  created_at?: string;
  updated_at?: string;
  company_sector?: EmployeeCompanySectorRelation | null;
  company?: EmployeeCompany | null;
  sector?: EmployeeSector | null;
  job_title?: EmployeeAssignmentRelation | null;
}

export interface EmployeeDocumentDefinition {
  id: number | string;
  code: string;
  name: string;
  description?: string | null;
  category?: string;
  is_required?: boolean;
  validity_days?: number | null;
}

export interface EmployeeDocumentUpload {
  id: number | string;
  file_name: string;
  file_path?: string;
  links?: {
    view?: string;
    download?: string;
  };
}

export interface EmployeeDocument {
  id: number | string;
  status: string;
  issued_at?: string | null;
  expires_at?: string | null;
  created_at?: string;
  updated_at?: string;
  document?: EmployeeDocumentDefinition | null;
  upload?: EmployeeDocumentUpload | null;
}

export interface Employee {
  id: string | number;
  name: string;
  cpf: string;
  rg: string;
  rg_issuer: string;
  birth_date: string;
  driver_license_type: string;
  first_license_date?: string | null;
  photo_path?: string | null;
  photo_url?: string | null;
  documents_download_url?: string | null;
  assignments?: EmployeeAssignment[];
  job_titles?: EmployeeJobTitle[];
  sectors?: EmployeeSector[];
  companies?: EmployeeCompany[];
  documents?: EmployeeDocument[];
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface EmployeeDetailsResponse {
  employee: Employee;
  documents?: EmployeeDocument[];
  documents_download_url?: string | null;
}

export type EmployeeMutationPayload = EmployeePayload | FormData;
export type EmployeeMutationResponse = Employee | EmployeeDetailsResponse;

export interface EmployeeAssignmentPayload {
  company_sector_id: number;
  job_title_id: number;
  start_date: string;
  end_date?: string | null;
}

export interface EmployeePayload {
  name: string;
  cpf: string;
  rg: string;
  rg_issuer: string;
  birth_date: string;
  driver_license_type: string;
  first_license_date?: string | null;
  assignments: EmployeeAssignmentPayload[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}

export interface GetEmployeesOptions {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const getEmployees = async (
  options: GetEmployeesOptions = {}
): Promise<PaginatedResponse<Employee>> => {
  const {
    page = 1,
    perPage = 25,
    search = "",
    sortBy = "name",
    sortOrder = "asc",
  } = options;

  return await request<PaginatedResponse<Employee>>(
    "GET",
    API_EMPLOYEES,
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

export const getEmployeeById = (id: string): Promise<EmployeeDetailsResponse> =>
  request<EmployeeDetailsResponse>("GET", `${API_EMPLOYEES}/${id}`);

export const createEmployee = (
  data: EmployeeMutationPayload
): Promise<EmployeeMutationResponse> =>
  data instanceof FormData
    ? multipartRequest<EmployeeMutationResponse>("POST", API_EMPLOYEES, data)
    : request<EmployeeMutationResponse>("POST", API_EMPLOYEES, data);

export const updateEmployee = (
  id: string,
  data: EmployeeMutationPayload
): Promise<EmployeeMutationResponse> => {
  if (data instanceof FormData) {
    data.append("_method", "PUT");
    return multipartRequest<EmployeeMutationResponse>(
      "POST",
      `${API_EMPLOYEES}/${id}`,
      data
    );
  }

  return request<EmployeeMutationResponse>("PUT", `${API_EMPLOYEES}/${id}`, data);
};

export const deleteEmployee = (id: string): Promise<void> =>
  request<void>("DELETE", `${API_EMPLOYEES}/${id}`);
