// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';
import { JwtInterceptor } from './app/core/interceptors/jwt.interceptor'; // ajusta el path si es necesario
import Aura from '@primeng/themes/aura';
import { JWT_OPTIONS, JwtHelperService } from '@auth0/angular-jwt';

export const appConfig: ApplicationConfig = {
    providers: [
        // Ruteo
        provideRouter(appRoutes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }), withEnabledBlockingInitialNavigation()),

        // HTTP con interceptores DI
        provideHttpClient(withInterceptorsFromDi()),

        // Animaciones
        provideAnimationsAsync(),

        // PrimeNG con tema Aura
        providePrimeNG({
            theme: {
                preset: Aura,
                options: {
                    darkModeSelector: '.app-dark'
                }
            }
        }),

        // Interceptor JWT personalizado
        {
            provide: HTTP_INTERCEPTORS,
            useClass: JwtInterceptor,
            multi: true
        },
        { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },
    { provide: JwtHelperService, useClass: JwtHelperService },
    ]
};
