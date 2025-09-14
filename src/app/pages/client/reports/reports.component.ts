import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { SelectModule } from 'primeng/select';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ReportsService } from './reports.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, CalendarModule,
    SelectModule, ChartModule, CardModule, ToastModule
  ],
  providers: [MessageService],
  template: `
    <div class="grid">
      <!-- Filtros -->
      <div class="col-12">
        <div class="card">
          <h3>Reportes y Analytics</h3>
          <div class="grid">
            <div class="col-12 md:col-3">
              <label>Fecha Inicio</label>
              <p-calendar [(ngModel)]="startDate" dateFormat="yy-mm-dd" 
                          [showIcon]="true" class="w-full"></p-calendar>
            </div>
            <div class="col-12 md:col-3">
              <label>Fecha Fin</label>
              <p-calendar [(ngModel)]="endDate" dateFormat="yy-mm-dd" 
                          [showIcon]="true" class="w-full"></p-calendar>
            </div>
            <div class="col-12 md:col-3">
              <label>Tipo de Reporte</label>
              <p-select [options]="reportTypes" [(ngModel)]="selectedReportType"
                        optionLabel="label" optionValue="value" class="w-full"></p-select>
            </div>
            <div class="col-12 md:col-3">
              <label>&nbsp;</label>
              <div class="flex gap-2">
                <p-button label="Generar" (click)="generateReport()" 
                          [loading]="loading" class="flex-1"></p-button>
                <p-button icon="pi pi-download" (click)="exportReport()" 
                          pTooltip="Exportar" styleClass="p-button-outlined"></p-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- KPIs -->
      <div class="col-12 lg:col-3">
        <div class="card text-center">
          <div class="text-2xl font-bold text-blue-500">{{ stats.total_sales || 0 }}</div>
          <div class="text-muted">Ventas Totales</div>
        </div>
      </div>
      <div class="col-12 lg:col-3">
        <div class="card text-center">
          <div class="text-2xl font-bold text-green-500">{{ stats.total_revenue | currency:'USD':'symbol':'1.0-0' }}</div>
          <div class="text-muted">Ingresos</div>
        </div>
      </div>
      <div class="col-12 lg:col-3">
        <div class="card text-center">
          <div class="text-2xl font-bold text-purple-500">{{ stats.total_appointments || 0 }}</div>
          <div class="text-muted">Citas</div>
        </div>
      </div>
      <div class="col-12 lg:col-3">
        <div class="card text-center">
          <div class="text-2xl font-bold text-orange-500">{{ stats.total_clients || 0 }}</div>
          <div class="text-muted">Clientes</div>
        </div>
      </div>

      <!-- Gráficos -->
      <div class="col-12 lg:col-6">
        <div class="card">
          <h4>Ventas por Día</h4>
          <p-chart type="line" [data]="salesChartData" [options]="chartOptions"></p-chart>
        </div>
      </div>
      <div class="col-12 lg:col-6">
        <div class="card">
          <h4>Servicios Más Populares</h4>
          <p-chart type="doughnut" [data]="servicesChartData" [options]="doughnutOptions"></p-chart>
        </div>
      </div>

      <!-- Tabla de Datos -->
      <div class="col-12">
        <div class="card">
          <h4>{{ getReportTitle() }}</h4>
          <p-table [value]="reportData" [loading]="loading" [paginator]="true" 
                   [rows]="10" responsiveLayout="scroll">
            
            <!-- Ventas -->
            <ng-template pTemplate="header" *ngIf="selectedReportType === 'sales'">
              <tr>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Método de Pago</th>
                <th>Estado</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-item *ngIf="selectedReportType === 'sales'">
              <tr>
                <td>{{ item.date_time | date:'dd/MM/yyyy HH:mm' }}</td>
                <td>{{ item.client_name || 'Cliente Anónimo' }}</td>
                <td>{{ item.total | currency:'USD':'symbol':'1.2-2' }}</td>
                <td>{{ getPaymentMethodLabel(item.payment_method) }}</td>
                <td>{{ item.closed ? 'Cerrada' : 'Abierta' }}</td>
              </tr>
            </ng-template>

            <!-- Citas -->
            <ng-template pTemplate="header" *ngIf="selectedReportType === 'appointments'">
              <tr>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Servicio</th>
                <th>Estilista</th>
                <th>Estado</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-item *ngIf="selectedReportType === 'appointments'">
              <tr>
                <td>{{ item.date_time | date:'dd/MM/yyyy HH:mm' }}</td>
                <td>{{ item.client_name }}</td>
                <td>{{ item.service_name }}</td>
                <td>{{ item.stylist_name }}</td>
                <td>{{ item.status }}</td>
              </tr>
            </ng-template>

            <!-- Clientes -->
            <ng-template pTemplate="header" *ngIf="selectedReportType === 'clients'">
              <tr>
                <th>Cliente</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Total Gastado</th>
                <th>Última Visita</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-item *ngIf="selectedReportType === 'clients'">
              <tr>
                <td>{{ item.full_name }}</td>
                <td>{{ item.email }}</td>
                <td>{{ item.phone }}</td>
                <td>{{ item.total_spent | currency:'USD':'symbol':'1.2-2' }}</td>
                <td>{{ item.last_visit | date:'dd/MM/yyyy' }}</td>
              </tr>
            </ng-template>

            <!-- Empleados -->
            <ng-template pTemplate="header" *ngIf="selectedReportType === 'employees'">
              <tr>
                <th>Empleado</th>
                <th>Citas Completadas</th>
                <th>Ingresos Generados</th>
                <th>Comisiones</th>
                <th>Calificación</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-item *ngIf="selectedReportType === 'employees'">
              <tr>
                <td>{{ item.user_name }}</td>
                <td>{{ item.completed_appointments }}</td>
                <td>{{ item.revenue_generated | currency:'USD':'symbol':'1.2-2' }}</td>
                <td>{{ item.commissions | currency:'USD':'symbol':'1.2-2' }}</td>
                <td>{{ item.rating || 'N/A' }}</td>
              </tr>
            </ng-template>

            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="5" class="text-center">No hay datos para mostrar</td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      </div>
    </div>

    <p-toast></p-toast>
  `
})
export class ReportsComponent implements OnInit {
  startDate: Date | null = null;
  endDate: Date | null = null;
  selectedReportType = 'sales';
  loading = false;

  stats: any = {};
  reportData: any[] = [];
  salesChartData: any = {};
  servicesChartData: any = {};
  chartOptions: any = {};
  doughnutOptions: any = {};

  reportTypes = [
    { label: 'Ventas', value: 'sales' },
    { label: 'Citas', value: 'appointments' },
    { label: 'Clientes', value: 'clients' },
    { label: 'Empleados', value: 'employees' }
  ];

  constructor(
    private reportsService: ReportsService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    // Establecer fechas por defecto (último mes)
    this.endDate = new Date();
    this.startDate = new Date();
    this.startDate.setMonth(this.startDate.getMonth() - 1);

    this.initChartOptions();
    this.loadDashboardStats();
    this.generateReport();
  }

  initChartOptions() {
    this.chartOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    };

    this.doughnutOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    };
  }

  loadDashboardStats() {
    this.reportsService.getDashboardStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.updateCharts(stats);
      },
      error: () => console.error('Error loading dashboard stats')
    });
  }

  generateReport() {
    if (!this.startDate || !this.endDate) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Seleccione las fechas de inicio y fin'
      });
      return;
    }

    this.loading = true;
    const params = {
      start_date: this.startDate.toISOString().split('T')[0],
      end_date: this.endDate.toISOString().split('T')[0]
    };

    const reportMethod = this.getReportMethod();
    reportMethod(params).subscribe({
      next: (data) => {
        this.reportData = data.results || data;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al generar el reporte'
        });
        this.loading = false;
      }
    });
  }

  exportReport() {
    if (!this.startDate || !this.endDate) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Seleccione las fechas de inicio y fin'
      });
      return;
    }

    const params = {
      start_date: this.startDate.toISOString().split('T')[0],
      end_date: this.endDate.toISOString().split('T')[0]
    };

    this.reportsService.exportReport(this.selectedReportType, params).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_${this.selectedReportType}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al exportar el reporte'
        });
      }
    });
  }

  private getReportMethod() {
    switch (this.selectedReportType) {
      case 'sales':
        return (params: any) => this.reportsService.getSalesReport(params);
      case 'appointments':
        return (params: any) => this.reportsService.getAppointmentsReport(params);
      case 'clients':
        return (params: any) => this.reportsService.getClientsReport(params);
      case 'employees':
        return (params: any) => this.reportsService.getEmployeesReport(params);
      default:
        return (params: any) => this.reportsService.getSalesReport(params);
    }
  }

  getReportTitle(): string {
    const titles: any = {
      'sales': 'Reporte de Ventas',
      'appointments': 'Reporte de Citas',
      'clients': 'Reporte de Clientes',
      'employees': 'Reporte de Empleados'
    };
    return titles[this.selectedReportType] || 'Reporte';
  }

  getPaymentMethodLabel(method: string): string {
    const labels: any = {
      'cash': 'Efectivo',
      'card': 'Tarjeta',
      'transfer': 'Transferencia',
      'mixed': 'Mixto'
    };
    return labels[method] || method;
  }

  private updateCharts(stats: any) {
    // Gráfico de ventas por día (datos de ejemplo)
    this.salesChartData = {
      labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
      datasets: [{
        label: 'Ventas',
        data: [120, 190, 300, 500, 200, 300, 450],
        borderColor: '#42A5F5',
        backgroundColor: 'rgba(66, 165, 245, 0.1)',
        tension: 0.4
      }]
    };

    // Gráfico de servicios más populares (datos de ejemplo)
    this.servicesChartData = {
      labels: ['Corte', 'Barba', 'Coloración', 'Tratamiento'],
      datasets: [{
        data: [40, 30, 20, 10],
        backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#EF5350']
      }]
    };
  }
}