// src/api/multipartRequest.ts
import http from "./http";
import type { AxiosResponse, Method } from "axios";

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

    const response: AxiosResponse<T> = await http.request({
      url,
      method,
      params,
      data,
      headers: {
        // REMOVE 'Content-Type' manualmente
        Accept: "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error(`❌ Erro multipart ${method.toUpperCase()} ${url}:`, error);
    throw error;
  }
}
