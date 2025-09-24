import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../../pages/auth/service/auth.service';

export const RoleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRoles = route.data?.['allowedRoles'] as string[] | undefined;
  
  if (!requiredRoles || requiredRoles.length === 0) {
    return true; // Sin restricciones de rol
  }

  const userRoles = authService.getUserRoles();
  const hasAccess = userRoles.some(role => requiredRoles.includes(role));

  if (!hasAccess) {
    console.log(`RoleGuard: Access denied. Required: ${requiredRoles}, User has: ${userRoles}`);
    return router.createUrlTree(['/access']);
  }

  return true;
};