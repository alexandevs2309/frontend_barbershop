import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environment';

export interface ReportQuery {
  type: 'sales' | 'appointments' | 'employees' | 'dashboard' | 'inventory' | 'admin_dashboard' | 'subscription_revenue' | 'tenant_growth' | 'churn_analysis' | 'plan_usage' | 'user_activity';
  start_date?: string;
  end_date?: string;
  employee_id?: number;
}

export interface DashboardMetrics {
  today: {
    revenue: number;
    sales_count?: number;
    appointments_count?: number;
    completed_appointments?: number;
    new_tenants?: number;
    new_subscriptions?: number;
    active_users?: number;
  };
  totals: {
    clients?: number;
    employees?: number;
    low_stock_products?: number;
    tenants?: number;
    users?: number;
    subscriptions?: number;
    revenue?: number;
  };
}

export interface SalesReport {
  period: { start: string; end: string };
  summary: {
    total_amount: number;
    total_count: number;
    avg_sale: number;
  };
  by_payment_method: Array<{ payment_method: string | null; total: number; count: number }>;
  by_employee: Array<{ user__full_name: string | null; total: number; count: number }>;
  daily_sales: Array<{ day: string; total: number; count: number }>;
}

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private apiUrl = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  getReport<T>(query: ReportQuery): Observable<T> {
    let params = new HttpParams().set('type', query.type);

    if (query.start_date) params = params.set('start_date', query.start_date);
    if (query.end_date) params = params.set('end_date', query.end_date);
    if (query.employee_id) params = params.set('employee_id', query.employee_id.toString());

    return this.http.get<T>(this.apiUrl, { params });
  }

  getDashboardMetrics(): Observable<DashboardMetrics> {
    return this.getReport({ type: 'admin_dashboard' });
  }

   getSalesReport(startDate?: string, endDate?: string): Observable<SalesReport> {
    return this.getReport<SalesReport>({
      type: 'sales',
      start_date: startDate,
      end_date: endDate
    }).pipe(
      map((report) => ({
        ...report,
        by_payment_method: report.by_payment_method.map(m => ({
          ...m,
          payment_method: m.payment_method || null,
          total: Number(m.total) || 0
        })),
        by_employee: report.by_employee.map(e => ({
          ...e,
          user__full_name: e.user__full_name || null,
          total: Number(e.total) || 0
        })),
        daily_sales: report.daily_sales.map(d => ({
          ...d,
          total: Number(d.total) || 0
        }))
      }))
    );
  }


  getDetailedSalesReport(query: Partial<ReportQuery> = {}): Observable<any> {
    let params = new HttpParams();

    if (query.start_date) params = params.set('start_date', query.start_date);
    if (query.end_date) params = params.set('end_date', query.end_date);
    if (query.employee_id) params = params.set('employee_id', query.employee_id.toString());

    return this.http.get<any>(`${this.apiUrl}/sales/`, { params });
  }
}
