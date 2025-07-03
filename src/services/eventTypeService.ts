import { request } from "../api/request";
import { API_EVENT_TYPES } from "../api/apiConfig";

export interface EventType {
  id: string;
  nome_tipo_evento: string;
  descricao?: string;
}

export type EventTypePayload = {
  nome_tipo_evento: string;
  descricao?: string;
};

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}

export interface GetEventTypesOptions {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Obter lista de tipos de evento
 */
export const getEventTypes = async (
  options: GetEventTypesOptions = {}
): Promise<PaginatedResponse<EventType>> => {
  const {
    page = 1,
    perPage = 25,
    search = "",
    sortBy = "nome_tipo_evento",
    sortOrder = "asc",
  } = options;

  return await request<PaginatedResponse<EventType>>(
    "GET",
    API_EVENT_TYPES,
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
 * Obter tipo de evento por ID
 */
export const getEventTypeById = (id: string): Promise<EventType> =>
  request<EventType>("GET", `${API_EVENT_TYPES}/${id}`);

/**
 * Criar novo tipo de evento
 */
export const createEventType = (
  data: EventTypePayload
): Promise<EventType> => request<EventType>("POST", API_EVENT_TYPES, data);

/**
 * Atualizar tipo de evento existente
 */
export const updateEventType = (
  id: string,
  data: EventTypePayload
): Promise<EventType> =>
  request<EventType>("PUT", `${API_EVENT_TYPES}/${id}`, data);

/**
 * Excluir tipo de evento
 */
export const deleteEventType = (id: string): Promise<void> =>
  request<void>("DELETE", `${API_EVENT_TYPES}/${id}`);
