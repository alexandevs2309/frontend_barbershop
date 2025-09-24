import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environment';

@Injectable({
  providedIn: 'root'
})
export class EmployeesService {
  private apiUrl = `${environment.apiUrl}/employees/employees`;

  constructor(private http: HttpClient) {}

 getEmployees(): Observable<any[]> {
  return this.http.get<any>(`${this.apiUrl}/`).pipe(
    map(response => {
      if (Array.isArray(response)) {
        return response;
      } else if (response.results) {
        return response.results;
      } else if (response.data) {
        return response.data;
      } else {
        return [];
      }
    })
  );
}


  getEmployee(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/`);
  }

  createEmployee(employee: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/`, employee);
  }

  updateEmployee(id: number, employee: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/`, employee);
  }

  deleteEmployee(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}/`);
  }

  getAvailableUsers(): Observable<any[]> {
    return this.http.get<any>(`${environment.apiUrl}/users/available-for-employee/`).pipe(
      map(response => {
        if (Array.isArray(response)) {
          return response;
        } else if (response.results) {
          return response.results;
        } else if (response.data) {
          return response.data;
        } else {
          return [];
        }
      })
    );
  }

  assignServices(employeeId: number, serviceIds: number[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/${employeeId}/assign_services/`, { service_ids: serviceIds });
  }

  getEmployeeServices(employeeId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${employeeId}/services/`);
  }

  setSchedule(employeeId: number, schedules: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/${employeeId}/set_schedule/`, { schedules });
  }

  getEmployeeSchedule(employeeId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${employeeId}/schedule/`);
  }

  getEmployeeStats(employeeId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${employeeId}/stats/`);
  }

  getAvailableServices(): Observable<any[]> {
    return this.http.get<any>(`${environment.apiUrl}/services/services/`).pipe(
      map(response => {
        if (Array.isArray(response)) {
          return response;
        } else if (response.results) {
          return response.results;
        } else {
          return [];
        }
      })
    );
  }
}
