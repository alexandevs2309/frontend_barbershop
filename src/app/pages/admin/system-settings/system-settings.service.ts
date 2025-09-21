import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment';

export interface SystemSettings {
  id?: number;
  
  // Configuración General
  platform_name: string;
  support_email: string;
  
  // Configuración de Clientes
  max_tenants: number;
  trial_days: number;
  default_currency: string;
  
  // Configuración de Plataforma
  platform_domain: string;
  supported_languages: string[];
  platform_commission_rate: number;
  
  // Límites por Plan
  basic_plan_max_employees: number;
  premium_plan_max_employees: number;
  enterprise_plan_max_employees: number;
  
  // Integraciones Globales
  stripe_enabled: boolean;
  paypal_enabled: boolean;
  twilio_enabled: boolean;
  sendgrid_enabled: boolean;
  aws_s3_enabled: boolean;
  
  // Preferencias del Sistema
  maintenance_mode: boolean;
  email_notifications: boolean;
  auto_suspend_expired: boolean;
  
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