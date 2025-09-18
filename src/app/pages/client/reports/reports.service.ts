import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environment';

export interface DashboardStats {
  totalSales: number;
  totalRevenue: number;
  totalClients: number;
  totalEmployees: number;
  totalServices: number;
  totalProducts: number;
  lowStockProducts: number;
  pendingAppointments: number;
}

export interface SalesReport {
  period: string;
  sales: number;
  revenue: number;
  avgTicket: number;
}

export interface EmployeeReport {
  employee_name: string;
  total_services: number;
  total_earnings: number;
  avg_commission: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<DashboardStats> {
    return forkJoin({
      sales: this.http.get<any>(`${environment.apiUrl}/pos/sales/`),
      clients: this.http.get<any>(`${environment.apiUrl}/clients/clients/`),
      employees: this.http.get<any>(`${environment.apiUrl}/employees/employees/`),
      services: this.http.get<any>(`${environment.apiUrl}/services/services/`),
      products: this.http.get<any>(`${environment.apiUrl}/inventory/products/`),
      appointments: this.http.get<any>(`${environment.apiUrl}/appointments/appointments/`)
    }).pipe(
      map(data => this.processDashboardData(data))
    );
  }

  getSalesReport(startDate: string, endDate: string): Observable<SalesReport[]> {
    return this.http.get<any>(`${environment.apiUrl}/pos/sales/`, {
      params: { start_date: startDate, end_date: endDate }
    }).pipe(
      map(response => {
        const sales = response.results || response || [];
        const groupedByDate = sales.reduce((acc: any, sale: any) => {
          const date = new Date(sale.date_time).toISOString().split('T')[0];
          if (!acc[date]) {
            acc[date] = { sales: 0, revenue: 0 };
          }
          acc[date].sales += 1;
          acc[date].revenue += sale.total || 0;
          return acc;
        }, {});

        return Object.entries(groupedByDate).map(([date, data]: [string, any]) => ({
          period: date,
          sales: data.sales,
          revenue: data.revenue,
          avgTicket: data.sales > 0 ? data.revenue / data.sales : 0
        }));
      })
    );
  }

  getEmployeeReport(): Observable<EmployeeReport[]> {
    return this.http.get<any>(`${environment.apiUrl}/employees/earnings/`).pipe(
      map(response => {
        const earnings = response.results || response || [];
        const groupedByEmployee = earnings.reduce((acc: any, earning: any) => {
          const name = earning.employee_name || `Employee ${earning.employee}`;
          if (!acc[name]) {
            acc[name] = { services: 0, earnings: 0, commissions: [] };
          }
          acc[name].services += 1;
          acc[name].earnings += earning.commission_amount || 0;
          acc[name].commissions.push(earning.commission_percentage || 0);
          return acc;
        }, {});

        return Object.entries(groupedByEmployee).map(([name, data]: [string, any]) => ({
          employee_name: name,
          total_services: data.services,
          total_earnings: data.earnings,
          avg_commission: data.commissions.reduce((sum: number, c: number) => sum + c, 0) / data.commissions.length || 0
        }));
      })
    );
  }

  getTopServices(): Observable<any[]> {
    return this.http.get<any>(`${environment.apiUrl}/pos/sales/`).pipe(
      map(response => {
        const sales = response.results || response || [];
        const serviceCount: any = {};

        sales.forEach((sale: any) => {
          if (sale.details) {
            sale.details.forEach((detail: any) => {
              if (detail.item_type === 'service') {
                const name = detail.name || 'Servicio desconocido';
                serviceCount[name] = (serviceCount[name] || 0) + detail.quantity;
              }
            });
          }
        });

        return Object.entries(serviceCount)
          .map(([name, count]) => ({ name, count }))
          .sort((a: any, b: any) => b.count - a.count)
          .slice(0, 5);
      })
    );
  }

  exportReport(type: string, data: any): void {
    const csvContent = this.convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private processDashboardData(data: any): DashboardStats {
    const sales = this.extractResults(data.sales);
    const products = this.extractResults(data.products);
    const appointments = this.extractResults(data.appointments);
    const clients = this.extractResults(data.clients);
    const employees = this.extractResults(data.employees);
    const services = this.extractResults(data.services);

    return {
      totalSales: sales.length,
      totalRevenue: this.calculateTotalRevenue(sales),
      totalClients: clients.length,
      totalEmployees: employees.length,
      totalServices: services.length,
      totalProducts: products.length,
      lowStockProducts: this.countLowStockProducts(products),
      pendingAppointments: this.countPendingAppointments(appointments)
    };
  }

  private extractResults(data: any): any[] {
    return data.results || data || [];
  }

  private calculateTotalRevenue(sales: any[]): number {
    return sales.reduce((sum: number, sale: any) => sum + (sale.total || 0), 0);
  }

  private countLowStockProducts(products: any[]): number {
    return products.filter((p: any) => p.stock <= p.min_stock).length;
  }

  private countPendingAppointments(appointments: any[]): number {
    return appointments.filter((a: any) => a.status === 'scheduled').length;
  }

  private convertToCSV(data: any[]): string {
    if (!data.length) return '';

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => this.formatCSVRow(row));

    return [headers, ...rows].join('\n');
  }

  private formatCSVRow(row: any): string {
    return Object.values(row)
      .map(value => this.formatCSVValue(value))
      .join(',');
  }

  private formatCSVValue(value: any): string {
    return typeof value === 'string' ? `"${value}"` : String(value);
  }
}
