import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

export const AuthGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const jwtHelper = inject(JwtHelperService);
  const router = inject(Router);
  const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');

  // Verifica que el token JWT sea válido
  const isValidJwt = token && token.split('.').length === 3 && !jwtHelper.isTokenExpired(token);
  if (!isValidJwt) {
    router.navigate(['/auth/login']);
    return false;
  }

  // Extrae el usuario y sus roles
  const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
  if (!userStr) {
    router.navigate(['/auth/login']);
    return false;
  }

  const user = JSON.parse(userStr);
  const userRoles = user.roles?.map((r: any) => r.name) || [];

  // Verifica contra los roles permitidos definidos en la ruta
  const allowedRoles = route.data['allowedRoles'] as string[] | undefined;
  if (allowedRoles && !userRoles.some((role: string) => allowedRoles.includes(role))) {
    router.navigate(['/access']); // acceso denegado
    return false;
  }

  return true;
};
