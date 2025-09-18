import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { MessageService } from 'primeng/api';
import { EarningsService, Earning, FortnightSummary } from './earnings.service';
import { EmployeesService } from '../employees/employees.service';

@Component({
  selector: 'app-earnings',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, DialogModule,
    CalendarModule, SelectModule, ToastModule, TagModule, CardModule, ChartModule
  ],
  providers: [MessageService],
  styleUrl: './earnings.component.scss',
  template: `
    <div class="grid">
      <!-- Header con estadísticas -->
      <div class="col-12">
        <div class="flex justify-content-between align-items-center mb-4">
          <h2 class="m-0">Gestión de Ganancias</h2>
          <div class="flex gap-2">
            <p-button label="Generar Quincena" icon="pi pi-plus" 
                      (click)="showGenerateDialog()" 
                      styleClass="p-button-success"></p-button>
          </div>
        </div>
      </div>

      <!-- Cards de estadísticas -->
      <div class="col-12 md:col-3">
        <p-card styleClass="bg-blue-100">
          <div class="flex justify-content-between align-items-start">
            <div>
              <span class="block text-500 font-medium mb-3">Total Ganancias</span>
              <div class="text-900 font-medium text-xl">{{ totalEarnings | currency:'USD':'symbol':'1.0-0' }}</div>
            </div>
            <div class="flex align-items-center justify-content-center bg-blue-500 border-round" 
                 style="width:2.5rem;height:2.5rem">
              <i class="pi pi-dollar text-blue-50 text-xl"></i>
            </div>
          </div>
        </p-card>
      </div>

      <div class="col-12 md:col-3">
        <p-card styleClass="bg-green-100">
          <div class="flex justify-content-between align-items-start">
            <div>
              <span class="block text-500 font-medium mb-3">Este Mes</span>
              <div class="text-900 font-medium text-xl">{{ monthlyEarnings | currency:'USD':'symbol':'1.0-0' }}</div>
            </div>
            <div class="flex align-items-center justify-content-center bg-green-500 border-round" 
                 style="width:2.5rem;height:2.5rem">
              <i class="pi pi-calendar text-green-50 text-xl"></i>
            </div>
          </div>
        </p-card>
      </div>

      <div class="col-12 md:col-3">
        <p-card styleClass="bg-orange-100">
          <div class="flex justify-content-between align-items-start">
            <div>
              <span class="block text-500 font-medium mb-3">Pendientes</span>
              <div class="text-900 font-medium text-xl">{{ pendingPayments | currency:'USD':'symbol':'1.0-0' }}</div>
            </div>
            <div class="flex align-items-center justify-content-center bg-orange-500 border-round" 
                 style="width:2.5rem;height:2.5rem">
              <i class="pi pi-clock text-orange-50 text-xl"></i>
            </div>
          </div>
        </p-card>
      </div>

      <div class="col-12 md:col-3">
        <p-card styleClass="bg-purple-100">
          <div class="flex justify-content-between align-items-start">
            <div>
              <span class="block text-500 font-medium mb-3">Empleados Activos</span>
              <div class="text-900 font-medium text-xl">{{ activeEmployees }}</div>
            </div>
            <div class="flex align-items-center justify-content-center bg-purple-500 border-round" 
                 style="width:2.5rem;height:2.5rem">
              <i class="pi pi-users text-purple-50 text-xl"></i>
            </div>
          </div>
        </p-card>
      </div>

      <!-- Filtros -->
      <div class="col-12">
        <p-card>
          <div class="formgrid grid">
            <div class="field col-12 md:col-4">
              <label for="employee">Empleado</label>
              <p-select [options]="employees" [(ngModel)]="selectedEmployee"
                        optionLabel="user" optionValue="id" placeholder="Todos los empleados"
                        (onChange)="filterEarnings()" class="w-full">
              </p-select>
            </div>
            <div class="field col-12 md:col-4">
              <label for="startDate">Fecha Inicio</label>
              <p-calendar [(ngModel)]="startDate" dateFormat="yy-mm-dd"
                          (onSelect)="filterEarnings()" class="w-full"></p-calendar>
            </div>
            <div class="field col-12 md:col-4">
              <label for="endDate">Fecha Fin</label>
              <p-calendar [(ngModel)]="endDate" dateFormat="yy-mm-dd"
                          (onSelect)="filterEarnings()" class="w-full"></p-calendar>
            </div>
          </div>
        </p-card>
      </div>

      <!-- Tabla de ganancias individuales -->
      <div class="col-12 lg:col-8">
        <p-card header="Ganancias Detalladas">
          <p-table [value]="filteredEarnings" [loading]="loading" 
                   [paginator]="true" [rows]="10" responsiveLayout="scroll">
            <ng-template pTemplate="header">
              <tr>
                <th>Empleado</th>
                <th>Servicio</th>
                <th>Comisión %</th>
                <th>Ganancia</th>
                <th>Fecha</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-earning>
              <tr>
                <td>{{ earning.employee_name }}</td>
                <td>{{ earning.service_name }}</td>
                <td>{{ earning.commission_percentage }}%</td>
                <td>{{ earning.commission_amount | currency:'USD':'symbol':'1.2-2' }}</td>
                <td>{{ earning.date | date:'dd/MM/yyyy' }}</td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="5" class="text-center">No hay ganancias registradas</td>
              </tr>
            </ng-template>
          </p-table>
        </p-card>
      </div>

      <!-- Gráfico de ganancias -->
      <div class="col-12 lg:col-4">
        <p-card header="Ganancias por Empleado">
          <p-chart type="doughnut" [data]="chartData" [options]="chartOptions"></p-chart>
        </p-card>
      </div>

      <!-- Resúmenes quincenales -->
      <div class="col-12">
        <p-card header="Resúmenes Quincenales">
          <p-table [value]="fortnightSummaries" [loading]="loadingSummaries" responsiveLayout="scroll">
            <ng-template pTemplate="header">
              <tr>
                <th>Empleado</th>
                <th>Período</th>
                <th>Ventas</th>
                <th>Servicios</th>
                <th>Total Comisión</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-summary>
              <tr>
                <td>{{ summary.employee_name }}</td>
                <td>{{ summary.start_date | date:'dd/MM' }} - {{ summary.end_date | date:'dd/MM/yyyy' }}</td>
                <td>{{ summary.total_sales }}</td>
                <td>{{ summary.services_count }}</td>
                <td>{{ summary.total_commission | currency:'USD':'symbol':'1.2-2' }}</td>
                <td>
                  <p-tag [value]="summary.is_paid ? 'Pagado' : 'Pendiente'"
                         [severity]="summary.is_paid ? 'success' : 'warning'"></p-tag>
                </td>
                <td>
                  <p-button *ngIf="!summary.is_paid" icon="pi pi-check" 
                            (click)="markAsPaid(summary)"
                            pTooltip="Marcar como pagado" 
                            styleClass="p-button-rounded p-button-success p-button-text"></p-button>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </p-card>
      </div>
    </div>

    <!-- Dialog para generar quincena -->
    <p-dialog [(visible)]="showGenerate" [modal]="true" [style]="{width: '400px'}"
              header="Generar Resumen Quincenal" [closable]="true">
      <div class="formgrid grid">
        <div class="field col-12">
          <label for="employee">Empleado *</label>
          <p-select [options]="employees" [(ngModel)]="generateForm.employee"
                    optionLabel="user" optionValue="id" placeholder="Seleccionar empleado"
                    class="w-full"></p-select>
        </div>
        <div class="field col-12">
          <label for="startDate">Fecha Inicio *</label>
          <p-calendar [(ngModel)]="generateForm.startDate" dateFormat="yy-mm-dd"
                      class="w-full"></p-calendar>
        </div>
        <div class="field col-12">
          <label for="endDate">Fecha Fin *</label>
          <p-calendar [(ngModel)]="generateForm.endDate" dateFormat="yy-mm-dd"
                      class="w-full"></p-calendar>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <div class="flex justify-content-end gap-2">
          <p-button label="Cancelar" icon="pi pi-times"
                    (click)="showGenerate = false" styleClass="p-button-text"></p-button>
          <p-button label="Generar" icon="pi pi-check"
                    (click)="generateSummary()" [loading]="generating"></p-button>
        </div>
      </ng-template>
    </p-dialog>

    <p-toast></p-toast>
  `
})
export class EarningsComponent implements OnInit {
  earnings: Earning[] = [];
  filteredEarnings: Earning[] = [];
  fortnightSummaries: FortnightSummary[] = [];
  employees: any[] = [];
  
  selectedEmployee: number | null = null;
  startDate: Date | null = null;
  endDate: Date | null = null;
  
  loading = false;
  loadingSummaries = false;
  showGenerate = false;
  generating = false;
  
  // Estadísticas
  totalEarnings = 0;
  monthlyEarnings = 0;
  pendingPayments = 0;
  activeEmployees = 0;
  
  // Gráfico
  chartData: any;
  chartOptions: any;
  
  // Formulario de generación
  generateForm = {
    employee: null,
    startDate: null,
    endDate: null
  };

  constructor(
    private earningsService: EarningsService,
    private employeesService: EmployeesService,
    private messageService: MessageService
  ) {
    this.initChart();
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loadEmployees();
    this.loadEarnings();
    this.loadFortnightSummaries();
    this.loadStats();
  }

  loadEmployees() {
    this.employeesService.getEmployees().subscribe({
      next: (data) => {
        this.employees = data;
        this.activeEmployees = data.filter(emp => emp.is_active).length;
      },
      error: () => this.showError('Error al cargar empleados')
    });
  }

  loadEarnings() {
    this.loading = true;
    this.earningsService.getAllEarnings().subscribe({
      next: (data) => {
        this.earnings = data;
        this.filteredEarnings = data;
        this.calculateStats();
        this.updateChart();
        this.loading = false;
      },
      error: () => {
        this.showError('Error al cargar ganancias');
        this.loading = false;
      }
    });
  }

  loadFortnightSummaries() {
    this.loadingSummaries = true;
    this.earningsService.getFortnightSummaries().subscribe({
      next: (data) => {
        this.fortnightSummaries = data;
        this.loadingSummaries = false;
      },
      error: () => {
        this.showError('Error al cargar resúmenes');
        this.loadingSummaries = false;
      }
    });
  }

  loadStats() {
    this.earningsService.getEarningsStats().subscribe({
      next: (stats) => {
        this.totalEarnings = stats.total || 0;
        this.monthlyEarnings = stats.monthly || 0;
        this.pendingPayments = stats.pending || 0;
      },
      error: () => console.warn('Error al cargar estadísticas')
    });
  }

  filterEarnings() {
    this.filteredEarnings = this.earnings.filter(e => {
      if (this.selectedEmployee && e.employee !== this.selectedEmployee) return false;
      if (this.startDate && new Date(e.date) < this.startDate) return false;
      if (this.endDate && new Date(e.date) > this.endDate) return false;
      return true;
    });
  }

  calculateStats() {
    this.totalEarnings = this.earnings.reduce((sum, e) => sum + e.commission_amount, 0);
    
    const currentMonth = new Date().getMonth();
    this.monthlyEarnings = this.earnings.reduce((sum, e) => {
      return new Date(e.date).getMonth() === currentMonth ? sum + e.commission_amount : sum;
    }, 0);
  }

  private readonly CHART_COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];

  updateChart() {
    const employeeEarnings = this.earnings.reduce((acc, earning) => {
      const name = earning.employee_name || `Empleado ${earning.employee}`;
      acc[name] = (acc[name] || 0) + earning.commission_amount;
      return acc;
    }, {} as Record<string, number>);

    this.chartData = {
      labels: Object.keys(employeeEarnings),
      datasets: [{
        data: Object.values(employeeEarnings),
        backgroundColor: this.CHART_COLORS
      }]
    };
  }

  initChart() {
    this.chartOptions = {
      plugins: {
        legend: {
          position: 'bottom'
        }
      },
      responsive: true,
      maintainAspectRatio: false
    };
  }

  showGenerateDialog() {
    this.generateForm = { employee: null, startDate: null, endDate: null };
    this.showGenerate = true;
  }

  generateSummary() {
    if (!this.generateForm.employee || !this.generateForm.startDate || !this.generateForm.endDate) {
      this.showError('Todos los campos son requeridos');
      return;
    }

    this.generating = true;
    const startDate = this.formatDate(this.generateForm.startDate);
    const endDate = this.formatDate(this.generateForm.endDate);

    this.earningsService.generateFortnightSummary(
      this.generateForm.employee, 
      startDate, 
      endDate
    ).subscribe({
      next: () => {
        this.showSuccess('Resumen quincenal generado exitosamente');
        this.loadFortnightSummaries();
        this.showGenerate = false;
        this.generating = false;
      },
      error: () => {
        this.showError('Error al generar resumen');
        this.generating = false;
      }
    });
  }

  markAsPaid(summary: FortnightSummary) {
    if (!summary.id) {
      this.showError('ID de resumen inválido');
      return;
    }
    
    this.earningsService.markAsPaid(summary.id).subscribe({
      next: () => {
        this.showSuccess('Marcado como pagado');
        this.loadFortnightSummaries();
      },
      error: () => this.showError('Error al marcar como pagado')
    });
  }

  private formatDate(date: any): string {
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    return date;
  }

  private showSuccess(message: string) {
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: message
    });
  }

  private showError(message: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message
    });
  }
}