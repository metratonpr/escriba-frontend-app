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
    // Use a rota de uploads que retorna JSON, não a rota view que retorna o arquivo
    const url = `${BASE_URL}/uploads/${id}`;
    console.log('🔄 Chamando viewService para URL de metadados:', url);

    try {
        const data = await request<UploadViewData>("GET", url);
        console.log('✅ Dados recebidos do viewService:', data);
        return data;
    } catch (error) {
        console.error('❌ Erro no viewService:', error);
        throw error;
    }
};