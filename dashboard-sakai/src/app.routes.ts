import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Documentation } from './app/pages/documentation/documentation';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';
import { AuthGuard } from './app/core/guard/auth.guard';

export const appRoutes: Routes = [
  // 🔓 Ruta pública
  { path: 'auth/login', loadComponent: () => import('./app/pages/auth/login').then(m => m.Login) },
  { path: 'forgot-password', loadComponent: () => import('./app/pages/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },
  { path: 'access', loadComponent: () => import('./app/pages/auth/access').then(m => m.Access) },



  // 🔐 Rutas protegidas dentro del layout
 {
  path: '',
  component: AppLayout,
  canActivate: [AuthGuard],
  children: [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

    // dashboard para usuarios suscritos
    { path: 'dashboard', loadComponent: () => import('./app/pages/dashboard/dashboard').then(m => m.Dashboard) },

    // dashboard del admin del sistema SaaS
    
      {
      path: 'admin',
      canActivate: [AuthGuard],
      data: { allowedRoles: ['Super-Admin'] },
      loadChildren: () => import('./app/pages/admin/admin.routes').then(m => m.adminRoutes)
    },

    { path: 'documentation', component: Documentation },
    { path: 'uikit', loadChildren: () => import('./app/pages/uikit/uikit.routes') },
    { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') },

    { path: 'reset-password', loadComponent: () => import('./app/pages/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent) },

    {
  path: 'admin',
  canActivate: [AuthGuard],
  data: { allowedRoles: ['Super-Admin'] },
  loadChildren: () => import('./app/pages/admin/admin.routes').then(m => m.adminRoutes)
}


  ]
},

  { path: 'reset-password', loadComponent: () => import('./app/pages/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent) },

  // ❌ Página no encontrada
  { path: 'notfound', component: Notfound },
  { path: '**', redirectTo: 'notfound' }
];
