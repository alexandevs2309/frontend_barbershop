import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environment'; // <-- ajusta si tu ruta es distinta
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { User } from './user.model';

export interface UsersQuery {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string; // ej: 'full_name' o '-date_joined'
}

export interface Paginated<T> {
  count: number;
  results: T[];
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  // sin slash final para evitar '//' cuando concatenamos
  private readonly baseUrl = environment.apiUrl;
  private readonly usersUrl = `${this.baseUrl}/users`;

  constructor(private http: HttpClient) {}

  /** Serializa params para DRF */
  private toHttpParams(q?: UsersQuery): HttpParams {
    let params = new HttpParams();
    if (!q) return params;

    if (q.page) params = params.set('page', String(q.page));
    if (q.page_size) params = params.set('page_size', String(q.page_size));
    if (q.search?.trim()) params = params.set('search', q.search.trim());
    if (q.ordering) params = params.set('ordering', q.ordering);

    return params;
  }

  /** Lista con filtros/búsqueda/paginación (usa en tu componente) */
  list(q?: UsersQuery): Observable<Paginated<User>> {
    const params = this.toHttpParams(q);
    return this.http.get<Paginated<User>>(this.usersUrl + '/', { params }).pipe(
      catchError(error => throwError(() => error))
    );
  }

  /** Alias si en algún lado sigues llamando getUsers */
  getUsers(q?: UsersQuery): Observable<Paginated<User>> {
    return this.list(q);
  }

  /** Cambiar contraseña */
  changePassword(userId: number, password: string) {
    return this.http.post(`${this.usersUrl}/${userId}/change_password/`, { password });
  }

  /** Logs de usuario */
  getUserLogs(userId: number, q?: any) {
    return this.http.get(`${this.usersUrl}/${userId}/logs/`, { params: q });
  }

  /** Crear */
  createUser(user: User): Observable<User> {
    return this.http.post<User>(this.usersUrl + '/', user).pipe(
      tap(created => console.log('Usuario creado:', created)),
      catchError(error => throwError(() => error))
    );
  }

  /** Actualizar */
  updateUser(user: User): Observable<User> {
    return this.http.put<User>(`${this.usersUrl}/${user.id}/`, user).pipe(
      tap(updated => console.log('Usuario actualizado:', updated)),
      catchError(error => throwError(() => error))
    );
  }

  /** Exportar CSV (respeta búsqueda actual) */
  exportUsers(q?: UsersQuery) {
    const params = this.toHttpParams(q);
    return this.http.get(`${this.usersUrl}/export/`, {
      params,
      responseType: 'blob'
    });
  }

  /** Eliminar */
  deleteUser(id: number): Observable<void> {
    console.log('[Service] DELETE:', `${this.usersUrl}/${id}/`);
    return this.http.delete<void>(`${this.usersUrl}/${id}/`).pipe(
      tap(() => console.log('[Service] Usuario eliminado')),
      catchError(error => {
        console.error('[Service] Error al eliminar:', error);
        return throwError(() => error);
      })
    );
  }
}
