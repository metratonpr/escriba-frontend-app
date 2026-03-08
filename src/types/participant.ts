// src/types/participant.ts
export interface Participant {
  id?: string | number;
  event_id: number;
  employee_id: number;
  employee?: {
    id: number;
    name: string;
  };
  certificate_number: string;
  presence: number;
  evaluation?: string;
  emitir_certificado?: boolean;
}
