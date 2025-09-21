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
    templateUrl: './audit-log.component.html'


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
