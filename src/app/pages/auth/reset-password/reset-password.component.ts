import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../auth/service/auth.service';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { AppFloatingConfigurator } from '../../../layout/component/app.floatingconfigurator';
import { DatePickerModule } from 'primeng/datepicker';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService } from 'primeng/api';
import { HttpClient } from '@angular/common/http';
import { Toast } from 'primeng/toast';

@Component({
    imports: [CommonModule, ButtonModule, PasswordModule, ReactiveFormsModule, AppFloatingConfigurator, DatePickerModule, DropdownModule, Toast],
    providers: [MessageService],
    template: `
        <app-floating-configurator></app-floating-configurator>
       
        <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden px-4 ">
            <div class="flex flex-col items-center justify-center">
                <div class="flex flex-col items-center justify-center  overflow-hidden px-4 mb-4">
                    <i class="pi pi-key" style="color: var(--primary-color); font-size: 5.5rem; "></i>
                  </div>

                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-6 sm:px-10 md:px-16 lg:px-20" style="border-radius: 53px">
                        <div class="text-center mb-6">
                            <div class="text-surface-900 dark:text-surface-0 text-5xl font-bold mb-4">Restablecer contraseña</div>
                            <span class="text-muted-color font-medium">Ingresa tu nueva contraseña</span>
                        </div>

                        <form (ngSubmit)="onSubmit()" [formGroup]="form" class="p-fluid">
                            <div class="field mb-5">
                                <label for="password" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Nueva contraseña</label>
                                <p-password inputId="password" formControlName="password" [toggleMask]="true" [feedback]="true" class="w-full" placeholder="Nueva contraseña" [mediumRegex]="mediumRegex.source" [strongRegex]="strongRegex.source"></p-password>
                                <small *ngIf="form.controls['password'].invalid && form.controls['password'].touched" class="p-error block mt-1 text-sm text-red-600"> La contraseña es requerida (mín. 8 caracteres). </small>
                            </div>

                            <div class="field mb-5">
                                <label for="confirmPassword" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Confirmar contraseña</label>
                                <p-password inputId="confirmPassword" id="confirmPassword" type="password" formControlName="confirmPassword" class="w-full" placeholder="Confirmar contraseña" [toggleMask]="true" [feedback]="true" />
                                <small *ngIf="form.controls['confirmPassword'].invalid && form.controls['confirmPassword'].touched" class="p-error block mt-1 text-sm text-red-600"> La contraseña es requerida (mín. 8 caracteres). </small>
                            </div>

                            <p-button label="Restablecer contraseña" icon="pi pi-refresh" styleClass="w-full mt-20" [disabled]="form.invalid || loading" [loading]="loading" type="submit"></p-button>

                            <p-toast></p-toast>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class ResetPasswordComponent {
    form!: FormGroup;
    token!: string;
    loading = false;

    // Regex opcionales para mejorar el feedback del password
    mediumRegex: RegExp = /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*\d))|((?=.*[A-Z])(?=.*\d)))(?=.{6,})/;
    strongRegex: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\-_#])[A-Za-z\d@$!%*?&\-_#]{8,}$/;

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private http: HttpClient,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.token = this.route.snapshot.queryParamMap.get('token') || '';
        this.form = this.fb.group(
            {
                password: ['', [Validators.required, Validators.minLength(8)]],
                confirmPassword: ['', [Validators.required]]
            },
            { validators: this.passwordsMatch }
        );
    }

    passwordsMatch(formGroup: FormGroup) {
        const password = formGroup.get('password')?.value;
        const confirm = formGroup.get('confirmPassword')?.value;
        return password === confirm ? null : { mismatch: true };
    }

    onSubmit(): void {
        if (this.form.invalid) return;

        this.loading = true;

        const payload = {
            token: this.token,
            new_password: this.form.value.password
        };

        this.http.post('/api/auth/reset-password/', payload).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Contraseña actualizada',
                    detail: 'Tu contraseña ha sido restablecida correctamente.'
                });
                setTimeout(() => this.router.navigate(['/auth/login']), 2000);
            },
            error: (err: any) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: err?.error?.detail || 'No se pudo restablecer la contraseña.'
                });
                this.loading = false;
            }
        });
    }
}
