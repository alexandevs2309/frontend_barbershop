import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError } from 'rxjs';
import { environment } from '../../../../environment';

export interface Service {
  id?: number;
  name: string;
  description?: string | undefined;
  price: number;
  duration: number; // en minutos
  category?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ServicesService {
  private apiUrl = `${environment.apiUrl}/services/services`;

  constructor(private http: HttpClient) {}

  getServices(params?: any): Observable<any> {
    console.log('Services URL:', `${this.apiUrl}/`);
    return this.http.get<any>(`${this.apiUrl}/`, { params }).pipe(
      map(response => {
        console.log('Services response:', response);
        if (Array.isArray(response)) {
          return { results: response, count: response.length };
        }
        return response;
      }),
      catchError(error => {
        console.error('Services error:', error);
        throw error;
      })
    );
  }

  getService(id: number): Observable<Service> {
    return this.http.get<Service>(`${this.apiUrl}/${id}/`);
  }

  createService(service: Partial<Service>): Observable<Service> {
    return this.http.post<Service>(`${this.apiUrl}/`, service);
  }

  updateService(id: number, service: Partial<Service>): Observable<Service> {
    return this.http.patch<Service>(`${this.apiUrl}/${id}/`, service);
  }

  deleteService(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}/`);
  }

  getCategories(): Observable<string[]> {
    // Categorías predefinidas, podrías obtenerlas del backend
    return new Observable(observer => {
      observer.next([
        'Corte de Cabello',
        'Barba y Bigote',
        'Coloración',
        'Tratamientos',
        'Peinados',
        'Otros'
      ]);
      observer.complete();
    });
  }
}
