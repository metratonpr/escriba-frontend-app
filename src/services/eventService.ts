// src/services/eventService.ts
import { request } from "../api/request";
import { API_EVENTS, API_EVENTS_COMPLETE, API_EVENT_TYPES } from "../api/apiConfig";
import type { Participant } from "../types/participant";
import type { EventAttendanceListItem } from "../types/eventAttendance";

export interface EventMedia {
  id: number;
  media_type: "image" | "video";
  mime_type: string;
  original_name: string;
  size_bytes?: number | null;
  url: string;
  has_file?: boolean | null;
  created_at: string;
}

export interface Event {
  id: string | number;
  name: string;
  event_type_id: string | number;
  company_id?: string | number | null;
  company?: {
    id: string | number;
    name: string;
  };
  total_hours?: number | null;
  event_type?: {
    id: string | number;
    nome_tipo_evento?: string;
    name?: string;
  };
  start_date: string;
  end_date: string;
  location: string;
  responsible: string;
  speakers: string;
  target_audience: string;
  notes: string;
  participations?: Participant[];
  attendance_list?: EventAttendanceListItem[];
  media?: EventMedia[];
}

export interface EventAttendancePayloadItem {
  id?: number;
  employee_id: number;
  event_participation_id?: number;
  attendance_date: string;
  present: boolean;
}

export interface EventCertificateGenerationPayload {
  generate?: boolean;
  organization_company_id?: number;
  issued_at?: string;
  include_total_hours?: boolean;
  total_hours?: number;
  include_presence_percent?: boolean;
  presence_percent?: number;
  title?: string;
  subtitle?: string;
  description?: string;
  signer_left?: string;
  signer_right?: string;
  location?: string;
}

export interface EventCompletePayload {
  name: string;
  event_type_id: string | number;
  start_date: string;
  end_date?: string;
  total_hours?: number | null;
  location?: string;
  responsible?: string;
  speakers?: string;
  target_audience?: string;
  notes?: string;
  participants: Participant[];
  attendance_list?: EventAttendancePayloadItem[];
  certificate_generation?: EventCertificateGenerationPayload;
}

export interface EventCompleteResponse {
  event: Event;
  certificates?: unknown;
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

export const createEvent = (data: EventPayload | FormData): Promise<Event> =>
  request<Event>("POST", API_EVENTS, data);

export const createCompleteEvent = (data: EventCompletePayload): Promise<EventCompleteResponse> =>
  request<EventCompleteResponse>("POST", API_EVENTS_COMPLETE, data);

export const updateEvent = (id: string, data: EventPayload | FormData): Promise<Event> => {
  if (data instanceof FormData) {
    if (!data.has("_method")) {
      data.append("_method", "PUT");
    }
    return request<Event>("POST", `${API_EVENTS}/${id}`, data);
  }

  return request<Event>("PUT", `${API_EVENTS}/${id}`, data);
};

export const deleteEvent = (id: string): Promise<void> =>
  request<void>("DELETE", `${API_EVENTS}/${id}`);

// Lista de tipos de evento
export interface EventType {
  id: string;
  name: string;
}

export const getEventTypes = (): Promise<EventType[]> =>
  request<EventType[]>("GET", API_EVENT_TYPES);
