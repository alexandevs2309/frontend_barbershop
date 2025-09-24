import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { MessageService, ConfirmationService } from 'primeng/api';
import { EmployeesService } from './employees.service';
import { DatePicker } from 'primeng/datepicker';
import { convertEmployeeId } from '../../../shared/utils/employee-id.util';
import { sanitizeForLog } from '../../../shared/utils/error.util';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, DialogModule,
    InputTextModule, CalendarModule, SelectModule, ToastModule,
    ConfirmDialogModule, TagModule, DatePicker
  ],
  providers: [MessageService, ConfirmationService],
  styleUrl:'./employees.scss',
  template: `
  <div class="card">
  <div class="flex justify-content-between align-items-center mb-4">
    <h2 class="m-0">Gestión de Empleados</h2>
    <div class="flex gap-2">
      <p-button label="Gestionar Usuarios" icon="pi pi-users" 
                (click)="showUserManagement()" 
                styleClass="p-button-outlined"
                pTooltip="Asignar tenant a usuarios"></p-button>
      <p-button label="Nuevo Empleado" icon="pi pi-plus" (click)="showDialog()"
                styleClass="p-button-rounded"></p-button>
    </div>
  </div>

  <p-table [value]="employees" [loading]="loading" responsiveLayout="scroll">
    <ng-template pTemplate="header">
      <tr>
        <th>Empleado</th>
        <th>Especialidad</th>
        <th>Teléfono</th>
        <th>Fecha Contratación</th>
        <th>Estado</th>
        <th>Acciones</th>
      </tr>
    </ng-template>
    <ng-template pTemplate="body" let-employee>
      <tr>
        <td>{{ employee.user }}</td>
        <td>{{ employee.specialty || 'Sin especialidad' }}</td>
        <td>{{ employee.phone || 'Sin teléfono' }}</td>
        <td>{{ employee.hire_date | date:'dd/MM/yyyy' }}</td>
        <td>
          <p-tag [value]="employee.is_active ? 'Activo' : 'Inactivo'"
                 [severity]="employee.is_active ? 'success' : 'danger'"></p-tag>
        </td>
        <td>
          <div class="flex gap-2">
            <p-button icon="pi pi-pencil" (click)="editEmployee(employee)"
                      pTooltip="Editar" styleClass="p-button-rounded p-button-text"></p-button>
            <p-button icon="pi pi-cog" (click)="manageServices(employee)"
                      pTooltip="Servicios" styleClass="p-button-rounded p-button-text"></p-button>
            <p-button icon="pi pi-calendar" (click)="manageSchedule(employee)"
                      pTooltip="Horarios" styleClass="p-button-rounded p-button-text"></p-button>
            <p-button icon="pi pi-trash" (click)="confirmDelete(employee)"
                      pTooltip="Eliminar" styleClass="p-button-rounded p-button-danger p-button-text"></p-button>
          </div>
        </td>
      </tr>
    </ng-template>
    <ng-template pTemplate="emptymessage">
      <tr>
        <td colspan="6" class="text-center">No hay empleados registrados</td>
      </tr>
    </ng-template>
  </p-table>
</div>

<!-- Dialog estilo Sakai -->
<p-dialog [(visible)]="displayDialog" [modal]="true" [style]="{width: '500px'}"
          [header]="(isEdit ? 'Editar' : 'Nuevo') + ' Empleado'"
          [closable]="true" [draggable]="false" [resizable]="false"
          styleClass="p-fluid">

  <div class="formgrid grid">
    <div class="field col-12">
      <label for="user">Usuario *</label>
      <p-select [options]="availableUsers" [(ngModel)]="employee.user_id"
                 optionLabel="full_name" optionValue="id" placeholder="Seleccionar usuario"
                 [disabled]="isEdit" class="w-full">
        <ng-template let-user pTemplate="item">
          <div class="flex justify-content-between align-items-center">
            <span>{{ user.full_name }} ({{ user.email }})</span>
            <p-tag *ngIf="!user.tenant_id" value="Sin Tenant" severity="warning" class="ml-2"></p-tag>
          </div>
        </ng-template>
      </p-select>
    </div>

    <div class="field col-12 md:col-6">
      <label for="specialty">Especialidad</label>
      <input type="text" pInputText [(ngModel)]="employee.specialty"
             placeholder="Ej: Corte, Barba" />
    </div>

    <div class="field col-12 md:col-6">
      <label for="phone">Teléfono</label>
      <input type="text" pInputText [(ngModel)]="employee.phone"
             placeholder="Número de contacto" maxlength="15" />
    </div>

    <div class="field col-12">
      <label for="hire_date">Fecha de Contratación</label>
      <p-datepicker [(ngModel)]="employee.hire_date" dateFormat="yy-mm-dd"
                    placeholder="Seleccionar fecha" class="w-full"></p-datepicker>
    </div>
  </div>

  <ng-template pTemplate="footer">
    <div class="flex justify-content-end gap-2">
      <p-button label="Cancelar" icon="pi pi-times"
                (click)="hideDialog()" styleClass="p-button-text"></p-button>
      <p-button label="Guardar" icon="pi pi-check"
                (click)="saveEmployee()" [loading]="saving"></p-button>
    </div>
  </ng-template>
</p-dialog>

<!-- Dialog de información de usuarios -->
<p-dialog [(visible)]="showUserInfoDialog" [modal]="true" [style]="{width: '600px'}"
          header="Usuarios sin Tenant" [closable]="true">
  <div class="mb-4">
    <p class="text-muted">Los siguientes usuarios no tienen tenant asignado y no pueden ser empleados:</p>
  </div>
  
  <div *ngIf="usersWithoutTenant.length === 0" class="text-center p-4">
    <i class="pi pi-check-circle text-green-500 text-3xl mb-2"></i>
    <p class="text-lg font-semibold">¡Perfecto!</p>
    <p>Todos los usuarios tienen tenant asignado</p>
  </div>
  
  <div *ngIf="usersWithoutTenant.length > 0">
    <p-table [value]="usersWithoutTenant">
      <ng-template pTemplate="header">
        <tr>
          <th>Usuario</th>
          <th>Email</th>
          <th>Roles</th>
        </tr>
      </ng-template>
      <ng-template pTemplate="body" let-user>
        <tr>
          <td>{{ user.full_name }}</td>
          <td>{{ user.email }}</td>
          <td>
            <p-tag *ngFor="let role of user.roles" [value]="role.name" class="mr-1"></p-tag>
          </td>
        </tr>
      </ng-template>
    </p-table>
    
    <div class="mt-4 p-3 bg-blue-50 border-l-4 border-blue-400">
      <p class="text-sm text-blue-700">
        <strong>Nota:</strong> Para que estos usuarios puedan ser empleados, 
        necesitan tener un tenant asignado. Contacte al administrador del sistema.
      </p>
    </div>
  </div>
  
  <ng-template pTemplate="footer">
    <p-button label="Cerrar" (click)="showUserInfoDialog = false"></p-button>
  </ng-template>
</p-dialog>

<!-- Dialog Gestionar Servicios -->
<p-dialog [(visible)]="servicesDialog" [modal]="true" [style]="{width: '600px'}"
          header="Gestionar Servicios" [closable]="true">
  <div *ngIf="selectedEmployeeForServices">
    <h4>{{ selectedEmployeeForServices.user }}</h4>
    <p class="text-muted mb-4">Selecciona los servicios que puede realizar este empleado</p>

    <div class="service-list">
      <div class="service-item flex align-items-center justify-content-between p-3 border-round mb-2"
           *ngFor="let service of availableServices"
           [class.bg-primary-50]="isServiceAssigned(service.id)">
        <div class="flex align-items-center gap-3">
          <input type="checkbox"
                 [checked]="isServiceAssigned(service.id)"
                 (change)="toggleServiceAssignment(service.id, $event)">
          <div>
            <div class="font-semibold">{{ service.name }}</div>
            <div class="text-sm text-600">{{ service.category || 'Sin categoría' }} - {{ service.price | currency:'USD' }}</div>
          </div>
        </div>
        <div *ngIf="isServiceAssigned(service.id)" class="text-sm text-primary">
          <i class="pi pi-check"></i> Asignado
        </div>
      </div>
    </div>

    <div *ngIf="!availableServices.length" class="text-center p-4">
      <i class="pi pi-cog text-4xl text-300 mb-2 block"></i>
      <p class="text-600">No hay servicios disponibles</p>
    </div>
  </div>

  <ng-template pTemplate="footer">
    <div class="flex justify-content-end gap-2">
      <p-button label="Cancelar" (click)="servicesDialog = false" styleClass="p-button-text"></p-button>
      <p-button label="Guardar" (click)="saveEmployeeServices()" [loading]="savingServices"></p-button>
    </div>
  </ng-template>
</p-dialog>

<!-- Dialog Gestionar Horarios -->
<p-dialog [(visible)]="scheduleDialog" [modal]="true" [style]="{width: '700px'}"
          header="Gestionar Horarios" [closable]="true">
  <div *ngIf="selectedEmployeeForSchedule">
    <h4>{{ selectedEmployeeForSchedule.user }}</h4>
    <p class="text-muted mb-4">Configura los horarios de trabajo del empleado</p>

    <div class="schedule-list">
      <div class="schedule-item p-3 border-round mb-3 surface-card"
           *ngFor="let schedule of employeeSchedules">
        <div class="flex align-items-center justify-content-between">
          <div class="flex align-items-center gap-3">
            <input type="checkbox" [(ngModel)]="schedule.enabled">
            <div class="font-semibold w-6rem">{{ getDayLabel(schedule.day_of_week) }}</div>
          </div>
          <div class="flex align-items-center gap-2" *ngIf="schedule.enabled">
            <input type="time" [(ngModel)]="schedule.start_time" class="p-2 border-round border-1 border-300">
            <span>a</span>
            <input type="time" [(ngModel)]="schedule.end_time" class="p-2 border-round border-1 border-300">
          </div>
          <div *ngIf="!schedule.enabled" class="text-sm text-500">
            No disponible
          </div>
        </div>
      </div>
    </div>
  </div>

  <ng-template pTemplate="footer">
    <div class="flex justify-content-end gap-2">
      <p-button label="Cancelar" (click)="scheduleDialog = false" styleClass="p-button-text"></p-button>
      <p-button label="Guardar" (click)="saveEmployeeSchedule()" [loading]="savingSchedule"></p-button>
    </div>
  </ng-template>
</p-dialog>

<p-toast></p-toast>
<p-confirmDialog></p-confirmDialog>

  `
})
export class EmployeesComponent implements OnInit {
  employees: any[] = [];
  availableUsers: any[] = [];
  employee: any = {};
  displayDialog = false;
  isEdit = false;
  loading = false;
  saving = false;
  showUserInfoDialog = false;
  usersWithoutTenant: any[] = [];
  
  // Gestión de servicios
  servicesDialog = false;
  availableServices: any[] = [];
  employeeServices: any[] = [];
  selectedEmployeeForServices: any = null;
  savingServices = false;
  
  // Gestión de horarios
  scheduleDialog = false;
  employeeSchedules: any[] = [];
  selectedEmployeeForSchedule: any = null;
  savingSchedule = false;
  
  daysOfWeek = [
    { label: 'Lunes', value: 'monday' },
    { label: 'Martes', value: 'tuesday' },
    { label: 'Miércoles', value: 'wednesday' },
    { label: 'Jueves', value: 'thursday' },
    { label: 'Viernes', value: 'friday' },
    { label: 'Sábado', value: 'saturday' },
    { label: 'Domingo', value: 'sunday' }
  ];

  constructor(
    private employeesService: EmployeesService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadEmployees();
    this.loadAvailableUsers();
    this.loadAvailableServices();
  }

  loadEmployees() {
    this.loading = true;
    this.employeesService.getEmployees().subscribe({
      next: (data) => {
        this.employees = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading employees:', sanitizeForLog(error));
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar empleados'
        });
        this.loading = false;
      }
    });
  }

  loadAvailableUsers() {
    this.employeesService.getAvailableUsers().subscribe({
      next: (data) => {
        // Filtrar solo usuarios con tenant o mostrar advertencia
        this.availableUsers = data.filter(user => {
          if (!user.tenant_id) {
            console.warn(`Usuario ${sanitizeForLog(user.email)} no tiene tenant asignado`);
            return false; // No mostrar usuarios sin tenant
          }
          return true;
        });
        
        if (data.length > this.availableUsers.length) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Advertencia',
            detail: `${data.length - this.availableUsers.length} usuarios no tienen tenant asignado y no se pueden usar como empleados`
          });
        }
      },
      error: () => this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al cargar usuarios disponibles'
      })
    });
  }

  showDialog() {
    this.employee = { is_active: true };
    this.isEdit = false;
    this.displayDialog = true;
  }

  editEmployee(employee: any) {
    this.employee = { ...employee };
    if (this.employee.hire_date) {
      this.employee.hire_date = new Date(this.employee.hire_date);
    }
    // Para edición, no necesitamos user_id ya que no se puede cambiar
    this.isEdit = true;
    this.displayDialog = true;
  }

  hideDialog() {
    this.displayDialog = false;
    this.employee = {};
  }

  saveEmployee() {
    if (!this.isEdit && !this.employee.user_id) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debe seleccionar un usuario'
      });
      return;
    }

    // Formatear fecha correctamente
    const employeeData = { ...this.employee };
    if (employeeData.hire_date && employeeData.hire_date instanceof Date) {
      employeeData.hire_date = employeeData.hire_date.toISOString().split('T')[0];
    }

    this.saving = true;
    const operation = this.isEdit
      ? this.employeesService.updateEmployee(this.employee.id, employeeData)
      : this.employeesService.createEmployee(employeeData);

    operation.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Empleado ${this.isEdit ? 'actualizado' : 'creado'} correctamente`
        });
        this.loadEmployees();
        this.hideDialog();
        this.saving = false;
      },
      error: (error) => {
        console.error('Error saving employee:', sanitizeForLog(error));
        let errorMsg = 'Error al guardar empleado';
        if (error.error) {
          if (typeof error.error === 'string') {
            errorMsg = error.error;
          } else if (error.error.detail) {
            errorMsg = error.error.detail;
          } else if (Array.isArray(error.error)) {
            errorMsg = error.error.join(', ');
          } else {
            errorMsg = JSON.stringify(error.error);
          }
        }
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMsg
        });
        this.saving = false;
      }
    });
  }

  confirmDelete(employee: any) {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar al empleado ${employee.user}?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deleteEmployee(employee.id)
    });
  }

  deleteEmployee(id: number) {
    this.employeesService.deleteEmployee(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Empleado eliminado correctamente'
        });
        this.loadEmployees();
      },
      error: () => this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al eliminar empleado'
      })
    });
  }

  loadAvailableServices() {
    // Cargar servicios disponibles desde el API
    this.employeesService.getAvailableServices().subscribe({
      next: (services) => {
        this.availableServices = services;
      },
      error: (error) => {
        console.error('Error loading services:', error);
      }
    });
  }

  manageServices(employee: any) {
    this.selectedEmployeeForServices = employee;
    this.loadEmployeeServices(employee.id);
    this.servicesDialog = true;
  }

  loadEmployeeServices(employeeId: number) {
    this.employeesService.getEmployeeServices(employeeId).subscribe({
      next: (services) => {
        this.employeeServices = services;
      },
      error: (error) => {
        console.error('Error loading employee services:', error);
        this.employeeServices = [];
      }
    });
  }

  isServiceAssigned(serviceId: number): boolean {
    return this.employeeServices.some(es => es.service.id === serviceId);
  }

  toggleServiceAssignment(serviceId: number, event: any) {
    if (event.target.checked) {
      const service = this.availableServices.find(s => s.id === serviceId);
      if (service && !this.isServiceAssigned(serviceId)) {
        this.employeeServices.push({ service });
      }
    } else {
      this.employeeServices = this.employeeServices.filter(es => es.service.id !== serviceId);
    }
  }

  saveEmployeeServices() {
    if (!this.selectedEmployeeForServices) return;

    const serviceIds = this.employeeServices.map(es => es.service.id);
    this.savingServices = true;

    this.employeesService.assignServices(this.selectedEmployeeForServices.id, serviceIds).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Servicios asignados correctamente'
        });
        this.servicesDialog = false;
        this.savingServices = false;
      },
      error: (error) => {
        console.error('Error saving services:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al asignar servicios'
        });
        this.savingServices = false;
      }
    });
  }

  manageSchedule(employee: any) {
    this.selectedEmployeeForSchedule = employee;
    this.loadEmployeeSchedule(employee.id);
    this.scheduleDialog = true;
  }

  loadEmployeeSchedule(employeeId: number) {
    this.employeesService.getEmployeeSchedule(employeeId).subscribe({
      next: (schedules) => {
        this.employeeSchedules = schedules;
        // Inicializar horarios vacíos si no existen
        this.daysOfWeek.forEach(day => {
          if (!this.employeeSchedules.find(s => s.day_of_week === day.value)) {
            this.employeeSchedules.push({
              day_of_week: day.value,
              start_time: '',
              end_time: '',
              enabled: false
            });
          } else {
            const schedule = this.employeeSchedules.find(s => s.day_of_week === day.value);
            if (schedule) schedule.enabled = true;
          }
        });
      },
      error: (error) => {
        console.error('Error loading schedule:', error);
        // Inicializar horarios vacíos
        this.employeeSchedules = this.daysOfWeek.map(day => ({
          day_of_week: day.value,
          start_time: '09:00',
          end_time: '18:00',
          enabled: false
        }));
      }
    });
  }

  saveEmployeeSchedule() {
    if (!this.selectedEmployeeForSchedule) return;

    const schedules = this.employeeSchedules
      .filter(s => s.enabled && s.start_time && s.end_time)
      .map(s => ({
        day_of_week: s.day_of_week,
        start_time: s.start_time,
        end_time: s.end_time
      }));

    this.savingSchedule = true;

    this.employeesService.setSchedule(this.selectedEmployeeForSchedule.id, schedules).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Horarios guardados correctamente'
        });
        this.scheduleDialog = false;
        this.savingSchedule = false;
      },
      error: (error) => {
        console.error('Error saving schedule:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al guardar horarios'
        });
        this.savingSchedule = false;
      }
    });
  }

  getDayLabel(dayValue: string): string {
    const day = this.daysOfWeek.find(d => d.value === dayValue);
    return day ? day.label : dayValue;
  }

  showUserManagement() {
    // Obtener usuarios sin tenant
    this.employeesService.getAvailableUsers().subscribe({
      next: (data) => {
        this.usersWithoutTenant = data.filter(user => !user.tenant_id);
        this.showUserInfoDialog = true;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los usuarios'
        });
      }
    });
  }
}
