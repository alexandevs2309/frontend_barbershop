import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { environment } from '../../../environment';

export interface Entitlements {
  plan: string;
  plan_display: string;
  duration_month: number;
  features: Record<string, boolean>;
 // Entitlements (service)
limits?: Partial<Record<string, number>>;
usage?: Partial<Record<string, number>>;

  status?: 'active' | 'trialing' | 'past_due' | 'unpaid' | 'canceled' | 'incomplete' | 'incomplete_expired';
  is_active?: boolean;
}

@Injectable({ providedIn: 'root' })
export class EntitlementsService {
  private readonly url = `${environment.apiUrl}/subscriptions/me/entitlements/`;

  // 👇 Subject PRIVADO (sí tiene .next y .value)
  private _entitlements$ = new BehaviorSubject<Entitlements | null>(null);

  // 👇 Observable PÚBLICO (solo lectura para componentes)
  readonly entitlements$: Observable<Entitlements | null> = this._entitlements$.asObservable();

  constructor(private http: HttpClient) {}

  /** Carga y emite (si tuvieras un “load” explícito). */
  load(): Observable<Entitlements | null> {
    return this.http.get<Entitlements>(this.url).pipe(
      map((e) => e ?? null),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 404 || err.status === 401 || err.status === 403) return of(null);
        return throwError(() => err);
      }),
      tap((e) => this._entitlements$.next(e))
    );
  }

  /** Limpia el estado (útil al login/logout). */
  clear(): void {
    this._entitlements$.next(null);
  }

  /** Pide al backend y actualiza el stream. 404/401/403 => null (no error). */
  refresh(): Observable<Entitlements | null> {
    return this.http.get<Entitlements>(this.url).pipe(
      map((e) => e ?? null),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 404 || err.status === 401 || err.status === 403) return of(null);
        return throwError(() => err);
      }),
      tap((val) => this._entitlements$.next(val)) // ✅ ahora sí existe .next
    );
  }

  // ===== Helpers =====
  hasFeature(key: string): boolean {
    const e = this._entitlements$.value;
    return !!e?.features?.[key];
  }

  underLimit(limitKey: string, usageKey?: string): boolean {
    const e = this._entitlements$.value;
    if (!e) return false;
    const max = e.limits?.[limitKey] ?? 0;
    const used = e.usage?.[usageKey ?? limitKey] ?? 0;
    return max === 0 || used < max; // 0 = ilimitado
  }
}
