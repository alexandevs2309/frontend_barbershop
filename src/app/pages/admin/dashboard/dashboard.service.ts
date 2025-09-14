import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environment';

export interface DashboardStats {
  today: {
    revenue: number;
    new_tenants: number;
    new_subscriptions: number;
    active_users: number;
  };
  totals: {
    tenants: number;
    users: number;
    subscriptions: number;
    revenue: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/reports/?type=admin_dashboard`).pipe(
      catchError(error => {
        console.error('Error fetching dashboard stats:', error);
        // Devolver datos por defecto en caso de error
        return of({
          today: {
            revenue: 0,
            new_tenants: 0,
            new_subscriptions: 0,
            active_users: 0
          },
          totals: {
            tenants: 0,
            users: 0,
            subscriptions: 0,
            revenue: 0
          }
        });
      })
    );
  }

  getChartData(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/reports/?type=chart_data`).pipe(
      catchError(error => {
        console.error('Error fetching chart data:', error);
        return of({
          subscriptions_by_month: [5, 12, 19, 23, 34, 38],
          plan_distribution: { basic: 12, pro: 18, premium: 8 }
        });
      })
    );
  }

  getRecentActivities(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/audit/logs/summary/`).pipe(
      catchError(error => {
        console.error('Error fetching activities:', error);
        return of({
          recent_activity: [
            { description: 'Nuevo registro', user: { first_name: 'BarberShop', last_name: 'X' }, timestamp: new Date(), action: 'CREATE' },
            { description: 'Cambio de plan', user: { first_name: 'Salon', last_name: 'Bella' }, timestamp: new Date(), action: 'UPDATE' },
            { description: 'Fallo de pago', user: { first_name: 'Stylo', last_name: 'Studio' }, timestamp: new Date(), action: 'ERROR' }
          ]
        });
      })
    );
  }
}
