import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { AuthService } from '../../pages/auth/service/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler) {
    const token = this.authService.getToken();

    // Rutas públicas (no se debe enviar el token en estas)
    const isPublicEndpoint = [
      '/api/auth/login/',
      '/api/auth/register/',
      '/api/auth/forgot-password/',
      '/api/auth/reset-password/'
    ].some(url => request.url.includes(url));

    if (token && !isPublicEndpoint) {
      const cloned = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next.handle(cloned);
    }

    // Si no hay token o es endpoint público, continúa sin modificar
    return next.handle(request);
  }
}
