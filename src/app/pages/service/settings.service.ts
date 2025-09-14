import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment';

export interface Branch {
  id: number;
  name: string;
  address?: string;
}

export interface Setting {
  id?: number;
  branch: number;
  business_name: string;
  business_email?: string;
  phone_number?: string;
  address?: string;
  currency: string;
  tax_percentage: number;
  timezone: string;
  business_hours: any;
  preferences: any;
  logo?: string;
  theme: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private apiUrl = `${environment.apiUrl}/settings`;

  constructor(private http: HttpClient) {}

  getBranches(): Observable<Branch[]> {
    return this.http.get<Branch[]>(`${this.apiUrl}/branches/`);
  }

  createBranch(branch: Partial<Branch>): Observable<Branch> {
    return this.http.post<Branch>(`${this.apiUrl}/branches/`, branch);
  }

  getSettings(branchId: number): Observable<Setting> {
    return this.http.get<Setting>(`${this.apiUrl}/?branch=${branchId}`);
  }

  updateSettings(branchId: number, settings: Partial<Setting>): Observable<Setting> {
    return this.http.put<Setting>(`${this.apiUrl}/?branch=${branchId}`, settings);
  }

  createSettings(settings: Partial<Setting>): Observable<Setting> {
    return this.http.post<Setting>(`${this.apiUrl}/settings/`, settings);
  }

  exportSettings(branchId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/export/?branch=${branchId}`);
  }

  importSettings(config: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/import/`, config);
  }

  getAuditLogs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/audit-logs/`);
  }
}
