import type { AxiosError } from "axios";

export function handleError(error: AxiosError, action: string): string | object {
  if (error.response) {
    const data = error.response.data;
    console.error(`Erro durante a ação "${action}":`, data);

    if (error.response.status === 422) {
      return data as object; // <- Type assertion corrigido
    }

    if (typeof data === "object" && data !== null && "message" in data) {
      return (data as any).message;
    }

    return "Ocorreu um erro ao processar a solicitação.";
  } else if (error.request) {
    console.error("Erro na requisição:", error.request);
    return "Falha na comunicação com o servidor. Tente novamente.";
  } else {
    console.error("Erro geral:", error.message);
    return "Ocorreu um erro inesperado.";
  }
}
