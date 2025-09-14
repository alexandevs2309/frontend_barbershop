import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment';

export interface SystemSettings {
  id?: number;
  platform_name: string;
  support_email: string;
  maintenance_mode: boolean;
  default_currency: string;
  max_tenants: number;
  backup_frequency: string;
  email_notifications: boolean;
  auto_suspend_expired: boolean;
  trial_days: number;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SystemSettingsService {
  private apiUrl = `${environment.apiUrl}/system-settings`;

  constructor(private http: HttpClient) {}

  getSettings(): Observable<SystemSettings> {
    return this.http.get<SystemSettings>(`${this.apiUrl}/`);
  }

  updateSettings(settings: Partial<SystemSettings>): Observable<SystemSettings> {
    return this.http.put<SystemSettings>(`${this.apiUrl}/`, settings);
  }

  resetToDefaults(): Observable<SystemSettings> {
    return this.http.post<SystemSettings>(`${this.apiUrl}/reset/`, {});
  }
}