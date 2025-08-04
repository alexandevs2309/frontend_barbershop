// src/app/pages/admin/dashboard/dashboard.service.ts
import { Injectable } from '@angular/core';
import { of, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' // Esto es esencial
})
export class DashboardService {
  getSummary(): Observable<any> {
    return of({
      totalTenants: 42,
      totalUsers: 168,
      monthlyRevenue: 3200,
      activeSubscriptions: 36,
    });
  }

  getRecentActivities(): Observable<any[]> {
    return of([
      { event: 'Nuevo registro', user: 'BarberShop X', date: new Date() },
      { event: 'Cambio de plan', user: 'Salon Bella', date: new Date() },
    ]);
  }
}
