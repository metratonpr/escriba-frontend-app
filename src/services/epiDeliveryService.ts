// src/services/epiDeliveryService.ts
import { request } from "../api/request";
import { API_EPI_DELIVERIES } from "../api/apiConfig";
import type { EpiDelivery } from "../types/epi";

export interface Person {
  id: number;
  name: string;
  cpf: string;
  rg: string;
  rg_issuer: string;
  birth_date: string;
  driver_license_type: string;
  first_license_date: string | null;}



export type EpiDeliveryPayload = Omit<EpiDelivery, "id" | "document_number">;

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}

export interface GetEpiDeliveriesOptions {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Obter lista paginada de entregas de EPI
 */
export const getEpiDeliveries = async (
  options: GetEpiDeliveriesOptions = {}
): Promise<PaginatedResponse<EpiDelivery>> => {
  const {
    page = 1,
    perPage = 25,
    search = "",
    sortBy = "delivery_date",
    sortOrder = "desc",
  } = options;

  return await request<PaginatedResponse<EpiDelivery>>(
    "GET",
    API_EPI_DELIVERIES,
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
 * Obter entrega de EPI por ID
 */
export const getEpiDeliveryById = (id: number): Promise<EpiDelivery> =>
  request<EpiDelivery>("GET", `${API_EPI_DELIVERIES}/${id}`);

/**
 * Criar nova entrega de EPI
 */
export const createEpiDelivery = (data: EpiDeliveryPayload): Promise<EpiDelivery> =>
  request<EpiDelivery>("POST", API_EPI_DELIVERIES, data);

/**
 * Atualizar entrega de EPI existente
 */
export const updateEpiDelivery = (
  id: number,
  data: Partial<EpiDeliveryPayload>
): Promise<EpiDelivery> =>
  request<EpiDelivery>("PUT", `${API_EPI_DELIVERIES}/${id}`, data);

/**
 * Excluir entrega de EPI
 */
export const deleteEpiDelivery = (id: number): Promise<void> =>
  request<void>("DELETE", `${API_EPI_DELIVERIES}/${id}`);
