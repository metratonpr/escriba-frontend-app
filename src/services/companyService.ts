// src/services/companyService.ts
import { request } from "../api/request";
import { API_COMPANIES } from "../api/apiConfig";

export interface Company {
  id: string;
  company_group_id: string;
  company_type_id: string;
  name: string;
  cnpj: string;
  phone?: string;
  address?: string;
  city?: string;
  state: string;
  responsible: string;
  email: string;
}

export type CompanyPayload = Omit<Company, "id">;

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}

export interface GetCompaniesOptions {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const getCompanies = async (options: GetCompaniesOptions = {}): Promise<PaginatedResponse<Company>> => {
  const {
    page = 1,
    perPage = 25,
    search = '',
    sortBy = 'name',
    sortOrder = 'asc',
  } = options;

  return request<PaginatedResponse<Company>>(
    'GET',
    API_COMPANIES,
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

export const getCompanyById = (id: string): Promise<Company> =>
  request<Company>('GET', `${API_COMPANIES}/${id}`);

export const createCompany = (data: CompanyPayload): Promise<Company> =>
  request<Company>('POST', API_COMPANIES, data);

export const updateCompany = (id: string, data: CompanyPayload): Promise<Company> =>
  request<Company>('PUT', `${API_COMPANIES}/${id}`, data);

export const deleteCompany = (id: string): Promise<void> =>
  request<void>('DELETE', `${API_COMPANIES}/${id}`);
