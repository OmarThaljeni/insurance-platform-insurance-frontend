// src/app/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// ─── DTOs (mirror your Spring Boot DTOs) ────────────────────────────────────

export interface UserRequestDTO {
  fullName: string;
  email: string;
  username: string;
  password?: string;           // required on create, optional on update
  role: 'ADMIN' | 'CLIENT' | 'EXPERT';
}

export interface UserResponseDTO {
  id: number;
  username: string;
  email: string;
  role: 'ADMIN' | 'CLIENT' | 'EXPERT';
  status: 'ACTIVE' | 'INACTIVE';
  fullName: string;       // remove ?
  createdAt: string;      // remove ?
}
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

// ─── Service ─────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class UserService {

  private readonly base = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  /** Build auth headers (JWT stored in sessionStorage / localStorage) */
  private headers(): HttpHeaders {
    const token =
      sessionStorage.getItem('token') ||
      localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });
  }

  // ── CRUD ────────────────────────────────────────────────────────────────

  /** POST /users — public (no auth required per controller) */
  create(dto: UserRequestDTO): Observable<ApiResponse<UserResponseDTO>> {
    return this.http.post<ApiResponse<UserResponseDTO>>(
      this.base, dto, { headers: this.headers() }
    );
  }

  /** GET /users — ADMIN only */
  getAll(): Observable<ApiResponse<UserResponseDTO[]>> {
    return this.http.get<ApiResponse<UserResponseDTO[]>>(
      this.base, { headers: this.headers() }
    );
  }

  /** GET /users/:id — ADMIN only */
  getById(id: number): Observable<ApiResponse<UserResponseDTO>> {
    return this.http.get<ApiResponse<UserResponseDTO>>(
      `${this.base}/${id}`, { headers: this.headers() }
    );
  }

  /** PUT /users/:id — ADMIN only */
  update(id: number, dto: UserRequestDTO): Observable<ApiResponse<UserResponseDTO>> {
    return this.http.put<ApiResponse<UserResponseDTO>>(
      `${this.base}/${id}`, dto, { headers: this.headers() }
    );
  }

  /** DELETE /users/:id — ADMIN only */
  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.base}/${id}`, { headers: this.headers() }
    );
  }

  /** PUT /users/:id/deactivate — ADMIN only */
  deactivate(id: number): Observable<ApiResponse<UserResponseDTO>> {
    return this.http.put<ApiResponse<UserResponseDTO>>(
      `${this.base}/${id}/deactivate`, {}, { headers: this.headers() }
    );
  }

  /** PUT /users/:id/activate — ADMIN only */
  activate(id: number): Observable<ApiResponse<UserResponseDTO>> {
    return this.http.put<ApiResponse<UserResponseDTO>>(
      `${this.base}/${id}/activate`, {}, { headers: this.headers() }
    );
  }

  searchUsers(query: string) {
    return this.http.get<any>(`/api/users/search?query=${query}`);
  }

}
