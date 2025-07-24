import {Injectable} from '@angular/core';
import {HttpInterceptor , HttpHandler, HttpRequest} from '@angular/common/http';
import {AuthService} from '../../pages/auth/service/auth.service';


@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler) {
    const token = this.authService.getToken();
    if (token) {
      const cloned = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
        return next.handle(cloned);
    }
    return next.handle(request);
  }

}