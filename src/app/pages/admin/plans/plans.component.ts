import { PlansFormComponent } from './plans-form/plans-form.component';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlansService, PlansQuery, Paginated } from './plans.service';
import { Entitlements, EntitlementsService } from '../../../layout/service/entitlements.service';
import { Plan } from './plan.model';
import { Observable, of } from 'rxjs';

import { CardModule } from 'primeng/card';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';

@Component({
    selector: 'app-plans',
    standalone: true,
    providers: [PlansService, MessageService, ConfirmationService],
    imports: [CommonModule, CardModule, TableModule, ButtonModule, TagModule, TooltipModule, PlansFormComponent, ConfirmDialogModule, Toast],
    template: `
        <p-card header="Planes de Suscripción">
            <div class="flex justify-content-end mb-3">
                <button pButton icon="pi pi-plus" label="Nuevo Plan" class="p-button-md" (click)="openCreateDialog()"></button>
            </div>

            <p-table [value]="plans" [lazy]="true" [paginator]="true" [rows]="pageSize" [totalRecords]="totalRecords" [loading]="loading" responsiveLayout="scroll" (onLazyLoad)="load($event)" dataKey="id">
                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="name">Nombre <p-sortIcon field="name" /></th>
                        <th pSortableColumn="price">Precio <p-sortIcon field="price" /></th>
                        <th>Descripción</th>
                        <th>Límite de usuarios</th>
                        <th>Características</th>

                        <th pSortableColumn="is_active">Estado <p-sortIcon field="is_active" /></th>
                        <th pSortableColumn="created_at">Creado <p-sortIcon field="created_at" /></th>
                        <th pSortableColumn="duration_month">Duración (meses) <p-sortIcon field="duration_month" /></th>
                        <th>Acciones</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-plan>
                    <tr>
                        <td>{{ plan.name }}</td>
                        <td>{{ plan.price | currency: 'USD' }}</td>
                        <td>{{ plan.description }}</td>

                        <td>
                            <span *ngIf="plan.employeesLimit !== null">{{ plan.employeesLimit }}</span>
                            <span *ngIf="plan.employeesLimit === null" pTooltip="Ilimitado" class="text-green-500 text-4xl">∞</span>
                        </td>
                        <td>
                            <ul class="m-0 pl-3">
                                <li *ngFor="let feat of plan.features">{{ feat }}</li>
                            </ul>
                        </td>
                        <td>
                            <p-tag [value]="plan.isActive ? 'Activo' : 'Inactivo'" [severity]="plan.isActive ? 'success' : 'danger'"></p-tag>
                        </td>
                        <td>{{ plan.createdAt | date: 'short' }}</td>
                        <td>{{ plan.durationMonths }}</td>
                        <td class="flex gap-2">
                            <button pButton icon="pi pi-pencil" class="p-button-rounded p-button-text" pTooltip="Editar" (click)="openEditDialog(plan)"></button>
                            <button pButton icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" pTooltip="Eliminar" (click)="deletePlan(plan)"></button>
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <tr>
                        <td colspan="8" class="text-center text-700">Sin resultados</td>
                    </tr>
                </ng-template>
            </p-table>
          <div *ngIf="ent$ | async as e" class="mx-auto max-w-30rem">
  <p-card class="shadow-2 border-round-2xl">
    <div class="flex align-items-center gap-2 mb-2">
      <i class="pi pi-star-fill text-primary"></i>
      <span class="text-900 text-3xl font-semibold">{{ e.plan_display }}</span>
    </div>

    <div class="flex flex-wrap gap-2 mb-2 text-lg">
      <p-tag icon="pi pi-calendar"
             [value]="e.duration_month + ' mes' + (e.duration_month > 1 ? 'es' : '')"
             severity="info"></p-tag>

      <ng-container *ngIf="e.limits.max_employees === 0; else conLimiteTag">
        <p-tag icon="pi pi-users" value="Empleados: ∞" severity="success" pTooltip="Ilimitado"></p-tag>
      </ng-container>
      <ng-template #conLimiteTag>
        <p-tag icon="pi pi-users"
               [value]="'Empleados: ' + e.usage.employees + '/' + e.limits.max_employees"
               severity="secondary"></p-tag>
      </ng-template>
    </div>

    <!-- Barra de capacidad (sin módulos extra) -->
    <ng-container *ngIf="e.limits.max_employees > 0">
      <div class="flex justify-content-between text-700 text-lg mb-1 ml-4">
        <span>Uso de empleados</span>
        <span>{{ ((e.usage.employees / e.limits.max_employees) * 100) | number:'1.0-0' }}%</span>
      </div>
      <div class="w-full surface-200 border-round overflow-hidden" style="height: 8px;">
        <div class="h-full bg-primary"
             [style.width.%]="(e.usage.employees / e.limits.max_employees) * 100"></div>
      </div>
    </ng-container>
  </p-card>
</div>

        </p-card>


        <p-confirmDialog></p-confirmDialog>
        <p-toast></p-toast>

        <app-plans-form [visible]="showCreateDialog" [plan]="selectedPlan" (close)="onHide()" (save)="handleSave($event)"> </app-plans-form>
    `
})
export class PlansComponent {
    showCreateDialog = false;
    selectedPlan: Plan | undefined;

    plans: Plan[] = [];
    totalRecords = 0;
    pageSize = 5;
    loading = false;

    // Agregar la propiedad ent$ que faltaba
    ent$: Observable<any> | undefined;

    private lastEvent: TableLazyLoadEvent | null = null;

    constructor(
        private plansService: PlansService,
        private messageService: MessageService,
        private entitlementsService: EntitlementsService,
        private confirmationService: ConfirmationService
    ) {}

    // PrimeNG llama a load() al paginar/ordenar; disparamos una inicial manual
    ngOnInit(): void {
        const initial: TableLazyLoadEvent = { first: 0, rows: this.pageSize, sortField: 'created_at', sortOrder: -1 };

        this.load(initial);

        // Inicializar ent$ con el servicio de entitlements
        this.ent$ = this.entitlementsService.entitlements$;
    }

    // === Data loading (server-side) ===
    load(event: TableLazyLoadEvent) {
        this.lastEvent = event;
        this.loading = true;

        const q: PlansQuery = this.toQuery(event);
        this.plansService.list(q).subscribe({
            next: (res) => {
                this.plans = res.results;
                this.totalRecords = res.count;
                this.loading = false;
            },
            error: () => {
                this.loading = false;
            }
        });
    }

    private toQuery(event: TableLazyLoadEvent): PlansQuery {
        const pageSize: number = event.rows ?? this.pageSize;
        const first: number = event.first ?? 0;

        // Ensure pageSize is never 0 to avoid division by zero
        const safePageSize: number = Math.max(1, pageSize);
        const page: number = Math.floor(first / safePageSize) + 1;

        let ordering: string | undefined;
        if (event.sortField && event.sortOrder) {
            ordering = event.sortOrder < 0 ? `-${event.sortField}` : `${event.sortField}`;
        }

        return {
            page,
            page_size: pageSize,
            ordering
            // aquí podrías añadir search/filtros cuando los tengas en la UI
        };
    }

    // === Dialog ===
    openCreateDialog(): void {
        this.selectedPlan = undefined;
        this.showCreateDialog = true;
    }

    openEditDialog(plan: Plan): void {
        this.selectedPlan = { ...plan }; // evita mutaciones directas
        this.showCreateDialog = true;
    }

    onHide(): void {
        this.showCreateDialog = false;
        this.selectedPlan = undefined;
    }

    // === Save (create/update) ===
    handleSave(plan: Plan): void {
        const isEditing = !!plan.id;
        const req$ = isEditing ? this.plansService.updatePlan(plan.id!!, plan) : this.plansService.createPlan(plan);

        req$.subscribe({
            next: (saved) => {
                this.messageService.add({
                    severity: 'success',
                    summary: isEditing ? 'Actualizado' : 'Creado',
                    detail: `El plan "${saved.name}" fue ${isEditing ? 'actualizado' : 'creado'} correctamente.`
                });
                this.showCreateDialog = false;
                this.selectedPlan = undefined;
                if (this.lastEvent) this.load(this.lastEvent); // recarga lista manteniendo página/orden
            },
            error: (e) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo guardar el plan.'
                });
            }
        });
    }

    // === Delete ===
    deletePlan(planToDelete: Plan): void {
        this.confirmationService.confirm({
            message: `¿Estás seguro de eliminar el plan "${planToDelete.name}"?`,
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí',
            rejectLabel: 'Cancelar',
            accept: () => {
                if (!planToDelete?.id) return;
                this.plansService.deletePlan(planToDelete.id).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Eliminado',
                            detail: `Plan "${planToDelete.name}" eliminado correctamente.`
                        });
                        if (this.lastEvent) this.load(this.lastEvent);
                    },
                    error: (error) => {
                        if (error.status === 400 && error.error?.active_subscriptions) {
                            // Plan tiene suscripciones activas, ofrecer desactivar
                            this.offerDeactivation(planToDelete, error.error);
                        } else {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: error.error?.message || 'No se pudo eliminar el plan.'
                            });
                        }
                    }
                });
            }
        });
    }

    private offerDeactivation(plan: Plan, errorData: any): void {
        this.confirmationService.confirm({
            message: `${errorData.message}\n\n¿Deseas desactivar el plan en su lugar?`,
            header: 'Plan con Suscripciones Activas',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Desactivar',
            rejectLabel: 'Cancelar',
            accept: () => {
                if (!plan?.id) return;
                this.plansService.deactivatePlan(plan.id).subscribe({
                    next: (response: any) => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Plan Desactivado',
                            detail: response.message || `Plan "${plan.name}" desactivado correctamente.`
                        });
                        if (this.lastEvent) this.load(this.lastEvent);
                    },
                    error: () => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'No se pudo desactivar el plan.'
                        });
                    }
                });
            }
        });
    }
}
