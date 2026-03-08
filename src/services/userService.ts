import { request } from "../api/request";
import { API_USERS } from "../api/apiConfig";

export interface User {
  id: number | string;
  name: string;
  email: string;
  is_admin: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserPayload {
  name: string;
  email: string;
  is_admin: boolean;
}

export interface PaginatedUsersResponse {
  data: User[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

export interface GetUsersOptions {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface ResetPasswordLinkResponse {
  message: string;
}

export const getUsers = async (
  options: GetUsersOptions = {}
): Promise<PaginatedUsersResponse> => {
  const {
    page = 1,
    perPage = 25,
    search = "",
    sortBy = "name",
    sortOrder = "asc",
  } = options;

  return request<PaginatedUsersResponse>(
    "GET",
    API_USERS,
    {},
    {
      page,
      per_page: perPage,
      search,
      sort_by: sortBy,
      sort_order: sortOrder,
    }
  );
};

export const getUserById = (id: string): Promise<User> =>
  request<User>("GET", `${API_USERS}/${id}`);

export const createUser = (data: UserPayload): Promise<User> =>
  request<User>("POST", API_USERS, data);

export const updateUser = (id: string, data: UserPayload): Promise<User> =>
  request<User>("PUT", `${API_USERS}/${id}`, data);

export const deleteUser = (id: string): Promise<void> =>
  request<void>("DELETE", `${API_USERS}/${id}`);

export const sendUserPasswordResetLink = (id: string): Promise<ResetPasswordLinkResponse> =>
  request<ResetPasswordLinkResponse>(
    "POST",
    `${API_USERS}/${id}/send-password-reset-link`
  );
