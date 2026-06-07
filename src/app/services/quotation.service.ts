import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface QuotationRequestDTO {
  coverageType: string;
  vehicleValue?: number;
  description?: string;
}

export interface QuotationResponseDTO {
  id: number;
  userId: number;
  vehicleType: string;
  coverageType: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

const BASE = 'http://localhost:8099/quotations';

@Injectable({ providedIn: 'root' })
export class QuotationService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<QuotationResponseDTO[]>> {
    return this.http.get<ApiResponse<QuotationResponseDTO[]>>(BASE);
  }

  getByUser(userId: number): Observable<ApiResponse<QuotationResponseDTO[]>> {
    return this.http.get<ApiResponse<QuotationResponseDTO[]>>(`${BASE}/user/${userId}`);
  }

  create(dto: QuotationRequestDTO, userId: number): Observable<ApiResponse<QuotationResponseDTO>> {
    return this.http.post<ApiResponse<QuotationResponseDTO>>(BASE, dto, {
      params: { userId: userId.toString() }
    });
  }

  approve(id: number): Observable<ApiResponse<QuotationResponseDTO>> {
    return this.http.post<ApiResponse<QuotationResponseDTO>>(`${BASE}/${id}/approve`, null);
  }

  reject(id: number): Observable<ApiResponse<QuotationResponseDTO>> {
    return this.http.post<ApiResponse<QuotationResponseDTO>>(`${BASE}/${id}/reject`, null);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${BASE}/${id}`);
  }
}
