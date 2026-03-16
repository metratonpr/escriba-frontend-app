// src/services/companyGroupService.ts
import { API_COMPANY_GROUPS } from "../api/apiConfig";
import { multipartRequest } from "../api/multipartRequest";
import { request } from "../api/request";

export interface CompanyGroup {
  id: string;
  name: string;
  description?: string | null;
  responsible: string;
  contact_email: string;
  logo_path?: string | null;
  logo_url?: string | null;
  has_logo?: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export type CompanyGroupPayload = {
  name: string;
  description?: string;
  responsible: string;
  contact_email: string;
  logo?: File | null;
  remove_logo?: boolean;
};

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}

export interface GetCompanyGroupsOptions {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Obter lista paginada de grupos de empresas
 */
export const getCompanyGroups = async (
  options: GetCompanyGroupsOptions = {}
): Promise<PaginatedResponse<CompanyGroup>> => {
  const {
    page = 1,
    perPage = 25,
    search = '',
    sortBy = 'name',
    sortOrder = 'asc',
  } = options;

  return await request<PaginatedResponse<CompanyGroup>>(
    'GET',
    API_COMPANY_GROUPS,
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
 * Obter grupo de empresa pelo ID
 */
export const getCompanyGroupById = (id: string | number): Promise<CompanyGroup> =>
  request<CompanyGroup>('GET', `${API_COMPANY_GROUPS}/${id}`);

/**
 * Criar novo grupo de empresa
 */
export const createCompanyGroup = (data: FormData): Promise<CompanyGroup> =>
  multipartRequest<CompanyGroup>('POST', API_COMPANY_GROUPS, data);

/**
 * Atualizar grupo de empresa existente
 */
export const updateCompanyGroup = (id: string | number, data: FormData): Promise<CompanyGroup> => {
  data.append("_method", "PUT");
  return multipartRequest<CompanyGroup>('POST', `${API_COMPANY_GROUPS}/${id}`, data);
};

/**
 * Excluir grupo de empresa
 */
export const deleteCompanyGroup = (id: string | number): Promise<void> =>
  request<void>('DELETE', `${API_COMPANY_GROUPS}/${id}`);
