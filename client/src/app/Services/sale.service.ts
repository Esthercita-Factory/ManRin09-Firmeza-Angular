import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of, catchError, map, tap } from 'rxjs';
import { AuthService } from './auth.service';
import { ProductsService } from './products.service';

export interface SaleDetailDto {
  id: number;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface SaleDto {
  id: number;
  clientId: number;
  clientName: string;
  quantity: number;
  totalAmount: number;
  paymentMethod: string;
  isPaid: boolean;
  scheduledBy: string;
  createdAt: string;
  details: SaleDetailDto[];
  stockAlerts?: string[];
}

export interface CreateSaleItemDto {
  productId: string;
  quantity: number;
  unitPrice?: number;
}

export interface CreateSaleDto {
  clientId?: number;
  items: CreateSaleItemDto[];
  paymentMethod: string;
  isPaid: boolean;
}

export interface UpdateSaleDto {
  quantity: number;
  totalAmount: number;
  paymentMethod: string;
  isPaid: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SaleService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly productsService = inject(ProductsService);
  private readonly apiUrl = 'http://localhost:5235/api/sale';

  private readonly salesSubject = new BehaviorSubject<SaleDto[]>([]);
  readonly sales$ = this.salesSubject.asObservable();
  readonly salesSignal = signal<SaleDto[]>([]);

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  private normalizeDetail(d: any): SaleDetailDto {
    return {
      id: Number(d.id ?? d.Id ?? 0),
      productId: String(d.productId ?? d.ProductId ?? ''),
      productName: String(d.productName ?? d.ProductName ?? 'Producto'),
      productSku: String(d.productSku ?? d.ProductSku ?? 'S/N'),
      quantity: Number(d.quantity ?? d.Quantity ?? 0),
      unitPrice: Number(d.unitPrice ?? d.UnitPrice ?? 0),
      subtotal: Number(d.subtotal ?? d.Subtotal ?? 0)
    };
  }

  private normalizeSale(raw: any): SaleDto {
    const rawDetails = raw.details ?? raw.Details ?? [];
    const details = Array.isArray(rawDetails)
      ? rawDetails.map(d => this.normalizeDetail(d))
      : [];

    const rawAlerts = raw.stockAlerts ?? raw.StockAlerts ?? [];

    return {
      id: Number(raw.id ?? raw.Id ?? 0),
      clientId: Number(raw.clientId ?? raw.ClientId ?? 0),
      clientName: String(raw.clientName ?? raw.ClientName ?? 'Cliente'),
      quantity: Number(raw.quantity ?? raw.Quantity ?? 0),
      totalAmount: Number(raw.totalAmount ?? raw.TotalAmount ?? 0),
      paymentMethod: String(raw.paymentMethod ?? raw.PaymentMethod ?? 'Cash'),
      isPaid: Boolean(raw.isPaid ?? raw.IsPaid ?? false),
      scheduledBy: String(raw.scheduledBy ?? raw.ScheduledBy ?? 'Operador'),
      createdAt: String(raw.createdAt ?? raw.CreatedAt ?? new Date().toISOString()),
      details,
      stockAlerts: Array.isArray(rawAlerts) ? rawAlerts.map(String) : []
    };
  }

  private updateState(list: SaleDto[]): void {
    this.salesSubject.next([...list]);
    this.salesSignal.set([...list]);
  }

  /**
   * Obtiene todas las ventas y pedidos registrados en la base de datos.
   */
  getSales(): Observable<SaleDto[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getAuthHeaders() }).pipe(
      map((res) => {
        if (!Array.isArray(res)) return [];
        const normalized = res.map(s => this.normalizeSale(s));
        this.updateState(normalized);
        return normalized;
      }),
      catchError((err) => {
        console.warn('[SaleService] Error obteniendo ventas desde la API:', err);
        return of(this.salesSubject.value);
      })
    );
  }

  /**
   * Obtiene una venta o pedido por su ID numérico.
   */
  getSaleById(id: number): Observable<SaleDto | null> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() }).pipe(
      map(res => res ? this.normalizeSale(res) : null),
      catchError(() => of(null))
    );
  }

  /**
   * Obtiene el historial de ventas y pedidos de un cliente específico.
   */
  getSalesByClient(clientId: number): Observable<SaleDto[]> {
    return this.http.get<any[]>(`${this.apiUrl}/client/${clientId}`, { headers: this.getAuthHeaders() }).pipe(
      map(res => Array.isArray(res) ? res.map(s => this.normalizeSale(s)) : []),
      catchError(() => of([]))
    );
  }

  /**
   * Registra un nuevo Pedido (isPaid = false -> ROJO) o Venta (isPaid = true -> VERDE) en la base de datos.
   * Deduce automáticamente el stock en el backend y sincroniza ProductsService.
   */
  createSale(request: CreateSaleDto): Observable<SaleDto> {
    return this.http.post<any>(this.apiUrl, request, { headers: this.getAuthHeaders() }).pipe(
      map(res => this.normalizeSale(res)),
      tap((created) => {
        const current = this.salesSubject.value;
        this.updateState([created, ...current.filter(s => s.id !== created.id)]);
        // Sincronizar inventario en tiempo real tras deducción de stock
        this.productsService.getProducts().subscribe();
      })
    );
  }

  /**
   * Actualiza los datos generales de un pedido o venta.
   */
  updateSale(id: number, request: UpdateSaleDto): Observable<SaleDto> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, request, { headers: this.getAuthHeaders() }).pipe(
      map(res => this.normalizeSale(res)),
      tap((updated) => {
        const current = this.salesSubject.value.map(s => s.id === id ? updated : s);
        this.updateState(current);
      })
    );
  }

  /**
   * Cambia el estado de un Pedido (Rojo -> isPaid: false) a Vendido / Venta (Verde -> isPaid: true) o viceversa.
   */
  togglePaid(id: number): Observable<SaleDto> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/toggle-paid`, {}, { headers: this.getAuthHeaders() }).pipe(
      map(res => this.normalizeSale(res)),
      tap((updated) => {
        const current = this.salesSubject.value.map(s => s.id === id ? updated : s);
        this.updateState(current);
      })
    );
  }

  /**
   * Elimina un pedido o venta y restaura automáticamente el stock en el inventario.
   */
  deleteSale(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() }).pipe(
      tap(() => {
        const filtered = this.salesSubject.value.filter(s => s.id !== id);
        this.updateState(filtered);
        // Sincronizar inventario tras revertir el stock
        this.productsService.getProducts().subscribe();
      })
    );
  }
}
