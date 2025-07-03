// src/services/jobTitleService.ts
import { request } from "../api/request";
import { API_JOB_TITLES } from "../api/apiConfig";

export interface JobTitle {
  id: string;
  name: string;
  description?: string;
}

export type JobTitlePayload = {
  name: string;
  description?: string;
};

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}

export interface GetJobTitlesOptions {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const getJobTitles = async (
  options: GetJobTitlesOptions = {}
): Promise<PaginatedResponse<JobTitle>> => {
  const {
    page = 1,
    perPage = 25,
    search = "",
    sortBy = "name",
    sortOrder = "asc",
  } = options;

  return await request<PaginatedResponse<JobTitle>>(
    "GET",
    API_JOB_TITLES,
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

export const getJobTitleById = (id: string): Promise<JobTitle> =>
  request<JobTitle>("GET", `${API_JOB_TITLES}/${id}`);

export const createJobTitle = (data: JobTitlePayload): Promise<JobTitle> =>
  request<JobTitle>("POST", API_JOB_TITLES, data);

export const updateJobTitle = (id: string, data: JobTitlePayload): Promise<JobTitle> =>
  request<JobTitle>("PUT", `${API_JOB_TITLES}/${id}`, data);

export const deleteJobTitle = (id: string): Promise<void> =>
  request<void>("DELETE", `${API_JOB_TITLES}/${id}`);
