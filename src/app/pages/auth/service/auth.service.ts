import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { environment } from '../../../../environment';
import { Observable, throwError ,BehaviorSubject   } from 'rxjs';
import { tap, catchError, distinctUntilChanged ,map} from 'rxjs/operators';
import { User } from '../../admin/users/user.model';
import { AuditLog } from '../../admin/audit-log/audit.model';
import { AuditLogResponse } from '../../admin/users/log.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  readonly baseUrl = environment.apiUrl;
  private loginUrl = `${this.baseUrl}/auth/login/`;
  private resetPasswordUrl = `${this.baseUrl}/auth/reset-password/`;
  private changePasswordUrl = `${this.baseUrl}/auth/change-password/`;

  private auditLogUrl = `${this.baseUrl}/audit/logs/`;

  private currentUser = new BehaviorSubject<User | null>(null)
  currentUser$: Observable< User | null> = this.currentUser.asObservable();
  userId$ = this.currentUser$.pipe(
      map(u => u?.id ?? null),
      distinctUntilChanged()
  );


  constructor(private http: HttpClient, private router: Router) {
  const raw = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (raw) {
      try { this.currentUser.next(JSON.parse(raw)); } catch {}
    }
  }


 setCurrentUser(user: User | null) {
    this.currentUser.next(user);
  }

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
   * Guardar tokens de forma segura (solo datos no sensibles en localStorage)
   */
setTokens(tokens: { access: string; refresh: string }, remember: boolean, user?: any) {
  // Solo guardar datos no sensibles del usuario en localStorage
  if (user) {
    const safeUserData = {
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
      roles: user.roles // IMPORTANTE: incluir roles para el guard
    };
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem('user', JSON.stringify(safeUserData));
  }
  
  // NOTA: Los tokens deberían manejarse como httpOnly cookies desde el backend
  // Por ahora mantenemos en sessionStorage como medida temporal
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem('access_token', tokens.access);
  storage.setItem('refresh_token', tokens.refresh);
  
  // Limpiar el storage opuesto
  const oppositeStorage = remember ? sessionStorage : localStorage;
  oppositeStorage.removeItem('access_token');
  oppositeStorage.removeItem('refresh_token');
  oppositeStorage.removeItem('user');
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
    this.setCurrentUser(null)
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('user');

    this.router.navigate(['/auth/login']);
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


 getAuditLogs(): Observable<AuditLogResponse> {
  return this.http.get<AuditLogResponse>(this.auditLogUrl);
}

}
export type { AuditLog };

