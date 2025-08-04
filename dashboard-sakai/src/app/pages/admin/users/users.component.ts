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
@Component({
  selector: 'app-users',
  imports: [BadgeModule, ButtonModule, CardModule, TableModule, TagModule, TooltipModule , CommonModule],
  template: `
   <p-card header="Gestión de Usuarios">
  <p-table [value]="users" [paginator]="true" [rows]="5" [responsiveLayout]="'scroll'"
           selectionMode="multiple" [(selection)]="selectedUsers" dataKey="id">
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
        <td>{{ user.fullName }}</td>
        <td>{{ user.email }}</td>
        <td>
         <p-badge [value]="user.role" [severity]="getSeverity(user.role)"></p-badge>

        </td>
        <td>
          <p-tag [value]="user.isActive ? 'Activo' : 'Inactivo'" [severity]="user.isActive ? 'success' : 'danger'"></p-tag>
        </td>
        <td>{{ user.tenant || '-' }}</td>
        <td>{{ user.createdAt | date:'shortDate' }}</td>
        <td>
          <button pButton icon="pi pi-pencil" class="p-button-rounded p-button-text" pTooltip="Editar"></button>
          <button pButton icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" pTooltip="Eliminar"></button>
        </td>
      </tr>
    </ng-template>
  </p-table>
</p-card>

  `
})


export class UsersComponent {

   users: User[] = [];
  selectedUsers: User[] = [];

  constructor(private usersService: UsersService) {}

  ngOnInit(): void {
    this.usersService.getUsers().subscribe(data => {
      this.users = data;
    });

    
  }
  getSeverity(role: string): 'info' | 'success' | 'warn' {
  if (role === 'SuperAdmin') return 'warn';
  if (role === 'ClientAdmin') return 'info';
  return 'success';
}
  getStatusTag(isActive: boolean): 'success' | 'danger' {
    return isActive ? 'success' : 'danger';
  
  }

}
