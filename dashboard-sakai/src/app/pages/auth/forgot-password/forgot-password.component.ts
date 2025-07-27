import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../environment';
import { AuthService } from '../service/auth.service';
import { Fluid } from 'primeng/fluid';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonModule, InputTextModule, CardModule, RouterModule],
    template: `
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 my-48">

  < <div class="mx-auto max-w-3xl">
    
    <div class="text-center mb-4">
      <img src="assets/layout/images/logo-dark.svg" alt="Logo" height="30" class="mb-3" />
      <h3 class="text-900 text-5xl font-semibold mb-1">¿Olvidaste tu contraseña?</h3>
      <p class="text-600 text-lg">Te enviaremos instrucciones por correo electrónico.</p>
    </div>

    <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()" novalidate>
      <div class="mb-3">
        <label for="email" class="block text-900 text-sm font-medium mb-1">Correo electrónico</label>
        <input
          id="email"
          type="email"
          formControlName="email"
          pInputText
          class="w-full text-sm"
          placeholder="correo@ejemplo.com"
        />
        <small *ngIf="email.invalid && email.touched" class="text-red-500 text-xs">Correo válido requerido</small>
      </div>

      <button
        type="submit"
        pButton
        label="Enviar"
        class="w-full text-sm mt-2"
        [disabled]="forgotPasswordForm.invalid || loading"
      ></button>

      <p *ngIf="successMessage" class="text-green-600 mt-3 text-sm text-center">{{ successMessage }}</p>
      <p *ngIf="errorMessage" class="text-red-600 mt-3 text-sm text-center">{{ errorMessage }}</p>

    <div class="flex justify-content-center mt-8">
  <p-button [routerLink]="['/auth/login']"
    p-button
    label="Volver al login"
    class="p-button-outlined p-button-sm">
</p-button>
</div>

    </form>
  </div>
</div>

    `
})
export class ForgotPasswordComponent {
    forgotPasswordForm: FormGroup;
    loading = false;
    successMessage = '';
    errorMessage = '';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService
    ) {
        this.forgotPasswordForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]]
        });
    }

    get email() {
        return this.forgotPasswordForm.get('email')!;
    }

    onSubmit() {
        if (this.forgotPasswordForm.invalid) return;
        this.loading = true;

        this.authService.requestPasswordReset(this.email.value).subscribe({
            next: () => {
                this.successMessage = 'Revisa tu correo para continuar con el restablecimiento.';
                this.errorMessage = '';
                this.loading = false;
            },
            error: () => {
                this.errorMessage = 'No se pudo enviar el correo. Asegúrate de estar registrado.';
                this.successMessage = '';
                this.loading = false;
            }
        });
    }
}
