import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface UserSession {
  id?: string;
  email: string;
  role: string;
  fullName?: string;
  accountType?: string;
  isEmployee?: boolean;
}

export interface AuthResponse {
  token: string;
  email: string;
  role: string;
  expiration: string;
  accountType?: string;
  message?: string;
}

function decodeJwtPayload(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }
    const decoded = atob(base64);
    const bytes = new Uint8Array(decoded.length);
    for (let i = 0; i < decoded.length; i++) {
      bytes[i] = decoded.charCodeAt(i);
    }
    const text = new TextDecoder('utf-8').decode(bytes);
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function getClaimAsString(claim: any): string {
  if (!claim) return '';
  if (Array.isArray(claim)) {
    return claim.length > 0 && typeof claim[0] === 'string' ? claim[0] : '';
  }
  return typeof claim === 'string' ? claim : String(claim);
}

function isInternalEmployeeEmail(emailClaim: any): boolean {
  const str = getClaimAsString(emailClaim).toLowerCase().trim();
  return str.endsWith('@firmeza.internal');
}

function getJwtRole(decoded: any): string {
  if (!decoded) return '';
  const rawRole = decoded.role || 
                  decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
                  decoded['Role'];
  return getClaimAsString(rawRole).trim();
}

function isEmployeeFromClaims(decoded: any): boolean {
  if (!decoded) return false;
  const role = getJwtRole(decoded).toLowerCase();
  const email = decoded.email || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
  
  if (role === 'employee' || role === 'empleado' || isInternalEmployeeEmail(email)) {
    return true;
  }
  return false;
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
  private readonly accountTypeKey = 'firmeza_account_type';

  // Reactividad moderna con Angular Signals
  readonly currentUser = signal<UserSession | null>(this.getStoredUser());
  readonly isAuthenticatedSignal = computed(() => !!this.currentUser() && !!this.getToken());

  private getStoredUser(): UserSession | null {
    try {
      const stored = localStorage.getItem(this.userKey);
      if (stored) {
        return JSON.parse(stored);
      }

      // Si no existe el usuario en localStorage pero sí el token, reconstruir sesión del JWT
      const token = this.getToken();
      if (token) {
        const decoded = decodeJwtPayload(token);
        if (decoded) {
          const isEmp = isEmployeeFromClaims(decoded);
          const role = getJwtRole(decoded) || (isEmp ? 'Employee' : 'Enterprise');
          const email = getClaimAsString(decoded.email || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress']);

          const user: UserSession = {
            id: getClaimAsString(decoded.sub || decoded.nameid || decoded.userId),
            email: email,
            role: isEmp ? 'Employee' : role,
            fullName: getClaimAsString(decoded.name || decoded.fullName) || (isEmp ? 'Operador Logístico' : 'Admin'),
            accountType: isEmp ? 'empleado' : 'empresa',
            isEmployee: isEmp
          };
          this.saveUser(user);
          return user;
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  register(data: any): Observable<any> {
    return this.http.post<any>('http://localhost:5235/api/auth/register', data).pipe(
      tap((response: any) => {
        if (response && response.token) {
          this.saveToken(response.token);
          const user: UserSession = {
            email: response.email,
            role: response.role || 'Enterprise',
            fullName: data.companyName || data.name || `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim(),
            accountType: 'empresa',
            isEmployee: false
          };
          localStorage.setItem(this.accountTypeKey, 'empresa');
          this.saveUser(user);
        }
      })
    );
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        const token = response?.token || response?.Token || response?.accessToken || response?.jwt;
        const isEmp = credentials?.isEmployee === true ||
          response?.accountType === 'empleado' ||
          response?.AccountType === 'empleado' ||
          response?.role === 'Employee' ||
          response?.Role === 'Employee';

        if (token) {
          this.saveToken(token);
          localStorage.setItem(this.accountTypeKey, isEmp ? 'empleado' : 'empresa');
          const user: UserSession = {
            id: response?.userId || response?.UserId,
            email: response?.email || response?.Email || credentials?.email,
            role: isEmp ? 'Employee' : (response?.role || response?.Role || 'Enterprise'),
            fullName: response?.fullName || response?.FullName,
            accountType: isEmp ? 'empleado' : 'empresa',
            isEmployee: isEmp
          };
          this.saveUser(user);
        }
      })
    );
  }

  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem('token', token);
    const decoded = decodeJwtPayload(token);
    if (decoded) {
      const isEmp = isEmployeeFromClaims(decoded);
      localStorage.setItem(this.accountTypeKey, isEmp ? 'empleado' : 'empresa');
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey) || localStorage.getItem('token');
  }

  saveUser(user: UserSession): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
    const isEmp = user.isEmployee === true || user.accountType === 'empleado' || user.role === 'Employee';
    localStorage.setItem(this.accountTypeKey, isEmp ? 'empleado' : 'empresa');
    this.currentUser.set(user);
  }

  getUser(): UserSession | null {
    return this.currentUser() || this.getStoredUser();
  }

  isEmployee(): boolean {
    const savedType = localStorage.getItem(this.accountTypeKey);
    if (savedType === 'empleado') {
      return true;
    }
    if (savedType === 'empresa') {
      return false;
    }

    const user = this.currentUser();
    if (user) {
      if (user.isEmployee === true ||
          user.accountType === 'empleado' ||
          user.role?.toLowerCase() === 'employee' ||
          user.role?.toLowerCase() === 'empleado' ||
          isInternalEmployeeEmail(user.email)) {
        return true;
      }
      if (user.isEmployee === false ||
          user.accountType === 'empresa' ||
          user.role?.toLowerCase() === 'enterprise' ||
          user.role?.toLowerCase() === 'admin') {
        return false;
      }
    }

    const token = this.getToken();
    if (token) {
      const decoded = decodeJwtPayload(token);
      if (decoded) {
        return isEmployeeFromClaims(decoded);
      }
    }

    return false;
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
    localStorage.removeItem(this.accountTypeKey);
    localStorage.removeItem('token');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }
}
