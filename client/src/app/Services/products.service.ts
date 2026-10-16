import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of, tap, catchError } from 'rxjs';
import { AuthService } from './auth.service';

export interface ProductItem {
  id: string;
  sku: string;
  barcode: string;
  name: string;
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
  selected?: boolean;
}

export interface CreateProductRequest {
  sku: string;
  name: string;
  category?: string;
  categoryDetail?: string;
  stock: number;
  location?: string;
  costPrice?: string;
  salePrice?: string;
  imageIcon?: string;
}

export interface UpdateProductRequest {
  name: string;
  category?: string;
  categoryDetail?: string;
  stock: number;
  location?: string;
  costPrice?: string;
  salePrice?: string;
  imageIcon?: string;
}

/**
 * Servicio unificado de Productos e Inventario para la plataforma Firmeza.
 * Consume el endpoint /api/products para abastecer tanto el Dashboard de Empresa
 * como el Dashboard de Empleado y el Catálogo de Inventario.
 */
@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = 'http://localhost:5235/api/products';

  // Reactividad para compartir la lista de productos en tiempo real
  private readonly productsSubject = new BehaviorSubject<ProductItem[]>(this.getStoredProducts());
  readonly products$ = this.productsSubject.asObservable();

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
          // Filtrar cualquier producto mock antiguo
          return parsed.filter(p => !['PER-IPE-200', 'BUL-HEX-123', 'CEM-EST-050', 'SOL-6011-18', 'TUB-EST-404'].includes(p.sku));
        }
      }
    } catch {}
    return [];
  }

  private saveStoredProducts(items: ProductItem[]): void {
    try {
      localStorage.setItem('firmeza_products', JSON.stringify(items));
      this.productsSubject.next(items);
    } catch {}
  }

  getProducts(): Observable<ProductItem[]> {
    console.log('[ProductsService] Consultando lista de productos desde API:', this.apiUrl);
    return this.http.get<ProductItem[]>(this.apiUrl, { headers: this.getAuthHeaders() }).pipe(
      tap((apiProducts) => {
        if (Array.isArray(apiProducts)) {
          console.log('[ProductsService] Productos recibidos desde API:', apiProducts.length);
          this.saveStoredProducts(apiProducts);
        }
      }),
      catchError((err) => {
        console.warn('[ProductsService] Error consultando API de productos, usando caché/estado local:', err);
        return of(this.productsSubject.value);
      })
    );
  }

  getProductById(id: string): Observable<ProductItem | null> {
    return this.http.get<ProductItem>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(() => of(this.productsSubject.value.find(p => p.id === id || p.sku === id) || null))
    );
  }

  createProduct(request: CreateProductRequest): Observable<ProductItem> {
    console.log('[ProductsService] Registrando nuevo producto en API:', request);
    return this.http.post<ProductItem>(this.apiUrl, request, { headers: this.getAuthHeaders() }).pipe(
      tap((newProduct) => {
        console.log('[ProductsService] Producto creado con éxito:', newProduct);
        const current = this.productsSubject.value;
        const updated = [newProduct, ...current.filter(p => p.sku !== newProduct.sku)];
        this.saveStoredProducts(updated);
      })
    );
  }

  updateProduct(id: string, request: UpdateProductRequest): Observable<ProductItem> {
    console.log('[ProductsService] Actualizando producto en API:', id, request);
    return this.http.put<ProductItem>(`${this.apiUrl}/${id}`, request, { headers: this.getAuthHeaders() }).pipe(
      tap((updated) => {
        console.log('[ProductsService] Producto actualizado con éxito:', updated);
        const current = this.productsSubject.value;
        const updatedList = current.map(p => (p.id === id || p.sku === id) ? updated : p);
        this.saveStoredProducts(updatedList);
      })
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
