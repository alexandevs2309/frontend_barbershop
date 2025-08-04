import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environment';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Tenant } from './tenant.model'; // Asegúrate de tener este modelo

@Injectable({
  providedIn: 'root'
})
export class TenantsService {
  private apiUrl = `${environment.apiUrl}/tenants/`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ 'Content-Type': 'application/json' });
  }

  /**
   * Obtener lista de tenants
   */
  getTenants(): Observable<Tenant[]> {
    return this.http.get<Tenant[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Obtener un tenant específico
   */
  getTenantById(id: number): Observable<Tenant> {
    return this.http.get<Tenant>(`${this.apiUrl}${id}/`, { headers: this.getHeaders() }).pipe(
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Crear nuevo tenant
   */
  createTenant(data: Tenant): Observable<Tenant> {
    return this.http.post<Tenant>(this.apiUrl, data, { headers: this.getHeaders() }).pipe(
      tap(created => console.log('Tenant creado:', created)),
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Actualizar tenant
   */
  updateTenant(data: Tenant): Observable<Tenant> {
    return this.http.put<Tenant>(`${this.apiUrl}${data.id}/`, data, { headers: this.getHeaders() }).pipe(
      tap(updated => console.log('Tenant actualizado:', updated)),
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Eliminar tenant
   */
  deleteTenant(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`, { headers: this.getHeaders() }).pipe(
      tap(() => console.log('Tenant eliminado')),
      catchError(error => throwError(() => error))
    );
  }
}
