// src/services/companyService.ts
import { request } from "../api/request";
import { API_COMPANIES } from "../api/apiConfig";

// Representa os dados planos da empresa
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

// Representa o payload de criação/atualização
export type CompanyPayload = Omit<Company, "id">;

// Representa os dados da empresa com relacionamentos (usado nas páginas de edição)
export interface CompanyResponse {
  id: string;
  name: string;
  cnpj: string;
  phone?: string;
  address?: string;
  city?: string;
  state: string;
  responsible: string;
  email: string;
  group?: { id: string; name: string };
  type?: { id: string; name: string };
  company_sectors?: { sector: { id: string; name: string } }[];
}

// Paginação genérica
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}

// Filtros para listagem
export interface GetCompaniesOptions {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Lista de empresas com paginação
export const getCompanies = async (
  options: GetCompaniesOptions = {}
): Promise<PaginatedResponse<CompanyResponse>> => {
  const {
    page = 1,
    perPage = 25,
    search = "",
    sortBy = "name",
    sortOrder = "asc",
  } = options;

  return request<PaginatedResponse<CompanyResponse>>(
    "GET",
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

// Busca empresa por ID
export const getCompanyById = (id: string): Promise<CompanyResponse> =>
  request<CompanyResponse>('GET', `${API_COMPANIES}/${id}`);

// Criação
export const createCompany = (data: CompanyPayload): Promise<Company> =>
  request<Company>('POST', API_COMPANIES, data);

// Atualização
export const updateCompany = (id: string, data: CompanyPayload): Promise<Company> =>
  request<Company>('PUT', `${API_COMPANIES}/${id}`, data);

// Exclusão
export const deleteCompany = (id: string): Promise<void> =>
  request<void>('DELETE', `${API_COMPANIES}/${id}`);
