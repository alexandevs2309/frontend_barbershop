import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ButtonModule } from 'primeng/button';
import { User } from './user.model';
import { FloatLabel } from 'primeng/floatlabel';
import { PasswordModule } from 'primeng/password';

@Component({
    selector: 'app-user-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, DialogModule, InputTextModule, DropdownModule, ToggleButtonModule, ButtonModule, FloatLabel, PasswordModule , ToggleSwitchModule],
    template: `
        <p-dialog header="{{ editingUser ? 'Editar Usuario' : 'Nuevo Usuario' }}" [(visible)]="visible" [modal]="true" [closable]="true" [style]="{ width: '50rem' }" (onHide)="onClose()" class="user-form-dialog h-full">
            <form [formGroup]="userForm" class="p-fluid" (ngSubmit)="onSubmit()">
                <div class="field my-4">
                    <p-floatlabel variant="on">
                        <input pInputText class="w-full" id="fullName" formControlName="fullName" autocomplete="on" />
                        <label for="fullName">Nombre Completo</label>
                    </p-floatlabel>
                </div>

                <div class="field my-4">
                    <p-floatlabel variant="on">
                        <input pInputText class="w-full" id="email" autocomplete="on" />
                        <label for="email">Correo</label>
                    </p-floatlabel>
                </div>
                <div class="field my-4">
                    <p-floatlabel variant="on">
                        <p-password formControlName="password" inputId="password" [toggleMask]="true" />
                        <label for="password">Password</label>
                    </p-floatlabel>
                </div>

                <div class="field my-4">
                    <p-dropdown formControlName="roles" [options]="roles" optionLabel="label" optionValue="value" placeholder="Seleccionar rol" class="w-full"> </p-dropdown>
                </div>

                <div class="field my-4 block">
                    <label for="isActive">Estado</label>
                    <p-toggleButton id="isActive" formControlName="isActive" onLabel="Activo" offLabel="Inactivo" onIcon="pi pi-check" offIcon="pi pi-times"
                    
                    > </p-toggleButton>
                </div>

              

                <div class="text-right mt-4">
                    <button pButton type="submit" label="Guardar" [disabled]="userForm.invalid"></button>
                </div>
            </form>
        </p-dialog>
    `
})
export class UserFormComponent implements OnChanges {
    @Input() visible: boolean = false;
    @Input() editingUser: User | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() save = new EventEmitter<User>();

    userForm!: FormGroup;

    roles = [
        { label: 'SuperAdmin', value: 'SuperAdmin' },
        { label: 'ClientAdmin', value: 'ClientAdmin' },
        { label: 'ClientStaff', value: 'ClientStaff' }
    ];

    constructor(private fb: FormBuilder) {
        this.initForm();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['editingUser'] && this.editingUser) {
            this.userForm.patchValue(this.editingUser);
        } else if (changes['visible'] && !this.editingUser) {
            this.userForm.reset({ isActive: true });
        }
    }

    initForm() {
        this.userForm = this.fb.group({
            fullName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: [''], // solo requerido en creación
            roles: ['', Validators.required],
            isActive: [true]
        });
    }

    onClose() {
        this.close.emit();
    }

    onSubmit() {
        if (this.userForm.invalid) return;

        const formValue = { ...this.userForm.value };
        if (this.editingUser) {
            formValue.id = this.editingUser.id;
        }
        this.save.emit(formValue);
        this.onClose();
    }
}
