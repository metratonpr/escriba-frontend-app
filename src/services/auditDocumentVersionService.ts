import { request } from "../api/request";
import { API_URL } from "../api/apiConfig";

export interface AuditDocumentVersionExpirationItem {
  document_id: number;
  document_code: string;
  document_name: string;
  document_version_id: number;
  document_version_code: string;
  version: string;
  description?: string | null;
  validity_days: number;
  created_at: string;
  updated_at: string;
  status: "pendente" | "enviado" | "aprovado" | "rejeitado" | string;
}

export interface AuditDocumentVersionExpirationResponse {
  data: AuditDocumentVersionExpirationItem[];
  total: number;
  params?: {
    days?: number | null;
    group_by?: string;
  };
}

export interface AuditDocumentVersionExpirationFilters {
  page?: number;
  perPage?: number;
  days?: number;
  query?: string;
}

const API_AUDIT_DOCUMENT_VERSION_EXPIRATION = `${API_URL}/auditoria/vencimentos-versoes-documentos`;

export const getDocumentVersionExpirationList = async (
  filters: AuditDocumentVersionExpirationFilters = {}
): Promise<AuditDocumentVersionExpirationResponse> => {
  const params: Record<string, unknown> = {
    page: filters.page ?? 1,
    per_page: filters.perPage ?? 25,
  };

  if (filters.days !== undefined) {
    params.days = filters.days;
  }

  if (filters.query) {
    params.q = filters.query;
  }

  return request<AuditDocumentVersionExpirationResponse>(
    "GET",
    API_AUDIT_DOCUMENT_VERSION_EXPIRATION,
    {},
    params
  );
};
