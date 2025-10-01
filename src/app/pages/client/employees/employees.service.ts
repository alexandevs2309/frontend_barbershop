import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap } from 'rxjs';
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

  createEmployeeWithUser(employeeData: any): Observable<any> {
    // Crear usuario y empleado en una sola operación
    const userData = {
      full_name: employeeData.full_name,
      email: employeeData.email,
      password: employeeData.password,
      role_ids: [employeeData.role_id]
    };

    // Primero crear usuario
    return this.http.post<any>(`${environment.apiUrl}/auth/users/`, userData).pipe(
      switchMap((userResponse: any) => {
        // Luego crear empleado con el user_id
        const empData = {
          user_id: userResponse.id,
          specialty: employeeData.specialty,
          phone: employeeData.phone,
          hire_date: employeeData.hire_date
        };
        return this.createEmployee(empData);
      })
    );
  }

  getRoles(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/roles/roles/`);
  }
}
