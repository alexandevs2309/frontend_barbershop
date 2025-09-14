import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError } from 'rxjs';
import { environment } from '../../../../environment';

export interface Sale {
  id?: number;
  client?: number;
  client_name?: string;
  date_time: string;
  total: number;
  discount: number;
  paid: number;
  payment_method: string;
  closed: boolean;
  details: SaleDetail[];
}

export interface SaleDetail {
  id?: number;
  name: string;
  quantity: number;
  price: number;
  item_type: 'service' | 'product';
  object_id: number;
}

@Injectable({
  providedIn: 'root'
})
export class PosService {
  private apiUrl = `${environment.apiUrl}/pos`;

  constructor(private http: HttpClient) {}



  createSale(sale: Partial<Sale>): Observable<Sale> {
    return this.http.post<Sale>(`${this.apiUrl}/sales/`, sale);
  }

  updateSale(id: number, sale: Partial<Sale>): Observable<Sale> {
    return this.http.patch<Sale>(`${this.apiUrl}/sales/${id}/`, sale);
  }

  getProducts(params?: any): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/inventory/products/`, { params });
  }

  getDailySummary(date?: string): Observable<any> {
    const params = date ? { date } : undefined;
    return this.http.get<any>(`${this.apiUrl}/summary/daily/`, params ? { params } : {});
  }

  getSale(id: string): Observable<Sale> {
    return this.http.get<Sale>(`${this.apiUrl}/sales/${id}/`);
  }

  getSales(params?: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/sales/`, { params }).pipe(
      map(response => {
        if (Array.isArray(response)) {
          return { results: response, count: response.length };
        }
        return response;
      })
    );
  }

  getDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/dashboard/stats/`);
  }

  getActivePromotions(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/promotions/active/`);
  }
}
