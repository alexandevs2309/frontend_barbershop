// pages/admin/admin.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard, AuthGuardChild } from '../../core/guard/auth.guard';

export const adminRoutes: Routes = [
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuardChild], // ✅ protege hijos también
        data: { allowedRoles: ['Super-Admin'] },
        children: [
            { path: '', pathMatch: 'full', redirectTo: 'dashboard' }, // ✅ redirect interno
            { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then((m) => m.DashboardComponent) },
            { path: 'users', loadComponent: () => import('./users/users.component').then((m) => m.UsersComponent) },
            { path: 'plans', loadComponent: () => import('./plans/plans.component').then((m) => m.PlansComponent) },
            { path: 'tenants', loadComponent: () => import('./tenants/tenants.component').then((m) => m.TenantsComponent) },
            { path: 'subscriptions', loadComponent: () => import('./subscriptions/subscriptions.component').then((m) => m.SubscriptionsComponent) },
            { path: 'settings', loadComponent: () => import('./settings/settings.component').then((m) => m.SettingsComponent) },
            { path: 'roles', loadComponent: () => import('./roles/roles.component').then((m) => m.RolesComponent) },
            { path: 'audit-log', loadComponent: () => import('./audit-log/audit-log.component').then((m) => m.AuditLogComponent) }
        ]
    }
];
