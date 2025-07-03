// src/services/brandService.ts
import { request } from "../api/request";
import { API_BRANDS } from "../api/apiConfig";

export interface Brand {
  id: string;
  name: string;
  website?: string;
  support_email?: string;
}

export type BrandPayload = Omit<Brand, "id">;

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}

export interface GetBrandsOptions {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const getBrands = async (options: GetBrandsOptions = {}): Promise<PaginatedResponse<Brand>> => {
  const {
    page = 1,
    perPage = 25,
    search = '',
    sortBy = 'name',
    sortOrder = 'asc',
  } = options;

  return request<PaginatedResponse<Brand>>(
    'GET',
    API_BRANDS,
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

export const getBrandById = (id: string): Promise<Brand> =>
  request<Brand>('GET', `${API_BRANDS}/${id}`);

export const createBrand = (data: BrandPayload): Promise<Brand> =>
  request<Brand>('POST', API_BRANDS, data);

export const updateBrand = (id: string, data: BrandPayload): Promise<Brand> =>
  request<Brand>('PUT', `${API_BRANDS}/${id}`, data);

export const deleteBrand = (id: string): Promise<void> =>
  request<void>('DELETE', `${API_BRANDS}/${id}`);
