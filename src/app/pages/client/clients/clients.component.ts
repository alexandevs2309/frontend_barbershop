import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { TextareaModule } from 'primeng/textarea';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ClientsService, Client, ClientStats } from './clients.service';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    DropdownModule,
    CalendarModule,
    TextareaModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="card">
      <div class="flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Clientes</h2>
        <p-button
          label="Nuevo Cliente"
          icon="pi pi-plus"
          (onClick)="openNew()">
        </p-button>
      </div>

      <!-- Filtros -->
      <div class="grid mb-3">
        <div class="col-12 md:col-4">
          <span class="p-input-icon-left w-full">
            <i class="pi pi-search"></i>
            <input
              pInputText
              type="text"
              [(ngModel)]="searchTerm"
              (input)="onSearch()"
              placeholder="Buscar clientes..."
              class="w-full">
          </span>
        </div>
        <div class="col-12 md:col-3">
          <p-dropdown
            [options]="genderOptions"
            [(ngModel)]="selectedGender"
            (onChange)="onFilter()"
            optionLabel="label"
            optionValue="value"
            placeholder="Filtrar por género"
            class="w-full">
          </p-dropdown>
        </div>
        <div class="col-12 md:col-3">
          <p-dropdown
            [options]="statusOptions"
            [(ngModel)]="selectedStatus"
            (onChange)="onFilter()"
            optionLabel="label"
            optionValue="value"
            placeholder="Filtrar por estado"
            class="w-full">
          </p-dropdown>
        </div>
        <div class="col-12 md:col-2">
          <p-button
            label="Limpiar"
            icon="pi pi-filter-slash"
            severity="secondary"
            (onClick)="clearFilters()"
            class="w-full">
          </p-button>
        </div>
      </div>

      <!-- Tabla -->
      <p-table
        [value]="clients"
        [loading]="loading"
        [paginator]="true"
        [rows]="10"
        [totalRecords]="totalRecords"
        [lazy]="true"
        (onLazyLoad)="loadClients($event)"
        responsiveLayout="scroll">

        <ng-template pTemplate="header">
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Puntos</th>
            <th>Última Visita</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-client>
          <tr>
            <td>{{ client.full_name }}</td>
            <td>{{ client.email || 'N/A' }}</td>
            <td>{{ client.phone || 'N/A' }}</td>
            <td>
              <p-tag
                [value]="client.loyalty_points + ' pts'"
                severity="info">
              </p-tag>
            </td>
            <td>{{ client.last_visit ? (client.last_visit | date:'short') : 'Nunca' }}</td>
            <td>
              <p-tag
                [value]="client.is_active ? 'Activo' : 'Inactivo'"
                [severity]="client.is_active ? 'success' : 'danger'">
              </p-tag>
            </td>
            <td>
              <p-button
                icon="pi pi-eye"
                severity="info"
                size="small"
                (onClick)="viewClient(client)"
                pTooltip="Ver detalles"
                class="mr-2">
              </p-button>
              <p-button
                icon="pi pi-pencil"
                severity="warn"
                size="small"
                (onClick)="editClient(client)"
                pTooltip="Editar"
                class="mr-2">
              </p-button>
              <p-button
                icon="pi pi-trash"
                severity="danger"
                size="small"
                (onClick)="deleteClient(client)"
                pTooltip="Eliminar">
              </p-button>
            </td>
          </tr>
        </ng-template>

        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="7" class="text-center">No se encontraron clientes</td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <!-- Dialog Crear/Editar -->
    <p-dialog
      [(visible)]="clientDialog"
      [header]="editMode ? 'Editar Cliente' : 'Nuevo Cliente'"
      [modal]="true"
      [style]="{width: '500px'}"
      [closable]="true">

      <form (ngSubmit)="saveClient()" #clientForm="ngForm">
        <div class="grid">
          <div class="col-12">
            <label>Nombre Completo *</label>
            <input
              pInputText
              [(ngModel)]="client.full_name"
              name="full_name"
              required
              class="w-full">
          </div>

          <div class="col-12 md:col-6">
            <label>Email</label>
            <input
              pInputText
              type="email"
              [(ngModel)]="client.email"
              name="email"
              placeholder="ejemplo@correo.com"
              class="w-full">
          </div>

          <div class="col-12 md:col-6">
            <label>Teléfono</label>
            <input
              pInputText
              [(ngModel)]="client.phone"
              name="phone"
              placeholder="123456789"
              class="w-full">
          </div>

          <div class="col-12 md:col-6">
            <label>Género</label>
            <p-dropdown
              [options]="genderOptions"
              [(ngModel)]="client.gender"
              name="gender"
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccionar"
              class="w-full">
            </p-dropdown>
          </div>

          <div class="col-12 md:col-6">
            <label>Fecha de Nacimiento</label>
            <input
              pInputText
              type="date"
              [(ngModel)]="client.birthday"
              name="birthday"
              class="w-full">
          </div>

          <div class="col-12">
            <label>Fuente</label>
            <input
              pInputText
              [(ngModel)]="client.source"
              name="source"
              placeholder="Ej: Instagram, Referido, etc."
              class="w-full">
          </div>

          <div class="col-12">
            <label>Notas</label>
            <textarea
              pInputTextarea
              [(ngModel)]="client.notes"
              name="notes"
              rows="3"
              class="w-full">
            </textarea>
          </div>
        </div>

        <div class="flex justify-content-end gap-2 mt-3">
          <p-button
            label="Cancelar"
            severity="secondary"
            (onClick)="hideDialog()">
          </p-button>
          <p-button
            label="Guardar"
            type="submit"
            [disabled]="!clientForm.form.valid">
          </p-button>
        </div>
      </form>
    </p-dialog>

    <!-- Dialog Ver Cliente -->
    <p-dialog
      [(visible)]="viewDialog"
      header="Detalles del Cliente"
      [modal]="true"
      [style]="{width: '600px'}">

      <div *ngIf="selectedClient" class="grid">
        <div class="col-12 md:col-6">
          <strong>Nombre:</strong> {{ selectedClient.full_name }}
        </div>
        <div class="col-12 md:col-6">
          <strong>Email:</strong> {{ selectedClient.email ? selectedClient.email : 'N/A' }}
        </div>
        <div class="col-12 md:col-6">
          <strong>Teléfono:</strong> {{ selectedClient.phone ? selectedClient.phone : 'N/A' }}
        </div>
        <div class="col-12 md:col-6">
          <strong>Puntos de Lealtad:</strong> {{ selectedClient.loyalty_points }}
        </div>
        <div class="col-12 md:col-6" *ngIf="clientStats">
          <strong>Total Gastado:</strong> {{ clientStats.total_spent | currency }}
        </div>
        <div class="col-12 md:col-6" *ngIf="clientStats">
          <strong>Citas Completadas:</strong> {{ clientStats.completed_appointments }}
        </div>
        <div class="col-12" *ngIf="selectedClient.notes">
          <strong>Notas:</strong><br>
          {{ selectedClient.notes }}
        </div>
      </div>
    </p-dialog>

    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
  `
})
export class ClientsComponent implements OnInit, OnDestroy {
  clients: Client[] = [];
  client: Partial<Client> = {};
  selectedClient: Client | null = null;
  clientStats: ClientStats | null = null;

  clientDialog = false;
  viewDialog = false;
  editMode = false;
  loading = false;

  totalRecords = 0;
  searchTerm = '';
  selectedGender = '';
  selectedStatus = '';

  genderOptions = [
    { label: 'Todos', value: '' },
    { label: 'Masculino', value: 'M' },
    { label: 'Femenino', value: 'F' },
    { label: 'Otro', value: 'O' }
  ];

  statusOptions = [
    { label: 'Todos', value: '' },
    { label: 'Activos', value: 'true' },
    { label: 'Inactivos', value: 'false' }
  ];

  constructor(
    private clientsService: ClientsService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadClients();
  }

  ngOnDestroy() {
    // Cleanup para evitar errores de focus
    this.hideDialog();
  }

  loadClients(event?: any) {
    this.loading = true;

    const params: any = {};
    if (event) {
      params.page = Math.floor(event.first / event.rows) + 1;
      params.page_size = event.rows;
    }
    if (this.searchTerm) params.search = this.searchTerm;
    if (this.selectedGender) params.gender = this.selectedGender;
    if (this.selectedStatus) params.is_active = this.selectedStatus;

    this.clientsService.getClients(params).subscribe({
      next: (response) => {
        this.clients = response.results;
        this.totalRecords = response.count;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading clients:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar clientes'
        });
        this.loading = false;
      }
    });
  }

  openNew() {
    this.client = { 
      full_name: '', 
      email: '',
      phone: '',
      loyalty_points: 0, 
      is_active: true 
    };
    this.editMode = false;
    this.clientDialog = true;
  }

  editClient(client: Client) {
    this.client = { ...client };
    this.editMode = true;
    this.clientDialog = true;
  }

  viewClient(client: Client) {
    this.selectedClient = client;
    this.viewDialog = true;

    // Cargar estadísticas del cliente
    this.clientsService.getClientStats(client.id!).subscribe({
      next: (stats) => this.clientStats = stats,
      error: (error) => console.error('Error loading client stats:', error)
    });
  }

  saveClient() {
    // Ensure required fields
    if (!this.client.email && !this.client.phone) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Debe proporcionar al menos email o teléfono'
      });
      return;
    }
    
    if (this.editMode && this.client.id) {
      this.clientsService.updateClient(this.client.id, this.client).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Cliente actualizado correctamente'
          });
          this.hideDialog();
          this.loadClients();
        },
        error: (error) => {
          console.error('Error updating client:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al actualizar cliente'
          });
        }
      });
    } else {
      this.clientsService.createClient(this.client).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Cliente creado correctamente'
          });
          this.hideDialog();
          this.loadClients();
        },
        error: (error) => {
          console.error('Error creating client:', error);
          const errorMsg = error.error?.detail || error.error?.message || JSON.stringify(error.error) || 'Error al crear cliente';
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: errorMsg
          });
        }
      });
    }
  }

  deleteClient(client: Client) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar a ${client.full_name}?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.clientsService.deleteClient(client.id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Cliente eliminado correctamente'
            });
            this.loadClients();
          },
          error: (error) => {
            console.error('Error deleting client:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al eliminar cliente'
            });
          }
        });
      }
    });
  }

  hideDialog() {
    this.clientDialog = false;
    this.viewDialog = false;
    this.client = { full_name: '', loyalty_points: 0, is_active: true };
    this.selectedClient = null;
    this.clientStats = null;
  }

  onSearch() {
    this.loadClients();
  }

  onFilter() {
    this.loadClients();
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedGender = '';
    this.selectedStatus = '';
    this.loadClients();
  }


}
