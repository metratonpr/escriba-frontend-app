// src/services/errorHandler.ts
import type { AxiosError } from "axios";

export function handleError(error: AxiosError, action: string): string | object {
  if (error.response) {
    console.error(`Erro durante a ação "${action}":`, error.response.data);

    if (error.response.status === 422) {
      return error.response.data;
    }

    if (error.response.data && (error.response.data as any).message) {
      return (error.response.data as any).message;
    } else {
      return "Ocorreu um erro ao processar a solicitação.";
    }
  } else if (error.request) {
    console.error("Erro na requisição:", error.request);
    return "Falha na comunicação com o servidor. Tente novamente.";
  } else {
    console.error("Erro geral:", error.message);
    return "Ocorreu um erro inesperado.";
  }
}
