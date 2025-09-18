import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ServicesService, Service, ServiceEmployee } from './services.service';
import { EmployeesService } from '../employees/employees.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { BUSINESS_CONSTANTS } from '../../../shared/constants/business.constants';


@Component({
  selector: 'app-services',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, DialogModule,
    InputTextModule, InputNumberModule, SelectModule, ToastModule,
    ConfirmDialogModule, TagModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="card">
      <div class="flex justify-content-between align-items-center mb-4">
        <h2 class="m-0">Gestión de Servicios</h2>
        <p-button label="Nuevo Servicio" icon="pi pi-plus" (click)="openNew()" class="ml-8 my-auto"></p-button>
      </div>

      <div class="flex gap-3 mb-4">
        <span class="p-input-icon-left flex-1">
          <i class="pi pi-search"></i>
          <input pInputText type="text" [(ngModel)]="searchTerm" (input)="searchSubject.next(searchTerm)" placeholder="Buscar servicios..." class="w-full">

        </span>

        <p-select [options]="categoryOptions" [(ngModel)]="selectedCategory"
                  (onChange)="loadServices()" placeholder="Todas las categorías"
                  [showClear]="true" class="w-12rem"></p-select>

        <p-select [options]="statusOptions" [(ngModel)]="selectedStatus"
                  (onChange)="loadServices()" placeholder="Todos los estados"
                  [showClear]="true" class="w-10rem"></p-select>
      </div>

      <p-table [value]="services" [loading]="loading" [paginator]="true"
               [rows]="10" [totalRecords]="totalRecords" [lazy]="true"
               (onLazyLoad)="loadServices($event)" responsiveLayout="scroll">

        <ng-template pTemplate="header">
          <tr>
            <th>Servicio</th>
            <th>Categoría</th>
            <th>Precio</th>
            <th>Duración</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-service>
          <tr>
            <td>
              <div>
                <div class="font-semibold">{{ service.name }}</div>
                <div class="text-sm text-muted" *ngIf="service.description">
                  {{ service.description }}
                </div>
              </div>
            </td>
            <td>
              <p-tag [value]="service.category || 'Sin categoría'"
                     severity="info" class="text-sm"></p-tag>
            </td>
            <td class="font-semibold">{{ service.price | currency:'USD':'symbol':'1.2-2' }}</td>
            <td>{{ service.duration }} min</td>
            <td>
              <p-tag [value]="service.is_active ? 'Activo' : 'Inactivo'"
                     [severity]="service.is_active ? 'success' : 'danger'"></p-tag>
            </td>
            <td>
              <div class="flex gap-2">
                <p-button icon="pi pi-eye" (click)="viewService(service)"
                          pTooltip="Ver" styleClass="p-button-rounded p-button-text"></p-button>
                <p-button icon="pi pi-pencil" (click)="editService(service)"
                          pTooltip="Editar" styleClass="p-button-rounded p-button-text"></p-button>
                <p-button icon="pi pi-users" (click)="manageEmployees(service)"
                          pTooltip="Empleados" styleClass="p-button-rounded p-button-info p-button-text"></p-button>
                <p-button icon="pi pi-dollar" (click)="managePricing(service)"
                          pTooltip="Precios" styleClass="p-button-rounded p-button-warning p-button-text"></p-button>
                <p-button icon="pi pi-trash" (click)="confirmDelete(service)"
                          pTooltip="Eliminar" styleClass="p-button-rounded p-button-danger p-button-text"></p-button>
              </div>
            </td>
          </tr>
        </ng-template>

        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="6" class="text-center">No hay servicios registrados</td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <!-- Dialog Crear/Editar -->
    <p-dialog [(visible)]="serviceDialog" [modal]="true" [style]="{width: '500px'}"
              [header]="(isEdit ? 'Editar' : 'Nuevo') + ' Servicio'"
              [closable]="true" styleClass="p-fluid">

      <div class="formgrid grid">
        <div class="field col-12">
          <label for="name">Nombre del Servicio *</label>
          <input pInputText [(ngModel)]="service.name"
                 placeholder="Ej: Corte de Cabello Clásico" class="w-full" required>
        </div>

        <div class="field col-12">
          <label for="description">Descripción</label>
          <textarea pInputTextarea [(ngModel)]="service.description"
                    rows="3" placeholder="Descripción del servicio..." class="w-full"></textarea>
        </div>

        <div class="field col-12 md:col-6">
          <label for="category">Categoría</label>
          <p-select [options]="categories" [(ngModel)]="service.category"
                    placeholder="Seleccionar categoría" [editable]="true" class="w-full"></p-select>
        </div>

        <div class="field col-12 md:col-6">
          <label for="duration">Duración (minutos) *</label>
          <p-inputNumber [(ngModel)]="service.duration" [min]="5" [max]="480"
                         placeholder="30" class="w-full" required></p-inputNumber>
        </div>

        <div class="field col-12 md:col-6">
          <label for="price">Precio Base *</label>
          <p-inputNumber [(ngModel)]="service.price" mode="currency"
                         currency="USD" [min]="0" placeholder="0.00"
                         class="w-full" required></p-inputNumber>
        </div>

        <div class="field col-12 md:col-6">
          <label for="commission">Comisión % *</label>
          <p-inputNumber [(ngModel)]="service.commission_percentage"
                         [min]="0" [max]="100" suffix="%"
                         placeholder="15" class="w-full" required></p-inputNumber>
        </div>

        <div class="field col-12">
          <div class="flex align-items-center">
            <input type="checkbox" [(ngModel)]="service.is_active" id="is_active">
            <label for="is_active" class="ml-2">Servicio activo</label>
          </div>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <div class="flex justify-content-end gap-2">
          <p-button label="Cancelar" icon="pi pi-times"
                    (click)="hideDialog()" styleClass="p-button-text"></p-button>
          <p-button label="Guardar" icon="pi pi-check"
                    (click)="saveService()" [loading]="saving"></p-button>
        </div>
      </ng-template>
    </p-dialog>

    <!-- Dialog Ver Servicio -->
    <p-dialog [(visible)]="viewDialog" [modal]="true" [style]="{width: '400px'}"
              header="Detalles del Servicio" [closable]="true">

      <div *ngIf="selectedService" class="grid">
        <div class="col-12">
          <h3 class="mt-0">{{ selectedService.name }}</h3>
        </div>
        <div class="col-12" *ngIf="selectedService.description">
          <p class="text-muted">{{ selectedService.description }}</p>
        </div>
        <div class="col-6">
          <strong>Categoría:</strong><br>
          {{ selectedService.category || 'Sin categoría' }}
        </div>
        <div class="col-6">
          <strong>Precio:</strong><br>
          {{ selectedService.price | currency:'USD':'symbol':'1.2-2' }}
        </div>
        <div class="col-6">
          <strong>Duración:</strong><br>
          {{ selectedService.duration }} minutos
        </div>
        <div class="col-6">
          <strong>Estado:</strong><br>
          <p-tag [value]="selectedService.is_active ? 'Activo' : 'Inactivo'"
                 [severity]="selectedService.is_active ? 'success' : 'danger'"></p-tag>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <p-button label="Cerrar" (click)="viewDialog = false"></p-button>
      </ng-template>
    </p-dialog>

    <!-- Dialog Gestionar Empleados -->
    <p-dialog [(visible)]="employeesDialog" [modal]="true" [style]="{width: '600px'}"
              header="Gestionar Empleados" [closable]="true">
      <div *ngIf="selectedService">
        <h4>{{ selectedService.name }}</h4>
        <p class="text-muted mb-4">Selecciona los empleados que pueden realizar este servicio</p>

        <div class="employee-list">
          <div class="employee-item flex align-items-center justify-content-between p-3 border-round mb-2"
               *ngFor="let employee of allEmployees"
               [class.bg-primary-50]="isEmployeeAssigned(employee.id)">
            <div class="flex align-items-center gap-3">
              <input type="checkbox"
                     [checked]="isEmployeeAssigned(employee.id)"
                     (change)="toggleEmployeeAssignment(employee.id, $event)">
              <div>
                <div class="font-semibold">{{ employee.user || employee.name }}</div>
                <div class="text-sm text-600">{{ employee.specialty || 'Sin especialidad' }}</div>
              </div>
            </div>
            <div *ngIf="isEmployeeAssigned(employee.id)" class="text-sm text-primary">
              <i class="pi pi-check"></i> Asignado
            </div>
          </div>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <div class="flex justify-content-end gap-2">
          <p-button label="Cancelar" (click)="employeesDialog = false" styleClass="p-button-text"></p-button>
          <p-button label="Guardar" (click)="saveEmployeeAssignments()" [loading]="savingEmployees"></p-button>
        </div>
      </ng-template>
    </p-dialog>

    <!-- Dialog Gestionar Precios -->
    <p-dialog [(visible)]="pricingDialog" [modal]="true" [style]="{width: '700px'}"
              header="Gestionar Precios por Empleado" [closable]="true">
      <div *ngIf="selectedService">
        <h4>{{ selectedService.name }}</h4>
        <p class="text-muted mb-4">Precio base: {{ selectedService.price | currency:'USD' }}</p>

        <div class="pricing-list">
          <div class="pricing-item p-3 border-round mb-3 surface-card"
               *ngFor="let assignment of serviceEmployees">
            <div class="flex align-items-center justify-content-between">
              <div class="flex align-items-center gap-3">
                <div>
                  <div class="font-semibold">{{ assignment.employee_name }}</div>
                  <div class="text-sm text-600">Comisión: {{ assignment.commission_percentage || selectedService.commission_percentage || getDefaultCommission() }}%</div>
                </div>
              </div>
              <div class="flex align-items-center gap-2">
                <p-inputNumber [(ngModel)]="assignment.custom_price"
                              mode="currency" currency="USD" [min]="0"
                              placeholder="Precio personalizado"
                              styleClass="w-8rem"></p-inputNumber>
                <small class="text-muted">*Opcional</small>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="!serviceEmployees.length" class="text-center p-4">
          <i class="pi pi-users text-4xl text-300 mb-2 block"></i>
          <p class="text-600">No hay empleados asignados a este servicio</p>
          <p-button label="Asignar Empleados" (click)="pricingDialog = false; manageEmployees(selectedService)"></p-button>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <div class="flex justify-content-end gap-2">
          <p-button label="Cancelar" (click)="pricingDialog = false" styleClass="p-button-text"></p-button>
          <p-button label="Guardar Precios" (click)="savePricing()" [loading]="savingPrices"></p-button>
        </div>
      </ng-template>
    </p-dialog>

    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
  `
})
export class ServicesComponent implements OnInit {
  services: Service[] = [];
  service: Partial<Service> = {};
  selectedService: Service | null = null;
  categories: string[] = [];

  // Employee management
  allEmployees: any[] = [];
  serviceEmployees: ServiceEmployee[] = [];
  assignedEmployeeIds: number[] = [];

  serviceDialog = false;
  viewDialog = false;
  employeesDialog = false;
  pricingDialog = false;
  isEdit = false;
  loading = false;
  saving = false;
  savingEmployees = false;
  savingPrices = false;

  totalRecords = 0;
  searchTerm = '';
  selectedCategory = '';
  selectedStatus = '';

  searchSubject: Subject<string> = new Subject();
  categoryOptions: any[] = [];
  statusOptions = [
    { label: 'Activos', value: 'true' },
    { label: 'Inactivos', value: 'false' }
  ];

  constructor(
    private servicesService: ServicesService,
    private employeesService: EmployeesService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  getDefaultCommission(): number {
    return BUSINESS_CONSTANTS.DEFAULT_COMMISSION_PERCENTAGE;
  }

  ngOnInit() {
    this.loadServices();
    this.loadCategories();
    this.loadEmployees();

    this.searchSubject.pipe(
        debounceTime(500)
    ).subscribe((term) => {
        this.searchTerm = term;
        this.loadServices();
    });
  }

  loadEmployees() {
    this.employeesService.getEmployees().subscribe({
      next: (employees: any) => {
        this.allEmployees = Array.isArray(employees) ? employees : (employees?.results || []);
      },
      error: (error) => {
        console.error('Error loading employees:', (error));
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar empleados'
        });
        this.allEmployees = [];
      }
    });
  }

  loadCategories() {
    this.servicesService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.categoryOptions = categories.map(cat => ({ label: cat, value: cat }));
      }
    });
  }

  loadServices(event?: any) {
    console.log('Loading services...');
    this.loading = true;

    const params: any = {};
    if (event) {
      params.page = Math.floor(event.first / event.rows) + 1;
      params.page_size = event.rows;
    }
    if (this.searchTerm) params.search = this.searchTerm;
    if (this.selectedCategory) params.category = this.selectedCategory;
    if (this.selectedStatus) params.is_active = this.selectedStatus;

    this.servicesService.getServices(params).subscribe({
      next: (response) => {
        this.services = response.results || response;
        this.totalRecords = response.count || (response.results || response).length;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading services:', (error));
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar servicios'
        });
        this.loading = false;
      }
    });
  }

  openNew() {
    this.service = {
      name: '',
      price: 0,
      duration: BUSINESS_CONSTANTS.DEFAULT_SERVICE_DURATION,
      commission_percentage: BUSINESS_CONSTANTS.DEFAULT_COMMISSION_PERCENTAGE,
      is_active: true
    };
    this.isEdit = false;
    this.serviceDialog = true;
  }

  editService(service: Service) {
    this.service = { ...service };
    this.isEdit = true;
    this.serviceDialog = true;
  }

  viewService(service: Service) {
    this.selectedService = service;
    this.viewDialog = true;
  }

  hideDialog() {
    this.serviceDialog = false;
    this.service = {};
  }

  saveService() {
  if (!this.service.name || !this.service.duration) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: 'Complete todos los campos requeridos'
    });
    return;
  }

  if (!this.service.price || this.service.price <= 0) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: 'El precio debe ser mayor a 0'
    });
    return;
  }

  this.saving = true;
  const operation = this.isEdit
    ? this.servicesService.updateService(this.service.id!, this.service)
    : this.servicesService.createService(this.service);

  operation.subscribe({
    next: () => {
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: `Servicio ${this.isEdit ? 'actualizado' : 'creado'} correctamente`
      });
      this.loadServices();
      this.hideDialog();
      this.saving = false;
    },
    error: () => {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al guardar servicio'
      });
      this.saving = false;
    }
  });
}


  confirmDelete(service: Service) {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar el servicio "${service.name}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deleteService(service.id!)
    });
  }

  deleteService(id: number) {
    this.servicesService.deleteService(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Servicio eliminado correctamente'
        });
        this.loadServices();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al eliminar servicio'
        });
      }
    });
  }

  manageEmployees(service: Service) {
    if (!service.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Servicio inválido'
      });
      return;
    }
    this.selectedService = service;
    this.loadServiceEmployees(service.id);
    this.employeesDialog = true;
  }

  managePricing(service: Service) {
    if (!service.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Servicio inválido'
      });
      return;
    }
    this.selectedService = service;
    this.loadServiceEmployees(service.id);
    this.pricingDialog = true;
  }

  loadServiceEmployees(serviceId: number) {
    this.servicesService.getServiceEmployees(serviceId).subscribe({
      next: (employees) => {
        this.serviceEmployees = employees;
        this.assignedEmployeeIds = employees.map(emp => (emp.employee));
      },
      error: () => {
        this.serviceEmployees = [];
        this.assignedEmployeeIds = [];
      }
    });
  }

  isEmployeeAssigned(employeeId: number): boolean {
    return this.assignedEmployeeIds.includes(employeeId);
  }

  toggleEmployeeAssignment(employeeId: number, event: any) {
    const convertedId = (employeeId);
    if (event.target.checked) {
      if (!this.assignedEmployeeIds.includes(convertedId)) {
        this.assignedEmployeeIds.push(convertedId);
      }
    } else {
      this.assignedEmployeeIds = this.assignedEmployeeIds.filter(id => id !== convertedId);
    }
  }

  saveEmployeeAssignments() {
    if (!this.selectedService?.id) return;

    this.savingEmployees = true;
    this.servicesService.assignEmployees(this.selectedService.id, this.assignedEmployeeIds).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Empleados asignados correctamente'
        });
        this.employeesDialog = false;
        this.savingEmployees = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error?.error?.detail || 'Error al asignar empleados'
        });
        this.savingEmployees = false;
      }
    });
  }

  savePricing() {
    if (!this.selectedService?.id) return;

    this.savingPrices = true;
    const promises = this.serviceEmployees
      .filter(emp => emp.custom_price && emp.custom_price > 0)
      .map(emp =>
        this.servicesService.setEmployeePrice(
          this.selectedService!.id!,
          emp.employee,
          emp.custom_price!
        ).toPromise()
      );

    Promise.all(promises).then(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Precios actualizados correctamente'
      });
      this.pricingDialog = false;
      this.savingPrices = false;
    }).catch((error) => {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error?.error?.detail || 'Error al actualizar precios'
      });
      this.savingPrices = false;
    });
  }
}
