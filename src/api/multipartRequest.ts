// src/api/multipartRequest.ts
import http from "./http";
import type { AxiosResponse, Method } from "axios";

/**
 * Requisição especializada para envio de arquivos via multipart/form-data (FormData).
 */
export async function multipartRequest<T = any>(
  method: Method,
  url: string,
  data: FormData,
  params: any = {}
): Promise<T> {
  try {
    if (!(data instanceof FormData)) {
      throw new Error("O corpo da requisição deve ser uma instância de FormData.");
    }

    console.log(`📤 Multipart request para: ${url}`, {
      method,
      params,
      body: "[FormData]",
    });

    const config = {
      url,
      method,
      params,
      data,
      headers: {
        Accept: "application/json",
        // Não definimos Content-Type: será definido automaticamente pelo navegador
      },
    };

    const response: AxiosResponse<T> = await http.request(config);
    return response.data;
  } catch (error) {
    console.error(`❌ Erro multipart ${method.toUpperCase()} ${url}:`, error);
    throw error;
  }
}
