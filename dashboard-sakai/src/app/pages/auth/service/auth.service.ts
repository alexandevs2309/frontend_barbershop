import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {JwtHelperService} from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { environment } from '../../../../environment';


@Injectable({
  providedIn: 'root'
})
export class AuthService {


private apiUrl = `${environment.apiUrl}/auth/login/`;

  constructor(private http: HttpClient, private router: Router) { }

  login(credentials:{email:string; password:string}){

    return this.http.post<any>(this.apiUrl, credentials);
  }


setTokens(tokens: { access: string; refresh: string; }, checked: boolean) {
  const storage = checked ? localStorage : sessionStorage;
  localStorage.setItem('access_token', tokens.access);
  localStorage.setItem('refresh_token', tokens.refresh);
}

getToken(): string | null {
  return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
}

logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  sessionStorage.removeItem('access_token');
  sessionStorage.removeItem('refresh_token');
  this.router.navigate(['/login']);
}


isAuthenticated(): boolean {
  const token = this.getToken();
  if (!token) {
    return false;
  }
  const jwtHelper = new JwtHelperService();
  return !jwtHelper.isTokenExpired(token);
}
}

