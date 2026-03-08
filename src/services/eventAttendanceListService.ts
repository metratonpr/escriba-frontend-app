import { request } from "../api/request";
import { API_EVENT_ATTENDANCE_LISTS } from "../api/apiConfig";
import type { EventAttendanceListItem } from "../types/eventAttendance";

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

interface GetEventAttendanceListOptions {
  eventId: number;
  attendanceDate?: string;
  employeeId?: number;
  page?: number;
  perPage?: number;
}

export interface EventAttendanceListPayload {
  event_id: number;
  employee_id: number;
  event_participation_id: number;
  attendance_date: string;
  present: boolean;
}

export const getEventAttendanceLists = async (
  options: GetEventAttendanceListOptions
): Promise<PaginatedResponse<EventAttendanceListItem>> => {
  const {
    eventId,
    attendanceDate,
    employeeId,
    page = 1,
    perPage = 200,
  } = options;

  return request<PaginatedResponse<EventAttendanceListItem>>(
    "GET",
    API_EVENT_ATTENDANCE_LISTS,
    {},
    {
      event_id: eventId,
      attendance_date: attendanceDate,
      employee_id: employeeId,
      page,
      per_page: perPage,
    }
  );
};

export const createEventAttendanceList = (
  payload: EventAttendanceListPayload
): Promise<EventAttendanceListItem> =>
  request<EventAttendanceListItem>("POST", API_EVENT_ATTENDANCE_LISTS, payload);

export const updateEventAttendanceList = (
  id: number,
  payload: EventAttendanceListPayload
): Promise<EventAttendanceListItem> =>
  request<EventAttendanceListItem>("PUT", `${API_EVENT_ATTENDANCE_LISTS}/${id}`, payload);

export const deleteEventAttendanceList = (id: number): Promise<void> =>
  request<void>("DELETE", `${API_EVENT_ATTENDANCE_LISTS}/${id}`);
