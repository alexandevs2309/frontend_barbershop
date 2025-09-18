import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ReportsService, DashboardStats, SalesReport, EmployeeReport } from './reports.service';
import { sanitizeForLog } from '../../../shared/utils/error.util';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule, FormsModule, CardModule, ChartModule, TableModule,
    ButtonModule, CalendarModule, SelectModule, ToastModule
  ],
  providers: [MessageService],
  styleUrl: './reports.component.scss',
  template: `
    <div class="grid">
      <!-- Header -->
      <div class="col-12">
        <div class="flex justify-content-between align-items-center mb-4">
          <h2 class="m-0">Dashboard y Reportes</h2>
          <div class="flex gap-2">
            <p-button label="Exportar Ventas" icon="pi pi-download" 
                      (click)="exportSalesReport()" styleClass="p-button-outlined"></p-button>
            <p-button label="Exportar Empleados" icon="pi pi-download" 
                      (click)="exportEmployeeReport()" styleClass="p-button-outlined"></p-button>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="col-12 md:col-3">
        <p-card styleClass="bg-blue-100">
          <div class="flex justify-content-between align-items-start">
            <div>
              <span class="block text-500 font-medium mb-3">Total Ventas</span>
              <div class="text-900 font-medium text-xl">{{ stats.totalSales }}</div>
              <div class="text-green-500 font-medium">{{ stats.totalRevenue | currency:'USD' }}</div>
            </div>
            <div class="flex align-items-center justify-content-center bg-blue-500 border-round" 
                 style="width:2.5rem;height:2.5rem">
              <i class="pi pi-shopping-cart text-blue-50 text-xl"></i>
            </div>
          </div>
        </p-card>
      </div>

      <div class="col-12 md:col-3">
        <p-card styleClass="bg-green-100">
          <div class="flex justify-content-between align-items-start">
            <div>
              <span class="block text-500 font-medium mb-3">Clientes</span>
              <div class="text-900 font-medium text-xl">{{ stats.totalClients }}</div>
              <div class="text-500 text-sm">Registrados</div>
            </div>
            <div class="flex align-items-center justify-content-center bg-green-500 border-round" 
                 style="width:2.5rem;height:2.5rem">
              <i class="pi pi-users text-green-50 text-xl"></i>
            </div>
          </div>
        </p-card>
      </div>

      <div class="col-12 md:col-3">
        <p-card styleClass="bg-orange-100">
          <div class="flex justify-content-between align-items-start">
            <div>
              <span class="block text-500 font-medium mb-3">Empleados</span>
              <div class="text-900 font-medium text-xl">{{ stats.totalEmployees }}</div>
              <div class="text-500 text-sm">Activos</div>
            </div>
            <div class="flex align-items-center justify-content-center bg-orange-500 border-round" 
                 style="width:2.5rem;height:2.5rem">
              <i class="pi pi-user-plus text-orange-50 text-xl"></i>
            </div>
          </div>
        </p-card>
      </div>

      <div class="col-12 md:col-3">
        <p-card styleClass="bg-purple-100">
          <div class="flex justify-content-between align-items-start">
            <div>
              <span class="block text-500 font-medium mb-3">Citas Pendientes</span>
              <div class="text-900 font-medium text-xl">{{ stats.pendingAppointments }}</div>
              <div class="text-500 text-sm">Por atender</div>
            </div>
            <div class="flex align-items-center justify-content-center bg-purple-500 border-round" 
                 style="width:2.5rem;height:2.5rem">
              <i class="pi pi-calendar text-purple-50 text-xl"></i>
            </div>
          </div>
        </p-card>
      </div>

      <!-- Charts Row -->
      <div class="col-12 lg:col-8">
        <p-card header="Ventas por Día">
          <div class="flex justify-content-between align-items-center mb-4">
            <div class="flex gap-2">
              <p-calendar [(ngModel)]="startDate" placeholder="Fecha inicio" 
                          (onSelect)="loadSalesReport()" dateFormat="yy-mm-dd"></p-calendar>
              <p-calendar [(ngModel)]="endDate" placeholder="Fecha fin" 
                          (onSelect)="loadSalesReport()" dateFormat="yy-mm-dd"></p-calendar>
            </div>
          </div>
          <p-chart type="line" [data]="salesChartData" [options]="chartOptions" height="300px"></p-chart>
        </p-card>
      </div>

      <div class="col-12 lg:col-4">
        <p-card header="Servicios Más Populares">
          <p-chart type="doughnut" [data]="servicesChartData" [options]="doughnutOptions" height="300px"></p-chart>
        </p-card>
      </div>

      <!-- Tables Row -->
      <div class="col-12 lg:col-6">
        <p-card header="Rendimiento de Empleados">
          <p-table [value]="employeeReport" [loading]="loadingEmployees">
            <ng-template pTemplate="header">
              <tr>
                <th>Empleado</th>
                <th>Servicios</th>
                <th>Ganancias</th>
                <th>Comisión Prom.</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-employee>
              <tr>
                <td>{{ employee.employee_name }}</td>
                <td>{{ employee.total_services }}</td>
                <td>{{ employee.total_earnings | currency:'USD' }}</td>
                <td>{{ employee.avg_commission | number:'1.1-1' }}%</td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="4" class="text-center">No hay datos de empleados</td>
              </tr>
            </ng-template>
          </p-table>
        </p-card>
      </div>

      <div class="col-12 lg:col-6">
        <p-card header="Resumen de Inventario">
          <div class="grid">
            <div class="col-6">
              <div class="text-center p-3 border-round bg-blue-50">
                <i class="pi pi-box text-blue-500 text-3xl mb-2 block"></i>
                <div class="text-2xl font-bold text-blue-800">{{ stats.totalProducts }}</div>
                <div class="text-blue-600">Total Productos</div>
              </div>
            </div>
            <div class="col-6">
              <div class="text-center p-3 border-round bg-red-50">
                <i class="pi pi-exclamation-triangle text-red-500 text-3xl mb-2 block"></i>
                <div class="text-2xl font-bold text-red-800">{{ stats.lowStockProducts }}</div>
                <div class="text-red-600">Stock Bajo</div>
              </div>
            </div>
            <div class="col-12 mt-3">
              <div class="text-center p-3 border-round bg-green-50">
                <i class="pi pi-list text-green-500 text-2xl mb-2 block"></i>
                <div class="text-xl font-bold text-green-800">{{ stats.totalServices }}</div>
                <div class="text-green-600">Servicios Disponibles</div>
              </div>
            </div>
          </div>
        </p-card>
      </div>

      <!-- Quick Actions -->
      <div class="col-12">
        <p-card header="Acciones Rápidas">
          <div class="flex flex-wrap gap-3">
            <p-button label="Ver Ganancias" icon="pi pi-money-bill" 
                      routerLink="/client/earnings" styleClass="p-button-success"></p-button>
            <p-button label="Gestionar Inventario" icon="pi pi-box" 
                      routerLink="/client/inventory" styleClass="p-button-info"></p-button>
            <p-button label="Nueva Cita" icon="pi pi-calendar-plus" 
                      routerLink="/client/appointments" styleClass="p-button-warning"></p-button>
            <p-button label="Abrir POS" icon="pi pi-shopping-cart" 
                      routerLink="/client/pos" styleClass="p-button-primary"></p-button>
          </div>
        </p-card>
      </div>
    </div>

    <p-toast></p-toast>
  `
})
export class ReportsComponent implements OnInit {
  stats: DashboardStats = {
    totalSales: 0,
    totalRevenue: 0,
    totalClients: 0,
    totalEmployees: 0,
    totalServices: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    pendingAppointments: 0
  };

  salesReport: SalesReport[] = [];
  employeeReport: EmployeeReport[] = [];
  topServices: any[] = [];

  startDate: Date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
  endDate: Date = new Date();

  loading = false;
  loadingEmployees = false;

  // Chart data
  salesChartData: any = {};
  servicesChartData: any = {};
  chartOptions: any = {};
  doughnutOptions: any = {};

  constructor(
    private reportsService: ReportsService,
    private messageService: MessageService
  ) {
    this.initChartOptions();
  }

  ngOnInit() {
    this.loadDashboardStats();
    this.loadSalesReport();
    this.loadEmployeeReport();
    this.loadTopServices();
  }

  loadDashboardStats() {
    this.loading = true;
    this.reportsService.getDashboardStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', sanitizeForLog(error));
        this.showError('Error al cargar estadísticas');
        this.loading = false;
      }
    });
  }

  loadSalesReport() {
    const startDate = this.formatDate(this.startDate);
    const endDate = this.formatDate(this.endDate);

    this.reportsService.getSalesReport(startDate, endDate).subscribe({
      next: (report) => {
        this.salesReport = report;
        this.updateSalesChart();
      },
      error: (error) => {
        console.error('Error loading sales report:', sanitizeForLog(error));
        this.showError('Error al cargar reporte de ventas');
      }
    });
  }

  loadEmployeeReport() {
    this.loadingEmployees = true;
    this.reportsService.getEmployeeReport().subscribe({
      next: (report) => {
        this.employeeReport = report;
        this.loadingEmployees = false;
      },
      error: (error) => {
        console.error('Error loading employee report:', sanitizeForLog(error));
        this.showError('Error al cargar reporte de empleados');
        this.loadingEmployees = false;
      }
    });
  }

  loadTopServices() {
    this.reportsService.getTopServices().subscribe({
      next: (services) => {
        this.topServices = services;
        this.updateServicesChart();
      },
      error: (error) => {
        console.error('Error loading top services:', sanitizeForLog(error));
        this.showError('Error al cargar servicios populares');
      }
    });
  }

  updateSalesChart() {
    this.salesChartData = {
      labels: this.salesReport.map(r => new Date(r.period).toLocaleDateString()),
      datasets: [
        {
          label: 'Ventas',
          data: this.salesReport.map(r => r.sales),
          borderColor: '#42A5F5',
          backgroundColor: 'rgba(66, 165, 245, 0.1)',
          tension: 0.4
        },
        {
          label: 'Ingresos',
          data: this.salesReport.map(r => r.revenue),
          borderColor: '#66BB6A',
          backgroundColor: 'rgba(102, 187, 106, 0.1)',
          tension: 0.4,
          yAxisID: 'y1'
        }
      ]
    };
  }

  updateServicesChart() {
    this.servicesChartData = {
      labels: this.topServices.map(s => s.name),
      datasets: [{
        data: this.topServices.map(s => s.count),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
      }]
    };
  }

  initChartOptions() {
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          position: 'left'
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          grid: {
            drawOnChartArea: false
          }
        }
      },
      plugins: {
        legend: {
          position: 'top'
        }
      }
    };

    this.doughnutOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    };
  }

  exportSalesReport() {
    if (this.salesReport.length === 0) {
      this.showWarn('No hay datos de ventas para exportar');
      return;
    }
    
    this.reportsService.exportReport('sales', this.salesReport);
    this.showSuccess('Reporte de ventas exportado');
  }

  exportEmployeeReport() {
    if (this.employeeReport.length === 0) {
      this.showWarn('No hay datos de empleados para exportar');
      return;
    }
    
    this.reportsService.exportReport('employees', this.employeeReport);
    this.showSuccess('Reporte de empleados exportado');
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private showSuccess(message: string) {
    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: message });
  }

  private showError(message: string) {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
  }

  private showWarn(message: string) {
    this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: message });
  }
}