// pages/dashboard/dashboard.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard, AuthGuardChild } from '../../core/guard/auth.guard';

export const dashboardRoutes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuardChild],
    data: { allowedRoles: ['Client-Admin', 'Admin', 'Manager', 'Client-Staff'] },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'home' },
      { path: 'home', loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard) },
      { path: 'clients', loadComponent: () => import('./clients/clients.component').then(m => m.ClientsComponent) },
    //   { path: 'employees', loadComponent: () => import('../client/employees/employees.component').then(m => m.EmployeesComponent) },
    //   { path: 'appointments', loadComponent: () => import('./appointments/appointments.component').then(m => m.AppointmentsComponent) },
    //   { path: 'pos', loadComponent: () => import('./pos/pos.component').then(m => m.PosComponent) },
    //   { path: 'reports', loadComponent: () => import('./reports/reports.component').then(m => m.TenantReportsComponent) },
    //   { path: 'settings', loadComponent: () => import('../client/settings/settings.component').then(m => m.SettingsComponent) },
      // Staff-only routes
    //   { path: 'my-appointments', loadComponent: () => import('./my-appointments/my-appointments.component').then(m => m.MyAppointmentsComponent) },
    //   { path: 'my-earnings', loadComponent: () => import('./my-earnings/my-earnings.component').then(m => m.MyEarningsComponent) }
    ]
  }
];
