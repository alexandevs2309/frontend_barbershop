import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environment';
import { Router } from '@angular/router';

export interface Client {
  id?: number;
  full_name: string;
  email?: string;
  phone?: string;
  birthday?: string;
  gender?: 'M' | 'F' | 'O';
  preferred_stylist?: number;
  loyalty_points: number;
  last_visit?: string;
  source?: string;
  notes?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ClientStats {
  total_appointments: number;
  completed_appointments: number;
  total_spent: number;
  loyalty_points: number;
  last_visit?: string;
}

export interface Paginated<T> {
  count: number;
  results: T[];
}

@Injectable({
  providedIn: 'root'
})
export class ClientsService {
  private apiUrl = `${environment.apiUrl}/clients/clients`;

  constructor(private http: HttpClient, private router: Router) {}

  getClients(params?: any): Observable<Paginated<Client>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<Paginated<Client>>(`${this.apiUrl}/`, { params: httpParams }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getClient(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${id}/`);
  }

  createClient(client: Partial<Client>): Observable<Client> {
    return this.http.post<Client>(`${this.apiUrl}/`, client).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  updateClient(id: number, client: Partial<Client>): Observable<Client> {
    return this.http.patch<Client>(`${this.apiUrl}/${id}/`, client);
  }

  deleteClient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`);
  }

  getClientHistory(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/history/`);
  }

  getClientStats(id: number): Observable<ClientStats> {
    return this.http.get<ClientStats>(`${this.apiUrl}/${id}/stats/`);
  }

  addLoyaltyPoints(id: number, points: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/add_loyalty_points/`, { points });
  }

  redeemPoints(id: number, points: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/redeem_points/`, { points });
  }

  getBirthdaysThisMonth(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.apiUrl}/birthdays_this_month/`);
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 401 || (error.status === 400 && error.error?.includes('tenant'))) {
      // Token expirado/inválido o sin tenant, redirigir al login
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('refresh_token');
      sessionStorage.removeItem('user');
      this.router.navigate(['/auth/login']);
    }
    return throwError(() => error);
  }
}
