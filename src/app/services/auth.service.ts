import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoginResponse {
  access_token: string;
  token_type: string;
  username: string;
  role: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly API = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // =========================
  // LOGIN
  // =========================
  login(
    username: string,
    password: string,
    rememberMe: boolean = false
  ): Observable<LoginResponse> {

    return this.http.post<LoginResponse>(
      `${this.API}/auth/login`,
      {
        username,
        password
      }
    ).pipe(
      tap((response: LoginResponse) => {

        const storage = rememberMe
          ? localStorage
          : sessionStorage;

        storage.setItem('token', response.access_token);
        storage.setItem('username', response.username);
        storage.setItem('role', response.role);
        storage.setItem('email', response.email);
      })
    );
  }

  // =========================
  // GET TOKEN
  // =========================
  getToken(): string | null {

    return (
      localStorage.getItem('token') ||
      sessionStorage.getItem('token')
    );
  }

  // =========================
  // GET ROLE
  // =========================
  getRole(): string | null {

    return (
      localStorage.getItem('role') ||
      sessionStorage.getItem('role')
    );
  }

  // =========================
  // GET USERNAME
  // =========================
  getUsername(): string | null {

    return (
      localStorage.getItem('username') ||
      sessionStorage.getItem('username')
    );
  }

  // =========================
  // CHECK LOGIN
  // =========================
  isLoggedIn(): boolean {

    return !!this.getToken();
  }

  // =========================
  // LOGOUT
  // =========================
  logout(): void {
    localStorage.clear();
    sessionStorage.clear();
  }
}
