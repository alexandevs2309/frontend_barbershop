// app.routes.ts
import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { AuthGuard } from './app/core/guard/auth.guard';

export const appRoutes: Routes = [
  // 🔓 Públicas
  { path: 'auth/login', loadComponent: () => import('./app/pages/auth/login').then(m => m.Login) },
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

      // Dashboard para clientes (suscritos)
      { path: 'dashboard', loadComponent: () => import('./app/pages/dashboard/dashboard').then(m => m.Dashboard) },

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
      { path: 'uikit', loadChildren: () => import('./app/pages/uikit/uikit.routes') },
      { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') }
    ]
  },

  // ❌ Not Found
  { path: 'notfound', loadComponent: () => import('./app/pages/notfound/notfound').then(m => m.Notfound) },
  { path: '**', redirectTo: 'notfound' }
];
