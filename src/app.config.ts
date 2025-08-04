import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';
import { JwtInterceptor } from '@auth0/angular-jwt';
import Aura from '@primeng/themes/aura';
import { JwtHelperService, JWT_OPTIONS } from '@auth0/angular-jwt';



export function tokenGetter() {
    return localStorage.getItem('access_token');
}

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(
            appRoutes,
            withInMemoryScrolling({ anchorScrolling: 'enabled', 
            scrollPositionRestoration: 'enabled' }), withEnabledBlockingInitialNavigation()),

        provideHttpClient(withInterceptorsFromDi()),
        provideAnimationsAsync(),
        providePrimeNG({ theme: { preset: Aura, options: { darkModeSelector: '.app-dark' } } }),

        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
         { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },
        { provide: JwtHelperService, useFactory: () => new JwtHelperService({ tokenGetter }) }
    ]
};
