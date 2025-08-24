import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService, AuditLog } from '../../auth/service/auth.service';
import { CommonModule } from '@angular/common';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-audit',
    standalone: true,
    imports:[CommonModule, TableModule, TagModule, DialogModule, InputTextModule, ButtonModule],
    styleUrl: './audit-log.component.scss',
    template:`

    <div class="card">
  <h5>Auditoría del sistema</h5>

  <p-table
    #dt
    [value]="logs"
    [paginator]="true"
    [rows]="10"
    [loading]="loading"
    [globalFilterFields]="['user','action','model_name']"
    [rowsPerPageOptions]="[10,20,50]"
    [responsiveLayout]="'scroll'"
    [filterDelay]="300">

    <ng-template pTemplate="caption">
      <div class="flex justify-content-between align-items-center">
        <h6>Historial de cambios</h6>
        <span class="p-input-icon-left">
          <i class="pi pi-search"></i>
          <input pInputText type="text" (input)="onGlobalFilter($event)" placeholder="Buscar..." />
        </span>
      </div>
    </ng-template>

    <ng-template pTemplate="header">
      <tr>
        <th pSortableColumn="user">Usuario <p-sortIcon field="user"></p-sortIcon></th>
        <th pSortableColumn="action">Acción <p-sortIcon field="action"></p-sortIcon></th>
        <th pSortableColumn="source">Origen <p-sortIcon field="source"></p-sortIcon></th>
        <th>Modelo</th>
        <th>ID Objeto</th>
        <th pSortableColumn="timestamp">Fecha <p-sortIcon field="timestamp"></p-sortIcon></th>
        <th>Detalles</th>
      </tr>
    </ng-template>

    <ng-template pTemplate="body" let-log>
      <tr>
        <td>{{ log.user?.email || 'Sistema' }}</td>
        <td><p-tag [value]="getActionLabel(log.action)" [severity]="getSeverity(log.action)"></p-tag></td>
        <td>{{ getSourceLabel(log.source) }}</td>
        <td>{{ log.content_type_name || '-' }}</td>
        <td>{{ log.object_id || '-' }}</td>
        <td>{{ log.timestamp | date:'short' }}</td>
        <td>
          <button pButton pRipple icon="pi pi-eye" label="Ver" class="p-button-text p-button-sm"
            (click)="showDetails(log)">
          </button>
        </td>
      </tr>
    </ng-template>

    <ng-template pTemplate="emptymessage">
      <tr>
        <td colspan="6">No se encontraron registros</td>
      </tr>
    </ng-template>
  </p-table>
</div>

<p-dialog
  header="Detalles del cambio"
  [(visible)]="displayDetails"
  [modal]="true"
  [style]="{width: '40vw'}"
  [dismissableMask]="true">
  <pre>{{ selectedLog?.changes | json }}</pre>
</p-dialog>


    `


})
export class AuditComponent implements OnInit {
  @ViewChild('dt') dt!: Table;
  logs: AuditLog[] = [];
  loading: boolean = true;
  displayDetails: boolean = false;
  selectedLog: AuditLog | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.getAuditLogs().subscribe({
      next: (data) => {
        console.log('Respuesta del backend:', data);

        this.logs = data.results;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando logs:', err);
        this.loading = false;
      }
    });
  }

  onGlobalFilter(event: Event) {
    const input = event.target as HTMLInputElement;
    if (this.dt && input.value) {
      this.dt.filterGlobal(input.value, 'contains');
    }
  }

  showDetails(log: AuditLog) {
    this.selectedLog = log;
    this.displayDetails = true;
  }

  getSeverity(action: string): string {
    switch (action) {
      case 'DELETE':
      case 'SUBSCRIPTION_CANCEL':
        return 'danger';
      case 'UPDATE':
      case 'SUBSCRIPTION_UPDATE':
      case 'SETTING_UPDATE':
        return 'warning';
      case 'CREATE':
      case 'SUBSCRIPTION_CREATE':
        return 'success';
      default:
        return 'info';
    }
  }

  getActionLabel(action: string): string {
    const labels: { [key: string]: string } = {
      'CREATE': 'Crear',
      'UPDATE': 'Actualizar',
      'DELETE': 'Eliminar',
      'VIEW': 'Ver',
      'LOGIN': 'Iniciar Sesión',
      'LOGOUT': 'Cerrar Sesión',
      'LOGIN_FAILED': 'Fallo Login',
      'PASSWORD_CHANGE': 'Cambiar Contraseña',
      'ROLE_ASSIGN': 'Asignar Rol',
      'ROLE_REMOVE': 'Remover Rol',
      'PERMISSION_GRANT': 'Conceder Permiso',
      'PERMISSION_REVOKE': 'Revocar Permiso',
      'SETTING_UPDATE': 'Actualizar Configuración',
      'SUBSCRIPTION_CREATE': 'Crear Suscripción',
      'SUBSCRIPTION_UPDATE': 'Actualizar Suscripción',
      'SUBSCRIPTION_CANCEL': 'Cancelar Suscripción',
      'SUBSCRIPTION_RENEW': 'Renovar Suscripción',
      'MFA_ENABLE': 'Activar MFA',
      'MFA_DISABLE': 'Desactivar MFA',
      'ADMIN_ACTION': 'Acción Admin'
    };
    return labels[action] || action;
  }

  getSourceLabel(source: string): string {
    const labels: { [key: string]: string } = {
      'AUTH': 'Autenticación',
      'ROLES': 'Roles y Permisos',
      'SETTINGS': 'Configuración',
      'SUBSCRIPTIONS': 'Suscripciones',
      'USERS': 'Usuarios',
      'SYSTEM': 'Sistema'
    };
    return labels[source] || source;
  }
}
export type { AuditLog };
