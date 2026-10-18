import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of, catchError, map, tap } from 'rxjs';
import { AuthService } from './auth.service';

export interface ClientDto {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
  enterpriseId?: number;
}

export interface CreateClientDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  enterpriseId?: number;
}

export interface UpdateClientDto {
  firstName: string;
  lastName: string;
  phone: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = 'http://localhost:5235/api/clients';

  private readonly clientsSubject = new BehaviorSubject<ClientDto[]>([]);
  readonly clients$ = this.clientsSubject.asObservable();
  readonly clientsSignal = signal<ClientDto[]>([]);

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  private normalizeClient(raw: any): ClientDto {
    const firstName = String(raw.firstName ?? raw.FirstName ?? '').trim();
    const lastName = String(raw.lastName ?? raw.LastName ?? '').trim();
    const fullName = `${firstName} ${lastName}`.trim() || String(raw.email ?? raw.Email ?? 'Cliente');

    return {
      id: Number(raw.id ?? raw.Id ?? 0),
      firstName,
      lastName,
      fullName,
      email: String(raw.email ?? raw.Email ?? ''),
      phone: String(raw.phone ?? raw.Phone ?? ''),
      isActive: Boolean(raw.isActive ?? raw.IsActive ?? true),
      createdAt: String(raw.createdAt ?? raw.CreatedAt ?? new Date().toISOString()),
      enterpriseId: raw.enterpriseId ?? raw.EnterpriseId
    };
  }

  private updateState(list: ClientDto[]): void {
    this.clientsSubject.next([...list]);
    this.clientsSignal.set([...list]);
  }

  getClients(): Observable<ClientDto[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getAuthHeaders() }).pipe(
      map((res) => {
        if (!Array.isArray(res)) return [];
        const normalized = res.map(c => this.normalizeClient(c));
        this.updateState(normalized);
        return normalized;
      }),
      catchError((err) => {
        console.warn('[ClientService] Error consultando clientes en API:', err);
        return of(this.clientsSubject.value);
      })
    );
  }

  getClientById(id: number): Observable<ClientDto | null> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() }).pipe(
      map(res => res ? this.normalizeClient(res) : null),
      catchError(() => of(null))
    );
  }

  createClient(request: CreateClientDto): Observable<ClientDto> {
    return this.http.post<any>(this.apiUrl, request, { headers: this.getAuthHeaders() }).pipe(
      map(res => this.normalizeClient(res)),
      tap((created) => {
        const current = this.clientsSubject.value;
        this.updateState([created, ...current.filter(c => c.id !== created.id)]);
      })
    );
  }

  updateClient(id: number, request: UpdateClientDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request, { headers: this.getAuthHeaders() }).pipe(
      tap(() => {
        this.getClients().subscribe();
      })
    );
  }

  deleteClient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() }).pipe(
      tap(() => {
        const filtered = this.clientsSubject.value.filter(c => c.id !== id);
        this.updateState(filtered);
      })
    );
  }
}
