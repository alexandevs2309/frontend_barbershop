import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { environment } from '../../../../environment';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loginUrl = `${environment.apiUrl}/auth/login/`;
  private resetPasswordUrl = `${environment.apiUrl}/auth/reset-password/`;
  private changePasswordUrl = `${environment.apiUrl}/auth/change-password/`;

  constructor(private http: HttpClient, private router: Router) {}

  /**
   * Login con credenciales y obtención de tokens.
   */
  login(credentials: { email: string; password: string }): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post<any>(this.loginUrl, credentials, { headers }).pipe(
      tap((res) => {
        // No guarda automáticamente: se maneja desde el componente para usar remember me
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  /**
   * Solicitud de restablecimiento de contraseña.
   */
  requestPasswordReset(email: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.resetPasswordUrl, { email }, { headers });
  }

  /**
   * Enviar nueva contraseña usando token recibido por email.
   */
  confirmPasswordReset(uid: string, token: string, new_password: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.resetPasswordUrl}confirm/`, {
      uid,
      token,
      new_password
    }, { headers });
  }

  /**
   * Cambio de contraseña desde sesión autenticada.
   */
  changePassword(current_password: string, new_password: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.changePasswordUrl, {
      current_password,
      new_password
    }, { headers });
  }

  /**
   * Guardar tokens dependiendo si se eligió "Remember Me"
   */
setTokens(tokens: { access: string; refresh: string }, remember: boolean, user?: any) {
  // Siempre guardar en localStorage
  localStorage.setItem('access_token', tokens.access);
  localStorage.setItem('refresh_token', tokens.refresh);
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  if (remember) {
    // Además guarda en sessionStorage si se quiere recordar
    sessionStorage.setItem('access_token', tokens.access);
    sessionStorage.setItem('refresh_token', tokens.refresh);
    if (user) {
      sessionStorage.setItem('user', JSON.stringify(user));
    }
  } else {
    // Borra cualquier sesión previa en sessionStorage
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('user');
  }
}


getUserRole(): string | null {
  const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
  if (!userData) return null;

  const user = JSON.parse(userData);
  return user.role || null;
}

  /**
   * Obtener el token actual (prioridad a localStorage)
   */
 getToken(): string | null {
  return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
}



  /**
   * Obtener el refresh token actual
   */
  getRefreshToken(): string | null {
    return this.getStorage().getItem('refresh_token');
  }

  /**
   * Eliminar tokens al cerrar sesión
   */
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  /**
   * Validar si el usuario sigue autenticado.
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    const jwtHelper = new JwtHelperService();
    return !jwtHelper.isTokenExpired(token);
  }

  /**
   * Interno: obtener el Storage activo (local o session)
   */
  private getStorage(): Storage {
    return localStorage.getItem('access_token') ? localStorage : sessionStorage;
  }
}
