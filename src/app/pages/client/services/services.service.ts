import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { environment } from '../../../../environment';
import { BUSINESS_CONSTANTS } from '../../../shared/constants/business.constants';

export interface Service {
  id?: number;
  name: string;
  description?: string | undefined;
  price: number;
  duration: number; // en minutos
  category?: string;
  is_active: boolean;
  commission_percentage?: number;
  created_at?: string;
  updated_at?: string;
}


/**
 * Represents the assignment of an employee to a service with custom pricing and commission settings
 */
export interface ServiceEmployee {
  /** Unique identifier for the service-employee assignment */
  id?: number;
  /** ID of the service being assigned */
  service: number;
  /** ID of the employee being assigned */
  employee: number;
  /** Display name of the employee (populated from employee data) */
  employee_name?: string;
  /** Custom price override for this employee-service combination */
  custom_price?: number;
  /** Custom commission percentage override for this assignment */
  commission_percentage?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ServicesService {
  private apiUrl = `${environment.apiUrl}/services/services`;

  constructor(private http: HttpClient) {}

  getServices(params?: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/`, { params }).pipe(
      map(response => {
        if (Array.isArray(response)) {
          return { results: response, count: response.length };
        }
        return response;
      }),
      catchError(error => {
        throw error;
      })
    );
  }

  getService(id: number): Observable<Service> {
    return this.http.get<Service>(`${this.apiUrl}/${id}/`);
  }

  createService(service: Partial<Service>): Observable<Service> {
    return this.http.post<Service>(`${this.apiUrl}/`, service);
  }

  updateService(id: number, service: Partial<Service>): Observable<Service> {
    return this.http.patch<Service>(`${this.apiUrl}/${id}/`, service);
  }

  deleteService(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}/`);
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categories/`).pipe(
      map(response => response || []),
      catchError(() => of(BUSINESS_CONSTANTS.DEFAULT_CATEGORIES))
    );
  }

  // Obtener precios dinámicos por empleado
  getServicePrices(serviceId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${serviceId}/prices/`).pipe(
      catchError(error => {
        console.error('Error getting service prices:', error);
        return of([]);
      })
    );
  }

  // Establecer precio específico por empleado
  setEmployeePrice(serviceId: number, employeeId: number, price: number): Observable<any> {
    if (!serviceId || !employeeId || price < 0) {
      return of({ error: 'Invalid parameters' });
    }

    const payload = {
      employee_id: employeeId,
      price: price
    };

    return this.http.post(`${this.apiUrl}/${serviceId}/set_employee_price/`, payload).pipe(
      catchError(error => {
        console.error('Error setting employee price:', error);
        return of({ error: 'Failed to set employee price' });
      })
    );
  }

  // Asignar empleados a servicio
  assignEmployees(serviceId: number, employeeIds: number[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/${serviceId}/assign_employees/`, {
      employee_ids: employeeIds
    }).pipe(
      catchError(error => {
        console.error('Error assigning employees:', error);
        throw error;
      })
    );
  }

  // Obtener empleados asignados a servicio
  getServiceEmployees(serviceId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${serviceId}/employees/`).pipe(
      catchError(error => {
        console.error('Error getting service employees:', error);
        return of([]);
      })
    );
  }
}
