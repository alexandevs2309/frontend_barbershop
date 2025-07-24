import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

export const AuthGuard: CanActivateFn = () => {
  const jwtHelper = inject(JwtHelperService);
  const router = inject(Router);
  const token = localStorage.getItem('access_token');

 const isValidJwt = token && token.split('.').length === 3 && !jwtHelper.isTokenExpired(token);
if (isValidJwt){
  return true;
}

router.navigate(['/auth/login']);
return false;

}
