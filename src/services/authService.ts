// src/services/authService.ts
import axios from "axios";
import { API_CHECK_TOKEN, API_LOGIN, API_LOGOUT, API_ME, API_PROFILE } from "../api/apiConfig";

const TOKEN_STORAGE_KEY = "token";
const USER_STORAGE_KEY = "auth_user";

export interface LoginCredentials {
  email: string;
  password: string;
  device_name: string;
}

export interface AuthUser {
  id: number | string;
  name?: string | null;
  email?: string | null;
  [key: string]: unknown;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  password?: string;
}

export interface UpdateProfileResponse {
  message: string;
  user: AuthUser;
}

const setDefaultAuthHeader = (token: string | null) => {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    return;
  }

  delete axios.defaults.headers.common["Authorization"];
};

export const getStoredToken = (): string | null => localStorage.getItem(TOKEN_STORAGE_KEY);

const setStoredToken = (token: string) => {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  setDefaultAuthHeader(token);
};

const setStoredUser = (user: AuthUser | null) => {
  if (!user) {
    localStorage.removeItem(USER_STORAGE_KEY);
    return;
  }

  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

export const getStoredUser = (): AuthUser | null => {
  const raw = localStorage.getItem(USER_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as AuthUser;
    if (parsed && typeof parsed === "object") {
      return parsed;
    }
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
  }

  return null;
};

export const clearAuthSession = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
  setDefaultAuthHeader(null);
};

const getAuthHeaders = () => {
  const token = getStoredToken();
  if (!token) {
    return undefined;
  }

  return { Authorization: `Bearer ${token}` };
};

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await axios.post<LoginResponse>(API_LOGIN, credentials);
  const { token, user } = response.data;

  setStoredToken(token);
  setStoredUser(user);

  return response.data;
};

export const fetchCurrentUser = async (): Promise<AuthUser> => {
  try {
    const response = await axios.get<AuthUser>(API_ME, {
      headers: getAuthHeaders(),
    });

    setStoredUser(response.data);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      clearAuthSession();
    }

    throw error;
  }
};

export const logout = async () => {
  try {
    await axios.post(API_LOGOUT, null, {
      headers: getAuthHeaders(),
    });
  } finally {
    clearAuthSession();
  }
};

export const checkToken = async (): Promise<boolean> => {
  if (!getStoredToken()) {
    return false;
  }

  try {
    const response = await axios.get<AuthUser>(API_CHECK_TOKEN, {
      headers: getAuthHeaders(),
    });

    setStoredUser(response.data);

    return true;
  } catch {
    clearAuthSession();
    return false;
  }
};

export const updateProfile = async (
  payload: UpdateProfilePayload
): Promise<UpdateProfileResponse> => {
  const response = await axios.put<UpdateProfileResponse>(API_PROFILE, payload, {
    headers: getAuthHeaders(),
  });

  setStoredUser(response.data.user);

  return response.data;
};

setDefaultAuthHeader(getStoredToken());

