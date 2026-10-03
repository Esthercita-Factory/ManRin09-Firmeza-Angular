import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface UserSession {
  id?: string;
  email: string;
  role: string;
  fullName?: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  role: string;
  expiration: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = 'http://localhost:5235/api/auth';
  private readonly tokenKey = 'firmeza_token';
  private readonly userKey = 'firmeza_user';

  // Reactividad moderna con Angular Signals
  readonly currentUser = signal<UserSession | null>(this.getStoredUser());
  readonly isAuthenticatedSignal = computed(() => !!this.currentUser() && !!this.getToken());

  private getStoredUser(): UserSession | null {
    try {
      const stored = localStorage.getItem(this.userKey);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData).pipe(
      tap((response: any) => {
        if (response && response.token) {
          this.saveToken(response.token);
          const user: UserSession = {
            email: response.email,
            role: response.role,
            fullName: userData.companyName || userData.name || `${userData.firstName ?? ''} ${userData.lastName ?? ''}`.trim()
          };
          this.saveUser(user);
        }
      })
    );
  }

  login(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: AuthResponse) => {
        if (response && response.token) {
          this.saveToken(response.token);
          const user: UserSession = {
            email: response.email,
            role: response.role
          };
          this.saveUser(user);
        }
      })
    );
  }

  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  saveUser(user: UserSession): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.currentUser.set(user);
  }

  getUser(): UserSession | null {
    return this.currentUser();
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Validación básica de expiración del JWT en cliente
    try {
      const payloadBase64 = token.split('.')[1];
      if (!payloadBase64) return false;
      const decodedJson = JSON.parse(atob(payloadBase64));
      if (decodedJson.exp && decodedJson.exp * 1000 < Date.now()) {
        this.logout();
        return false;
      }
      return true;
    } catch {
      return !!token;
    }
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }
}
