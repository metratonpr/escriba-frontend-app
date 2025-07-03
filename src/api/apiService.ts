// src/services/apiService.ts
import http from "./http";

class ApiService<T = any> {
  resource: string;

  constructor(resource: string) {
    this.resource = resource;
  }

  getAll(): Promise<T[]> {
    return http.get<T[]>(`/${this.resource}`).then(res => res.data);
  }

  getById(id: number | string): Promise<T> {
    return http.get<T>(`/${this.resource}/${id}`).then(res => res.data);
  }

  create(data: Partial<T>): Promise<T> {
    return http.post<T>(`/${this.resource}`, data).then(res => res.data);
  }

  update(id: number | string, data: Partial<T>): Promise<T> {
    return http.put<T>(`/${this.resource}/${id}`, data).then(res => res.data);
  }

  delete(id: number | string): Promise<void> {
    return http.delete<void>(`/${this.resource}/${id}`).then(res => res.data);
  }
}

export default ApiService;
