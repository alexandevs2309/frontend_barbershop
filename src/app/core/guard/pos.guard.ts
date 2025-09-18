import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../../pages/auth/service/auth.service';

type GuardResult = boolean | UrlTree;

export const PosGuard: CanActivateFn = (): GuardResult => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar autenticación básica
  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/auth/login']);
  }

  // Verificar si es un rol global (SuperAdmin o Soporte)
  if (authService.isGlobalRole()) {
    // Los roles globales no pueden acceder al POS directamente
    // Deberían usar un panel de administración global
    return router.createUrlTree(['/access'], {
      queryParams: { 
        message: 'Los roles globales no tienen acceso al POS. Use el panel de administración.' 
      }
    });
  }

  // Verificar permisos específicos para POS
  if (!authService.canAccessPOS()) {
    return router.createUrlTree(['/access'], {
      queryParams: { 
        message: 'No tienes permisos para acceder al sistema POS.' 
      }
    });
  }

  return true;
};