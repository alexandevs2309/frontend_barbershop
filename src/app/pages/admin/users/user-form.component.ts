import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, OnInit } from '@angular/core';
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
import { RoleService, Role } from '../roles/roles.service';

@Component({
    selector: 'app-user-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, DialogModule, InputTextModule, DropdownModule, ToggleButtonModule, ButtonModule, FloatLabel, PasswordModule, ToggleSwitchModule],
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
                        <input pInputText class="w-full" id="email" formControlName="email" autocomplete="on" />
                        <label for="email">Correo</label>
                    </p-floatlabel>
                </div>
                <!-- SOLO creación (cuando no hay editingUser?.id) -->
                <div class="field my-4" *ngIf="!editingUser?.id">
                    <p-floatlabel variant="on">
                        <p-password formControlName="password" inputId="password" [toggleMask]="true" />
                        <label for="password">Password</label>
                    </p-floatlabel>
                </div>

                <div class="field my-4">
                    <p-dropdown formControlName="role_ids" [options]="roles" optionLabel="label" optionValue="value" placeholder="Seleccionar rol" class="w-full"> </p-dropdown>
                </div>

                <div class="field my-4 block">
                    <label for="isActive">Estado</label>
                    <p-toggleButton id="isActive" formControlName="isActive" onLabel="Activo" offLabel="Inactivo" onIcon="pi pi-check" offIcon="pi pi-times"> </p-toggleButton>
                </div>

                <div class="text-right mt-4">
                    <button pButton type="submit" label="Guardar" [disabled]="userForm.invalid"></button>
                </div>
            </form>
        </p-dialog>
    `
})
export class UserFormComponent implements OnInit, OnChanges {
    @Input() visible: boolean = false;
    @Input() editingUser: User | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() save = new EventEmitter<User>();

    userForm!: FormGroup;
    isEditMode: boolean = false;

    roles: { label: string; value: number }[] = [];

    constructor(
        private fb: FormBuilder,
        private roleService: RoleService
    ) {
        this.initForm();
    }

    ngOnInit(): void {
        this.roleService.getRoles().subscribe({
            next: (data: Role[]) => {
                console.log('[DEBUG] Respuesta roles:', data);
                this.roles = data.map((role) => ({
                    label: role.name,
                    value: role.id
                }));
            },
            error: (err) => console.error('[ERROR] Cargando roles:', err)
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.isEditMode = !!this.editingUser;

        if (changes['editingUser'] && this.editingUser) {
            this.userForm.patchValue({
                fullName: this.editingUser.full_name,
                email: this.editingUser.email,
                role_ids: this.editingUser.roles?.map((r) => r.id) ?? [],
                isActive: this.editingUser.is_active
            });

            this.userForm.get('password')?.clearValidators();
            this.userForm.get('password')?.updateValueAndValidity();
        } else if (changes['visible'] && !this.editingUser) {
            this.userForm.reset({ isActive: true });
            this.userForm.get('password')?.setValidators([Validators.required]);
            this.userForm.get('password')?.updateValueAndValidity();
        }
    }

    initForm() {
        this.userForm = this.fb.group({
            fullName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: [''],
            role_ids: [[], Validators.required],
            isActive: [true]
        });
    }

    onClose() {
        this.close.emit();
    }

    onSubmit() {
        if (this.userForm.invalid) return;

        const formValue = this.userForm.value;

        const userPayload: any = {
            id: this.editingUser?.id ?? 0,
            full_name: formValue.fullName,
            email: formValue.email,
            is_active: formValue.isActive,
            role_ids: Array.isArray(formValue.role_ids) ? formValue.role_ids : [formValue.role_ids].filter(Boolean)
        };

        // Only include password if provided and not empty
        if (formValue.password && formValue.password.trim()) {
            userPayload.password = formValue.password;
        }

        console.log('[DEBUG] Payload enviado al guardar:', userPayload);

        this.save.emit(userPayload);
        this.onClose();
    }
}
