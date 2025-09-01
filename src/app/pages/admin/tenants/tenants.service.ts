import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environment';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Tenant, TenantStats, TenantCreateRequest, TenantUpdateRequest } from './tenant.model';

@Injectable({
  providedIn: 'root'
})
export class TenantsService {
  private apiUrl = `${environment.apiUrl}/tenants/`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener lista de todos los tenants (solo superusuarios)
   */
  getTenants(): Observable<Tenant[]> {
    console.log('Making GET request to:', this.apiUrl);
    return this.http.get(this.apiUrl).pipe(
      tap((response: any) => {
        console.log('API Response for getTenants:', response);
        console.log('Response type:', typeof response);
        if (Array.isArray(response)) {
          console.log('Response is array with length:', response.length);
        } else if (response && typeof response === 'object') {
          console.log('Response keys:', Object.keys(response));
          if (response.results) {
            console.log('Found results array with length:', response.results.length);
          }
        }
      }),
      map((response: any) => {
        // Handle paginated response or direct array response
        if (Array.isArray(response)) {
          return response as Tenant[];
        } else if (response && response.results && Array.isArray(response.results)) {
          return response.results as Tenant[];
        } else {
          console.warn('Unexpected response format:', response);
          return [];
        }
      }),
      catchError(error => {
        console.error('Error in getTenants:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtener un tenant específico por ID
   */
  getTenantById(id: number): Observable<Tenant> {
    return this.http.get<Tenant>(`${this.apiUrl}${id}/`).pipe(
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Crear nuevo tenant
   */
  createTenant(data: TenantCreateRequest): Observable<Tenant> {
    console.log('Creating tenant with URL:', this.apiUrl);
    console.log('Data:', data);

    // Verificar si el usuario es administrador
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('Current user:', user);

    // Verificar permisos en el token JWT
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('JWT payload:', payload);
        console.log('Is superuser from JWT:', payload.is_superuser);
        console.log('User ID from JWT:', payload.user_id);
        console.log('Token expiration:', new Date(payload.exp * 1000));
      } catch (e) {
        console.error('Error parsing JWT:', e);
      }
    } else {
      console.error('No access token found in localStorage');
    }

    return this.http.post<Tenant>(this.apiUrl, data).pipe(
      tap(created => console.log('Tenant creado:', created)),
      catchError(error => {
        console.error('Error creating tenant:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error details:', error.error);
        if (error.error) {
          console.error('Backend error details:', JSON.stringify(error.error, null, 2));
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Actualizar tenant existente
   */
  updateTenant(id: number, data: TenantUpdateRequest): Observable<Tenant> {
    return this.http.patch<Tenant>(`${this.apiUrl}${id}/`, data).pipe(
      tap(updated => console.log('Tenant actualizado:', updated)),
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Eliminar tenant
   */
  deleteTenant(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`).pipe(
      tap(() => console.log('Tenant eliminado')),
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Activar tenant
   */
  activateTenant(id: number): Observable<Tenant> {
    return this.http.post<Tenant>(`${this.apiUrl}${id}/activate/`, {}).pipe(
      tap(tenant => console.log('Tenant activado:', tenant)),
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Desactivar tenant
   */
  deactivateTenant(id: number): Observable<Tenant> {
    return this.http.post<Tenant>(`${this.apiUrl}${id}/deactivate/`, {}).pipe(
      tap(tenant => console.log('Tenant desactivado:', tenant)),
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Obtener estadísticas tenants
   */
  getTenantStats(): Observable<TenantStats> {
    return this.http.get<TenantStats>(`${this.apiUrl}stats/`).pipe(
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Verificar si se puede agregar un usuario al tenant
   */
  canAddUser(tenantId: number): Observable<boolean> {
    return this.getTenantById(tenantId).pipe(
      map(tenant => tenant.can_add_user || false),
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Verificar si se puede agregar un empleado al tenant
   */
  canAddEmployee(tenantId: number): Observable<boolean> {
    return this.getTenantById(tenantId).pipe(
      map(tenant => tenant.can_add_employee || false),
      catchError(error => throwError(() => error))
    );
  }
}
