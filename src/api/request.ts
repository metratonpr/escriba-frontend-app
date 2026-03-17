import type { AxiosResponse, Method } from "axios";
import http from "./http";
import { multipartRequest } from "./multipartRequest";
import { logApiRequest } from "./requestDebug";
import { normalizeApiResponse } from "./responseNormalizer";

/**
 * Requisicao generica para JSON.
 * Se receber FormData, delega automaticamente para multipart.
 */
export async function request<T = unknown>(
  method: Method,
  url: string,
  data: object | FormData = {},
  params: Record<string, unknown> = {}
): Promise<T> {
  try {
    if (data instanceof FormData) {
      return multipartRequest<T>(method, url, data, params);
    }

    logApiRequest(
      method,
      url,
      params,
      method !== "GET" ? data : undefined,
      "application/json"
    );

    const config = {
      url,
      method,
      params,
      ...(method !== "GET" && { data }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };

    const response: AxiosResponse<unknown> = await http.request(config);
    return normalizeApiResponse<T>(response.data);
  } catch (error) {
    console.error(`Erro JSON ${method.toUpperCase()} ${url}:`, error);
    throw error;
  }
}
