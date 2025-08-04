import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersService } from './users.service';
import { User } from './user.model';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { UserFormComponent } from "./user-form.component";
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { Toast } from "primeng/toast";

@Component({
    selector: 'app-users',
    imports: [BadgeModule, ButtonModule, CardModule, TableModule, TagModule, TooltipModule, CommonModule, UserFormComponent, Toast],
    providers: [UsersService, ConfirmationService, MessageService],
    template: `
        <p-card header="Gestión de Usuarios">
            <div class="my-3 text-left">
                <button pButton label="Nuevo Usuario" icon="pi pi-plus" class="p-button-success" (click)="openNewUserForm()"></button>
            </div>

            <p-table [value]="users" [paginator]="true" [rows]="5" [responsiveLayout]="'scroll'" selectionMode="multiple" [(selection)]="selectedUsers" dataKey="id">
                <ng-template pTemplate="header">
                    <tr>
                        <th pSelectableRow></th>
                        <th>Nombre</th>
                        <th>Correo</th>
                        <th>Rol</th>
                        <th>Estado</th>
                        <th>Negocio</th>
                        <th>Creado</th>
                        <th>Acciones</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-user>
                    <tr>
                        <td pSelectableRowCheckbox></td>
                        <td>{{ user.full_name }}</td>
                        <td>{{ user.email }}</td>
                        <td>
                            <p-badge [value]="user.roles" [severity]="getSeverity(user.role)"></p-badge>
                        </td>
                        <td>
                            <p-tag [value]="user.isActive ? 'Activo' : 'Inactivo'" [severity]="user.isActive ? 'success' : 'danger'"></p-tag>
                        </td>
                        <td>{{ user.tenant || '-' }}</td>
                        <td>{{ user.createdAt | date: 'shortDate' }}</td>
                        <td>
                            <button pButton icon="pi pi-pencil" class="p-button-rounded p-button-text" pTooltip="Editar"></button>
                            <button pButton icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" pTooltip="Eliminar"  (click)="confirmDeleteUser(user)" (click)="confirmDeleteUser(user)"></button>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </p-card>

        <app-user-form [visible]="showUserForm" [editingUser]="editingUser" (close)="onUserFormClose()"> </app-user-form>
        <p-toast></p-toast>

    `
})
export class UsersComponent {
    users: User[] = [];
    selectedUsers: User[] = [];
    showUserForm: boolean = false;
    editingUser: User | null = null;

    constructor(
        private usersService: UsersService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.usersService.getUsers().subscribe((data) => {
            this.users = data;
        });
    }

    openNewUserForm() {
        this.editingUser = null; // modo creación
        this.showUserForm = true;
    }

    onUserFormClose() {
        this.showUserForm = false;
    }

    getSeverity(role: string): 'info' | 'success' | 'warn' {
        if (role === 'SuperAdmin') return 'warn';
        if (role === 'ClientAdmin') return 'info';
        return 'success';
    }
    getStatusTag(isActive: boolean): 'success' | 'danger' {
        return isActive ? 'success' : 'danger';
    }

    confirmDeleteUser(user: User) {
  this.confirmationService.confirm({
    message: `¿Seguro que deseas eliminar a ${user.fullName}?`,
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Sí',
    rejectLabel: 'No',
    accept: () => {
      this.usersService.deleteUser(user.id).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== user.id);
          this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Usuario eliminado correctamente' });
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el usuario' });
        }
      });
    }
  });
}



saveUser(user: User) {
  if (user.id) {
    this.usersService.updateUser(user).subscribe({
      next: updated => {
        const idx = this.users.findIndex(u => u.id === updated.id);
        if (idx !== -1) this.users[idx] = updated;
        this.messageService.add({ severity: 'success', summary: 'Usuario actualizado' });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el usuario' });
      }
    });
  } else {
    this.usersService.createUser(user).subscribe({
      next: created => {
        this.users.unshift(created);
        this.messageService.add({ severity: 'success', summary: 'Usuario creado' });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear el usuario' });
      }
    });
  }
}

}
