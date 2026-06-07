import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ClaimRequestDTO {
  title: string;
  description: string;
  contractId: number;
  userId: number;
}

export interface ClaimResponseDTO {
  id: number;
  title: string;
  description: string;
  contractId: number;
  userId: number;
  expertId: number | null;
  expertReport: string | null;
  status: 'PENDING' | 'ASSIGNED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'CLOSED';
  createdAt: string;
  updatedAt: string | null;
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

const BASE = 'http://localhost:8099/claims';

@Injectable({ providedIn: 'root' })
export class ClaimService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<ClaimResponseDTO[]>> {
    return this.http.get<ApiResponse<ClaimResponseDTO[]>>(BASE);
  }

  getById(id: number): Observable<ApiResponse<ClaimResponseDTO>> {
    return this.http.get<ApiResponse<ClaimResponseDTO>>(`${BASE}/${id}`);
  }

  getByUser(userId: number): Observable<ApiResponse<ClaimResponseDTO[]>> {
    return this.http.get<ApiResponse<ClaimResponseDTO[]>>(`${BASE}/user/${userId}`);
  }

  getByExpert(expertId: number): Observable<ApiResponse<ClaimResponseDTO[]>> {
    return this.http.get<ApiResponse<ClaimResponseDTO[]>>(`${BASE}/expert/${expertId}`);
  }

  create(dto: ClaimRequestDTO): Observable<ApiResponse<ClaimResponseDTO>> {
    return this.http.post<ApiResponse<ClaimResponseDTO>>(BASE, dto);
  }

  updateStatus(id: number, status: string): Observable<ApiResponse<ClaimResponseDTO>> {
    return this.http.put<ApiResponse<ClaimResponseDTO>>(
      `${BASE}/${id}/status`, null, { params: { status } }
    );
  }

  assignExpert(id: number, expertId: number): Observable<ApiResponse<ClaimResponseDTO>> {
    return this.http.put<ApiResponse<ClaimResponseDTO>>(
      `${BASE}/${id}/assign-expert`, null, { params: { expertId: expertId.toString() } }
    );
  }

  submitReport(id: number, report: string): Observable<ApiResponse<ClaimResponseDTO>> {
    return this.http.post<ApiResponse<ClaimResponseDTO>>(
      `${BASE}/${id}/report`, null, { params: { report } }
    );
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${BASE}/${id}`);
  }
}
