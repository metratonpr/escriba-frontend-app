// src/services/authService.ts
import axios from "axios";
import { API_LOGIN, API_LOGOUT, API_CHECK_TOKEN } from "../api/apiConfig";

export interface LoginCredentials {
  email: string;
  password: string;
  device_name: string; // ✅ adiciona isso
}

export const login = async (credentials: LoginCredentials) => {
  const response = await axios.post(API_LOGIN, credentials);
  const token = response.data.token;

  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  localStorage.setItem("token", token);

  return response.data;
};

export const logout = async () => {
  try {
    await axios.post(API_LOGOUT, null, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  } finally {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
  }
};

export const checkToken = async (): Promise<boolean> => {
  const token = localStorage.getItem("token");

  if (!token) return false;

  try {
    await axios.get(API_CHECK_TOKEN, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return true;
  } catch {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    return false;
  }
};
