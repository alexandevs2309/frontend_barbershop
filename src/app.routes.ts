// app.routes.ts
import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { AuthGuard, AuthGuardChild } from './app/core/guard/auth.guard';
import { RoleGuard } from './app/core/guard/role.guard';

export const appRoutes: Routes = [
  // Root redirect
  { path: '', redirectTo: 'landing', pathMatch: 'full' },

  // 🔓 Públicas
  { path: 'landing', loadComponent: () => import('./app/pages/landing/landing').then(m => m.Landing) },
  { path: 'auth/login', loadComponent: () => import('./app/pages/auth/login').then(m => m.Login) },
  { path: 'auth/register', loadComponent: () => import('./app/pages/auth/register/register.component').then(m => m.RegisterComponent) },
  { path: 'forgot-password', loadComponent: () => import('./app/pages/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },
  { path: 'reset-password', loadComponent: () => import('./app/pages/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent) },
  { path: 'access', loadComponent: () => import('./app/pages/auth/access').then(m => m.Access) },

  // 🔐 Protegidas (dentro del layout)
  {
    path: '',
    component: AppLayout,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      // Dashboard para clientes (suscritos) - Solo roles de tenant
      { 
        path: 'dashboard', 
        loadComponent: () => import('./app/pages/client/dashboard/dashboard').then(m => m.Dashboard),
        canActivate: [AuthGuard],
        data: { allowedRoles: ['Client-Admin', 'Admin', 'Manager', 'Client-Staff', 'Cajera', 'Soporte'] }
      },

      // Client routes
      {
        path: 'client',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuardChild],
        data: { allowedRoles: ['Client-Admin', 'Admin', 'Manager', 'Client-Staff', 'Cajera'] },
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'home' },
          { path: 'home', loadComponent: () => import('./app/pages/client/dashboard/dashboard').then(m => m.Dashboard) },
          { path: 'clients', loadComponent: () => import('./app/pages/client/clients/clients.component').then(m => m.ClientsComponent) },
          { path: 'employees', loadComponent: () => import('./app/pages/client/employees/employees.component').then(m => m.EmployeesComponent) },
          { path: 'earnings', loadComponent: () => import('./app/pages/client/earnings/earnings.component').then(m => m.EarningsComponent) },
          { path: 'inventory', loadComponent: () => import('./app/pages/client/inventory/inventory.component').then(m => m.InventoryComponent) },
          { path: 'services', loadComponent: () => import('./app/pages/client/services/services.component').then(m => m.ServicesComponent) },
          { path: 'appointments', loadComponent: () => import('./app/pages/client/appointments/appointments.component').then(m => m.AppointmentsComponent) },
          { path: 'pos', loadComponent: () => import('./app/pages/client/pos/pos.component').then(m => m.PosComponent) },
          { path: 'reports', loadComponent: () => import('./app/pages/client/reports/reports.component').then(m => m.ReportsComponent) },
          {
            path: 'settings',
            loadComponent: () => import('./app/pages/client/settings/settings.component').then(m => m.SettingsComponent),
            canActivate: [RoleGuard],
            data: { allowedRoles: ['Client-Admin'] }
          }
        ]
      },

      // Admin del SaaS (solo Super-Admin)
      {
        path: 'admin',
        // Puedes dejar la verificación de rol aquí...
        canActivate: [AuthGuard],
        data: { allowedRoles: ['Super-Admin'] },
        loadChildren: () => import('./app/pages/admin/admin.routes').then(m => m.adminRoutes)

        // ...o delegarla 100% al admin.routes (recomendado) y quitar estas dos líneas:
        // loadChildren: () => import('./app/pages/admin/admin.routes').then(m => m.adminRoutes)
      },

      // Otras secciones lazy
      { path: 'documentation', loadComponent: () => import('./app/pages/documentation/documentation').then(m => m.Documentation) },
      { path: 'crud', loadComponent: () => import('./app/pages/crud/crud').then(m => m.Crud) },
      { path: 'empty', loadComponent: () => import('./app/pages/empty/empty').then(m => m.Empty) },

      { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') }
    ]
  },

  // ❌ Not Found
  { path: 'notfound', loadComponent: () => import('./app/pages/notfound/notfound').then(m => m.Notfound) },
  { path: '**', redirectTo: 'notfound' }
];
