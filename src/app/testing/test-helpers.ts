import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

export const getTestProviders = () => [
  provideHttpClient(),
  provideHttpClientTesting(),
  provideRouter([]),
  JwtHelperService
];