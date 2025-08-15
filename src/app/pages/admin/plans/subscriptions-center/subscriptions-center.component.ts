import { Component, OnInit, ChangeDetectionStrategy, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { TabViewModule } from 'primeng/tabview';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { EntitlementsService, Entitlements } from '../../../../layout/service/entitlements.service';

type Invoice = {
    id: string;
    number: string;
    amount: number;
    currency: string;
    status: 'paid' | 'open' | 'void';
    created_at: string; // ISO string
    hosted_invoice_url?: string | null;
};

type AuditLog = {
    id: number;
    action: string;
    actor: string;
    details: string;
    created_at: string; // ISO string
};

@Component({
    selector: 'app-subscription-center',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [MessageService],
    imports: [CommonModule, TabViewModule, CardModule, ButtonModule, TagModule, DividerModule, ProgressBarModule, TableModule, SkeletonModule, TooltipModule, ToastModule],
    template: `
        <div class="surface-section border-round-xl p-3 md:p-4">
            <p-toast></p-toast>

            <p-tabView (onChange)="onTabChange($event.index)">
                <!-- ================= Resumen ================= -->
                <p-tabPanel header="Resumen" leftIcon="pi pi-chart-bar" [selected]="true">
                   <p-card class="mb-3" header="Tu suscripción">
  <!-- 👇 Esto SIEMPRE es truthy, aunque vm.e sea null -->
  <ng-container *ngIf="{ e: (ent$ | async) } as vm">
    <!-- 1) CARGANDO -->
    <ng-container *ngIf="loadingResumenSig(); else loadedState">
      <div class="flex flex-column gap-2">
        <p-skeleton width="50%" height="1.4rem"></p-skeleton>
        <p-skeleton width="80%" height="1rem"></p-skeleton>
        <p-skeleton width="100%" height="8px"></p-skeleton>
      </div>
    </ng-container>

    <!-- 2) CARGADO: SIN PLAN o CON PLAN -->
    <ng-template #loadedState>
      <ng-container *ngIf="vm.e !== null; else noPlan">
        <!-- ======= CON PLAN ======= -->
        <div class="flex align-items-center gap-2 mb-3">
          <i class="pi pi-star-fill text-primary" aria-hidden="true"></i>
          <span class="text-900 text-2xl font-bold">{{ vm.e.plan_display || 'Sin plan' }}</span>
          <p-tag [severity]="statusSeverity(vm.e)" [value]="statusLabel(vm.e)"></p-tag>
        </div>

        <div class="flex flex-wrap gap-2 mb-3">
          <p-tag icon="pi pi-calendar"
                 [value]="vm.e.duration_month + ' mes' + (vm.e.duration_month > 1 ? 'es' : '')"
                 severity="info"></p-tag>

          <ng-container *ngIf="vm.e.limits?.['max_employees'] === 0; else conLimiteTag">
            <p-tag icon="pi pi-users" value="Empleados: ∞" severity="success" pTooltip="Ilimitado"></p-tag>
          </ng-container>
          <ng-template #conLimiteTag>
            <p-tag icon="pi pi-users"
                   [value]="'Empleados: ' + (vm.e.usage?.['employees'] ?? 0) + '/' + (vm.e.limits?.['max_employees'] ?? 0)"
                   severity="secondary"></p-tag>
          </ng-template>
        </div>

        <ng-container *ngIf="(vm.e.limits?.['max_employees'] ?? 0) > 0">
          <div class="flex justify-content-between text-700 mb-1">
            <small>Uso de empleados</small>
            <small>{{ usagePct(vm.e) | number:'1.0-0' }}%</small>
          </div>
          <p-progressBar [value]="usagePct(vm.e)"></p-progressBar>
        </ng-container>

        <p-divider></p-divider>

        <div class="flex flex-wrap gap-2">
          <button pButton icon="pi pi-sync" label="Actualizar"
                  (click)="refreshResumen()" [disabled]="loadingResumenSig()"></button>
          <button pButton icon="pi pi-list" label="Ver planes" class="p-button-help" (click)="goToPlans()"></button>
        </div>
        <!-- ======= /CON PLAN ======= -->
      </ng-container>
    </ng-template>

    <!-- 3) SIN PLAN -->
    <ng-template #noPlan>
      <div class="text-700">
        <p>No tienes un plan activo.</p>
        <button pButton icon="pi pi-shopping-bag" label="Elegir plan" (click)="goToPlans()"></button>
      </div>
    </ng-template>
  </ng-container>
</p-card>

                </p-tabPanel>

                <!-- ================= Facturas ================= -->
                <p-tabPanel header="Facturas" leftIcon="pi pi-file">
                    <p-card>
                        <ng-container *ngIf="loadedInvoices; else invoicesLazy">
                            <ng-container *ngIf="loadingInvoices(); else invoicesContent">
                                <p-skeleton width="60%" height="1.2rem"></p-skeleton>
                                <p-skeleton width="100%" height="8rem" class="mt-3"></p-skeleton>
                            </ng-container>
                            <ng-template #invoicesContent>
                                <ng-container *ngIf="invoices.length; else invoicesEmpty">
                                    <p-table [value]="invoices" [paginator]="true" [rows]="10" responsiveLayout="scroll" dataKey="id" [rowTrackBy]="trackByInvoice">
                                        <ng-template pTemplate="header">
                                            <tr>
                                                <th>#</th>
                                                <th>Monto</th>
                                                <th>Estado</th>
                                                <th>Fecha</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </ng-template>
                                        <ng-template pTemplate="body" let-inv>
                                            <tr>
                                                <td>{{ inv.number }}</td>
                                                <td>{{ inv.amount | currency: inv.currency }}</td>
                                                <td>
                                                    <p-tag [severity]="inv.status === 'paid' ? 'success' : inv.status === 'open' ? 'warning' : 'danger'" [value]="inv.status"> </p-tag>
                                                </td>
                                                <td>{{ inv.created_at | date: 'medium' }}</td>
                                                <td>
                                                    <button pButton icon="pi pi-external-link" class="p-button-text" [disabled]="!inv.hosted_invoice_url" (click)="openInvoice(inv.hosted_invoice_url ?? undefined)" aria-label="Abrir factura"></button>
                                                </td>
                                            </tr>
                                        </ng-template>
                                    </p-table>
                                </ng-container>
                                <ng-template #invoicesEmpty>
                                    <div class="text-700">No hay facturas para mostrar.</div>
                                </ng-template>

                                <div class="mt-3">
                                    <button pButton icon="pi pi-refresh" label="Actualizar" (click)="loadInvoices()"></button>
                                </div>
                            </ng-template>
                        </ng-container>
                        <ng-template #invoicesLazy>
                            <p-skeleton width="60%" height="1.2rem"></p-skeleton>
                        </ng-template>
                    </p-card>
                </p-tabPanel>

                <!-- ================= Auditoría ================= -->
                <p-tabPanel header="Auditoría" leftIcon="pi pi-history">
                    <p-card>
                        <ng-container *ngIf="loadedAudit; else auditLazy">
                            <ng-container *ngIf="loadingAudit(); else auditContent">
                                <p-skeleton width="60%" height="1.2rem"></p-skeleton>
                                <p-skeleton width="100%" height="8rem" class="mt-3"></p-skeleton>
                            </ng-container>
                            <ng-template #auditContent>
                                <ng-container *ngIf="auditLogs.length; else auditEmpty">
                                    <p-table [value]="auditLogs" [paginator]="true" [rows]="10" responsiveLayout="scroll" [rowTrackBy]="trackByAudit">
                                        <ng-template pTemplate="header">
                                            <tr>
                                                <th>Acción</th>
                                                <th>Actor</th>
                                                <th>Detalles</th>
                                                <th>Fecha</th>
                                            </tr>
                                        </ng-template>
                                        <ng-template pTemplate="body" let-log>
                                            <tr>
                                                <td>{{ log.action }}</td>
                                                <td>{{ log.actor }}</td>
                                                <td>{{ log.details }}</td>
                                                <td>{{ log.created_at | date: 'medium' }}</td>
                                            </tr>
                                        </ng-template>
                                    </p-table>
                                </ng-container>
                                <ng-template #auditEmpty>
                                    <div class="text-700">Sin eventos de auditoría.</div>
                                </ng-template>

                                <div class="mt-3">
                                    <button pButton icon="pi pi-refresh" label="Actualizar" (click)="loadAudit()"></button>
                                </div>
                            </ng-template>
                        </ng-container>
                        <ng-template #auditLazy>
                            <p-skeleton width="60%" height="1.2rem"></p-skeleton>
                        </ng-template>
                    </p-card>
                </p-tabPanel>

                <!-- ================= Pago ================= -->
                <p-tabPanel header="Pago" leftIcon="pi pi-credit-card">
                    <p-card header="Método de pago">
                        <ng-container *ngIf="loadedPayment; else paymentLazy">
                            <ng-container *ngIf="loadingPayment(); else paymentContent">
                                <p-skeleton width="40%" height="1.2rem"></p-skeleton>
                                <p-skeleton width="100%" height="2rem" class="mt-2"></p-skeleton>
                            </ng-container>
                            <ng-template #paymentContent>
                                <div class="flex align-items-center gap-2 mb-3" *ngIf="paymentMethod; else noPM">
                                    <i class="pi pi-credit-card" aria-hidden="true"></i>
                                    <div>
                                        <div class="text-900 font-medium">{{ paymentMethod!.brand | uppercase }} ···· {{ paymentMethod!.last4 }}</div>
                                        <small class="text-600">Expira {{ paymentMethod!.exp_month }}/{{ paymentMethod!.exp_year }}</small>
                                    </div>
                                </div>
                                <ng-template #noPM>
                                    <div class="text-700">No hay método de pago guardado.</div>
                                </ng-template>

                                <div class="flex flex-wrap gap-2">
                                    <button pButton icon="pi pi-pencil" label="Actualizar tarjeta" (click)="updatePayment()"></button>
                                    <button pButton icon="pi pi-external-link" label="Ir a portal de pagos" class="p-button-outlined" (click)="openBillingPortal()"></button>
                                </div>
                            </ng-template>
                        </ng-container>
                        <ng-template #paymentLazy>
                            <p-skeleton width="40%" height="1.2rem"></p-skeleton>
                        </ng-template>
                    </p-card>
                </p-tabPanel>
            </p-tabView>
        </div>
    `
})
export class SubscriptionCenterComponent implements OnInit {
    ent$!: Observable<Entitlements | null>;

    // loading flags (signals) y flags de pestaña cargada
    loadingResumenSig = signal(false);
    loadingInvoices = signal(false);
    loadingAudit = signal(false);
    loadingPayment = signal(false);

    loadedInvoices = false;
    loadedAudit = false;
    loadedPayment = false;

    invoices: Invoice[] = [];
    auditLogs: AuditLog[] = [];
    paymentMethod: { brand: string; last4: string; exp_month: number; exp_year: number } | null = null;

    constructor(
        private entitlements: EntitlementsService,
        private router: Router,
        private messageService: MessageService,
        private cd: ChangeDetectorRef
    ) {
        this.ent$ = this.entitlements.entitlements$;
    }

    ngOnInit(): void {
        // Solo la primera pestaña al cargar:
        this.refreshResumen();
    }

    onTabChange(index: number) {
        // 0 Resumen, 1 Facturas, 2 Auditoría, 3 Pago
        if (index === 1 && !this.loadedInvoices) {
            this.loadedInvoices = true;
            this.loadInvoices();
        }
        if (index === 2 && !this.loadedAudit) {
            this.loadedAudit = true;
            this.loadAudit();
        }
        if (index === 3 && !this.loadedPayment) {
            this.loadedPayment = true;
            this.loadPayment();
        }
        this.cd.markForCheck();
    }

    // ======== Resumen ========
    refreshResumen(): void {
        if (this.loadingResumenSig()) return;
        this.loadingResumenSig.set(true);
        // si tu servicio es http, esto es rápido y no bloquea el hilo
        this.entitlements.refresh();
        // pequeño delay visual; puedes quitarlo
        setTimeout(() => this.loadingResumenSig.set(false), 150);
    }

    usagePct(e: Entitlements): number {
        const used = e.usage?.['employees'] ?? 0;
        const max = e.limits?.['max_employees'] ?? 0;
        if (!max || max <= 0) return 0;
        return (used / max) * 100;
    }

    hasActiveSubscription(e: Entitlements | null | undefined): boolean {
        if (!e) return false;
        const anyE = e as any;
        if (typeof anyE.status === 'string') return anyE.status === 'active' || anyE.status === 'trialing';
        if (typeof anyE.is_active === 'boolean') return anyE.is_active;
        return true;
    }

    statusLabel(e: Entitlements): string {
        const s = (e as any).status as string | undefined;
        if (s) {
            switch (s) {
                case 'active':
                    return 'Activo';
                case 'trialing':
                    return 'En prueba';
                case 'past_due':
                    return 'Pago vencido';
                case 'unpaid':
                    return 'Impago';
                case 'canceled':
                    return 'Cancelado';
                case 'incomplete':
                    return 'Incompleto';
                case 'incomplete_expired':
                    return 'Expirado';
                default:
                    return s;
            }
        }
        if ((e as any).is_active === false) return 'Inactivo';
        return 'Activo';
    }

    statusSeverity(e: Entitlements): 'success' | 'warning' | 'danger' | 'info' | 'secondary' {
        const s = (e as any).status as string | undefined;
        if (s) {
            switch (s) {
                case 'active':
                    return 'success';
                case 'trialing':
                    return 'info';
                case 'past_due':
                    return 'warning';
                case 'unpaid':
                    return 'danger';
                case 'canceled':
                    return 'secondary';
                case 'incomplete':
                case 'incomplete_expired':
                    return 'warning';
                default:
                    return 'secondary';
            }
        }
        return (e as any).is_active === false ? 'warning' : 'success';
    }

    goToPlans(): void {
        this.router.navigate(['/admin/plans']);
    }

    // ======== Facturas ========
    loadInvoices(): void {
        this.loadingInvoices.set(true);
        // Simulación no-bloqueante (mejor que setTimeout)
        of<Invoice[]>([
            {
                id: 'inv_123',
                number: 'INV-001',
                amount: 29.99,
                currency: 'USD',
                status: 'paid',
                created_at: new Date().toISOString(),
                hosted_invoice_url: 'https://example.com/invoice/123'
            }
        ])
            .pipe(delay(300))
            .subscribe((data) => {
                this.invoices = data;
                this.loadingInvoices.set(false);
                this.cd.markForCheck();
            });
    }

    openInvoice(url?: string): void {
        if (url) window.open(url, '_blank', 'noopener');
    }

    trackByInvoice = (_: number, inv: Invoice) => inv.id;

    // ======== Auditoría ========
    loadAudit(): void {
        this.loadingAudit.set(true);
        of<AuditLog[]>([
            {
                id: 1,
                action: 'subscription_created',
                actor: 'admin@example.com',
                details: 'Plan Premium activado',
                created_at: new Date().toISOString()
            }
        ])
            .pipe(delay(300))
            .subscribe((data) => {
                this.auditLogs = data;
                this.loadingAudit.set(false);
                this.cd.markForCheck();
            });
    }

    trackByAudit = (_: number, log: AuditLog) => log.id;

    // ======== Pago ========
    loadPayment(): void {
        this.loadingPayment.set(true);
        of<{ brand: string; last4: string; exp_month: number; exp_year: number } | null>({
            brand: 'visa',
            last4: '4242',
            exp_month: 12,
            exp_year: 2025
        })
            .pipe(delay(300))
            .subscribe((pm) => {
                this.paymentMethod = pm;
                this.loadingPayment.set(false);
                this.cd.markForCheck();
            });
    }

    updatePayment(): void {
        this.messageService.add({ severity: 'info', summary: 'Próximamente', detail: 'Función no implementada aún' });
    }

    openBillingPortal(): void {
        this.messageService.add({ severity: 'info', summary: 'Próximamente', detail: 'Portal de facturación no implementado aún' });
    }
}
