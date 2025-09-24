import { TestBed } from '@angular/core/testing';
import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { RoleGuard } from './role.guard';
import { AuthService } from '../../pages/auth/service/auth.service';

describe('RoleGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let mockRoute: ActivatedRouteSnapshot;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['getUserRoles']);
    const routerSpy = jasmine.createSpyObj('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    
    mockRoute = new ActivatedRouteSnapshot();
  });

  it('should allow access when no roles required', () => {
    mockRoute.data = {};
    const mockState = {} as any;
    
    const result = TestBed.runInInjectionContext(() => RoleGuard(mockRoute, mockState));
    
    expect(result).toBe(true);
  });

  it('should allow access when user has required role', () => {
    mockRoute.data = { allowedRoles: ['Client-Admin'] };
    authService.getUserRoles.and.returnValue(['Client-Admin', 'Cajera']);
    const mockState = {} as any;
    
    const result = TestBed.runInInjectionContext(() => RoleGuard(mockRoute, mockState));
    
    expect(result).toBe(true);
  });

  it('should deny access when user lacks required role', () => {
    mockRoute.data = { allowedRoles: ['Super-Admin'] };
    authService.getUserRoles.and.returnValue(['Client-Admin']);
    router.createUrlTree.and.returnValue({} as any);
    const mockState = {} as any;
    
    const result = TestBed.runInInjectionContext(() => RoleGuard(mockRoute, mockState));
    
    expect(router.createUrlTree).toHaveBeenCalledWith(['/access']);
  });

  it('should allow Super-Admin access to system-settings', () => {
    mockRoute.data = { allowedRoles: ['Super-Admin', 'Soporte'] };
    authService.getUserRoles.and.returnValue(['Super-Admin']);
    const mockState = {} as any;
    
    const result = TestBed.runInInjectionContext(() => RoleGuard(mockRoute, mockState));
    
    expect(result).toBe(true);
  });

  it('should deny Client-Admin access to system-settings', () => {
    mockRoute.data = { allowedRoles: ['Super-Admin', 'Soporte'] };
    authService.getUserRoles.and.returnValue(['Client-Admin']);
    router.createUrlTree.and.returnValue({} as any);
    const mockState = {} as any;
    
    const result = TestBed.runInInjectionContext(() => RoleGuard(mockRoute, mockState));
    
    expect(router.createUrlTree).toHaveBeenCalledWith(['/access']);
  });
});