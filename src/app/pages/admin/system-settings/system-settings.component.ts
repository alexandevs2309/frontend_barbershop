import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MultiSelectModule } from 'primeng/multiselect';
import { SystemSettingsService, SystemSettings } from './system-settings.service';
import { PanelModule } from 'primeng/panel';

@Component({
  selector: 'app-system-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ToastModule,
    ConfirmDialogModule,
    CardModule,
    InputTextModule,
    DropdownModule,
    InputNumberModule,
    ButtonModule,
    DividerModule,
    ProgressSpinnerModule,
    CheckboxModule,
    MultiSelectModule,
    PanelModule
    
  ],
  templateUrl: './system-settings.component.html',
  styleUrl: './system-settings.component.scss',
  providers: [MessageService, ConfirmationService]
})
export class SystemSettingsComponent implements OnInit {
  settingsForm!: FormGroup;
  loading = false;
  saving = false;
  currentSettings: SystemSettings | null = null;

  currencyOptions = [
    { label: 'Dólar Americano (USD)', value: 'USD' },
    { label: 'Peso Dominicano (DOP)', value: 'DOP' },
    { label: 'Euro (EUR)', value: 'EUR' }
  ];

  languageOptions = [
    { label: 'Español', value: 'es' },
    { label: 'English', value: 'en' },
    { label: 'Português', value: 'pt' },
    { label: 'Français', value: 'fr' }
  ];

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private systemSettingsService: SystemSettingsService
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.loadSettings();
  }

  initForm() {
    this.settingsForm = this.fb.group({
      // Configuración General
      platform_name: ['BarberSaaS', Validators.required],
      support_email: ['', [Validators.required, Validators.email]],
      
      // Configuración de Clientes
      max_tenants: [100, [Validators.required, Validators.min(1)]],
      trial_days: [7, [Validators.required, Validators.min(0), Validators.max(365)]],
      default_currency: ['USD', Validators.required],
      
      // Configuración de Plataforma
      platform_domain: ['', Validators.required],
      supported_languages: [['es', 'en'], Validators.required],
      platform_commission_rate: [5, [Validators.required, Validators.min(0), Validators.max(50)]],
      

      
      // Integraciones Globales
      stripe_enabled: [true],
      paypal_enabled: [false],
      twilio_enabled: [false],
      sendgrid_enabled: [true],
      aws_s3_enabled: [true],
      
      // Preferencias del Sistema
      maintenance_mode: [false],
      email_notifications: [true],
      auto_suspend_expired: [true]
    });
  }

  loadSettings() {
    this.loading = true;
    this.systemSettingsService.getSettings().subscribe({
      next: (settings) => {
        this.currentSettings = settings;
        this.settingsForm.patchValue(settings);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar configuraciones:', error);
        if (error.status === 404) {
          // No hay configuraciones, usar valores por defecto
          this.currentSettings = null;
          this.messageService.add({
            severity: 'info',
            summary: 'Configuraciones Iniciales',
            detail: 'Se están usando valores por defecto. Guarde para crear la configuración inicial.',
            life: 6000
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error de Carga',
            detail: 'No se pudieron cargar las configuraciones del sistema',
            life: 8000
          });
        }
        this.loading = false;
      }
    });
  }

  saveSettings() {
    if (this.settingsForm.invalid) {
      this.markFormGroupTouched(this.settingsForm);
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario Inválido',
        detail: 'Por favor, corrija los errores en el formulario antes de guardar'
      });
      return;
    }

    this.saving = true;
    const formData = this.settingsForm.value;

    this.systemSettingsService.updateSettings(formData).subscribe({
      next: (settings) => {
        this.currentSettings = settings;
        this.messageService.add({
          severity: 'success',
          summary: 'Configuraciones Guardadas',
          detail: 'Las configuraciones del sistema se han guardado correctamente',
          life: 5000
        });
        this.saving = false;
      },
      error: (error) => {
        console.error('Error al guardar configuraciones:', error);
        let errorMessage = 'Error al guardar configuraciones del sistema';
        
        if (error.error && error.error.detail) {
          errorMessage = error.error.detail;
        } else if (error.error && typeof error.error === 'object') {
          const firstError = Object.values(error.error)[0];
          if (Array.isArray(firstError)) {
            errorMessage = firstError[0];
          }
        }
        
        this.messageService.add({
          severity: 'error',
          summary: 'Error al Guardar',
          detail: errorMessage,
          life: 8000
        });
        this.saving = false;
      }
    });
  }

  resetToDefaults() {
    this.confirmationService.confirm({
      message: '¿Está seguro de restablecer todas las configuraciones a los valores por defecto? Esta acción no se puede deshacer.',
      header: 'Confirmar Restablecimiento',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, restablecer',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.loading = true;
        this.systemSettingsService.resetToDefaults().subscribe({
          next: (settings) => {
            this.currentSettings = settings;
            this.settingsForm.patchValue(settings);
            this.messageService.add({
              severity: 'success',
              summary: 'Configuraciones Restablecidas',
              detail: 'Todas las configuraciones han sido restablecidas a sus valores por defecto',
              life: 5000
            });
            this.loading = false;
          },
          error: (error) => {
            console.error('Error al restablecer configuraciones:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error al Restablecer',
              detail: 'No se pudieron restablecer las configuraciones. Inténtelo nuevamente.',
              life: 8000
            });
            this.loading = false;
          }
        });
      }
    });
  }

  getFieldError(fieldName: string): string | null {
    const field = this.settingsForm.get(fieldName);
    if (field && field.invalid && field.touched) {
      if (field.errors?.['required']) return 'Este campo es obligatorio';
      if (field.errors?.['email']) return 'Email inválido';
      if (field.errors?.['min']) {
        const minValue = field.errors['min'].min;
        return `El valor mínimo es ${minValue}`;
      }
      if (field.errors?.['max']) {
        const maxValue = field.errors['max'].max;
        return `El valor máximo es ${maxValue}`;
      }
    }
    return null;
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}