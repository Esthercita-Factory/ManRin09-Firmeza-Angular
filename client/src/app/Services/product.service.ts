import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';

export interface ProductDto {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  description: string;
  category: string;
  categoryDetail: string;
  location: string;
  costPrice: number;
  price: number;
  stock: number;
  stockReserved: number;
  minStock: number;
  isActive: boolean;
  registeredById: string;
  enterpriseId?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateProductDto {
  sku?: string;
  barcode?: string;
  name: string;
  description?: string;
  category?: string;
  categoryDetail?: string;
  location?: string;
  costPrice?: number;
  price: number;
  stock: number;
  stockReserved?: number;
  minStock?: number;
  enterpriseId?: number;
}

export interface UpdateProductDto {
  sku?: string;
  barcode?: string;
  name: string;
  description?: string;
  category?: string;
  categoryDetail?: string;
  location?: string;
  costPrice?: number;
  price: number;
  stock: number;
  stockReserved?: number;
  minStock?: number;
  isActive?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5235/api/products';

  /**
   * Obtiene la lista completa de productos desde la API.
   */
  getProducts(): Observable<ProductDto[]> {
    return this.http.get<ProductDto[]>(this.apiUrl).pipe(
      catchError((error) => {
        console.error('Error al obtener productos:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene el detalle de un producto específico por su ID.
   */
  getProductById(id: string): Observable<ProductDto> {
    return this.http.get<ProductDto>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error(`Error al obtener producto con ID ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Registra un nuevo producto en el catálogo e inventario.
   */
  createProduct(dto: CreateProductDto): Observable<ProductDto> {
    return this.http.post<ProductDto>(this.apiUrl, dto).pipe(
      catchError((error) => {
        console.error('Error al registrar producto:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Actualiza los datos y stock de un producto existente.
   */
  updateProduct(id: string, dto: UpdateProductDto): Observable<ProductDto> {
    return this.http.put<ProductDto>(`${this.apiUrl}/${id}`, dto).pipe(
      catchError((error) => {
        console.error(`Error al actualizar producto con ID ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Elimina un producto por su ID.
   */
  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error(`Error al eliminar producto con ID ${id}:`, error);
        return throwError(() => error);
      })
    );
  }
}
