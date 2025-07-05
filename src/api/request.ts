import http from "./http";
import type { AxiosResponse, Method } from "axios";

/**
 * Requisição genérica para JSON (não suporta FormData).
 */
export async function request<T = any>(
  method: Method,
  url: string,
  data: Record<string, any> = {},
  params: Record<string, any> = {}
): Promise<T> {
  try {
    if (data instanceof FormData) {
      throw new Error("Esta função não aceita FormData. Use `multipartRequest` para uploads.");
    }

    console.log(`🔄 JSON request para: ${url}`, {
      method,
      params,
      body: method !== "GET" ? data : undefined,
    });

    const config = {
      url,
      method,
      params,
      ...(method !== "GET" && { data }), // ✅ só inclui `data` se for método válido
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };

    const response: AxiosResponse<T> = await http.request(config);
    return response.data;
  } catch (error) {
    console.error(`❌ Erro JSON ${method.toUpperCase()} ${url}:`, error);
    throw error;
  }
}
