import { API_COMPANIES, API_COMPANIES_WITH_SECTORS } from "../api/apiConfig";
import { multipartRequest } from "../api/multipartRequest";
import { request } from "../api/request";

export type CompanyId = string | number;

export interface CompanyGroupRef {
  id: CompanyId;
  name: string;
}

export interface CompanyTypeRef {
  id: CompanyId;
  name: string;
}

export interface CompanySectorRef {
  id: CompanyId;
  name: string;
}

export interface CompanyUploadLinks {
  view?: string;
  download?: string;
}

export interface CompanyUploadRef {
  id: CompanyId;
  nome_arquivo?: string;
  url_arquivo?: string;
  file_name?: string;
  file_path?: string;
  has_file?: boolean | null;
  links?: CompanyUploadLinks;
}

export interface CompanyDocumentRef {
  id: CompanyId;
  code?: string;
  name: string;
  description?: string | null;
  category?: string | null;
  is_required?: boolean;
  validity_days?: number | null;
  document_type_id?: CompanyId;
  document_issuer_id?: CompanyId;
}

export interface CompanyDocumentPayloadItem {
  document_id?: CompanyId;
  document?: { id: CompanyId };
  upload_id?: CompanyId;
  upload?: { id: CompanyId };
  status?: string;
  emission_date?: string;
  due_date?: string;
  issued_at?: string;
  expires_at?: string;
}

export interface CompanyDocumentItem {
  id: CompanyId;
  company_id: CompanyId;
  company?: {
    id: CompanyId;
    name: string;
  } | null;
  document_id: CompanyId;
  document?: CompanyDocumentRef | null;
  upload_id?: CompanyId | null;
  status?: string | null;
  emission_date?: string | null;
  due_date?: string | null;
  issued_at?: string | null;
  expires_at?: string | null;
  created_at?: string;
  updated_at?: string;
  upload?: CompanyUploadRef | null;
}

export interface CompanySectorPayload {
  sector_id?: CompanyId;
  sector?: { id: CompanyId };
}

export interface CompanySectorRelation {
  id: CompanyId;
  company_id?: CompanyId;
  sector_id?: CompanyId;
  sector: CompanySectorRef;
}

export interface CompanyPayload {
  company_group_id: CompanyId;
  company_type_id: CompanyId;
  name: string;
  cnpj: string;
  phone?: string;
  address?: string;
  city?: string;
  state: string;
  responsible: string;
  email: string;
  logo?: File | null;
  company_sectors: CompanySectorPayload[];
  documents?: CompanyDocumentPayloadItem[];
}

export interface CompanyResponse {
  id: CompanyId;
  company_group_id?: CompanyId;
  company_type_id?: CompanyId;
  name: string;
  cnpj: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  responsible?: string | null;
  email?: string | null;
  logo_path?: string | null;
  logo_url?: string | null;
  group?: CompanyGroupRef | null;
  type?: CompanyTypeRef | null;
  company_sectors?: CompanySectorRelation[];
  sectors?: CompanySectorRef[];
  documents_count?: number;
  documents?: CompanyDocumentItem[];
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}

export type CompanyMutationPayload = CompanyPayload | FormData;
export type CompanyMutationResponse = CompanyResponse;

type CompanyCollectionResponse = PaginatedResponse<CompanyResponse> | CompanyResponse[];

export interface GetCompaniesOptions {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

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

  return request<PaginatedResponse<CompanyResponse>>("GET", API_COMPANIES, {}, {
    page,
    per_page: perPage,
    search,
    sort_by: sortBy,
    sort_order: sortOrder,
  });
};

export const getCompaniesWithSectors = async (
  options: GetCompaniesOptions = {}
): Promise<PaginatedResponse<CompanyResponse>> => {
  const {
    page = 1,
    perPage = 25,
    search = "",
    sortBy = "name",
    sortOrder = "asc",
  } = options;

  const response = await request<CompanyCollectionResponse>(
    "GET",
    API_COMPANIES_WITH_SECTORS,
    {},
    {
      page,
      per_page: perPage,
      search,
      sort_by: sortBy,
      sort_order: sortOrder,
    }
  );

  if (Array.isArray(response)) {
    return {
      data: response,
      total: response.length,
      page,
      per_page: perPage,
    };
  }

  return response;
};

export const getCompanyById = (id: CompanyId): Promise<CompanyResponse> =>
  request<CompanyResponse>("GET", `${API_COMPANIES}/${id}`);

export const createCompany = (
  data: CompanyMutationPayload
): Promise<CompanyMutationResponse> =>
  data instanceof FormData
    ? multipartRequest<CompanyMutationResponse>("POST", API_COMPANIES, data)
    : request<CompanyMutationResponse>(
        "POST",
        API_COMPANIES,
        data as unknown as Record<string, unknown>
      );

export const updateCompany = (
  id: CompanyId,
  data: CompanyMutationPayload
): Promise<CompanyMutationResponse> => {
  if (data instanceof FormData) {
    data.append("_method", "PUT");
    return multipartRequest<CompanyMutationResponse>(
      "POST",
      `${API_COMPANIES}/${id}`,
      data
    );
  }

  return request<CompanyMutationResponse>(
    "PUT",
    `${API_COMPANIES}/${id}`,
    data as unknown as Record<string, unknown>
  );
};

export const deleteCompany = (id: CompanyId): Promise<void> =>
  request<void>("DELETE", `${API_COMPANIES}/${id}`);
