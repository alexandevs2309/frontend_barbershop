import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../pages/auth/service/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    const token = this.authService.getToken();

    const isPublicEndpoint = [
      '/api/auth/login/',
      '/api/auth/register/',
      '/api/auth/forgot-password/',
      '/api/auth/reset-password/'
    ].some(url => request.url.includes(url));

    console.log('JWT Interceptor:', {
      url: request.url,
      hasToken: !!token,
      isPublic: isPublicEndpoint,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'none'
    });

    let authRequest = request;
    if (token && !isPublicEndpoint) {
      authRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(authRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log('HTTP Error:', {
          url: request.url,
          status: error.status,
          message: error.message
        });
        if (error.status === 401 && !isPublicEndpoint) {
          this.authService.logout();
        }
        return throwError(() => error);
      })
    );
  }
}
