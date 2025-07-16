import { request } from "../api/request";
import { multipartRequest } from "../api/multipartRequest";
import { API_MEDICAL_EXAMS } from "../api/apiConfig";

export interface Attachment {
  id: number;
  nome_arquivo: string;
  url_arquivo: string;
}

export interface MedicalExam {
  id: string;
  employee_id: number;
  employee_name?: string;
  exam_type: 'admissional' | 'periodico' | 'demissional' | 'retorno_ao_trabalho' | 'mudanca_de_funcao';
  exam_date: string;
  cid?: string;
  fit: boolean;
  result_attachment_url?: string;

  // ✅ Novos campos necessários para tela
  uploads?: Attachment[];
  employee?: {
    name: string;
  };
}


export type MedicalExamPayload = Omit<MedicalExam, 'id' | 'employee_name'>;

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}

export interface GetMedicalExamsOptions {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const getMedicalExams = async (
  options: GetMedicalExamsOptions = {}
): Promise<PaginatedResponse<MedicalExam>> => {
  const {
    page = 1,
    perPage = 25,
    search = '',
    sortBy = 'exam_date',
    sortOrder = 'desc',
  } = options;

  return request<PaginatedResponse<MedicalExam>>(
    'GET',
    API_MEDICAL_EXAMS,
    {},
    {
      page,
      per_page: perPage,
      search,
      sort_by: sortBy,
      sort_order: sortOrder,
    }
  );
};

export const getMedicalExamById = (id: number): Promise<MedicalExam> =>
  request<MedicalExam>('GET', `${API_MEDICAL_EXAMS}/${id}`);

// Envio multipart via FormData (criação)
export const createMedicalExam = (data: FormData): Promise<MedicalExam> =>
  multipartRequest<MedicalExam>('POST', API_MEDICAL_EXAMS, data);

// Atualização via POST com _method=PUT (compatível com Laravel)
export const updateMedicalExam = (id: number, data: FormData): Promise<MedicalExam> => {
  data.append('_method', 'PUT');
  return multipartRequest<MedicalExam>('POST', `${API_MEDICAL_EXAMS}/${id}`, data);
};

export const deleteMedicalExam = (id: string): Promise<void> =>
  request<void>('DELETE', `${API_MEDICAL_EXAMS}/${id}`);
