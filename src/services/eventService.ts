// src/services/eventService.ts
import { request } from "../api/request";
import { API_EVENTS, API_EVENT_TYPES } from "../api/apiConfig";
import type { Participant } from "../types/participant";

export interface Event {
  id: string;
  name: string;
  event_type_id: string;
  event_type?: {
    id: string | number;
    nome_tipo_evento: string;
  };
  start_date: string;
  end_date: string;
  location: string;
  responsible: string;
  speakers: string;
  target_audience: string;
  notes: string;
  participations?: Participant[];
}




export type EventPayload = Omit<Event, "id">;

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}

export interface GetEventsOptions {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const getEvents = async (options: GetEventsOptions = {}): Promise<PaginatedResponse<Event>> => {
  const {
    page = 1,
    perPage = 25,
    search = "",
    sortBy = "start_date",
    sortOrder = "desc",
  } = options;

  return request<PaginatedResponse<Event>>(
    "GET",
    API_EVENTS,
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

export const getEventById = (id: string): Promise<Event> =>
  request<Event>("GET", `${API_EVENTS}/${id}`);

export const createEvent = (data: EventPayload): Promise<Event> =>
  request<Event>("POST", API_EVENTS, data);

export const updateEvent = (id: string, data: EventPayload): Promise<Event> =>
  request<Event>("PUT", `${API_EVENTS}/${id}`, data);

export const deleteEvent = (id: string): Promise<void> =>
  request<void>("DELETE", `${API_EVENTS}/${id}`);

// Lista de tipos de evento
export interface EventType {
  id: string;
  name: string;
}

export const getEventTypes = (): Promise<EventType[]> =>
  request<EventType[]>("GET", API_EVENT_TYPES);
