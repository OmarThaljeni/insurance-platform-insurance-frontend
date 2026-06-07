import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ContractResponseDTO {
  id: number;
  quotationId: number;
  userId: number;
  premium: number;
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'ACTIVE' | 'ACCEPTED' | 'PAID' | 'CANCELLED' | 'EXPIRED';
  createdAt: string;
  updatedAt: string | null;
}

export interface ContractRequestDTO {
  quotationId: number;
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

const BASE = 'http://localhost:8099/contracts';

@Injectable({ providedIn: 'root' })
export class ContractService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<ContractResponseDTO[]>> {
    return this.http.get<ApiResponse<ContractResponseDTO[]>>(BASE);
  }

  getByUser(userId: number): Observable<ApiResponse<ContractResponseDTO[]>> {
    return this.http.get<ApiResponse<ContractResponseDTO[]>>(`${BASE}/user/${userId}`);
  }

  create(dto: ContractRequestDTO): Observable<ApiResponse<ContractResponseDTO>> {
    return this.http.post<ApiResponse<ContractResponseDTO>>(BASE, dto);
  }

  accept(id: number): Observable<ApiResponse<ContractResponseDTO>> {
    return this.http.post<ApiResponse<ContractResponseDTO>>(`${BASE}/${id}/accept`, null);
  }

  pay(id: number): Observable<ApiResponse<ContractResponseDTO>> {
    return this.http.post<ApiResponse<ContractResponseDTO>>(`${BASE}/${id}/pay`, null);
  }

  cancel(id: number): Observable<ApiResponse<ContractResponseDTO>> {
    return this.http.post<ApiResponse<ContractResponseDTO>>(`${BASE}/${id}/cancel`, null);
  }
}
