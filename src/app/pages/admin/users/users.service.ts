import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/`);
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
}