import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../../environment';
import { handleResponse } from '../../../shared/utils/response.util';
import { handleError, sanitizeForLog } from '../../../shared/utils/error.util';

export interface Product {
  id?: number;
  name: string;
  description?: string;
  price: number;
  cost?: number;
  stock: number;
  min_stock: number;
  category?: string;
  barcode?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface StockMovement {
  id?: number;
  product: number;
  product_name?: string;
  movement_type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason?: string;
  user?: number;
  user_name?: string;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private apiUrl = `${environment.apiUrl}/inventory`;

  constructor(private http: HttpClient) {}

  getProducts(params?: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/products/`, { params })
      .pipe(
        map(handleResponse),
        catchError(error => {
          console.error(`Error getting products with params: ${sanitizeForLog(params)}:`, error);
          return throwError(() => error);
        })
      );
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}/`);
  }

  createProduct(product: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/products/`, product)
      .pipe(
        map(handleResponse),
        catchError(error => {
          console.error(`Error creating product: ${sanitizeForLog(product.name || 'unknown')}:`, error);
          return throwError(() => error);
        })
      );
  }

  updateProduct(id: number, product: Partial<Product>): Observable<Product> {
    return this.http.patch<Product>(`${this.apiUrl}/products/${id}/`, product);
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/products/${id}/`);
  }

  getStockMovements(params?: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stock-movements/`, { params });
  }

  createStockMovement(movement: Partial<StockMovement>): Observable<StockMovement> {
    return this.http.post<StockMovement>(`${this.apiUrl}/stock-movements/`, movement)
      .pipe(
        map(handleResponse),
        catchError(error => {
          console.error(`Error creating stock movement for product ${sanitizeForLog(movement.product?.toString() || 'unknown')}:`, error);
          return throwError(() => error);
        })
      );
  }

  getLowStockProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products/low-stock/`).pipe(
      catchError(() => of([]))
    );
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categories/`).pipe(
      catchError(() => of(['Productos de Cabello', 'Productos de Barba', 'Herramientas', 'Accesorios']))
    );
  }

  bulkUpdateStock(updates: Array<{product_id: number, quantity: number, reason?: string}>): Observable<any> {
    return this.http.post(`${this.apiUrl}/bulk-stock-update/`, { updates });
  }
}
