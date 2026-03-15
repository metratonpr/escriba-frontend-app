import { request } from "../api/request";

export interface MedicalExamDocumentType {
  id: number;
  code: string;
  name: string;
  validity_days: number;
  type: {
    id: number;
    name: string;
  };
  versions: Array<{
    id: number;
    version: string;
    validity_days: number;
  }>;
}

export const getMedicalExamDocumentTypes = async (): Promise<MedicalExamDocumentType[]> => {
  const response = await request<{ data: MedicalExamDocumentType[] }>(
    "GET",
    "/api/documents/medical-exams"
  );
  return response.data;
};
