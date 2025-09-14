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
import { SystemSettingsService, SystemSettings } from './system-settings.service';

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
    CheckboxModule
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

  backupFrequencyOptions = [
    { label: 'Diario', value: 'daily' },
    { label: 'Semanal', value: 'weekly' },
    { label: 'Mensual', value: 'monthly' }
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
      platform_name: ['BarberSaaS', Validators.required],
      support_email: ['', [Validators.required, Validators.email]],
      maintenance_mode: [false],
      default_currency: ['USD', Validators.required],
      max_tenants: [100, [Validators.required, Validators.min(1)]],
      backup_frequency: ['daily', Validators.required],
      email_notifications: [true],
      auto_suspend_expired: [true],
      trial_days: [7, [Validators.required, Validators.min(0), Validators.max(365)]]
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
        if (error.status === 404) {
          // No hay configuraciones, usar valores por defecto
          this.currentSettings = null;
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar configuraciones del sistema'
          });
        }
        this.loading = false;
      }
    });
  }

  saveSettings() {
    if (this.settingsForm.invalid) {
      this.markFormGroupTouched(this.settingsForm);
      return;
    }

    this.saving = true;
    const formData = this.settingsForm.value;

    this.systemSettingsService.updateSettings(formData).subscribe({
      next: (settings) => {
        this.currentSettings = settings;
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Configuraciones del sistema guardadas correctamente'
        });
        this.saving = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al guardar configuraciones del sistema'
        });
        this.saving = false;
      }
    });
  }

  resetToDefaults() {
    this.confirmationService.confirm({
      message: '¿Está seguro de restablecer todas las configuraciones a los valores por defecto?',
      header: 'Confirmar Restablecimiento',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.systemSettingsService.resetToDefaults().subscribe({
          next: (settings) => {
            this.currentSettings = settings;
            this.settingsForm.patchValue(settings);
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Configuraciones restablecidas a valores por defecto'
            });
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al restablecer configuraciones'
            });
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
      if (field.errors?.['min']) return 'Valor mínimo no válido';
      if (field.errors?.['max']) return 'Valor máximo no válido';
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