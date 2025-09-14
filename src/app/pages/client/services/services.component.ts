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
import { ServicesService, Service } from './services.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';


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

        <div class="field col-12">
          <label for="price">Precio *</label>
          <p-inputNumber [(ngModel)]="service.price" mode="currency"
                         currency="USD" [min]="0" placeholder="0.00"
                         class="w-full" required></p-inputNumber>
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

    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
  `
})
export class ServicesComponent implements OnInit {
  services: Service[] = [];
  service: Partial<Service> = {};
  selectedService: Service | null = null;
  categories: string[] = [];

  serviceDialog = false;
  viewDialog = false;
  isEdit = false;
  loading = false;
  saving = false;

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
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadServices();
    this.loadCategories();

    this.searchSubject.pipe(
        debounceTime(500)
    ).subscribe((term) => {
        this.searchTerm = term;
        this.loadServices();
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
        this.services = response.results;
        this.totalRecords = response.count;
        this.loading = false;
      },
      error: (error) => {
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
      duration: 30,
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
}
