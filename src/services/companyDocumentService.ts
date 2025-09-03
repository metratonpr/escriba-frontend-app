// src/services/companyDocumentService.ts
import { request } from "../api/request";
import { multipartRequest } from "../api/multipartRequest";
import { API_COMPANY_DOCUMENT_VERSION_UPLOADS } from "../api/apiConfig";

/** Envelope padrão da API: { data: T } */
type ApiEnvelope<T> = { data: T };

export interface Company {
    id: number;
    name: string;
}

export interface DocumentVersion {
    id: number;
    code: string;
    version: string;
    // campos extras podem existir na API (description, validity_days), mas não são necessários aqui
}

export interface UploadFile {
    id: number;
    nome_arquivo: string;
    url_arquivo: string;
    descricao?: string | null;
    created_at?: string;
    updated_at?: string;
}

export type Status = "pendente" | "enviado" | "aprovado" | "rejeitado";

export interface CompanyDocumentUpload {
    id: number;
    company_id: number;
    document_version_id: number;
    status: Status;
    emission_date: string | null;
    due_date: string | null;
    upload_id: number | null;
    created_at: string;
    updated_at: string;
    company?: Company;
    document_version?: DocumentVersion;
    upload?: UploadFile;
}

export type CompanyDocumentUploadPayload = {
    company_id: string | number;
    document_version_id: string | number;
    status: Status;
    emission_date: string;
    due_date?: string;
    upload?: File; // no update pode não enviar arquivo
};

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    per_page: number;
}

export interface GetCompanyDocumentUploadOptions {
    page?: number;
    perPage?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

/**
 * Lista paginada (a API já retorna o shape correto, sem envelope)
 */
export const getCompanyDocumentUploads = async (
    options: GetCompanyDocumentUploadOptions = {}
): Promise<PaginatedResponse<CompanyDocumentUpload>> => {
    const {
        page = 1,
        perPage = 25,
        search = "",
        sortBy = "created_at",
        sortOrder = "desc",
    } = options;

    return request<PaginatedResponse<CompanyDocumentUpload>>(
        "GET",
        API_COMPANY_DOCUMENT_VERSION_UPLOADS,
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

/**
 * Busca por ID — desenvelopa { data: T } -> T
 */
export const getCompanyDocumentUploadById = async (
    id: string | number
): Promise<CompanyDocumentUpload> => {
    const res = await request<ApiEnvelope<CompanyDocumentUpload>>(
        "GET",
        `${API_COMPANY_DOCUMENT_VERSION_UPLOADS}/${id}`
    );
    return res.data;
};

/**
 * Criação — desenvelopa { data: T } -> T
 */
export const createCompanyDocumentUpload = async (
    data: FormData
): Promise<CompanyDocumentUpload> => {
    const res = await multipartRequest<ApiEnvelope<CompanyDocumentUpload>>(
        "POST",
        API_COMPANY_DOCUMENT_VERSION_UPLOADS,
        data
    );
    return res.data;
};

/**
 * Atualização — desenvelopa { data: T } -> T
 * Obs.: não precisa enviar _method aqui se o controller aceita POST + _method=PUT.
 * Caso já adicione no form, não tem problema (chave repetida é ignorada pelo backend).
 */
export const updateCompanyDocumentUpload = async (
    id: string | number,
    data: FormData
): Promise<CompanyDocumentUpload> => {
    data.append("_method", "PUT");
    const res = await multipartRequest<ApiEnvelope<CompanyDocumentUpload>>(
        "POST",
        `${API_COMPANY_DOCUMENT_VERSION_UPLOADS}/${id}`,
        data
    );
    return res.data;
};

export const deleteCompanyDocumentUpload = (id: string | number): Promise<void> =>
    request<void>("DELETE", `${API_COMPANY_DOCUMENT_VERSION_UPLOADS}/${id}`);
