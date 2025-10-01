import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = `${environment.apiUrl}/auth/users`;

  constructor(private http: HttpClient) {}

  getUsers(params?: any): Observable<any> {
    const options = params ? { params } : {};
    return this.http.get<any>(`${this.apiUrl}/`, options);
  }

  updateUser(id: number, userData: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/`, userData);
  }

  assignTenant(userId: number, tenantId: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${userId}/`, { tenant: tenantId });
  }

  getUsersWithoutTenant(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/?tenant__isnull=true`);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}/`);
  }

  getDeletedUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/deleted/`);
  }

  restoreUser(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/restore/`, {});
  }

  createUser(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/`, userData);
  }

  changePassword(userId: number, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${userId}/change_password/`, { password: newPassword });
  }

  getUserLogs(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${userId}/logs/`);
  }

  exportUsers(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/`, { responseType: 'blob' });
  }
}