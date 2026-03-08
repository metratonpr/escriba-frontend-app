import http from "../api/http";
import { request } from "../api/request";
import { API_CERTIFICATES_GENERATE, API_EVENTS } from "../api/apiConfig";

export interface CertificateGenerationOptions {
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

export interface GenerateCertificatePayload extends CertificateGenerationOptions {
  event_id: number;
  event_participation_id: number;
  participant_name?: string;
  participant_email?: string;
  certificate_number?: string;
}

export interface GenerateEventCertificatesPayload extends CertificateGenerationOptions {
  event_participation_ids?: number[];
}

export interface GenerateEventCertificatesResult {
  event_id: number;
  event_name: string;
  processed_count: number;
  created_count: number;
  skipped_count: number;
  created: Array<{
    event_participation_id: number;
    employee_id: number;
    participant_name?: string;
    certificate_id: number;
    certificate_number: string;
    verification_code: string;
    verification_url: string;
  }>;
  skipped: Array<{
    event_participation_id: number;
    employee_id: number;
    participant_name?: string;
    reason: string;
    certificate_id?: number;
    verification_code?: string;
  }>;
}

export const generateCertificatePdf = async (
  payload: GenerateCertificatePayload
): Promise<Blob> => {
  const response = await http.post(API_CERTIFICATES_GENERATE, payload, {
    responseType: "blob",
    headers: {
      Accept: "application/pdf",
    },
  });

  return response.data as Blob;
};

export const generateCertificatesByEvent = (
  eventId: number,
  payload: GenerateEventCertificatesPayload = {}
): Promise<GenerateEventCertificatesResult> =>
  request<GenerateEventCertificatesResult>(
    "POST",
    `${API_EVENTS}/${eventId}/certificates/generate`,
    payload
  );
