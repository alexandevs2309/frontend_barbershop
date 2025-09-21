import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SystemSettingsService, SystemSettings } from '../../pages/admin/system-settings/system-settings.service';

@Injectable({
  providedIn: 'root'
})
export class SystemConfigService {
  private configSubject = new BehaviorSubject<SystemSettings | null>(null);
  public config$ = this.configSubject.asObservable();

  constructor(private systemSettingsService: SystemSettingsService) {
    this.loadConfig();
  }

  private loadConfig() {
    this.systemSettingsService.getSettings().subscribe({
      next: (config) => this.configSubject.next(config),
      error: () => this.configSubject.next(null)
    });
  }

  refreshConfig() {
    this.loadConfig();
  }

  get config(): SystemSettings | null {
    return this.configSubject.value;
  }

  isMaintenanceMode(): boolean {
    return this.config?.maintenance_mode || false;
  }

  getPlatformName(): string {
    return this.config?.platform_name || 'BarberSaaS';
  }

  getMaxTenants(): number {
    return this.config?.max_tenants || 100;
  }

  isStripeEnabled(): boolean {
    return this.config?.stripe_enabled || false;
  }
}