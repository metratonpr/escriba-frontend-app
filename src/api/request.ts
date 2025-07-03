// src/services/request.ts
import http from "./http";
import type { AxiosResponse, Method } from 'axios';

export async function request<T = any>(
  method: Method,
  url: string,
  data: any = {},
  params: any = {}
): Promise<T> {
  try {
    const isFormData = data instanceof FormData;
    const lowerCaseMethod = method.toLowerCase();

    console.log(`Tentando acessar a rota: ${url}`, {
      method: method.toUpperCase(),
      data: isFormData ? '[FormData Object]' : data,
      params,
    });

    let response: AxiosResponse<T>;

    if (
      isFormData &&
      ['post', 'put', 'patch'].includes(lowerCaseMethod)
    ) {
      const config = {
        params,
        headers: {
          'Content-Type': undefined,
        },
      };

      switch (lowerCaseMethod) {
        case 'post':
          response = await http.post(url, data, config);
          break;
        case 'put':
          response = await http.put(url, data, config);
          break;
        case 'patch':
          response = await http.patch(url, data, config);
          break;
        default:
          throw new Error(`Método HTTP inválido para FormData: ${method}`);
      }
    } else {
      const config = {
        method,
        url,
        data,
        params,
        headers: {} as Record<string, string>,
      };

      if (!isFormData) {
        config.headers['Content-Type'] = 'application/json';
      }

      response = await http(config);
    }

    return response.data;
  } catch (error) {
    console.error(`Erro na requisição ${method.toUpperCase()} ${url}:`, error);
    throw error;
  }
}
