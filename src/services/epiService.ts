// src/services/epiService.ts
import { request } from "../api/request";
import { API_EPIS } from "../api/apiConfig";

export interface Epi {
  id: string;
  name: string;
  epi_type_id: string;
  epi_type_name: string;
  brand_id: string;
  brand_name: string;
  company_id: string;
  company_name: string;
  ca: string;
  ca_expiration: string;
}


export interface EpiPayload {
  name: string;
  ca: string;
  ca_expiration: string;
  brand_id: string;
  company_id: string;
  epi_type_id: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}

export interface GetEpisOptions {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const getEpis = async (
  options: GetEpisOptions = {}
): Promise<PaginatedResponse<Epi>> => {
  const {
    page = 1,
    perPage = 25,
    search = "",
    sortBy = "name",
    sortOrder = "asc",
  } = options;

  return request<PaginatedResponse<Epi>>(
    "GET",
    API_EPIS,
    {},
    { page, per_page: perPage, search, sort_by: sortBy, sort_order: sortOrder }
  );
};

export const getEpiById = (id: string): Promise<Epi> =>
  request<Epi>("GET", `${API_EPIS}/${id}`);

export const createEpi = (data: EpiPayload): Promise<Epi> =>
  request<Epi>("POST", API_EPIS, data);

export const updateEpi = (id: string, data: EpiPayload): Promise<Epi> =>
  request<Epi>("PUT", `${API_EPIS}/${id}`, data);

export const deleteEpi = (id: string): Promise<void> =>
  request<void>("DELETE", `${API_EPIS}/${id}`);
