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
//   { path: 'forgot-password', loadComponent: () => import('./app/pages/auth/forgot-password').then(m => m.ForgotPassword) },


  // 🔐 Rutas protegidas dentro del layout
  {
    path: '',
    component: AppLayout,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      { path: 'documentation', component: Documentation },
      { path: 'uikit', loadChildren: () => import('./app/pages/uikit/uikit.routes') },
      { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') }
    ]
  },

  // ❌ Página no encontrada
  { path: 'notfound', component: Notfound },
  { path: '**', redirectTo: 'notfound' }
];
