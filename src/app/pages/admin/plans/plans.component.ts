import { PlansFormComponent } from './plans-form/plans-form.component';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlansService } from './plans.service';
import { Plan } from './plan.model';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialog, ConfirmDialogModule } from 'primeng/confirmdialog';
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

            <p-table [value]="plans" [paginator]="true" [rows]="5" responsiveLayout="scroll">
                <ng-template pTemplate="header">
                    <tr>
                        <th>Nombre</th>
                        <th>Precio</th>
                        <th>Descripción</th>
                        <th>Límite de usuarios</th>
                        <th>Características</th>
                        <th>Estado</th>
                        <th>Creado</th>
                        <th>Acciones</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-plan>
                    <tr>
                        <td>{{ plan.name }}</td>
                        <td>{{ plan.price | currency: 'USD' }}</td>
                        <td>{{ plan.description }}</td>
                        <td>
                            <span *ngIf="plan.usersLimit !== null">{{ plan.usersLimit }}</span>
                            <span *ngIf="plan.usersLimit === null" pTooltip="Ilimitado" class="text-green-500 text-4xl">∞</span>
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
                        <td>
                            <button pButton icon="pi pi-pencil" class="p-button-rounded p-button-text" pTooltip="Editar" (click)="openEditDialog(plan)"></button>

                            <button pButton icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" pTooltip="Eliminar" (click)="deletePlan(plan)"></button>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </p-card>

        <p-confirmDialog></p-confirmDialog>
        <p-toast></p-toast>

        <app-plans-form [visible]="showCreateDialog" [plan]="selectedPlan" (close)="showCreateDialog = false" (save)="handleSave($event)"> </app-plans-form>
    `
})
export class PlansComponent {
    showCreateDialog = false;
    selectedPlan?: Plan;
    plans: Plan[] = [];

    constructor(
        private plansService: PlansService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit(): void {
        this.plansService.getPlans().subscribe((data) => (this.plans = data));
    }

    openCreateDialog(): void {
        this.selectedPlan = undefined;
        this.showCreateDialog = true;
    }

    openEditDialog(plan: Plan): void {
        this.selectedPlan = { ...plan }; // evita mutaciones directas
        this.showCreateDialog = true;
    }

    deletePlan(planToDelete: Plan): void {
        this.confirmationService.confirm({
            message: `¿Estás seguro de eliminar el plan "${planToDelete.name}"?`,
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí',
            rejectLabel: 'Cancelar',
            accept: () => {
                if (!planToDelete?.id) return;

                console.log('Antes de eliminar:', this.plans.length);
                this.plans = this.plans.filter((plan) => plan.id !== planToDelete.id);
                this.plans = [...this.plans];
                console.log('Después de eliminar:', this.plans.length);

                this.messageService.add({
                    severity: 'success',
                    summary: 'Eliminado',
                    detail: `Plan "${planToDelete.name}" eliminado correctamente.`
                });
            }
        });
    }

    onHide(): void {
        this.showCreateDialog = false;
        this.selectedPlan = undefined;
    }

   handleSave(plan: Plan): void {
  const isEditing = !!this.plans.find(p => p.id === plan.id);

  const nameExists = this.plans.some(p => 
    p.name.toLowerCase() === plan.name.toLowerCase() && p.id !== plan.id
  );

  const priceExists = this.plans.some(p => 
    p.price === plan.price && p.id !== plan.id
  );

  if (nameExists) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: `Ya existe un plan con el nombre "${plan.name}".`
    });
    return;
  }

  if (priceExists) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: `Ya existe un plan con el precio "${plan.price}".`
    });
    return;
  }

  const index = this.plans.findIndex(p => p.id === plan.id);

  if (index !== -1) {
    this.plans[index] = plan;
    this.messageService.add({
      severity: 'success',
      summary: 'Actualizado',
      detail: `El plan "${plan.name}" fue actualizado.`
    });
  } else {
    this.plans.push(plan);
    this.messageService.add({
      severity: 'success',
      summary: 'Creado',
      detail: `El plan "${plan.name}" fue creado exitosamente.`
    });
  }

  this.showCreateDialog = false;
}

}
