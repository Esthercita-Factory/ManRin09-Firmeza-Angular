import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of, timer, Subscription, switchMap, tap, catchError, map } from 'rxjs';
import { AuthService } from './auth.service';

export interface ProductItem {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  description?: string;
  category: string;
  categoryDetail: string;
  hasRedDot?: boolean;
  imageIcon: string;
  location: string;
  locationIcon?: 'pallet' | 'freeze' | 'lock' | 'standard';
  stockTotal: string;
  stockReserved: string;
  stockAvailable: string;
  isCriticalStock?: boolean;
  stockLevelPercent: number;
  stockStatus: 'ÓPTIMO' | 'STOCK CRÍTICO' | 'ESTABLE' | string;
  stockStatusClass: 'optimal' | 'critical' | 'stable' | string;
  costPrice: string;
  salePrice: string;
  lastMovement: string;
  minStock?: number;
  registeredById?: string;
  registeredByName?: string;
  selected?: boolean;
}

export interface CreateProductRequest {
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  category: string;
  categoryDetail?: string;
  stock: number;
  minStock?: number;
  location: string;
  costPrice: string | number;
  salePrice: string | number;
  price?: number;
  imageIcon?: string;
}

export interface UpdateProductRequest {
  sku?: string;
  barcode?: string;
  name: string;
  description?: string;
  category: string;
  categoryDetail?: string;
  stock: number;
  minStock?: number;
  location: string;
  costPrice: string | number;
  salePrice: string | number;
  price?: number;
  imageIcon?: string;
}

/** Fila de la plantilla oficial ya validada y normalizada (espejo de BulkImportProductItemDto). */
export interface BulkImportProductItem {
  sku: string;
  name: string;
  description?: string;
  category: string;
  stock: number;
  costPrice: number;
  salePrice: number;
  location?: string;
  minStock?: number;
}

/** Estrategia cuando un SKU ya existe: sumar cantidad o sobrescribir datos. */
export type BulkImportConflictMode = 'SumStock' | 'Overwrite';

export interface BulkImportRequest {
  products: BulkImportProductItem[];
  conflictMode: BulkImportConflictMode;
}

export interface BulkImportResult {
  totalReceived: number;
  totalProcessed: number;
  totalCreated: number;
  totalUpdated: number;
  conflictMode: BulkImportConflictMode;
  warnings: string[];
}

/**
 * Servicio unificado de Productos e Inventario para la plataforma Firmeza.
 * Sincronización en tiempo real mediante Signals, BehaviorSubject,
 * polling activo continuo contra /api/products y eventos inter-pestañas.
 */
@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = 'http://localhost:5235/api/products';

  // Reactividad dual: BehaviorSubject y Signal nativo
  private readonly productsSubject = new BehaviorSubject<ProductItem[]>(this.getStoredProducts());
  readonly products$ = this.productsSubject.asObservable();
  readonly productsSignal = signal<ProductItem[]>(this.getStoredProducts());

  private pollingSub?: Subscription;

  constructor() {
    this.initRealtimeSync();
  }

  private formatMoney(val: any, fallback: number = 0): string {
    if (val === undefined || val === null || val === '') {
      return `$${fallback.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    const num = typeof val === 'number'
      ? val
      : parseFloat(String(val).replace(/[^0-9.-]/g, ''));
    if (isNaN(num)) {
      return `$${fallback.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  private normalizeProduct(raw: any): ProductItem {
    const rawStockStr = String(raw.stockAvailable ?? raw.stockTotal ?? raw.stock ?? '0');
    const stockVal = parseInt(rawStockStr.replace(/[^0-9-]/g, ''), 10) || 0;
    const minStockVal = typeof raw.minStock === 'number' ? raw.minStock : 5;
    const isCrit = stockVal <= minStockVal || stockVal < 5;

    const regName = raw.registeredByName || raw.registeredBy || 'Administrador';

    return {
      id: String(raw.id || raw.sku || ''),
      sku: String(raw.sku || ''),
      barcode: String(raw.barcode || ''),
      name: String(raw.name || ''),
      description: String(raw.description || ''),
      category: String(raw.category || 'General'),
      categoryDetail: String(raw.categoryDetail || 'Inventario Firmeza'),
      hasRedDot: isCrit,
      imageIcon: raw.imageIcon || '📦',
      location: String(raw.location || 'Nave A-P01-R1'),
      locationIcon: raw.locationIcon || 'standard',
      stockTotal: raw.stockTotal ? String(raw.stockTotal) : `${stockVal} Unid.`,
      stockReserved: raw.stockReserved ? String(raw.stockReserved) : '0',
      stockAvailable: raw.stockAvailable ? String(raw.stockAvailable) : `${stockVal}`,
      isCriticalStock: isCrit,
      stockLevelPercent: typeof raw.stockLevelPercent === 'number' 
        ? raw.stockLevelPercent 
        : (minStockVal > 0 ? Math.min(100, Math.round((stockVal / (minStockVal * 2)) * 100)) : Math.min(100, Math.max(5, stockVal * 10))),
      stockStatus: stockVal <= 0 ? 'AGOTADO' : (isCrit ? 'STOCK CRÍTICO' : (stockVal <= minStockVal * 2 ? 'ESTABLE' : 'ÓPTIMO')),
      stockStatusClass: stockVal <= 0 ? 'critical' : (isCrit ? 'critical' : (stockVal <= minStockVal * 2 ? 'stable' : 'optimal')),
      costPrice: this.formatMoney(raw.costPrice, 0),
      salePrice: this.formatMoney(raw.price ?? raw.salePrice, 0),
      lastMovement: String(raw.lastMovement || 'Recién registrado'),
      minStock: minStockVal,
      registeredById: raw.registeredById ? String(raw.registeredById) : undefined,
      registeredByName: String(regName),
      selected: !!raw.selected
    };
  }

  private hasChanges(a: ProductItem[], b: ProductItem[]): boolean {
    if (a.length !== b.length) return true;
    for (let i = 0; i < a.length; i++) {
      if (
        a[i].id !== b[i].id ||
        a[i].sku !== b[i].sku ||
        a[i].stockTotal !== b[i].stockTotal ||
        a[i].stockAvailable !== b[i].stockAvailable ||
        a[i].name !== b[i].name ||
        a[i].costPrice !== b[i].costPrice ||
        a[i].salePrice !== b[i].salePrice ||
        a[i].registeredByName !== b[i].registeredByName
      ) {
        return true;
      }
    }
    return false;
  }

  private initRealtimeSync(): void {
    // 1. Sincronización instantánea entre pestañas / ventanas del navegador
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key === 'firmeza_products' && event.newValue) {
          try {
            const parsed = JSON.parse(event.newValue);
            if (Array.isArray(parsed)) {
              const normalized = parsed.map(p => this.normalizeProduct(p));
              this.productsSubject.next(normalized);
              this.productsSignal.set(normalized);
            }
          } catch {}
        }
      });
    }

    // 2. Polling activo en tiempo real contra la API cada 2.5s
    this.pollingSub = timer(500, 2500).pipe(
      switchMap(() => this.http.get<any[]>(this.apiUrl, { headers: this.getAuthHeaders() }).pipe(
        catchError(() => of(null))
      ))
    ).subscribe((apiData) => {
      if (apiData && Array.isArray(apiData)) {
        const normalized = apiData.map(p => this.normalizeProduct(p));
        const current = this.productsSubject.value;
        if (this.hasChanges(current, normalized)) {
          this.saveStoredProducts(normalized);
        }
      }
    });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  private getStoredProducts(): ProductItem[] {
    try {
      const stored = localStorage.getItem('firmeza_products');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed
            .filter(p => !['PER-IPE-200', 'BUL-HEX-123', 'CEM-EST-050', 'SOL-6011-18', 'TUB-EST-404'].includes(p.sku))
            .map(p => this.normalizeProduct(p));
        }
      }
    } catch {}
    return [];
  }

  private saveStoredProducts(items: ProductItem[]): void {
    try {
      localStorage.setItem('firmeza_products', JSON.stringify(items));
      this.productsSubject.next([...items]);
      this.productsSignal.set([...items]);
    } catch {}
  }

  getProducts(): Observable<ProductItem[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getAuthHeaders() }).pipe(
      map((apiProducts) => {
        if (Array.isArray(apiProducts)) {
          const normalized = apiProducts.map(p => this.normalizeProduct(p));
          this.saveStoredProducts(normalized);
          return normalized;
        }
        return this.productsSubject.value;
      }),
      catchError((err) => {
        console.warn('[ProductsService] Error consultando API de productos, usando caché/estado local:', err);
        return of(this.productsSubject.value);
      })
    );
  }

  getProductById(id: string): Observable<ProductItem | null> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() }).pipe(
      map(p => p ? this.normalizeProduct(p) : null),
      catchError(() => of(this.productsSubject.value.find(p => p.id === id || p.sku === id) || null))
    );
  }

  createProduct(request: CreateProductRequest): Observable<ProductItem> {
    const costNum = typeof request.costPrice === 'number'
      ? request.costPrice
      : parseFloat(String(request.costPrice || '0').replace(/[^0-9.]/g, '')) || 0;
    const priceNum = typeof request.price === 'number'
      ? request.price
      : parseFloat(String(request.salePrice || request.price || '0').replace(/[^0-9.]/g, '')) || 0;

    const payload = {
      sku: request.sku,
      barcode: request.barcode,
      name: request.name,
      description: request.description,
      category: request.category,
      categoryDetail: request.categoryDetail,
      location: request.location,
      costPrice: costNum,
      price: priceNum,
      salePrice: priceNum,
      stock: request.stock,
      stockReserved: 0,
      minStock: request.minStock ?? 5
    };

    return this.http.post<any>(this.apiUrl, payload, { headers: this.getAuthHeaders() }).pipe(
      map(p => this.normalizeProduct(p)),
      tap((newProduct) => {
        const current = this.productsSubject.value;
        const updated = [newProduct, ...current.filter(p => p.sku !== newProduct.sku && p.id !== newProduct.id)];
        this.saveStoredProducts(updated);
      })
    );
  }

  updateProduct(id: string, request: UpdateProductRequest): Observable<ProductItem> {
    const costNum = typeof request.costPrice === 'number'
      ? request.costPrice
      : parseFloat(String(request.costPrice || '0').replace(/[^0-9.]/g, '')) || 0;
    const priceNum = typeof request.price === 'number'
      ? request.price
      : parseFloat(String(request.salePrice || request.price || '0').replace(/[^0-9.]/g, '')) || 0;

    const payload = {
      name: request.name,
      description: request.description,
      category: request.category,
      categoryDetail: request.categoryDetail,
      location: request.location,
      costPrice: costNum,
      price: priceNum,
      salePrice: priceNum,
      stock: request.stock,
      stockReserved: 0,
      minStock: request.minStock ?? 5,
      isActive: true
    };

    return this.http.put<any>(`${this.apiUrl}/${id}`, payload, { headers: this.getAuthHeaders() }).pipe(
      map(p => this.normalizeProduct(p)),
      tap((updated) => {
        const current = this.productsSubject.value;
        const updatedList = current.map(p => (p.id === id || p.sku === id) ? updated : p);
        this.saveStoredProducts(updatedList);
      })
    );
  }

  /**
   * Envía el lote de productos validado al endpoint de importación masiva y,
   * al terminar, refresca el catálogo para que la tabla y los KPIs reflejen los cambios.
   * Los errores 400/401 los presenta el productInterceptor.
   */
  bulkImport(request: BulkImportRequest): Observable<BulkImportResult> {
    return this.http.post<BulkImportResult>(`${this.apiUrl}/bulk-import`, request, { headers: this.getAuthHeaders() }).pipe(
      switchMap((result) => this.getProducts().pipe(map(() => result)))
    );
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() }).pipe(
      tap(() => {
        const filtered = this.productsSubject.value.filter(p => p.id !== id && p.sku !== id);
        this.saveStoredProducts(filtered);
      }),
      catchError(() => {
        const filtered = this.productsSubject.value.filter(p => p.id !== id && p.sku !== id);
        this.saveStoredProducts(filtered);
        return of({ success: true });
      })
    );
  }
}
