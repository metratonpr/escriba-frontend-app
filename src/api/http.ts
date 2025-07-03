// src/services/http.ts
import axios from "axios";
import { API_URL } from "./apiConfig";
import type { AxiosRequestConfig } from "axios";

const http = axios.create({
  baseURL: API_URL,
});

http.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // Busca token no localStorage
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("Token expirado ou inválido. Redirecionando para o login...");
      // Limpa token e redireciona
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default http;
