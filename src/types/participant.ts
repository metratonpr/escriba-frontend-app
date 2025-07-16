// src/types/participant.ts
export interface Participant {
  id?: string;
  event_id: number;
  employee_id: number;
  employee?: {
    id: number;
    name: string;
  };
  certificate_number: string;
  presence: boolean;
  evaluation?: string;
}
