import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
  private apiUrl = `${environment.apiUrl}/auth/permissions`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Verificar permisos del usuario actual
   */
  checkPermissions(): Observable<any> {
    return this.http.get<any>(this.apiUrl, { headers: this.getHeaders() });
  }

  /**
   * Verificar si el usuario es superusuario
   */
  isSuperUser(): Observable<boolean> {
    return new Observable<boolean>(observer => {
      this.checkPermissions().subscribe({
        next: (response) => {
          observer.next(response.is_superuser || false);
          observer.complete();
        },
        error: (error) => {
          console.error('Error checking permissions:', error);
          observer.next(false);
          observer.complete();
        }
      });
    });
  }
}
