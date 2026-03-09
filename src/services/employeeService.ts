// src/services/employeeService.ts
import { request } from "../api/request";
import { API_EMPLOYEES } from "../api/apiConfig";

export interface EmployeeJobTitle {
  id: number;
  start_date: string;
  end_date?: string | null;
  status: "ativo" | "afastado" | "desligado";
}

export interface EmployeeSector {
  id: number;
  start_date: string;
  end_date?: string | null;
  status: "ativo" | "afastado" | "desligado";
}

export interface EmployeeCompany {
  id: number;
  start_date: string;
  end_date?: string | null;
  status: "ativo" | "afastado" | "desligado";
}

export interface EmployeeAssignmentRelation {
  id: number | string;
  name: string;
}

export interface EmployeeCompanySectorRelation {
  id: number;
  company?: EmployeeAssignmentRelation | null;
  sector?: EmployeeAssignmentRelation | null;
}

export interface EmployeeAssignment {
  company_sector_id: number;
  job_title_id: number;
  start_date: string;
  end_date?: string | null;
  company_sector?: EmployeeCompanySectorRelation | null;
  job_title?: EmployeeAssignmentRelation | null;
}

export interface Employee {
  id: string;
  name: string;
  cpf: string;
  rg: string;
  rg_issuer: string;
  birth_date: string;
  driver_license_type: string;
  first_license_date?: string | null;
  assignments?: EmployeeAssignment[];
  job_titles?: EmployeeJobTitle[];
  sectors?: EmployeeSector[];
  companies?: EmployeeCompany[];
}

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

export const getEmployeeById = (id: string): Promise<Employee> =>
  request<Employee>("GET", `${API_EMPLOYEES}/${id}`);

export const createEmployee = (data: EmployeePayload): Promise<Employee> =>
  request<Employee>("POST", API_EMPLOYEES, data);

export const updateEmployee = (
  id: string,
  data: EmployeePayload
): Promise<Employee> =>
  request<Employee>("PUT", `${API_EMPLOYEES}/${id}`, data);

export const deleteEmployee = (id: string): Promise<void> =>
  request<void>("DELETE", `${API_EMPLOYEES}/${id}`);
