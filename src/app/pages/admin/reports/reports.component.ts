import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';
import { TagModule } from 'primeng/tag';
import { ReportsService, DashboardMetrics, SalesReport } from './reports.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    CalendarModule,
    TabViewModule,
    TableModule,
    ChartModule,
    TagModule
  ],
  template: `
   <div class="grid gap-3">
  <!-- Filtros de Fecha -->
  <div class="col-12">
    <p-card header="Filtros" styleClass="shadow-1 surface-card border-round">
      <div class="grid gap-3">
        <div class="col-12 md:col-4">
          <label>Fecha Inicio</label>
          <p-calendar
            [(ngModel)]="startDate"
            dateFormat="yy-mm-dd"
            placeholder="Fecha inicio"
            class="w-full">
          </p-calendar>
        </div>
        <div class="col-12 md:col-4">
          <label>Fecha Fin</label>
          <p-calendar
            [(ngModel)]="endDate"
            dateFormat="yy-mm-dd"
            placeholder="Fecha fin"
            class="w-full">
          </p-calendar>
        </div>
        <div class="col-12 md:col-4 flex align-items-end">
          <p-button
            label="Actualizar"
            icon="pi pi-refresh"
            (onClick)="generateReport()"
            class="w-full">
          </p-button>
        </div>
      </div>
    </p-card>
  </div>

  <!-- TabView para Reportes -->
  <div class="col-12">
    <p-tabView (onChange)="onTabChange($event)">
      <!-- Dashboard -->
      <p-tabPanel header="Dashboard SaaS" leftIcon="pi pi-home" [selected]="true">
        <ng-container *ngIf="selectedReportType === 'admin_dashboard' && dashboardData">
          <div class="grid gap-3">
            <div class="col-12 md:col-3">
              <p-card styleClass="shadow-1 border-round relative overflow-hidden surface-card">
                <i class="pi pi-dollar absolute right-3 top-3 text-5xl opacity-20 text-primary"></i>
                <div class="text-center p-3">
                  <div class="text-3xl font-bold text-primary">
                    {{ dashboardData.totals.revenue | currency:'USD':'symbol':'1.0-0' }}
                  </div>
                  <div class="text-sm text-600">Ingresos Totales</div>
                </div>
              </p-card>
            </div>
            <div class="col-12 md:col-3">
              <p-card styleClass="shadow-1 border-round relative overflow-hidden surface-card">
                <i class="pi pi-building absolute right-3 top-3 text-5xl opacity-20 text-green-500"></i>
                <div class="text-center p-3">
                  <div class="text-3xl font-bold text-green-500">{{ dashboardData.totals.tenants }}</div>
                  <div class="text-sm text-600">Tenants Activos</div>
                </div>
              </p-card>
            </div>
            <div class="col-12 md:col-3">
              <p-card styleClass="shadow-1 border-round relative overflow-hidden surface-card">
                <i class="pi pi-users absolute right-3 top-3 text-5xl opacity-20 text-blue-500"></i>
                <div class="text-center p-3">
                  <div class="text-3xl font-bold text-blue-500">{{ dashboardData.totals.users }}</div>
                  <div class="text-sm text-600">Total Usuarios</div>
                </div>
              </p-card>
            </div>
            <div class="col-12 md:col-3">
              <p-card styleClass="shadow-1 border-round relative overflow-hidden surface-card">
                <i class="pi pi-id-card absolute right-3 top-3 text-5xl opacity-20 text-orange-500"></i>
                <div class="text-center p-3">
                  <div class="text-3xl font-bold text-orange-500">{{ dashboardData.totals.subscriptions }}</div>
                  <div class="text-sm text-600">Suscripciones Activas</div>
                </div>
              </p-card>
            </div>
          </div>
        </ng-container>
      </p-tabPanel>

      <!-- Ingresos -->
      <p-tabPanel header="Ingresos" leftIcon="pi pi-dollar">
        <ng-container *ngIf="selectedReportType === 'subscription_revenue'">
          <p-card header="Ingresos por Suscripciones - Últimos 12 Meses" styleClass="shadow-1 surface-card border-round" *ngIf="chartData">
            <p-chart type="line" [data]="chartData" [options]="chartOptions"></p-chart>
          </p-card>
        </ng-container>
      </p-tabPanel>

      <!-- Crecimiento -->
      <p-tabPanel header="Crecimiento" leftIcon="pi pi-chart-line">
        <ng-container *ngIf="selectedReportType === 'tenant_growth'">
          <p-card header="Crecimiento de Tenants - Últimos 12 Meses" styleClass="shadow-1 surface-card border-round" *ngIf="chartData">
            <p-chart type="line" [data]="chartData" [options]="chartOptions"></p-chart>
          </p-card>
        </ng-container>
      </p-tabPanel>

      <!-- Churn -->
      <p-tabPanel header="Churn" leftIcon="pi pi-exclamation-triangle">
        <ng-container *ngIf="selectedReportType === 'churn_analysis' && churnData">
          <p-card header="Análisis de Churn" styleClass="shadow-1 surface-card border-round">
            <div class="grid gap-3">
              <div class="col-12 md:col-3 text-center">
                <div class="text-3xl font-bold">{{ churnData.total_tenants }}</div>
                <div class="text-sm text-600">Total Tenants</div>
              </div>
              <div class="col-12 md:col-3 text-center">
                <div class="text-3xl font-bold text-green-500">{{ churnData.active_tenants }}</div>
                <div class="text-sm text-600">Activos</div>
              </div>
              <div class="col-12 md:col-3 text-center">
                <div class="text-3xl font-bold text-red-500">{{ churnData.inactive_tenants }}</div>
                <div class="text-sm text-600">Inactivos</div>
              </div>
              <div class="col-12 md:col-3 text-center">
                <div class="text-3xl font-bold text-orange-500">{{ churnData.churn_rate }}%</div>
                <div class="text-sm text-600">Tasa de Churn</div>
              </div>
            </div>
          </p-card>
        </ng-container>
      </p-tabPanel>

      <!-- Planes -->
      <p-tabPanel header="Planes" leftIcon="pi pi-tags">
        <ng-container *ngIf="selectedReportType === 'plan_usage' && planUsageData">
          <p-card header="Distribución por Plan" styleClass="shadow-1 surface-card border-round">
            <div class="grid gap-2">
              <div class="col-12 md:col-6" *ngFor="let plan of planUsageData.plan_usage">
                <div class="flex justify-content-between align-items-center p-3 border-1 border-200 border-round mb-2">
                  <span class="font-semibold">{{ plan.name }}</span>
                  <p-tag [value]="plan.active_subscriptions + ' suscripciones'" severity="info"></p-tag>
                </div>
              </div>
            </div>
          </p-card>
        </ng-container>
      </p-tabPanel>

      <!-- Usuarios -->
      <p-tabPanel header="Usuarios" leftIcon="pi pi-users">
        <ng-container *ngIf="selectedReportType === 'user_activity' && userActivityData">
          <p-card header="Actividad de Usuarios" styleClass="shadow-1 surface-card border-round">
            <div class="grid gap-3">
              <div class="col-12 md:col-3 text-center">
                <div class="text-3xl font-bold text-blue-500">{{ userActivityData.active_today }}</div>
                <div class="text-sm text-600">Activos Hoy</div>
              </div>
              <div class="col-12 md:col-3 text-center">
                <div class="text-3xl font-bold text-green-500">{{ userActivityData.active_week }}</div>
                <div class="text-sm text-600">Activos esta Semana</div>
              </div>
              <div class="col-12 md:col-3 text-center">
                <div class="text-3xl font-bold">{{ userActivityData.total_users }}</div>
                <div class="text-sm text-600">Total Usuarios</div>
              </div>
              <div class="col-12 md:col-3 text-center">
                <div class="text-3xl font-bold text-primary">{{ userActivityData.activity_rate }}%</div>
                <div class="text-sm text-600">Tasa de Actividad</div>
              </div>
            </div>
          </p-card>
        </ng-container>
      </p-tabPanel>
    </p-tabView>
  </div>

  <!-- Sales Report -->
  <div class="col-12" *ngIf="selectedReportType === 'sales' && salesData">
    <div class="grid gap-3">
      <div class="col-12 md:col-4">
        <p-card header="Resumen de Ventas" styleClass="shadow-1 surface-card border-round">
          <div class="text-center">
            <div class="text-2xl font-bold">{{ salesData.summary.total_amount | currency:'USD':'symbol':'1.0-0' }}</div>
            <div class="text-sm text-600">Total Vendido</div>
            <div class="mt-2">
              <div class="text-lg">{{ salesData.summary.total_count }}</div>
              <div class="text-xs text-600">Número de Ventas</div>
            </div>
          </div>
        </p-card>
      </div>

      <div class="col-12 md:col-4">
        <p-card header="Por Método de Pago" styleClass="shadow-1 surface-card border-round">
          <div *ngFor="let method of salesData.by_payment_method" class="flex justify-content-between align-items-center mb-2">
            <span class="capitalize">{{ getPaymentMethod(method.payment_method) }}</span>
            <p-tag [value]="formatCurrencyForTag(method.total)" severity="info"></p-tag>
          </div>
        </p-card>
      </div>

      <div class="col-12 md:col-4">
        <p-card header="Top Empleados" styleClass="shadow-1 surface-card border-round">
          <div *ngFor="let emp of getTopEmployees()" class="flex justify-content-between align-items-center mb-2">
            <span>{{ getEmployeeName(emp.user__full_name) }}</span>
            <p-tag [value]="formatCurrencyForTag(emp.total)" severity="success"></p-tag>
          </div>
        </p-card>
      </div>

      <div class="col-12" *ngIf="chartData">
        <p-card header="Ventas Diarias" styleClass="shadow-1 surface-card border-round">
          <p-chart type="line" [data]="chartData" [options]="chartOptions"></p-chart>
        </p-card>
      </div>
    </div>
  </div>

  <!-- Loading -->
  <div class="col-12" *ngIf="loading">
    <p-card styleClass="shadow-1 surface-card border-round">
      <div class="text-center">
        <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
        <div class="mt-2">Generando reporte...</div>
      </div>
    </p-card>
  </div>

  <!-- No Data -->
  <div class="col-12" *ngIf="!loading && !dashboardData && !salesData && selectedReportType">
    <p-card styleClass="shadow-1 surface-card border-round">
      <div class="text-center text-600">
        <i class="pi pi-info-circle" style="font-size: 2rem"></i>
        <div class="mt-2">No hay datos disponibles para el período seleccionado</div>
      </div>
    </p-card>
  </div>
</div>

  `
})
export class ReportsComponent implements OnInit {
  selectedReportType: string = 'admin_dashboard';
  startDate: Date | undefined = undefined;
  endDate: Date | undefined = undefined;
  loading = false;

  dashboardData: DashboardMetrics | null = null;
  salesData: SalesReport | null = null;
  chartData: any = null;
  chartOptions: any = {};
  churnData: any = null;
  planUsageData: any = null;
  userActivityData: any = null;

  tabReports = [
    { type: 'admin_dashboard', index: 0 },
    { type: 'subscription_revenue', index: 1 },
    { type: 'tenant_growth', index: 2 },
    { type: 'churn_analysis', index: 3 },
    { type: 'plan_usage', index: 4 },
    { type: 'user_activity', index: 5 }
  ];

  constructor(private reportsService: ReportsService) {
    this.initChartOptions();
  }

  ngOnInit() {
    this.generateReport();
  }

  onTabChange(event: any) {
    const reportType = this.tabReports[event.index]?.type;
    if (reportType) {
      this.selectedReportType = reportType;
      this.generateReport();
    }
  }

  generateReport() {
    this.loading = true;
    this.clearData();

    const query: any = {
      type: this.selectedReportType
    };

    if (this.startDate) {
      query.start_date = this.formatDate(this.startDate);
    }
    if (this.endDate) {
      query.end_date = this.formatDate(this.endDate);
    }

    this.reportsService.getReport(query).subscribe({
      next: (data) => {
        this.handleReportData(data);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error generating report:', error);
        this.loading = false;
      }
    });
  }

  private handleReportData(data: any) {
    switch (this.selectedReportType) {
      case 'admin_dashboard':
        this.dashboardData = data;
        break;
      case 'subscription_revenue':
        this.generateRevenueChart(data);
        break;
      case 'tenant_growth':
        this.generateGrowthChart(data);
        break;
      case 'churn_analysis':
        this.churnData = data;
        break;
      case 'plan_usage':
        this.planUsageData = data;
        break;
      case 'user_activity':
        this.userActivityData = data;
        break;
      case 'sales':
        this.salesData = data;
        this.generateSalesChart(data);
        break;
    }
  }

  private generateSalesChart(salesData: SalesReport) {
    if (!salesData.daily_sales || salesData.daily_sales.length === 0) return;

    this.chartData = {
      labels: salesData.daily_sales.map(d => d.day),
      datasets: [
        {
          label: 'Ventas Diarias',
          data: salesData.daily_sales.map(d => d.total),
          borderColor: '#42A5F5',
          backgroundColor: 'rgba(66, 165, 245, 0.1)',
          tension: 0.4
        }
      ]
    };
  }

  private generateRevenueChart(data: any) {
    this.chartData = {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
      datasets: [
        {
          label: 'Ingresos por Suscripciones',
          data: data.monthly_revenue || new Array(12).fill(0),
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          tension: 0.4
        }
      ]
    };
  }

  private generateGrowthChart(data: any) {
    this.chartData = {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
      datasets: [
        {
          label: 'Nuevos Tenants',
          data: data.monthly_tenants || new Array(12).fill(0),
          borderColor: '#FF9800',
          backgroundColor: 'rgba(255, 152, 0, 0.1)',
          tension: 0.4
        }
      ]
    };
  }

  private initChartOptions() {
    this.chartOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value: any) {
              return '$' + value.toLocaleString();
            }
          }
        }
      }
    };
  }

  private clearData() {
    this.dashboardData = null;
    this.salesData = null;
    this.chartData = null;
    this.churnData = null;
    this.planUsageData = null;
    this.userActivityData = null;
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Helper methods para evitar errores de TypeScript
  getPaymentMethod(method: string | null | undefined): string {
    return method || 'N/A';
  }

  getEmployeeName(name: string | null | undefined): string {
    return name || 'N/A';
  }

  getTopEmployees(): any[] {
    if (!this.salesData?.by_employee) return [];
    return this.salesData.by_employee.slice(0, 5);
  }

  formatCurrencyForTag(value: number | null | undefined): string {
    const amount = value || 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  getChartTitle(): string {
    const titles: { [key: string]: string } = {
      'subscription_revenue': 'Ingresos por Suscripciones - Últimos 12 Meses',
      'tenant_growth': 'Crecimiento de Tenants - Últimos 12 Meses',
      'plan_usage': 'Uso por Plan de Suscripción',
      'user_activity': 'Actividad de Usuarios'
    };
    return titles[this.selectedReportType] || 'Gráfico';
  }
}
