import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Plan } from '../plan.model';
import { PlansService } from '../plans.service';
import { Dialog } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ChipsModule } from 'primeng/chips';
import { ReactiveFormsModule } from '@angular/forms';
import { Checkbox } from 'primeng/checkbox';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputGroupModule } from 'primeng/inputgroup';
import { FloatLabel } from 'primeng/floatlabel';
import { DropdownModule } from 'primeng/dropdown';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-plans-form',
    standalone: true,
    providers: [],
    imports: [Dialog, ButtonModule, InputTextModule, InputNumberModule, Checkbox, ChipsModule, ReactiveFormsModule, InputGroup, InputGroupAddon, IftaLabelModule, InputGroupModule, FormsModule, FloatLabel, DropdownModule, CommonModule],
    template: `
        <p-dialog [(visible)]="visible" (onHide)="onHide()" header="Crear Tipo de Plan" [modal]="true" [style]="{ width: '600px' }" [closeOnEscape]="true" [dismissableMask]="true">
            <form [formGroup]="planForm" (ngSubmit)="submitForm()" class="p-fluid my-8">
                <div class="field my-4">
                    <p-floatlabel variant="on">
                        <p-dropdown formControlName="name" [options]="planNameOptions" placeholder="Selecciona un plan" styleClass="w-full"></p-dropdown>
                        <label>Nombre del Plan</label>
                    </p-floatlabel>
                </div>
                <small class="p-error text-red-500 font-bold text-lg" *ngIf="planForm.get('name')?.errors?.['server']">
                    {{ planForm.get('name')?.errors?.['server'] }}
                </small>

                <div class="field my-8">
                    <p-inputgroup class="w-full">
                        <p-inputgroup-addon>
                            <i class="pi pi-dollar"></i>
                        </p-inputgroup-addon>
                        <p-floatlabel class="w-full">
                            <p-inputnumber class="w-full" formControlName="price" inputId="price" mode="currency" currency="USD" locale="en-US" />
                            <label for="price">Precio Mensual</label>
                        </p-floatlabel>
                    </p-inputgroup>
                </div>

                <div class="field my-4">
                    <p-floatlabel variant="on">
                        <textarea pTextarea class="w-full bg-gray-100 p-2 rounded-lg" id="description" formControlName="description" rows="5" style="resize: none"></textarea>
                        <label for="description">Descripción del Plan</label>
                    </p-floatlabel>
                </div>

                <div class="field my-4">
                    <p-floatlabel variant="on">
                        <p-inputnumber class="w-full" formControlName="employeesLimit" [min]="1" [max]="500" [showButtons]="true" mode="decimal" locale="en-US" />
                        <label for="employeesLimit">Límite de Empleados</label>
                    </p-floatlabel>
                </div>

                <div class="field my-4">
                    <p-floatlabel variant="on">
                        <p-inputnumber class="w-full" formControlName="usersLimit" [min]="1" [max]="1000" [showButtons]="true" mode="decimal" locale="en-US" />
                        <label for="usersLimit">Límite de Usuarios</label>
                    </p-floatlabel>
                </div>

                <div class="field my-4">
                    <p-chips formControlName="features" class="w-full" placeholder="Ej: Agenda, POS, Inventario"></p-chips>
                </div>

                <div class="field my-4">
                    <p-floatlabel variant="on">
                        <p-inputnumber class="w-full" formControlName="durationMonths" [min]="1" [max]="36" [showButtons]="true" mode="decimal" locale="en-US" />
                        <label for="durationMonths">Duración (meses)</label>
                    </p-floatlabel>
                </div>

                <div class="field-checkbox my-4">
                    <p-checkbox formControlName="isActive" binary="true" inputId="activo"></p-checkbox>
                    <label for="activo">¿ Plan activo ?</label>
                </div>

                <div class="field-checkbox mt-2">
                    <p-checkbox formControlName="isUnlimited" binary="true" inputId="unlimited"> </p-checkbox>
                    <label for="unlimited">¿Usuarios Ilimitados?</label>
                </div>

                <div class="flex justify-content-end gap-2 mt-4">
                    <button pButton type="button" label="Cancelar" icon="pi pi-times" class="p-button-text" (click)="onHide()"></button>
                    <button pButton type="submit" label="Guardar" icon="pi pi-check" [disabled]="planForm.invalid"></button>
                </div>
            </form>
        </p-dialog>
    `
})
export class PlansFormComponent implements OnInit {
    @Input() visible: boolean = false;
    @Input() plan?: Plan;

    @Output() close = new EventEmitter<void>();
    @Output() save = new EventEmitter<Plan>();

    planForm!: FormGroup;
    planNameOptions: Array<{ label: string; value: string }> = [];

    constructor(
        private fb: FormBuilder,
        private plansService: PlansService
    ) {}

    ngOnInit(): void {
        this.initForm();
        this.loadPlanChoices();

        // Escuchar cambios en "isUnlimited"
        const isUnlimitedControl = this.planForm.get('isUnlimited');
        if (isUnlimitedControl) {
            isUnlimitedControl.valueChanges.subscribe((isUnlimited: boolean) => {
                const usersLimitControl = this.planForm.get('usersLimit');
                if (usersLimitControl) {
                    if (isUnlimited) {
                        usersLimitControl.disable();
                    } else {
                        usersLimitControl.enable();
                    }
                }
            });
        }
    }

    ngOnChanges(): void {
        if (this.planForm && this.plan) {
            this.planForm.patchValue(this.plan);
        }
    }

    initForm(): void {
        this.planForm = this.fb.group({
            name: ['', Validators.required],
            price: [null, [Validators.required, Validators.min(0)]],
            description: ['', Validators.required],
            durationMonths: [1, [Validators.required, Validators.min(1)]],
            employeesLimit: [{ value: null, disabled: false }, [Validators.min(1)]],
            usersLimit: [{ value: null, disabled: false }, [Validators.min(1)]],
            features: [[]],
            isActive: [true],
            isUnlimited: [false]
        });

        if (this.plan) {
            // Mapea plan existente al form
            this.planForm.patchValue(
                {
                    name: this.plan.name,
                    price: this.plan.price,
                    description: this.plan.description ?? '',
                    durationMonths: this.plan.durationMonths ?? 1, // <-- mapeo
                    usersLimit: this.plan.employeesLimit, // null = ilimitado
                    features: this.plan.features ?? [],
                    isActive: this.plan.isActive,
                    isUnlimited: this.plan.employeesLimit == null
                },
                { emitEvent: false }
            );

            // Si era ilimitado, deshabilita el control
            if (this.plan.employeesLimit == null) {
                this.planForm.get('usersLimit')?.disable({ emitEvent: false });
            }
        }
    }

    loadPlanChoices(): void {
        // Opciones predeterminadas para el dropdown
        this.planNameOptions = [
            { label: 'Plan Básico', value: 'basic' },
            { label: 'Plan Estándar', value: 'standard' },
            { label: 'Plan Premium', value: 'premium' },
            { label: 'Plan Empresarial', value: 'enterprise' }
        ];
    }

    submitForm(): void {
        if (this.planForm.invalid) return;

        const v = this.planForm.getRawValue();

        const planData: Plan = {
            id: this.plan?.id,
            name: v.name,
            price: Number(v.price),
            description: v.description ?? '',
            durationMonths:Number(v.durationMonths ?? 1 ),
            employeesLimit: v.isUnlimited ? null : v.usersLimit !== null ? Number(v.usersLimit) : null,
            isActive: !!v.isActive,
            features: Array.isArray(v.features) ? v.features : []
        };

        const req$ = this.plan?.id ? this.plansService.updatePlan(this.plan.id, planData) : this.plansService.createPlan(planData);

        req$.subscribe({
            next: (saved) => {
                this.save.emit(saved);
                this.visible = false;
            },
            error: (err) => {
                const errors = err?.error || {};
                // Recorre las claves del error (p.ej. "name", "price", etc.)
                Object.keys(errors).forEach((field) => {
                    if (this.planForm.get(field)) {
                        this.planForm.get(field)?.setErrors({ server: errors[field][0] });
                    }
                });
            }
        });
    }

    onHide(): void {
        this.close.emit();
    }
}
