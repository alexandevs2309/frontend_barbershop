import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { UsersService } from './users.service';
import { User } from './user.model';
import { AuditLog } from './log.model';

import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { Card } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';

import { UserFormComponent } from './user-form.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ToolbarModule } from 'primeng/toolbar';
import { Subject, debounceTime, takeUntil } from 'rxjs';

import { LazyLoadEvent } from 'primeng/api';

@Component({
    selector: 'app-users',
    imports: [CommonModule, FormsModule, BadgeModule, ButtonModule, Card, TableModule, TagModule, TooltipModule, InputTextModule, DialogModule, UserFormComponent, Toast, ConfirmDialog, ToolbarModule],
    providers: [UsersService, ConfirmationService, MessageService],


   template: `
        <p-card header="Gestión de Usuarios">
            <!-- SOLO búsqueda por texto + Export -->
<p-toolbar class="mb-3">
  <div class="p-toolbar-group-left">
    <button pButton label="Nuevo Usuario" icon="pi pi-plus" class="p-button-success mr-2" (click)="openNewUserForm()"></button>
    <button pButton label="Ver Eliminados" icon="pi pi-trash" class="p-button-secondary" (click)="showDeletedUsers()"></button>
  </div>

  <div class="p-toolbar-group-right flex gap-2">
    <span class="p-input-icon-left">
      <i class="pi pi-search"></i>
      <input pInputText type="text" placeholder="Buscar (nombre o email)" [(ngModel)]="search" (input)="onSearchInput()" class="w-72" />
    </span>
    <button pButton label="Exportar CSV" icon="pi pi-download" class="p-button-outlined" (click)="exportCsv()"></button>
  </div>
</p-toolbar>


            <p-table
                [value]="users"
                [lazy]="true"
                (onLazyLoad)="onLazyLoad($event)"
                [paginator]="true"
                [rows]="pageSize"
                [totalRecords]="total"
                [loading]="loading"
                trackBy="trackById"
                dataKey="id"
                [responsiveLayout]="'scroll'"
                [sortField]="sortField"
                [sortOrder]="sortOrder"
            >
                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="full_name">
                            Nombre
                            <p-sortIcon field="full_name"></p-sortIcon>
                        </th>
                        <th pSortableColumn="email">
                            Correo
                            <p-sortIcon field="email"></p-sortIcon>
                        </th>
                        <th>Rol(es)</th>
                        <th pSortableColumn="is_active">
                            Estado
                            <p-sortIcon field="is_active"></p-sortIcon>
                        </th>
                        <th pSortableColumn="date_joined">
                            Creado
                            <p-sortIcon field="date_joined"></p-sortIcon>
                        </th>
                        <th>Negocio</th>
                        <th style="width:140px">Acciones</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-user>
                    <tr>
                        <td>{{ user.full_name || '—' }}</td>
                        <td>{{ user.email }}</td>
                        <td>
                            <ng-container *ngFor="let role of user.roles">
                                <p-badge [value]="role.name" [severity]="getSeverity(role.name)" class="mr-1"></p-badge>
                            </ng-container>
                        </td>
                        <td>
                            <p-tag [value]="user.is_active ? 'Activo' : 'Inactivo'" [severity]="user.is_active ? 'success' : 'danger'"></p-tag>
                        </td>
                        <td>{{ user.date_joined | date: 'shortDate' }}</td>
                        <td>{{ user.tenant || '-' }}</td>
                        <td>
                            <div class="flex flex-wrap">
                                <button pButton icon="pi pi-pencil" class="p-button-rounded p-button-text mr-1" pTooltip="Editar" (click)="onEditUser(user)"></button>
                                <button pButton icon="pi pi-key" class="p-button-rounded p-button-text mr-1" pTooltip="Cambiar contraseña" (click)="openPwdDialog(user.id)"></button>
                                <button pButton icon="pi pi-history" class="p-button-rounded p-button-text mr-1" pTooltip="Ver logs" (click)="openLogs(user.id)"></button>
                                <button pButton icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" pTooltip="Eliminar" (click)="confirmDeleteUser(user)"></button>
                            </div>
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <tr>
                        <td colspan="7" class="text-center p-4 font-bold text-lg text-red-500">Sin resultados para “{{ search }}”.</td>
                    </tr>
                </ng-template>
            </p-table>
        </p-card>

        <!-- Form modal -->
        <app-user-form [visible]="showUserForm" [editingUser]="editingUser" (close)="onUserFormClose()" (save)="saveUser($event)"> </app-user-form>

        <!-- Cambiar contraseña -->
        <p-dialog header="Cambiar contraseña" [(visible)]="showPwdDialog" [modal]="true" [style]="{ width: '25rem' }">
            <div class="flex flex-column gap-3">
                <input pInputText type="password" [(ngModel)]="newPassword" placeholder="Nueva contraseña" />
                <div class="flex justify-end gap-2">
                    <button pButton label="Cancelar" (click)="showPwdDialog = false" class="p-button-text"></button>

                    <button pButton label="Guardar" icon="pi pi-check" [disabled]="!newPassword || newPassword.length < 8 || submittingPwd" (click)="submitPassword()"></button>
                </div>
            </div>
        </p-dialog>

        <!-- Logs del usuario -->
        <p-dialog header="Historial del usuario" [(visible)]="showLogsDialog" [modal]="true" [style]="{ width: '60rem' }">
            <p *ngIf="logsLoading" class="m-3">Cargando...</p>
            <p-table *ngIf="!logsLoading" [value]="logs">
                <ng-template pTemplate="header">
                    <tr>
                        <th>Evento</th>
                        <th>IP</th>
                        <th>User-Agent</th>
                        <th>Fecha</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-log>
                    <tr>
                        <td>{{ log.event_type }}</td>
                        <td>{{ log.ip_address }}</td>
                        <td class="ellipsis">{{ log.user_agent }}</td>
                        <td>{{ log.timestamp | date: 'short' }}</td>
                    </tr>
                </ng-template>
            </p-table>
        </p-dialog>

        <!-- Usuarios eliminados -->
        <p-dialog header="Usuarios Eliminados" [(visible)]="showDeletedDialog" [modal]="true" [style]="{ width: '70rem' }">
            <p-table [value]="deletedUsers" [loading]="loadingDeleted">
                <ng-template pTemplate="header">
                    <tr>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Roles</th>
                        <th>Acciones</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-user>
                    <tr>
                        <td>{{ user.full_name || '—' }}</td>
                        <td>{{ user.email }}</td>
                        <td>
                            <ng-container *ngFor="let role of user.roles">
                                <p-badge [value]="role.name" class="mr-1"></p-badge>
                            </ng-container>
                        </td>
                        <td>
                            <button pButton icon="pi pi-undo" label="Restaurar" class="p-button-success p-button-sm" (click)="restoreUser(user)"></button>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </p-dialog>

        <p-toast></p-toast>
        <p-confirmDialog></p-confirmDialog>
    `
})
export class UsersComponent {
    submittingPwd = false;

    // tabla
    users: User[] = [];
    total = 0;
    pageSize = 10;
    loading = false;

    // orden
    sortField?: string;
    sortOrder: number = 1;

    // búsqueda
    search = '';
    private searchBounce$ = new Subject<void>();
    private destroy$ = new Subject<void>();

    // selección / edición
    selectedUsers: User[] = [];
    showUserForm = false;
    editingUser: User | null = null;

    // cambiar contraseña
    showPwdDialog = false;
    targetUserId?: number;
    newPassword = '';

    // logs
    showLogsDialog = false;
    logs: AuditLog[] = [];
    logsLoading = false;

    // usuarios eliminados
    showDeletedDialog = false;
    deletedUsers: User[] = [];
    loadingDeleted = false;

    trackById = (_: number, u: User) => u.id;

    constructor(
        private usersService: UsersService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        // debounce de búsqueda
        this.searchBounce$.pipe(debounceTime(350), takeUntil(this.destroy$)).subscribe(() => this.reload({ page: 1 }));

        // primera carga
        this.reload();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // ====== Core de datos
    onSearchInput() {
        this.searchBounce$.next();
    }

    onLazyLoad(e: any) {
        const pageSize = e.rows == null ? this.pageSize : e.rows;
        const page = e.first && pageSize ? Math.floor(e.first / pageSize) + 1 : 1;

        this.sortField = (e.sortField as string) ?? this.sortField;
        this.sortOrder = typeof e.sortOrder === 'number' ? e.sortOrder : this.sortOrder;

        const ordering = this.sortField ? `${this.sortOrder === 1 ? '' : '-'}${this.sortField}` : undefined;

        this.reload({ page, page_size: pageSize, ordering });
    }

    reload(extra?: Partial<{ page: number; page_size: number; ordering?: string }>) {
        const params: any = {
            page: 1,
            page_size: this.pageSize,
            search: this.search?.trim() || undefined,
            ordering: undefined,
            ...extra
        };

        this.loading = true;
        // Filtrar parámetros undefined
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, value]) => value !== undefined)
        );

        this.usersService.getUsers(Object.keys(cleanParams).length > 0 ? cleanParams : undefined).subscribe({
            next: (res: any) => {
                this.users = res.results ?? res;
                this.total = res.count ?? (Array.isArray(res) ? res.length : this.total);
                if (params.page_size) this.pageSize = params.page_size;
                this.loading = false;
            },
            error: (err: any) => {
                this.loading = false;
                console.error('[UsersComponent] Error al cargar usuarios:', err);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar usuarios' });
            }
        });
    }

    // ====== Exportar CSV (usa el mismo filtro de búsqueda)
    exportCsv() {
        this.usersService.exportUsers().subscribe({
            next: (blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `usuarios_${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
                window.URL.revokeObjectURL(url);
                this.messageService.add({ severity: 'success', summary: 'Exportado', detail: 'Archivo CSV descargado correctamente' });
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo exportar el archivo' });
            }
        });
    }

    // ====== CRUD UI
    openNewUserForm() {
        this.editingUser = null;
        this.showUserForm = true;
    }

    onUserFormClose() {
        this.showUserForm = false;
    }

    getSeverity(role: string): 'info' | 'success' | 'warn' {
        if (role === 'Super-Admin') return 'info';
        if (role === 'ClientAdmin') return 'warn';
        return 'success';
    }

    onEditUser(user: User) {
        this.editingUser = user;
        this.showUserForm = true;
    }

    confirmDeleteUser(user: User) {
        const totalUsers = this.users.length;
        const userRoles = user.roles?.map((r) => r.name) || [];
        const isSuperAdmin = userRoles.includes('Super-Admin');
        const isLastUser = totalUsers === 1;

        if (isSuperAdmin && isLastUser) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Acción no permitida',
                detail: 'No puedes eliminar el único usuario con rol Super-Admin.'
            });
            return;
        }

        this.confirmationService.confirm({
            message: `¿Eliminar a ${user.full_name}?`,
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.usersService.deleteUser(user.id).subscribe({
                    next: () => {
                        this.users = this.users.filter(u => u.id !== user.id);
                        this.total--;
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Usuario eliminado',
                            detail: `${user.full_name} ha sido eliminado correctamente`
                        });
                    },
                    error: (err) => {
                        console.error('Error eliminando usuario:', err);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'No se pudo eliminar el usuario'
                        });
                    }
                });
            }
        });
    }

    saveUser(user: User) {
        if (user.id) {
            this.usersService.updateUser(user.id, user).subscribe({
                next: (updated) => {
                    const idx = this.users.findIndex((u) => u.id === updated.id);
                    if (idx !== -1) this.users[idx] = updated;
                    this.messageService.add({ severity: 'success', summary: 'Usuario actualizado' });
                    this.showUserForm = false;
                },
                error: (err: any) => {
                    const e = err?.error;
                    const detail = (e?.email && e.email.join ? e.email.join(', ') : e?.email) || (e?.role_ids && e.role_ids.join ? e.role_ids.join(', ') : e?.role_ids) || e?.detail || 'No se pudo actualizar el usuario';
                    this.messageService.add({ severity: 'error', summary: 'Error', detail });
                }
            });
        } else {
            this.usersService.createUser(user).subscribe({
                next: (created) => {
                    this.users.unshift(created);
                    this.total++;
                    this.messageService.add({ severity: 'success', summary: 'Usuario creado', detail: `${created.full_name} ha sido creado correctamente` });
                    this.showUserForm = false;
                },
                error: (err: any) => {
                    const e = err?.error;
                    const detail = (e?.email && e.email.join ? e.email.join(', ') : e?.email) || e?.detail || 'No se pudo crear el usuario';
                    this.messageService.add({ severity: 'error', summary: 'Error', detail });
                }
            });
        }
    }

    // ====== Cambiar contraseña
    openPwdDialog(userId: number) {
        this.targetUserId = userId;
        this.newPassword = '';
        this.showPwdDialog = true;
    }

    submitPassword() {
        if (!this.targetUserId || !this.newPassword || this.newPassword.length < 8) return;
        this.submittingPwd = true;
        this.usersService.changePassword(this.targetUserId, this.newPassword).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Contraseña cambiada', detail: 'La contraseña ha sido actualizada correctamente' });
                this.showPwdDialog = false;
                this.submittingPwd = false;
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cambiar la contraseña' });
                this.submittingPwd = false;
            }
        });
    }

    // ====== Logs
    openLogs(userId: number) {
        this.logs = [];
        this.logsLoading = true;
        this.showLogsDialog = true;
        this.usersService.getUserLogs(userId).subscribe({
            next: (logs) => {
                this.logs = logs;
                this.logsLoading = false;
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los logs del usuario' });
                this.logsLoading = false;
            }
        });
    }

    showDeletedUsers() {
        this.loadingDeleted = true;
        this.showDeletedDialog = true;
        this.usersService.getDeletedUsers().subscribe({
            next: (users) => {
                this.deletedUsers = users;
                this.loadingDeleted = false;
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar usuarios eliminados' });
                this.loadingDeleted = false;
            }
        });
    }

    restoreUser(user: User) {
        this.usersService.restoreUser(user.id).subscribe({
            next: () => {
                this.deletedUsers = this.deletedUsers.filter(u => u.id !== user.id);
                this.messageService.add({ severity: 'success', summary: 'Restaurado', detail: `${user.full_name} ha sido restaurado` });
                this.reload(); // Recargar lista principal
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo restaurar el usuario' });
            }
        });
    }
}
