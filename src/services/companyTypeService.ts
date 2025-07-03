// src/services/companyTypeService.ts
import { request } from "../api/request";
import { API_COMPANY_TYPES } from "../api/apiConfig";

export interface CompanyType {
  id: string;
  name: string;
  description?: string;
}

export type CompanyTypePayload = {
  name: string;
  description?: string;
};

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}

export interface GetCompanyTypesOptions {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Obter lista paginada de tipos de empresas
 */
export const getCompanyTypes = async (
  options: GetCompanyTypesOptions = {}
): Promise<PaginatedResponse<CompanyType>> => {
  const {
    page = 1,
    perPage = 25,
    search = "",
    sortBy = "name",
    sortOrder = "asc",
  } = options;

  return await request<PaginatedResponse<CompanyType>>(
    "GET",
    API_COMPANY_TYPES,
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

/**
 * Obter tipo de empresa pelo ID
 */
export const getCompanyTypeById = (id: string): Promise<CompanyType> =>
  request<CompanyType>("GET", `${API_COMPANY_TYPES}/${id}`);

/**
 * Criar novo tipo de empresa
 */
export const createCompanyType = (
  data: CompanyTypePayload
): Promise<CompanyType> =>
  request<CompanyType>("POST", API_COMPANY_TYPES, data);

/**
 * Atualizar tipo de empresa existente
 */
export const updateCompanyType = (
  id: string,
  data: CompanyTypePayload
): Promise<CompanyType> =>
  request<CompanyType>("PUT", `${API_COMPANY_TYPES}/${id}`, data);

/**
 * Excluir tipo de empresa
 */
export const deleteCompanyType = (id: string): Promise<void> =>
  request<void>("DELETE", `${API_COMPANY_TYPES}/${id}`);
