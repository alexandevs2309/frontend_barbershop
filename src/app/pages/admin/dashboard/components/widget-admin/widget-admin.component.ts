import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from "primeng/table";
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { DashboardService } from '../../dashboard.service';

@Component({
  selector: 'app-widget-admin',
  imports: [CommonModule, TableModule, ButtonModule, RouterModule],
  template: `
  <!-- Tarjetas de resumen -->
  <div class="col-span-12 lg:col-span-6 xl:col-span-3" *ngFor="let card of summaryCards">
    <div class="card mb-0">
      <div class="flex justify-between mb-4">
        <div>
          <span class="block text-muted-color font-medium mb-4">{{card.title}}</span>
          <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{card.value}}</div>
        </div>
        <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
          <i [ngClass]="card.icon + ' text-blue-500 text-xl'"></i>
        </div>
      </div>
      <span class="text-primary font-medium">24 new </span>
      <span class="text-muted-color">since last visit</span>
    </div>
  </div>

  <!-- Botones de acceso rápido -->
  <div class="col-span-12">
    <div class="card">
      <h5 class="mb-4">Acceso Rápido</h5>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button *ngFor="let item of quickAccess"
          pButton
          [icon]="item.icon"
          [label]="item.label"
          class="p-button-outlined"
          (click)="item.command()">
        </button>
      </div>
    </div>
  </div>
  `
})
export class WidgetAdminComponent implements OnInit {
  loading = true;
  summaryCards: any[] = [];

  quickAccess = [
    { label: 'Ver Logs', icon: 'pi pi-eye', command: () => this.router.navigate(['/admin/audit-log']) },
    { label: 'Crear Plan', icon: 'pi pi-plus', command: () => this.router.navigate(['/admin/plans']) },
    { label: 'Usuarios', icon: 'pi pi-users', command: () => this.router.navigate(['/admin/users']) },
    { label: 'Tenants', icon: 'pi pi-briefcase', command: () => this.router.navigate(['/admin/tenants']) }
  ];

  constructor(private router: Router, private dashboardService: DashboardService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    console.log('Cargando datos del dashboard...');
    this.dashboardService.getDashboardStats().subscribe({
      next: (stats) => {
        console.log('Datos recibidos:', stats);
        this.summaryCards = [
          { title: 'Tenants', value: stats.totals.tenants || 0, icon: 'pi pi-building', color: 'linear-gradient(to right, #00b09b, #96c93d)' },
          { title: 'Usuarios', value: stats.totals.users || 0, icon: 'pi pi-users', color: 'linear-gradient(to right, #396afc, #2948ff)' },
          { title: 'Ingresos', value: `$${stats.totals.revenue || 0}`, icon: 'pi pi-dollar', color: 'linear-gradient(to right, #f7971e, #ffd200)' },
          { title: 'Suscripciones', value: stats.totals.subscriptions || 0, icon: 'pi pi-id-card', color: 'linear-gradient(to right, #e53935, #e35d5b)' }
        ];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.summaryCards = [
          { title: 'Tenants', value: 0, icon: 'pi pi-building', color: 'linear-gradient(to right, #00b09b, #96c93d)' },
          { title: 'Usuarios', value: 0, icon: 'pi pi-users', color: 'linear-gradient(to right, #396afc, #2948ff)' },
          { title: 'Ingresos', value: '$0', icon: 'pi pi-dollar', color: 'linear-gradient(to right, #f7971e, #ffd200)' },
          { title: 'Suscripciones', value: 0, icon: 'pi pi-id-card', color: 'linear-gradient(to right, #e53935, #e35d5b)' }
        ];
        this.loading = false;
      }
    });
  }
}
