import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ClientUsersService } from './users.service';

@Component({
  selector: 'app-client-users',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, DialogModule,
    InputTextModule, MultiSelectModule, ToastModule, ConfirmDialogModule, TagModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="card">
      <div class="flex justify-content-between align-items-center mb-4">
        <h2 class="m-0">Gestión de Usuarios</h2>
        <p-button label="Nuevo Usuario" icon="pi pi-plus" (click)="showDialog()"></p-button>
      </div>

      <p-table [value]="users" [loading]="loading" responsiveLayout="scroll">
        <ng-template pTemplate="header">
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Roles</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-user>
          <tr>
            <td>{{ user.full_name }}</td>
            <td>{{ user.email }}</td>
            <td>
              <p-tag *ngFor="let role of user.roles" [value]="role.name" class="mr-1"></p-tag>
            </td>
            <td>
              <p-tag [value]="user.is_active ? 'Activo' : 'Inactivo'"
                     [severity]="user.is_active ? 'success' : 'danger'"></p-tag>
            </td>
            <td>
              <div class="flex gap-2">
                <p-button icon="pi pi-pencil" (click)="editUser(user)"
                          pTooltip="Editar" styleClass="p-button-rounded p-button-text"></p-button>
                <p-button icon="pi pi-trash" (click)="confirmDelete(user)"
                          pTooltip="Eliminar" styleClass="p-button-rounded p-button-danger p-button-text"></p-button>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <p-dialog [(visible)]="displayDialog" [modal]="true" [style]="{width: '500px'}"
              [header]="(isEdit ? 'Editar' : 'Nuevo') + ' Usuario'"
              [closable]="true">
      
      <div class="formgrid grid">
        <div class="field col-12">
          <label for="full_name">Nombre Completo *</label>
          <input type="text" pInputText [(ngModel)]="user.full_name" 
                 placeholder="Nombre del usuario" class="w-full" />
        </div>

        <div class="field col-12">
          <label for="email">Email *</label>
          <input type="email" pInputText [(ngModel)]="user.email" 
                 placeholder="email@ejemplo.com" class="w-full" [disabled]="isEdit" />
        </div>

        <div class="field col-12" *ngIf="!isEdit">
          <label for="password">Contraseña *</label>
          <input type="password" pInputText [(ngModel)]="user.password" 
                 placeholder="Contraseña" class="w-full" />
        </div>

        <div class="field col-12">
          <label for="roles">Roles *</label>
          <p-multiSelect [options]="availableRoles" [(ngModel)]="user.role_ids"
                         optionLabel="name" optionValue="id" placeholder="Seleccionar roles"
                         class="w-full">
          </p-multiSelect>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <div class="flex justify-content-end gap-2">
          <p-button label="Cancelar" icon="pi pi-times"
                    (click)="hideDialog()" styleClass="p-button-text"></p-button>
          <p-button label="Guardar" icon="pi pi-check"
                    (click)="saveUser()" [loading]="saving"></p-button>
        </div>
      </ng-template>
    </p-dialog>

    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
  `
})
export class ClientUsersComponent implements OnInit {
  users: any[] = [];
  availableRoles: any[] = [];
  user: any = {};
  displayDialog = false;
  isEdit = false;
  loading = false;
  saving = false;

  constructor(
    private usersService: ClientUsersService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadUsers();
    this.loadRoles();
  }

  loadUsers() {
    this.loading = true;
    this.usersService.getUsers().subscribe({
      next: (data: any) => {
        this.users = Array.isArray(data) ? data : (data?.results || []);
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar usuarios'
        });
        this.loading = false;
      }
    });
  }

  loadRoles() {
    this.usersService.getRoles().subscribe({
      next: (data: any) => {
        // Filtrar solo roles de tenant (no globales)
        this.availableRoles = (Array.isArray(data) ? data : (data?.results || []))
          .filter((role: any) => role.scope === 'TENANT');
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar roles'
        });
      }
    });
  }

  showDialog() {
    this.user = { is_active: true, role_ids: [] };
    this.isEdit = false;
    this.displayDialog = true;
  }

  editUser(user: any) {
    this.user = { 
      ...user, 
      role_ids: user.roles?.map((r: any) => r.id) || []
    };
    this.isEdit = true;
    this.displayDialog = true;
  }

  hideDialog() {
    this.displayDialog = false;
    this.user = {};
  }

  saveUser() {
    if (!this.user.full_name || !this.user.email || !this.user.role_ids?.length) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Complete todos los campos requeridos'
      });
      return;
    }

    if (!this.isEdit && !this.user.password) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'La contraseña es requerida'
      });
      return;
    }

    this.saving = true;
    const operation = this.isEdit
      ? this.usersService.updateUser(this.user.id, this.user)
      : this.usersService.createUser(this.user);

    operation.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Usuario ${this.isEdit ? 'actualizado' : 'creado'} correctamente`
        });
        this.loadUsers();
        this.hideDialog();
        this.saving = false;
      },
      error: (error) => {
        let errorMsg = 'Error al guardar usuario';
        if (error.error?.email) {
          errorMsg = 'Este email ya está registrado';
        } else if (error.error?.detail) {
          errorMsg = error.error.detail;
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

  confirmDelete(user: any) {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar al usuario ${user.full_name}?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deleteUser(user.id)
    });
  }

  deleteUser(id: number) {
    this.usersService.deleteUser(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Usuario eliminado correctamente'
        });
        this.loadUsers();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al eliminar usuario'
        });
      }
    });
  }
}