// src/services/sectorService.ts
import { request } from "../api/request";
import { API_SECTORS } from "../api/apiConfig";

export interface Sector {
  id: string;
  name: string;
  description?: string;
}

export type SectorPayload = {
  name: string;
  description?: string;
};

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}

export interface GetSectorsOptions {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const getSectors = async (
  options: GetSectorsOptions = {}
): Promise<PaginatedResponse<Sector>> => {
  const {
    page = 1,
    perPage = 25,
    search = "",
    sortBy = "name",
    sortOrder = "asc",
  } = options;

  return await request<PaginatedResponse<Sector>>(
    "GET",
    API_SECTORS,
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

export const getSectorById = (id: string): Promise<Sector> =>
  request<Sector>("GET", `${API_SECTORS}/${id}`);

export const createSector = (data: SectorPayload): Promise<Sector> =>
  request<Sector>("POST", API_SECTORS, data);

export const updateSector = (id: string, data: SectorPayload): Promise<Sector> =>
  request<Sector>("PUT", `${API_SECTORS}/${id}`, data);

export const deleteSector = (id: string): Promise<void> =>
  request<void>("DELETE", `${API_SECTORS}/${id}`);
