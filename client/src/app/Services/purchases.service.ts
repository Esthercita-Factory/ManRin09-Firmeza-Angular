import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of, catchError, map, tap } from 'rxjs';
import { AuthService } from './auth.service';
import { ProductsService } from './products.service';

export interface PurchaseDetailDto {
  id: number;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
}

export interface PurchaseDto {
  id: number;
  purchaseNumber: string;
  supplierId: number;
  supplierName: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  notes: string;
  receivedBy: string;
  createdAt: string;
  details: PurchaseDetailDto[];
}

export interface CreatePurchaseItemDto {
  productId: string;
  quantity: number;
  unitCost: number;
}

export interface CreatePurchaseDto {
  purchaseNumber: string;
  supplierId: number;
  items: CreatePurchaseItemDto[];
  paymentMethod: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PurchasesService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly productsService = inject(ProductsService);
  private readonly apiUrl = 'http://localhost:5235/api/purchases';

  private readonly purchasesSubject = new BehaviorSubject<PurchaseDto[]>([]);
  readonly purchases$ = this.purchasesSubject.asObservable();
  readonly purchasesSignal = signal<PurchaseDto[]>([]);

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  getPurchases(): Observable<PurchaseDto[]> {
    return this.http.get<PurchaseDto[]>(this.apiUrl, { headers: this.getAuthHeaders() }).pipe(
      tap(list => {
        this.purchasesSubject.next(list || []);
        this.purchasesSignal.set(list || []);
      }),
      catchError(err => {
        console.warn('[PurchasesService] Error cargando compras:', err);
        return of(this.purchasesSubject.value);
      })
    );
  }

  getPurchaseById(id: number): Observable<PurchaseDto | null> {
    return this.http.get<PurchaseDto>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(() => of(null))
    );
  }

  createPurchase(request: CreatePurchaseDto): Observable<PurchaseDto> {
    return this.http.post<PurchaseDto>(this.apiUrl, request, { headers: this.getAuthHeaders() }).pipe(
      tap(created => {
        const current = this.purchasesSubject.value;
        const updated = [created, ...current];
        this.purchasesSubject.next(updated);
        this.purchasesSignal.set(updated);
      })
    );
  }

  cancelPurchase(id: number): Observable<boolean> {
    return this.http.post(`${this.apiUrl}/${id}/cancel`, {}, { headers: this.getAuthHeaders() }).pipe(
      map(() => {
        const current = this.purchasesSubject.value.map(p =>
          p.id === id ? { ...p, status: 'Cancelled' } : p
        );
        this.purchasesSubject.next(current);
        this.purchasesSignal.set(current);
        return true;
      }),
      catchError(() => of(false))
    );
  }
}
