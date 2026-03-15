import { API_DOCUMENTS_EXPIRED, API_DOCUMENTS_EXPIRING_SOON } from "../api/apiConfig";
import { request } from "../api/request";

export type DocumentSourceType =
  | "company"
  | "employee"
  | "event"
  | "epi_delivery"
  | "occurrence"
  | "medical_exam";

export interface DocumentFileLinks {
  view?: string | null;
  download?: string | null;
}

export interface DocumentUploadReference {
  id: number | string;
  nome_arquivo?: string;
  url_arquivo?: string;
  links?: DocumentFileLinks | null;
}

export interface DocumentDeadlineIndicator {
  source_type: DocumentSourceType;
  source_id: number;
  source_name: string | null;
  document_id: number;
  document_name: string | null;
  status: string | null;
  emission_date: string | null;
  due_date: string | null;
  is_expired?: boolean;
  days_until_due?: number | null;
  days_remaining: number | null;
  uploaded_at: string | null;
  has_file?: boolean | null;
  upload_id?: number | string | null;
  links?: DocumentFileLinks | null;
  upload?: DocumentUploadReference | null;
}

export interface GetExpiringSoonOptions {
  days?: number;
}

export const getDocumentsExpiringSoon = async (
  options: GetExpiringSoonOptions = {}
): Promise<DocumentDeadlineIndicator[]> => {
  const { days = 30 } = options;

  return request<DocumentDeadlineIndicator[]>(
    "GET",
    API_DOCUMENTS_EXPIRING_SOON,
    {},
    { days }
  );
};

export const getExpiredDocuments = async (): Promise<DocumentDeadlineIndicator[]> =>
  request<DocumentDeadlineIndicator[]>("GET", API_DOCUMENTS_EXPIRED);
