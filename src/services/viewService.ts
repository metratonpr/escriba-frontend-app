// src/services/viewService.ts
import { request } from "../api/request";
import { BASE_URL } from "../api/apiConfig";

export interface UploadViewData {
  id: number;
  nome_arquivo: string;
  url_arquivo: string;
  descricao?: string;
  created_at: string;
  updated_at: string;
}

export const getUploadViewById = async (id: number): Promise<UploadViewData> => {
  return request<UploadViewData>("GET", `${BASE_URL}/view/${id}`);
};
