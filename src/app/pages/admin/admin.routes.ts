// pages/admin/admin.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard, AuthGuardChild } from '../../core/guard/auth.guard';
import { RoleGuard } from '../../core/guard/role.guard';

export const adminRoutes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuardChild],
    data: { allowedRoles: ['Super-Admin', 'Soporte'] },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'users', loadComponent: () => import('./users/users.component').then(m => m.UsersComponent) },

      // ⬇️ Ruta 'plans' ahora con hijos
      {
        path: 'plans',
        children: [
          { path: '', loadComponent: () => import('./plans/plans.component').then(m => m.PlansComponent) }, // /admin/plans
          { path: 'subscriptions-center', loadComponent: () => import('./plans/subscriptions-center/subscriptions-center.component').then(m => m.SubscriptionCenterComponent) } // /admin/plans/subscriptions-center
        ]
      },

      { path: 'tenants', loadComponent: () => import('./tenants/tenants.component').then(m => m.TenantsComponent) },
      { 
        path: 'system-settings', 
        loadComponent: () => import('./system-settings/system-settings.component').then(m => m.SystemSettingsComponent),
        canActivate: [RoleGuard],
        data: { allowedRoles: ['Super-Admin', 'Soporte'] }
      },
      { path: 'roles', loadComponent: () => import('./roles/roles.component').then(m => m.RoleComponent) },
      { path: 'audit-log', loadComponent: () => import('./audit-log/audit-log.component').then(m => m.AuditComponent) },
      { path: 'reports', loadComponent: () => import('./reports/reports.component').then(m => m.ReportsComponent) }
    ]
  }
];
