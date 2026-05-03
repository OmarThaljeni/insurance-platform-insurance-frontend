import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoginResponse {
  data: {
    token: string;
    user: {
      id: string;
      username: string;
      role: string;
    };
  };
  message: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly API = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /* ── Credentials login ── */
  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API}/auth/login`, {
      username,
      password
    });
  }

  /* ── SSO redirect ── */
  loginWithSSO(): void {
    window.location.href = `${this.API}/auth/sso`;
  }

  /* ── Token helpers ── */
  getToken(): string | null {
    return localStorage.getItem('token') ?? sessionStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
  }
}
