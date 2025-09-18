import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../../environment';
import { handleResponse } from '../../../shared/utils/response.util';
import { handleError, sanitizeForLog } from '../../../shared/utils/error.util';
import { convertEmployeeId } from '../../../shared/utils/employee-id.util';

export interface Earning {
  id: number;
  employee: number;
  employee_name?: string;
  sale: number;
  service_name: string;
  commission_percentage: number;
  commission_amount: number;
  date: string;
  created_at: string;
}

export interface FortnightSummary {
  id: number;
  employee: number;
  employee_name?: string;
  start_date: string;
  end_date: string;
  total_sales: number;
  total_commission: number;
  services_count: number;
  is_paid: boolean;
  paid_date?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EarningsService {
  private apiUrl = `${environment.apiUrl}/employees`;

  constructor(private http: HttpClient) {}

  // Obtener ganancias por empleado
  getEarningsByEmployee(employeeId: number): Observable<Earning[]> {
    const id = convertEmployeeId(employeeId);
    return this.http.get<Earning[]>(`${this.apiUrl}/${id}/earnings/`)
      .pipe(
        map(handleResponse),
        catchError(error => {
          console.error(`Error getting earnings for employee ${sanitizeForLog(id)}:`, error);
          return throwError(() => error);
        })
      );
  }

  // Obtener todas las ganancias
  getAllEarnings(): Observable<Earning[]> {
    return this.http.get<Earning[]>(`${this.apiUrl}/earnings/`)
      .pipe(
        map(handleResponse),
        catchError(error => {
          console.error('Error getting all earnings:', error);
          return throwError(() => error);
        })
      );
  }

  // Obtener resúmenes quincenales
  getFortnightSummaries(employeeId?: number): Observable<FortnightSummary[]> {
    const id = employeeId ? convertEmployeeId(employeeId) : undefined;
    const url = id
      ? `${this.apiUrl}/${id}/fortnight-summaries/`
      : `${this.apiUrl}/fortnight-summaries/`;
    return this.http.get<FortnightSummary[]>(url)
      .pipe(
        map(handleResponse),
        catchError(error => {
          console.error(`Error getting fortnight summaries${id ? ` for employee ${sanitizeForLog(id)}` : ''}:`, error);
          return throwError(() => error);
        })
      );
  }

  // Generar resumen quincenal
  generateFortnightSummary(employeeId: number, startDate: string, endDate: string): Observable<FortnightSummary> {
    return this.http.post<FortnightSummary>(`${this.apiUrl}/${employeeId}/generate-fortnight/`, {
      start_date: startDate,
      end_date: endDate
    });
  }

  // Marcar como pagado
  markAsPaid(summaryId: number): Observable<FortnightSummary> {
    return this.http.patch<FortnightSummary>(`${this.apiUrl}/fortnight-summaries/${summaryId}/`, {
      is_paid: true,
      paid_date: new Date().toISOString().split('T')[0]
    });
  }

  // Obtener estadísticas de ganancias
  getEarningsStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/earnings/stats/`);
  }
}
