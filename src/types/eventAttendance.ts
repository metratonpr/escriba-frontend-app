export interface EventAttendanceParticipation {
  id: number;
  event_id: number;
  employee_id: number;
  presence: number;
  evaluation?: string | null;
}

export interface EventAttendanceEmployee {
  id: number;
  name: string;
}

export interface EventAttendanceListItem {
  id: number;
  event_id: number;
  event_participation_id: number;
  employee_id: number;
  attendance_date: string;
  present: boolean;
  employee?: EventAttendanceEmployee;
  participation?: EventAttendanceParticipation;
}
