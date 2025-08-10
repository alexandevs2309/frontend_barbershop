import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Plan } from '../plan.model';
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

@Component({
  selector: 'app-plans-form',
  standalone: true,
  providers: [],
  imports: [
    Dialog,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    Checkbox,
    ChipsModule,
    ReactiveFormsModule,
    InputGroup,
    InputGroupAddon,
    IftaLabelModule,
    InputGroupModule,
    FormsModule,
    FloatLabel
  ],
  template: `
    <p-dialog
      [(visible)]="visible"
      (onHide)="onHide()"
      header="Crear Tipo de Plan"
      [modal]="true"
      [style]="{ width: '600px' }"
      [closeOnEscape]="true"
      [dismissableMask]="true"
    >
      <form [formGroup]="planForm" (ngSubmit)="submitForm()" class="p-fluid my-8">
        <div class="field my-4">
          <p-floatlabel variant="on">
            <input pInputText class="w-full" id="name" formControlName="name" autocomplete="on" />
            <label for="name">Nombre del Plan</label>
          </p-floatlabel>
        </div>

        <div class="field my-8">
          <p-inputgroup class="w-full">
            <p-inputgroup-addon>
              <i class="pi pi-dollar"></i>
            </p-inputgroup-addon>
            <p-floatlabel class="w-full">
              <p-inputnumber
                class="w-full"
                formControlName="price"
                inputId="price"
                mode="currency"
                currency="USD"
                locale="en-US"
              />
              <label for="price">Precio Mensual</label>
            </p-floatlabel>
          </p-inputgroup>
        </div>

        <div class="field my-4">
          <p-floatlabel variant="on">
            <textarea
              pTextarea
              class="w-full bg-gray-100 p-2 rounded-lg"
              id="description"
              formControlName="description"
              rows="5"
              style="resize: none"
            ></textarea>
            <label for="description">Descripción del Plan</label>
          </p-floatlabel>
        </div>

        <div class="field my-4">
          <p-floatlabel variant="on">
            <p-inputnumber
              class="w-full"
              formControlName="usersLimit"
              [min]="1"
              [max]="50"
              [showButtons]="true"
              mode="decimal"
              locale="en-US"
            />
            <label for="limite">Límite de Usuarios</label>
          </p-floatlabel>
        </div>

        <div class="field my-4">
          <p-chips formControlName="features" class="w-full" placeholder="Ej: Agenda, POS, Inventario"></p-chips>
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

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();

    // Escuchar cambios en "isUnlimited"
    this.planForm.get('isUnlimited')?.valueChanges.subscribe((isUnlimited) => {
      const usersLimitControl = this.planForm.get('usersLimit');
      if (isUnlimited) {
        usersLimitControl?.disable();
      } else {
        usersLimitControl?.enable();
      }
    });
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
      usersLimit: [{ value: null, disabled: false }, [Validators.required, Validators.min(1)]],
      features: [[]],
      isActive: [true],
      isUnlimited: [false]
    });

    if (this.plan) {
      this.planForm.patchValue(this.plan);
    }
  }

  submitForm(): void {

    

    if (this.planForm.invalid) return;

    const formValue = this.planForm.getRawValue(); // incluye campos deshabilitados

    const finalPlan = {
      ...formValue,
      usersLimit: formValue.isUnlimited ? null : formValue.usersLimit,
      id: this.plan?.id || Date.now(),
      createdAt: this.plan?.createdAt || new Date()
    };

    this.save.emit(finalPlan);
    this.visible = false;
  }

  onHide(): void {
    this.close.emit();
  }

  
}
