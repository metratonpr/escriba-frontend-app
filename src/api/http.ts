import axios from "axios";
import { API_URL } from "./apiConfig";
import type { InternalAxiosRequestConfig } from "axios"; // ajuste aqui

const http = axios.create({
  baseURL: API_URL,
});

http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
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
    if (error.response?.status === 401) {
      console.error("Token expirado ou inválido. Redirecionando para o login...");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default http;
