import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login successfully', () => {
    const mockCredentials = { email: 'test@test.com', password: 'password' };
    const mockResponse = { access: 'token123', refresh: 'refresh123' };

    service.login(mockCredentials).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(req => req.url.includes('/auth/login/'));
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should set tokens correctly', () => {
    const tokens = { access: 'token123', refresh: 'refresh123' };
    const user = { id: 1, email: 'test@test.com', roles: [{ name: 'Client-Admin' }] };
    
    service.setTokens(tokens, true, user);
    
    expect(localStorage.getItem('access_token')).toBe('token123');
    expect(localStorage.getItem('user')).toContain('test@test.com');
  });

  it('should get user roles correctly', () => {
    const user = { roles: [{ name: 'Client-Admin' }, { name: 'Cajera' }] };
    localStorage.setItem('user', JSON.stringify(user));
    
    const roles = service.getUserRoles();
    expect(roles).toEqual(['Client-Admin', 'Cajera']);
  });

  it('should check if user is super admin', () => {
    const user = { roles: [{ name: 'Super-Admin' }] };
    localStorage.setItem('user', JSON.stringify(user));
    
    expect(service.isSuperAdmin()).toBe(true);
  });

  it('should check if user can access POS', () => {
    const user = { roles: [{ name: 'Client-Admin' }] };
    localStorage.setItem('user', JSON.stringify(user));
    
    expect(service.canAccessPOS()).toBe(true);
  });

  it('should logout and navigate to login', () => {
    localStorage.setItem('access_token', 'token');
    spyOn(router, 'navigate');
    
    service.logout();
    
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  });



  it('should return null when no refresh token', () => {
    localStorage.removeItem('refresh_token');
    
    const token = service.getRefreshToken();
    expect(token).toBeNull();
  });

  it('should clear all tokens on logout', () => {
    localStorage.setItem('access_token', 'access123');
    localStorage.setItem('refresh_token', 'refresh123');
    localStorage.setItem('user', '{}');
    spyOn(router, 'navigate');
    
    service.logout();
    
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('should handle empty user roles', () => {
    localStorage.setItem('user', JSON.stringify({ roles: [] }));
    
    const roles = service.getUserRoles();
    expect(roles).toEqual([]);
  });

  it('should handle user without roles property', () => {
    localStorage.setItem('user', JSON.stringify({ id: 1, email: 'test@test.com' }));
    
    const roles = service.getUserRoles();
    expect(roles).toEqual([]);
  });

  it('should check if user is not super admin', () => {
    const user = { roles: [{ name: 'Client-Admin' }] };
    localStorage.setItem('user', JSON.stringify(user));
    
    expect(service.isSuperAdmin()).toBe(false);
  });

  it('should check if user cannot access POS', () => {
    const user = { roles: [{ name: 'Utility' }] };
    localStorage.setItem('user', JSON.stringify(user));
    
    expect(service.canAccessPOS()).toBe(false);
  });
});
