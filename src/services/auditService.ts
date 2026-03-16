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

export interface CompanySectorAudit {
  company_sector_id: number;
  sector_id: number;
  name: string;
  employees: Array<{
    assignment_id: number;
    employee_id: number;
    employee_name: string;
    job_title: string;
    status: string;
    start_date: string;
    end_date: string | null;
  }>;
}

export interface CompanyDocumentAudit {
  id: number;
  status: string;
  emission_date: string;
  due_date: string;
  upload: {
    id: number;
    file_name: string;
    path: string;
  };
  document_version: {
    id: number;
    code: string;
    version: string;
  };
  document: {
    id: number;
    name: string;
    type: string;
    issuer: string;
  };
  has_file?: boolean;
}

export interface CompanyAssignmentAudit {
  id: number;
  company_sector_id: number;
  sector_id: number;
  sector_name: string;
  job_title: string;
  status: string;
  start_date: string;
  end_date: string | null;
}

export interface CompanyEmployeeAudit {
  id: number;
  name: string;
  cpf: string;
  rg: string;
  documents: CompanyDocumentAudit[];
  assignments: CompanyAssignmentAudit[];
}

export interface CompanyAuditDetail {
  company: {
    id: number;
    name: string;
    cnpj: string;
  };
  sectors: CompanySectorAudit[];
  employees: CompanyEmployeeAudit[];
  company_documents: CompanyDocumentAudit[];
  events: Array<{
    id: number;
    event_id: number;
    name: string;
    event_type: string;
    start_date: string;
    end_date: string;
    location: string;
    responsible: string;
    role: string;
    joined_at: string;
  }>;
}

export const getCompanyAuditDetail = async (
  companyId: number
): Promise<CompanyAuditDetail> => {
  const url = `${API_DASHBOARD_AUDIT}?company_id=${companyId}`;
  return request<CompanyAuditDetail>("GET", url);
};
