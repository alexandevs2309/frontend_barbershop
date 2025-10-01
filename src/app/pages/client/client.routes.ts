// pages/client/client.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard, AuthGuardChild } from '../../core/guard/auth.guard';

export const clientRoutes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuardChild],
    data: { allowedRoles: ['Client-Admin', 'Admin', 'Manager', 'Client-Staff'] },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'home' },
      { path: 'home', loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard) },
      { path: 'clients', loadComponent: () => import('./clients/clients.component').then(m => m.ClientsComponent) },
      { path: 'employees', loadComponent: () => import('./employees/employees.component').then(m => m.EmployeesComponent) },
      { path: 'earnings', loadComponent: () => import('./earnings/earnings.component').then(m => m.EarningsComponent) },
      { path: 'inventory', loadComponent: () => import('./inventory/inventory.component').then(m => m.InventoryComponent) },
      { path: 'services', loadComponent: () => import('./services/services.component').then(m => m.ServicesComponent) },
      { path: 'appointments', loadComponent: () => import('./appointments/appointments.component').then(m => m.AppointmentsComponent) },
      { path: 'agenda', loadComponent: () => import('./appointments/appointments.component').then(m => m.AppointmentsComponent) },
      { path: 'pos', loadComponent: () => import('./pos/pos.component').then(m => m.PosComponent) },
      { path: 'reports', loadComponent: () => import('./reports/reports.component').then(m => m.ReportsComponent) },
      { 
        path: 'users', 
        loadComponent: () => import('./users/users.component').then(m => m.ClientUsersComponent)
      },
      { path: 'settings', loadComponent: () => import('./settings/settings.component').then(m => m.SettingsComponent) },

    
 
    ]
  }
];
