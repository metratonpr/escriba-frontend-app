import { API_KPIS_SYSTEM } from "../api/apiConfig";
import { request } from "../api/request";

export interface KpiNumericStats {
  sample_size: number;
  total: number;
  average: number | null;
  min: number | null;
  max: number | null;
}

export interface LabelTotalItem {
  label: string | null;
  total: number;
}

export interface EventTypeTotalItem {
  event_type_id: number | null;
  event_type_name: string | null;
  total: number;
}

export interface OccurrenceTypeTotalItem {
  occurrence_type_id: number | null;
  occurrence_type_name: string | null;
  total: number;
}

export interface TopEventByParticipants {
  event_id: number;
  event_name: string | null;
  start_date: string | null;
  end_date: string | null;
  participants_total: number;
}

export interface TopEventParticipant {
  employee_id: number;
  employee_name: string | null;
  events_total: number;
  presences_total: number;
  presence_rate_percent: number;
}

export interface TopOccurrenceInvolvedEmployee {
  employee_id: number;
  employee_name: string | null;
  as_primary_total: number;
  as_participant_total: number;
  involvements_total: number;
}

export interface SystemEventKpis {
  totals: {
    total: number;
    completed: number;
    ongoing: number;
    upcoming: number;
    created_in_window: number;
  };
  duration_days: KpiNumericStats;
  participations: {
    total: number;
    present: number;
    absent: number;
    presence_rate_percent: number;
  };
  top_events_by_participants: TopEventByParticipants[];
  top_participants: TopEventParticipant[];
  by_type: EventTypeTotalItem[];
}

export interface SystemOccurrenceKpis {
  totals: {
    total: number;
    open: number;
    closed: number;
    created_in_window: number;
  };
  by_status: LabelTotalItem[];
  by_severity: LabelTotalItem[];
  by_classification: LabelTotalItem[];
  by_type: OccurrenceTypeTotalItem[];
  top_involved_employees: TopOccurrenceInvolvedEmployee[];
  closure_time_days: KpiNumericStats;
}

export interface SystemEmployeeKpis {
  summary: {
    total_employees: number;
    new_employees_in_window: number;
    without_assignments: number;
  };
  by_assignment_status: LabelTotalItem[];
  by_job_title: LabelTotalItem[];
}

export interface CompanyGroupSummaryItem {
  company_group_id: number;
  company_group_name: string;
  companies_total: number;
}

export interface CompanyTypeSummaryItem {
  company_type_id: number;
  company_type_name: string;
  companies_total: number;
}

export interface CompanySectorSummaryItem {
  sector_id: number;
  sector_name: string;
  companies_total: number;
}

export interface SystemCompanyKpis {
  summary: {
    total_companies: number;
    with_sectors: number;
    with_sectors_percent: number;
  };
  by_group: CompanyGroupSummaryItem[];
  by_type: CompanyTypeSummaryItem[];
  top_sectors: CompanySectorSummaryItem[];
}

export interface SystemDocumentKpis {
  summary: {
    total_documents: number;
    required_documents: number;
    optional_documents: number;
  };
  by_category: LabelTotalItem[];
  by_type: LabelTotalItem[];
  validity_days: KpiNumericStats;
}

export interface SystemMedicalExamKpis {
  summary: {
    total_exams: number;
    upcoming_exams: number;
    past_exams: number;
    window_exams: number;
  };
  by_type: LabelTotalItem[];
}

export interface SystemEpiDeliveryKpis {
  summary: {
    total_deliveries: number;
    deliveries_in_window: number;
    total_items: number;
  };
  top_items: {
    epi_id: number;
    epi_name: string;
    quantity_total: number;
  }[];
}

export interface SystemKpiFilters {
  company_group_id: number | null;
  company_id: number | null;
}

export interface ModelSummaryKpis {
  total_models: number;
  active_records_total: number;
  all_records_total: number;
}

export interface ModelItemKpi {
  model: string;
  table: string;
  supports_soft_deletes: boolean;
  active_count: number;
  all_count: number;
}

export interface SystemModelKpis {
  summary: ModelSummaryKpis;
  items: ModelItemKpi[];
}

export interface SystemKpiResponse {
  generated_at: string;
  window_days: number;
  time_window: string | null;
  filters: SystemKpiFilters;
  events: SystemEventKpis;
  occurrences: SystemOccurrenceKpis;
  employees: SystemEmployeeKpis;
  companies: SystemCompanyKpis;
  documents: SystemDocumentKpis;
  medical_exams: SystemMedicalExamKpis;
  epi_deliveries: SystemEpiDeliveryKpis;
  models: SystemModelKpis;
}

export interface GetSystemKpisOptions {
  days?: number;
}

export const getSystemKpis = async (
  options: GetSystemKpisOptions = {}
): Promise<SystemKpiResponse> => {
  const { days = 30 } = options;

  return request<SystemKpiResponse>("GET", API_KPIS_SYSTEM, {}, { days });
};
