import http from "../api/http";
import { request } from "../api/request";
import {
  API_CERTIFICATES_GENERATE,
  API_CERTIFICATES_VERIFY,
  API_EVENTS,
} from "../api/apiConfig";

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

export interface CertificateCourseData {
  name?: string;
  type?: string;
  period?: string;
  location?: string;
  responsible?: string;
  speakers?: string;
  target_audience?: string;
  notes?: string | null;
  total_hours?: number | null;
}

export interface CertificateMeta {
  organization_name?: string;
  location?: string;
  signer_left?: string;
  signer_right?: string;
  event_name?: string;
  event_type_name?: string;
  verification_url?: string;
  course_data?: CertificateCourseData;
}

export interface VerifiedCertificate {
  id: number;
  event_id: number;
  event_participation_id: number;
  company_id: number;
  certificate_number: string;
  verification_code: string;
  participant_name?: string;
  participant_email?: string | null;
  issued_at?: string;
  include_total_hours?: boolean;
  total_hours?: number | null;
  include_presence_percent?: boolean;
  presence_percent?: number | null;
  title?: string;
  subtitle?: string;
  description?: string;
  pdf_path?: string | null;
  meta?: CertificateMeta;
}

export interface CertificateVerificationResult {
  is_issued: boolean;
  is_valid_for_organization: boolean;
  certificate: VerifiedCertificate;
  event?: {
    id: number;
    name?: string;
    start_date?: string;
    end_date?: string;
    location?: string;
    total_hours?: number | null;
    event_type?: {
      id: number;
      nome_tipo_evento?: string;
    };
  };
  company?: {
    id: number;
    name?: string;
    cnpj?: string;
    city?: string;
    state?: string;
    logo_path?: string | null;
  };
  participation?: {
    id: number;
    employee_id?: number;
    certificate_number?: string;
    presence?: number;
    evaluation?: string | null;
    emitir_certificado?: boolean;
    employee?: {
      id: number;
      name?: string;
    };
  };
  verification_url?: string;
  course_data?: CertificateCourseData;
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

export const verifyCertificate = (
  verificationCode: string
): Promise<CertificateVerificationResult> =>
  request<CertificateVerificationResult>(
    "GET",
    `${API_CERTIFICATES_VERIFY}/${encodeURIComponent(verificationCode)}`
  );
