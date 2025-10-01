import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError } from 'rxjs';
import { environment } from '../../../../environment';

/**
 * Payment method information with validation constraints
 */
export interface Payment {
  method: string;
  /** Payment amount - must be positive */
  amount: number;
}

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
  /** Multiple payment methods used for this sale */
  payments?: Payment[];
}

export interface SaleDetail {
  id?: number;
  name: string;
  quantity: number;
  price: number;
  item_type: 'service' | 'product';
  object_id: number;
  /** Employee ID for service provider commissions and earnings tracking */
  employee_id?: number;
  /** Employee name for service provider display in reports */
  employee_name?: string;
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

  openCashRegister(initialCash: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/cashregisters/`, { 
      opening_amount: initialCash 
    });
  }

  getCurrentCashRegister(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/cashregisters/current`);
  }

  closeCashRegister(registerId: number, finalCash: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/cashregisters/${registerId}/close/`, { 
      final_cash: finalCash 
    });
  }

  // Endpoints para el sistema de ganancias por empleado
  getMyEarnings(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/earnings/my_earnings/`);
  }

  getCurrentFortnightEarnings(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/earnings/current_fortnight/`);
  }

  getMyFortnightSummary(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/employees/fortnight-summaries/my_summary/`);
  }

  // Nuevos endpoints para configuración
  getPosCategories(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/categories/`);
  }

  getPosConfig(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/config/`);
  }
}
