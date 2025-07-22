import { request } from "../api/request";
import { API_EPIS } from "../api/apiConfig";

export interface Epi {
  id: number;
  name: string;
  epi_type_id: number;
  brand_id: number;
  company_id: number;
  ca: string;
  ca_expiration: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;

  type?: {
    id: number;
    name: string;
  };

  brand?: {
    id: number;
    name: string;
    website?: string | null;
    support_email?: string | null;
  };

  company?: {
    id: number;
    name: string;
    cnpj: string;
    city: string;
    state: string;
    email: string;
    responsible: string;
    address?: string | null;
    phone?: string | null;
  };
}

export type EpiPayload = Omit<Epi, "id" | "created_at" | "updated_at" | "deleted_at" | "type" | "brand" | "company">;

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}

export const getEpis = async (
  params: { search?: string; page?: number; perPage?: number } = {}
): Promise<PaginatedResponse<Epi>> => {
  const { search = "", page = 1, perPage = 10 } = params;

  return await request("GET", API_EPIS, {}, {
    search,
    page,
    per_page: perPage,
  });
};

export const getEpiById = (id: number): Promise<Epi> =>
  request("GET", `${API_EPIS}/${id}`);

export const createEpi = (data: EpiPayload): Promise<Epi> =>
  request("POST", API_EPIS, data);

export const updateEpi = (id: number, data: EpiPayload): Promise<Epi> =>
  request("PUT", `${API_EPIS}/${id}`, data);

export const deleteEpi = (id: number): Promise<void> =>
  request("DELETE", `${API_EPIS}/${id}`);
