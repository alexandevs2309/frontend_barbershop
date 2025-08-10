import { inject } from '@angular/core';
import { CanActivateFn, CanActivateChildFn, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

type GuardResult = boolean | UrlTree;

// === Configurable ===
const CLOCK_SKEW_SECONDS = 60; // margen para expiración
const LOGIN_URL = '/auth/login';
const ACCESS_DENIED_URL = '/access';
const TOKEN_KEY = 'access_token';
const USER_KEY = 'user';

function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

function getStoredUser(): any | null {
    const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function normalizeRolesFromUser(user: any): string[] {
    // Espera user.roles: [{id, name}, ...]
    if (Array.isArray(user?.roles)) {
        return user.roles.map((r: any) => r?.name).filter(Boolean);
    }
    // Si el user trae un string simple
    if (typeof user?.role === 'string') return [user.role];
    return [];
}

function normalizeRolesFromToken(token: string, jwt: JwtHelperService): string[] {
    try {
        const decoded: any = jwt.decodeToken(token) || {};
        // Soportar varias formas: roles: string[] | role: string
        if (Array.isArray(decoded.roles)) return decoded.roles;
        if (typeof decoded.role === 'string') return [decoded.role];
    } catch {
        /* noop */
    }
    return [];
}

function isAuthenticated(router: Router, jwt: JwtHelperService): GuardResult {
    const token = getToken();
    if (!token || jwt.isTokenExpired(token, CLOCK_SKEW_SECONDS)) {
        // Guardar returnUrl para volver post-login
        const returnUrl = location.pathname + location.search;
        return router.createUrlTree([LOGIN_URL], { queryParams: { returnUrl } });
    }
    return true;
}

function hasRequiredRole(route: ActivatedRouteSnapshot, userRoles: string[]): boolean {
    const allowedRoles = route.data?.['allowedRoles'] as string[] | undefined;
    if (!allowedRoles || allowedRoles.length === 0) {
        // Si la ruta no define roles, se permite el acceso
        return true;
    }
    // Intersección
    return userRoles.some((r) => allowedRoles.includes(r));
}

function evaluateGuard(route: ActivatedRouteSnapshot): GuardResult {
    const router = inject(Router);
    const jwt = inject(JwtHelperService);

    // 1) Autenticación
    const auth = isAuthenticated(router, jwt);
    if (auth !== true) return auth;

    // 2) Roles del usuario (primero desde storage, fallback al token)
    const token = getToken()!;
    const user = getStoredUser();
    let roles = normalizeRolesFromUser(user);
    if (!roles.length) {
        roles = normalizeRolesFromToken(token, jwt);
    }

    // 3) Autorización por roles (si la ruta lo pide)
    if (!hasRequiredRole(route, roles)) {
        return router.createUrlTree([ACCESS_DENIED_URL]);
    }

    return true;
}

// === Guards exportados (úsalos en tus rutas) ===
export const AuthGuard: CanActivateFn = (route) => evaluateGuard(route);

export const AuthGuardChild: CanActivateChildFn = (route) => evaluateGuard(route);
