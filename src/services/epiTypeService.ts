// src/services/epiTypeService.ts
import { request } from "../api/request";
import { API_EPI_TYPES } from "../api/apiConfig";

export interface EpiType {
  id: string;
  name: string;
}

export type EpiTypePayload = {
  name: string;
};

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}

export interface GetEpiTypesOptions {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const getEpiTypes = async (
  options: GetEpiTypesOptions = {}
): Promise<PaginatedResponse<EpiType>> => {
  const {
    page = 1,
    perPage = 25,
    search = "",
    sortBy = "name",
    sortOrder = "asc",
  } = options;

  return await request<PaginatedResponse<EpiType>>(
    "GET",
    API_EPI_TYPES,
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

export const getEpiTypeById = (id: string): Promise<EpiType> =>
  request<EpiType>("GET", `${API_EPI_TYPES}/${id}`);

export const createEpiType = (data: EpiTypePayload): Promise<EpiType> =>
  request("POST", API_EPI_TYPES, data);

export const updateEpiType = (id: string, data: EpiTypePayload): Promise<EpiType> =>
  request("PUT", `${API_EPI_TYPES}/${id}`, data);

export const deleteEpiType = (id: string): Promise<void> =>
  request("DELETE", `${API_EPI_TYPES}/${id}`);
