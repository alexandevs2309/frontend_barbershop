import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { environment } from '../../../../environment';

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
  login(credentials: { email: string; password: string }) {
    return this.http.post<any>(this.loginUrl, credentials);
  }

  /**
   * Solicitud de restablecimiento de contraseña.
   */
  requestPasswordReset(email: string) {
    return this.http.post(this.resetPasswordUrl, { email });
  }

  /**
   * Enviar nueva contraseña usando token recibido por email.
   */
  confirmPasswordReset(uid: string, token: string, new_password: string) {
    return this.http.post(`${this.resetPasswordUrl}confirm/`, {
      uid,
      token,
      new_password
    });
  }

  /**
   * Cambio de contraseña desde sesión autenticada.
   */
  changePassword(current_password: string, new_password: string) {
    return this.http.post(this.changePasswordUrl, {
      current_password,
      new_password
    });
  }

  /**
   * Guardar tokens dependiendo si se eligió "Remember Me"
   */
  setTokens(tokens: { access: string; refresh: string }, remember: boolean) {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem('access_token', tokens.access);
    storage.setItem('refresh_token', tokens.refresh);
  }

  /**
   * Obtener el token actual (prioridad a localStorage)
   */
  getToken(): string | null {
    return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  }

  /**
   * Eliminar tokens al cerrar sesión
   */
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
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
}
