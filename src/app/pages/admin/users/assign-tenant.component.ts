import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { UsersService } from './users.service';

@Component({
  selector: 'app-assign-tenant',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, 
    SelectModule, ToastModule, TagModule
  ],
  providers: [MessageService],
  template: `
    <div class="card">
      <h3>Asignar Tenant a Usuarios</h3>
      <p class="text-muted mb-4">Usuarios que necesitan tener un tenant asignado para poder ser empleados</p>
      
      <p-table [value]="usersWithoutTenant" [loading]="loading">
        <ng-template pTemplate="header">
          <tr>
            <th>Usuario</th>
            <th>Email</th>
            <th>Roles</th>
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
              <p-button label="Asignar a Mi Tenant" 
                       (click)="assignToCurrentTenant(user.id)"
                       [loading]="assigningUsers.has(user.id)"
                       size="small"></p-button>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="4" class="text-center">
              <i class="pi pi-check-circle text-green-500 text-2xl mb-2"></i>
              <p>Todos los usuarios tienen tenant asignado</p>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
    
    <p-toast></p-toast>
  `
})
export class AssignTenantComponent implements OnInit {
  usersWithoutTenant: any[] = [];
  loading = false;
  assigningUsers = new Set<number>();

  constructor(
    private usersService: UsersService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loadUsersWithoutTenant();
  }

  loadUsersWithoutTenant() {
    this.loading = true;
    this.usersService.getUsersWithoutTenant().subscribe({
      next: (users) => {
        // Filtrar Super-Admin que no necesita tenant
        this.usersWithoutTenant = users.filter(user => 
          !user.roles.some((role: any) => role.name === 'Super-Admin')
        );
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

  assignToCurrentTenant(userId: number) {
    this.assigningUsers.add(userId);
    
    // Obtener el tenant del usuario actual desde localStorage
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const tenantId = currentUser.tenant_id;
    
    if (!tenantId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se puede determinar el tenant actual'
      });
      this.assigningUsers.delete(userId);
      return;
    }

    this.usersService.assignTenant(userId, tenantId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Tenant asignado correctamente'
        });
        this.loadUsersWithoutTenant();
        this.assigningUsers.delete(userId);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al asignar tenant'
        });
        this.assigningUsers.delete(userId);
      }
    });
  }
}