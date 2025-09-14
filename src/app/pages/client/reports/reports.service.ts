import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private apiUrl = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  getSalesReport(params: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/sales/`, { params });
  }

  getAppointmentsReport(params: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/appointments/`, { params });
  }

  getClientsReport(params: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/clients/`, { params });
  }

  getEmployeesReport(params: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/employees/`, { params });
  }

  getDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/dashboard-stats/`);
  }

  exportReport(type: string, params: any): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${type}/export/`, { 
      params, 
      responseType: 'blob' 
    });
  }
}