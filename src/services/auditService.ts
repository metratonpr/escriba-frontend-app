import { API_DASHBOARD_AUDIT } from "../api/apiConfig";
import { request } from "../api/request";
import type { CompanyResponse } from "./companyService";

export interface CompanyGroupAuditSummary {
  id: number;
  name: string;
  description: string | null;
  responsible: string | null;
  contact_email: string | null;
  logo_url: string | null;
  has_logo: boolean;
  companies: CompanyResponse[];
}

export interface AuditSection {
  key: string;
  label: string;
  data: CompanyGroupAuditSummary[];
}

export interface DashboardAuditResponse {
  items: AuditSection[];
}

export const getDashboardAudit = async (): Promise<DashboardAuditResponse> => {
  return request<DashboardAuditResponse>("GET", API_DASHBOARD_AUDIT);
};
