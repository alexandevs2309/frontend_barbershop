import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, catchError } from 'rxjs';
import { environment } from '../../../../environment';

export interface Appointment {
  id?: number;
  client: number;
  client_name?: string;
  stylist: number;
  stylist_name?: string;
  service: number;
  service_name?: string;
  date_time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  description?: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentsService {
  private apiUrl = `${environment.apiUrl}/appointments/appointments`;

  constructor(private http: HttpClient) {}

  getAppointments(params?: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/`, { params }).pipe(
      map(response => {
        if (Array.isArray(response)) {
          return { results: response, count: response.length };
        }
        return response;
      }),
      catchError(error => {
        console.error('Appointments error:', error);
        return of({ results: [], count: 0 });
      })
    );
  }

  getAppointment(id: number): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.apiUrl}/${id}/`);
  }

  createAppointment(appointment: Partial<Appointment>): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.apiUrl}/`, appointment);
  }

  updateAppointment(id: number, appointment: Partial<Appointment>): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.apiUrl}/${id}/`, appointment);
  }

  deleteAppointment(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}/`);
  }

  getAvailableSlots(date: string, stylistId?: number): Observable<string[]> {
    const params: any = { date };
    if (stylistId) params.stylist = stylistId;
    return this.http.get<string[]>(`${this.apiUrl}/available-slots/`, { params });
  }
}
