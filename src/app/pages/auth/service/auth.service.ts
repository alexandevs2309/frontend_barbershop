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
  if (user) {
    const safeUserData = {
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
      roles: user.roles,
      remember: remember
    };
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem('user', JSON.stringify(safeUserData));
  }
  
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem('access_token', tokens.access);
  storage.setItem('refresh_token', tokens.refresh);
  storage.setItem('remember_me', remember.toString());
  
  const oppositeStorage = remember ? sessionStorage : localStorage;
  oppositeStorage.removeItem('access_token');
  oppositeStorage.removeItem('refresh_token');
  oppositeStorage.removeItem('user');
  oppositeStorage.removeItem('remember_me');
}


getUserRole(): string | null {
  const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
  if (!userData) return null;

  const user = JSON.parse(userData);
  return user.role || null;
}

// Métodos para el sistema de roles de dos niveles
getUserRoles(): string[] {
  const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
  if (!userData) return [];

  try {
    const user = JSON.parse(userData);
  
  // Si roles es un array de objetos con propiedad 'name'
  if (Array.isArray(user.roles) && user.roles.length > 0 && typeof user.roles[0] === 'object') {
    return user.roles.map((role: any) => role.name).filter(Boolean);
  }
  
  // Si roles es un array de strings
  if (Array.isArray(user.roles)) {
    return user.roles;
  }
  
    return [];
  } catch (error) {
    console.error('Failed to parse user data:', error);
    return [];
  }
}

// Nivel 1: Roles globales (SaaS)
isSuperAdmin(): boolean {
  return this.getUserRoles().includes('Super-Admin');
}

isSupportRole(): boolean {
  return this.getUserRoles().includes('Soporte');
}

isGlobalRole(): boolean {
  return this.isSuperAdmin() || this.isSupportRole();
}

// Nivel 2: Roles por tenant (Peluquería)
isClientAdmin(): boolean {
  return this.getUserRoles().includes('Client-Admin');
}

isCashier(): boolean {
  return this.getUserRoles().includes('Cajera');
}

isStylist(): boolean {
  return this.getUserRoles().includes('Client-Staff'); // Estilista/Peluquero
}

isUtility(): boolean {
  return this.getUserRoles().includes('Utility');
}

// Permisos específicos para POS
canAccessPOS(): boolean {
  // Solo roles de tenant pueden acceder al POS
  return !this.isGlobalRole() && (this.isClientAdmin() || this.isCashier());
}

canManageCashRegister(): boolean {
  return this.isClientAdmin() || this.isCashier();
}

canViewAllEarnings(): boolean {
  return this.isClientAdmin();
}

canViewOwnEarnings(): boolean {
  return this.isStylist();
}

canViewSalesHistory(): boolean {
  return this.isClientAdmin() || this.isCashier();
}

canProcessSales(): boolean {
  return this.isClientAdmin() || this.isCashier();
}

  /**
   * Obtener el token actual (prioridad a localStorage)
   */
 getToken(): string | null {
  return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
}

getCurrentUser(): any {
  const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
}



  /**
   * Obtener el refresh token actual
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
  }

  /**
   * Refrescar token automáticamente
   */
  refreshToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<any>(`${this.baseUrl}/auth/token/refresh/`, {
      refresh: refreshToken
    }).pipe(
      tap((response) => {
        const remember = localStorage.getItem('remember_me') === 'true' || sessionStorage.getItem('remember_me') === 'true';
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem('access_token', response.access);
        if (response.refresh) {
          storage.setItem('refresh_token', response.refresh);
        }
      }),
      catchError((error) => {
        this.logout(); // Si no se puede refrescar, cerrar sesión
        return throwError(() => error);
      })
    );
  }

  /**
   * Eliminar tokens al cerrar sesión
   */
  logout(): void {
    this.setCurrentUser(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('remember_me');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('remember_me');

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

