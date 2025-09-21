import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SystemConfigService } from '../../../core/services/system-config.service';

@Component({
  selector: 'app-maintenance-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isMaintenanceMode" class="maintenance-banner">
      <div class="flex align-items-center justify-content-center p-3 bg-orange-500 text-white">
        <i class="pi pi-exclamation-triangle mr-2"></i>
        <span class="font-semibold">Sistema en Modo Mantenimiento</span>
        <span class="ml-2">- Algunas funciones pueden estar limitadas</span>
      </div>
    </div>
  `,
  styles: [`
    .maintenance-banner {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 9999;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
  `]
})
export class MaintenanceBannerComponent implements OnInit {
  isMaintenanceMode = false;

  constructor(private systemConfig: SystemConfigService) {}

  ngOnInit() {
    this.systemConfig.config$.subscribe(config => {
      this.isMaintenanceMode = config?.maintenance_mode || false;
    });
  }
}