// src/services/occurrenceTypeService.ts
import { request } from "../api/request";
import { API_OCCURRENCE_TYPES } from "../api/apiConfig";

export interface OccurrenceType {
  id: string;
  name: string;
  description?: string;
  category: "Acidente" | "Quase Acidente" | "Desvio" | "Comportamento Inseguro" | "Outro";
  severity_level: "Baixo" | "Médio" | "Alto" | "Gravíssimo";
}

export type OccurrenceTypePayload = Omit<OccurrenceType, "id">;

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}

export interface GetOccurrenceTypesOptions {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const getOccurrenceTypes = async (
  options: GetOccurrenceTypesOptions = {}
): Promise<PaginatedResponse<OccurrenceType>> => {
  const {
    page = 1,
    perPage = 25,
    search = '',
    sortBy = 'name',
    sortOrder = 'asc',
  } = options;

  return request<PaginatedResponse<OccurrenceType>>(
    'GET',
    API_OCCURRENCE_TYPES,
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

export const getOccurrenceTypeById = (id: string): Promise<OccurrenceType> =>
  request<OccurrenceType>('GET', `${API_OCCURRENCE_TYPES}/${id}`);

export const createOccurrenceType = (data: OccurrenceTypePayload): Promise<OccurrenceType> =>
  request<OccurrenceType>('POST', API_OCCURRENCE_TYPES, data);

export const updateOccurrenceType = (id: string, data: OccurrenceTypePayload): Promise<OccurrenceType> =>
  request<OccurrenceType>('PUT', `${API_OCCURRENCE_TYPES}/${id}`, data);

export const deleteOccurrenceType = (id: string): Promise<void> =>
  request<void>('DELETE', `${API_OCCURRENCE_TYPES}/${id}`);
