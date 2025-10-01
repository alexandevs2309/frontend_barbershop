import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { RegisterService, RegisterData } from './register.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, InputTextModule, 
    SelectModule, CardModule, ToastModule, RouterModule
  ],
  providers: [MessageService],
  template: `
    <div class="register-container min-h-screen flex align-items-center justify-content-center">
      <div class="register-card surface-card p-6 border-round shadow-2 w-full max-w-md">
        <div class="text-center mb-6">
          <h1 class="text-3xl font-bold text-900 mb-2">Crear Cuenta</h1>
          <p class="text-600">Comienza a gestionar tu barbería hoy</p>
        </div>

        <!-- Plan Seleccionado -->
        <div class="plan-info bg-primary-50 p-3 border-round mb-4" *ngIf="selectedPlan">
          <div class="flex align-items-center justify-content-between">
            <div>
              <h3 class="text-primary font-semibold m-0">Plan {{ getPlanName(selectedPlan) }}</h3>
              <p class="text-primary-600 text-sm m-0">{{ getPlanPrice(selectedPlan) }}/mes</p>
            </div>
            <button 
              type="button" 
              class="p-button-text p-button-sm text-primary"
              (click)="changePlan()">
              Cambiar
            </button>
          </div>
        </div>

        <form (ngSubmit)="onSubmit()" #registerForm="ngForm">
          <!-- Información Personal -->
          <div class="field mb-4">
            <label for="fullName" class="block text-900 font-medium mb-2">Nombre Completo *</label>
            <input 
              pInputText 
              id="fullName" 
              [(ngModel)]="formData.fullName"
              name="fullName"
              required
              class="w-full"
              placeholder="Tu nombre completo">
          </div>

          <div class="field mb-4">
            <label for="email" class="block text-900 font-medium mb-2">Email *</label>
            <input 
              pInputText 
              id="email" 
              type="email"
              [(ngModel)]="formData.email"
              name="email"
              required
              class="w-full"
              placeholder="tu@email.com">
          </div>

          <div class="field mb-4">
            <label for="password" class="block text-900 font-medium mb-2">Contraseña *</label>
            <input 
              pInputText 
              id="password" 
              type="password"
              [(ngModel)]="formData.password"
              name="password"
              required
              class="w-full"
              placeholder="Mínimo 8 caracteres">
          </div>

          <div class="field mb-4">
            <label for="passwordConfirm" class="block text-900 font-medium mb-2">Confirmar Contraseña *</label>
            <input 
              pInputText 
              id="passwordConfirm" 
              type="password"
              [(ngModel)]="formData.passwordConfirm"
              name="passwordConfirm"
              required
              class="w-full"
              placeholder="Repite tu contraseña">
          </div>

          <!-- Información del Negocio -->
          <div class="field mb-4">
            <label for="businessName" class="block text-900 font-medium mb-2">Nombre de la Barbería *</label>
            <input 
              pInputText 
              id="businessName" 
              [(ngModel)]="formData.businessName"
              name="businessName"
              required
              class="w-full"
              placeholder="Nombre de tu barbería">
          </div>

          <div class="field mb-4">
            <label for="phone" class="block text-900 font-medium mb-2">Teléfono</label>
            <input 
              pInputText 
              id="phone" 
              [(ngModel)]="formData.phone"
              name="phone"
              class="w-full"
              placeholder="Número de contacto">
          </div>

          <!-- Selección de Plan (si no viene de la landing) -->
          <div class="field mb-4" *ngIf="!selectedPlan">
            <label for="plan" class="block text-900 font-medium mb-2">Seleccionar Plan *</label>
            <p-select 
              [options]="planOptions" 
              [(ngModel)]="formData.planType"
              name="planType"
              optionLabel="label" 
              optionValue="value"
              placeholder="Elige tu plan"
              class="w-full">
            </p-select>
          </div>

          <!-- Información de Pago -->
          <div class="payment-section mb-4">
            <h3 class="text-900 font-semibold mb-3">Información de Pago</h3>
            
            <div class="field mb-3">
              <label for="cardNumber" class="block text-900 font-medium mb-2">
                Número de Tarjeta * 
                <span class="text-sm text-500" *ngIf="getCardBrand(formData.cardNumber)">
                  ({{ getCardBrand(formData.cardNumber) }})
                </span>
              </label>
              <input 
                pInputText 
                id="cardNumber" 
                [(ngModel)]="formData.cardNumber"
                name="cardNumber"
                required
                class="w-full"
                placeholder="1234 5678 9012 3456"
                maxlength="19"
                (input)="formatCardNumber($event)">
            </div>

            <div class="grid">
              <div class="col-6">
                <label for="expiryDate" class="block text-900 font-medium mb-2">Vencimiento *</label>
                <input 
                  pInputText 
                  id="expiryDate" 
                  [(ngModel)]="formData.expiryDate"
                  name="expiryDate"
                  required
                  class="w-full"
                  placeholder="MM/AA"
                  maxlength="5"
                  (input)="formatExpiryDate($event)">
              </div>
              <div class="col-6">
                <label for="cvv" class="block text-900 font-medium mb-2">CVV *</label>
                <input 
                  pInputText 
                  id="cvv" 
                  [(ngModel)]="formData.cvv"
                  name="cvv"
                  required
                  class="w-full"
                  placeholder="123"
                  maxlength="4">
              </div>
            </div>
          </div>

          <!-- Términos y Condiciones -->
          <div class="field-checkbox mb-4">
            <input 
              type="checkbox" 
              id="terms" 
              [(ngModel)]="formData.acceptTerms"
              name="acceptTerms"
              required>
            <label for="terms" class="ml-2">
              Acepto los <a href="#" class="text-primary">términos y condiciones</a>
            </label>
          </div>

          <!-- Botón de Registro -->
          <button 
            pButton 
            type="submit" 
            label="Crear Cuenta y Pagar"
            [loading]="loading"
            [disabled]="!registerForm.form.valid || registrationComplete"
            class="w-full p-3 text-xl"
            *ngIf="!registrationComplete">
          </button>

          <!-- Botón para ir al Login después del registro -->
          <button 
            pButton 
            type="button" 
            label="Ir al Login"
            (click)="goToLogin()"
            class="w-full p-3 text-xl"
            *ngIf="registrationComplete">
          </button>
        </form>

        <!-- Link a Login -->
        <div class="text-center mt-4">
          <span class="text-600">¿Ya tienes cuenta? </span>
          <a routerLink="/auth/login" class="text-primary font-medium">Iniciar Sesión</a>
        </div>
      </div>
    </div>

    <p-toast></p-toast>
  `,
  styles: [`
    .register-container {
      background: linear-gradient(135deg, var(--primary-100) 0%, var(--primary-50) 100%);
    }

    .register-card {
      max-width: 500px;
    }

    .plan-info {
      border-left: 4px solid var(--primary-color);
    }

    .payment-section {
      border-top: 1px solid var(--surface-border);
      padding-top: 1rem;
    }
  `]
})
export class RegisterComponent implements OnInit {
  selectedPlan: string | null = null;
  loading = false;
  registrationComplete = false;

  formData = {
    fullName: '',
    email: '',
    password: '',
    passwordConfirm: '',
    businessName: '',
    phone: '',
    planType: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    acceptTerms: false
  };

  planOptions = [
    { label: 'Básico - $29/mes', value: 'basic' },
    { label: 'Estándar - $49/mes', value: 'standard' },
    { label: 'Premium - $79/mes', value: 'premium' },
    { label: 'Enterprise - $129/mes', value: 'enterprise' }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private registerService: RegisterService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['plan']) {
        this.selectedPlan = params['plan'];
        this.formData.planType = params['plan'];
      }
    });
  }

  getPlanName(plan: string): string {
    const names: any = {
      'basic': 'Básico',
      'standard': 'Estándar',
      'premium': 'Premium',
      'enterprise': 'Enterprise'
    };
    return names[plan] || plan;
  }

  getPlanPrice(plan: string): string {
    const prices: any = {
      'basic': '$29',
      'standard': '$49',
      'premium': '$79',
      'enterprise': '$129'
    };
    return prices[plan] || '$0';
  }

  changePlan() {
    this.router.navigate(['/landing'], { fragment: 'pricing' });
  }

  formatCardNumber(event: any) {
    let value = event.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    this.formData.cardNumber = formattedValue;
  }

  formatExpiryDate(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    this.formData.expiryDate = value;
  }

  getCardBrand(cardNumber: string): string {
    const number = cardNumber.replace(/\s/g, '');
    if (number.startsWith('4')) return 'Visa';
    if (number.startsWith('5') || number.startsWith('2')) return 'Mastercard';
    if (number.startsWith('3')) return 'American Express';
    if (number.startsWith('6')) return 'Discover';
    return '';
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }

  onSubmit() {
    if (!this.formData.acceptTerms) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debes aceptar los términos y condiciones'
      });
      return;
    }

    this.loading = true;
    setTimeout(() => {
      this.processRegistration();
    }, 2000);
  }

  private processRegistration() {
    // Validar contraseñas
    if (this.formData.password !== this.formData.passwordConfirm) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Error',
        detail: 'Las contraseñas no coinciden'
      });
      this.loading = false;
      return;
    }

    const registerData: RegisterData = {
      fullName: this.formData.fullName,
      email: this.formData.email,
      password: this.formData.password,
      businessName: this.formData.businessName,
      phone: this.formData.phone,
      planType: this.formData.planType,
      cardNumber: this.formData.cardNumber,
      expiryDate: this.formData.expiryDate,
      cvv: this.formData.cvv
    };

    this.registerService.registerWithPlan(registerData).subscribe({
      next: (response) => {
        // Mostrar éxito del registro
        this.messageService.add({
          severity: 'success',
          summary: '🎉 ¡Registro Exitoso!',
          detail: `Tu cuenta ha sido creada exitosamente para ${response.full_name}`,
          life: 5000
        });

        // Mostrar información del email
        setTimeout(() => {
          this.messageService.add({
            severity: 'info',
            summary: '📧 Revisa tu Email',
            detail: `Hemos enviado tus credenciales de acceso a:\n${this.formData.email}\n\nRevisa tu bandeja de entrada (y spam) para acceder a tu cuenta.`,
            life: 8000
          });
        }, 1000);

        // Mostrar opción de ir al login
        setTimeout(() => {
          this.messageService.add({
            severity: 'info',
            summary: '🚀 ¿Ya tienes tus credenciales?',
            detail: 'Haz clic en "Ir al Login" cuando hayas recibido el email con tus datos de acceso.',
            life: 0  // No se cierra automáticamente
          });
        }, 3000);

        // Cambiar el estado para mostrar botón de ir al login
        this.registrationComplete = true;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error en registro:', error);
        
        // Mostrar errores específicos del backend
        let errorMessage = 'Error al procesar el registro';
        
        if (error.error) {
          if (typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.error.detail) {
            errorMessage = error.error.detail;
          } else if (error.error.non_field_errors) {
            errorMessage = error.error.non_field_errors.join(', ');
          } else {
            // Mostrar errores de campos específicos
            const fieldErrors = [];
            for (const [field, errors] of Object.entries(error.error)) {
              if (Array.isArray(errors)) {
                fieldErrors.push(`${field}: ${errors.join(', ')}`);
              }
            }
            if (fieldErrors.length > 0) {
              errorMessage = fieldErrors.join('\n');
            }
          }
        }
        
        this.messageService.add({
          severity: 'error',
          summary: '❌ Error de Registro',
          detail: errorMessage,
          life: 0
        });
        
        this.loading = false;
      }
    });
  }
}