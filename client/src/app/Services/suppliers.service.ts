import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of, catchError, map, tap } from 'rxjs';
import { AuthService } from './auth.service';

export interface SupplierDto {
  id: number;
  taxId: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
  enterpriseId?: number;
  createdAt: string;
}

export interface CreateSupplierDto {
  taxId: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface UpdateSupplierDto {
  taxId: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SuppliersService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = 'http://localhost:5235/api/suppliers';

  private readonly suppliersSubject = new BehaviorSubject<SupplierDto[]>([]);
  readonly suppliers$ = this.suppliersSubject.asObservable();
  readonly suppliersSignal = signal<SupplierDto[]>([]);

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  getSuppliers(): Observable<SupplierDto[]> {
    return this.http.get<SupplierDto[]>(this.apiUrl, { headers: this.getAuthHeaders() }).pipe(
      tap(list => {
        this.suppliersSubject.next(list || []);
        this.suppliersSignal.set(list || []);
      }),
      catchError(err => {
        console.warn('[SuppliersService] Error cargando proveedores:', err);
        return of(this.suppliersSubject.value);
      })
    );
  }

  getSupplierById(id: number): Observable<SupplierDto | null> {
    return this.http.get<SupplierDto>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(() => of(null))
    );
  }

  createSupplier(request: CreateSupplierDto): Observable<SupplierDto> {
    return this.http.post<SupplierDto>(this.apiUrl, request, { headers: this.getAuthHeaders() }).pipe(
      tap(created => {
        const current = this.suppliersSubject.value;
        const updated = [created, ...current];
        this.suppliersSubject.next(updated);
        this.suppliersSignal.set(updated);
      })
    );
  }

  updateSupplier(id: number, request: UpdateSupplierDto): Observable<SupplierDto> {
    return this.http.put<SupplierDto>(`${this.apiUrl}/${id}`, request, { headers: this.getAuthHeaders() }).pipe(
      tap(updated => {
        const current = this.suppliersSubject.value.map(s => s.id === id ? updated : s);
        this.suppliersSubject.next(current);
        this.suppliersSignal.set(current);
      })
    );
  }

  deleteSupplier(id: number): Observable<boolean> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() }).pipe(
      map(() => {
        const current = this.suppliersSubject.value.filter(s => s.id !== id);
        this.suppliersSubject.next(current);
        this.suppliersSignal.set(current);
        return true;
      }),
      catchError(() => of(false))
    );
  }
}
