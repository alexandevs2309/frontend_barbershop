import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { DividerModule } from 'primeng/divider';
import { TabViewModule } from 'primeng/tabview';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SettingsService, Branch, Setting } from '../../service/settings.service';
import { ToolbarModule } from 'primeng/toolbar';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ToastModule,
        ConfirmDialogModule,
        CardModule,
        InputTextModule,
        TextareaModule,
        DropdownModule,
        InputNumberModule,
        FileUploadModule,
        ButtonModule,
        DividerModule,
        TabViewModule,
        ProgressSpinnerModule,
        CheckboxModule,
        MessageModule,
        ToolbarModule
    ],
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.scss',
    providers: [MessageService, ConfirmationService]
})
export class SettingsComponent implements OnInit {
    settingForm!: FormGroup;
    branches: Branch[] = [];
    selectedBranch: Branch | null = null;
    loading = false;
    saving = false;
    currentSetting: Setting | null = null;

    currencyOptions: any[] = [
        { label: 'Peso Dominicano (DOP)', value: 'DOP' },
        { label: 'Dólar Americano (USD)', value: 'USD' },
        { label: 'Euro (EUR)', value: 'EUR' }
    ];

    themeOptions: any[] = [
        { label: 'Claro', value: 'light' },
        { label: 'Oscuro', value: 'dark' },
        { label: 'Personalizado', value: 'custom' }
    ];

    timezoneOptions: any[] = [
        { label: 'América/Santo Domingo', value: 'America/Santo_Domingo' },
        { label: 'América/New York', value: 'America/New_York' },
        { label: 'América/Los Angeles', value: 'America/Los_Angeles' }
    ];

    daysOfWeek = [
        { key: 'monday', label: 'Lunes' },
        { key: 'tuesday', label: 'Martes' },
        { key: 'wednesday', label: 'Miércoles' },
        { key: 'thursday', label: 'Jueves' },
        { key: 'friday', label: 'Viernes' },
        { key: 'saturday', label: 'Sábado' },
        { key: 'sunday', label: 'Domingo' }
    ];

    constructor(
        private fb: FormBuilder,
        private http: HttpClient,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private settingsService: SettingsService
    ) {
        this.initForm();
    }

    ngOnInit() {
        this.loadBranches();
    }

    // Nuevo control auxiliar en el formulario
initForm() {
  this.settingForm = this.fb.group({
    branch: [null, Validators.required],
    business_name: ['', Validators.required],
    business_email: ['', [Validators.email]],
    phone_number: [''],
    address: [''],
    currency: ['DOP', Validators.required],
    tax_percentage: [0, [Validators.min(0), Validators.max(100)]],
    timezone: ['America/Santo_Domingo', Validators.required],
    theme: ['light', Validators.required],
    general_business_hours: ['9:00-18:00'], // NUEVO: horario único
    business_hours: this.fb.group({
      monday: ['9:00-18:00'],
      tuesday: ['9:00-18:00'],
      wednesday: ['9:00-18:00'],
      thursday: ['9:00-18:00'],
      friday: ['9:00-18:00'],
      saturday: ['9:00-17:00'],
      sunday: ['Cerrado']
    }),
    preferences: this.fb.group({
      notifications_enabled: [true],
      auto_backup: [true],
      maintenance_mode: [false]
    })
  });
}
applyGeneralHoursToAllDays() {
  const generalValue = this.settingForm.get('general_business_hours')?.value;
  if (!generalValue) return;

  const businessHours = this.settingForm.get('business_hours') as FormGroup;
  if (!businessHours) return;

  this.daysOfWeek.forEach(day => {
    if (day.key !== 'sunday') { // Mantener domingo Cerrado
      const control = businessHours.get(day.key);
      if (control) control.setValue(generalValue);
    }
  });
}


    loadBranches() {
        this.loading = true;
        this.settingsService.getBranches().subscribe({
            next: (branches: Branch[]) => {
                this.branches = branches;
                if (branches.length > 0) {
                    this.selectedBranch = branches[0];
                    this.settingForm.patchValue({ branch: branches[0].id });
                    this.loadSettings(branches[0].id);
                }
                this.loading = false;
            },
            error: (error: any) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar sucursales'
                });
                this.loading = false;
            }
        });
    }

    onBranchChange(event: any) {
        const branchId = event.value;
        this.selectedBranch = this.branches.find((b) => b.id === branchId) || null;
        if (branchId) {
            this.clearForm();
            this.loadSettings(branchId);
        }
    }

   clearForm() {
  this.currentSetting = null;

  // Reset general del formulario
  this.settingForm.reset({
    branch: this.selectedBranch?.id || null,
    business_name: '',
    business_email: '',
    phone_number: '',
    address: '',
    currency: 'DOP',
    tax_percentage: 0,
    timezone: 'America/Santo_Domingo',
    theme: 'light'
  });

  // Limpiar y asignar horarios por defecto
  const businessHours = this.settingForm.get('business_hours') as FormGroup;
  if (businessHours) {
    this.daysOfWeek.forEach(day => {
      const control = businessHours.get(day.key);
      if (control) {
        control.setValue(day.key === 'sunday' ? 'Cerrado' : day.key === 'saturday' ? '9:00-17:00' : '9:00-18:00');
        control.markAsPristine();
        control.markAsUntouched();
      }
    });
  }

  // Limpiar preferencias por defecto
  const preferences = this.settingForm.get('preferences') as FormGroup;
  if (preferences) {
    Object.keys(preferences.controls).forEach(pref => {
      const control = preferences.get(pref);
      if (control) {
        // Puedes asignar valores por defecto
        switch (pref) {
          case 'notifications_enabled':
          case 'auto_backup':
            control.setValue(true);
            break;
          case 'maintenance_mode':
            control.setValue(false);
            break;
          default:
            control.setValue(null);
        }
        control.markAsPristine();
        control.markAsUntouched();
      }
    });
  }
}


    loadSettings(branchId: number) {
        this.loading = true;
        this.settingsService.getSettings(branchId).subscribe({
            next: (setting: Setting) => {
                this.currentSetting = setting;
                // Limpiar completamente antes de cargar nuevos datos
                this.clearForm();

                // Establecer valores uno por uno para evitar persistencia
                this.settingForm.patchValue({
                    branch: setting.branch,
                    business_name: setting.business_name || '',
                    business_email: setting.business_email || '',
                    phone_number: setting.phone_number || '',
                    address: setting.address || '',
                    currency: setting.currency || 'DOP',
                    tax_percentage: setting.tax_percentage || 0,
                    timezone: setting.timezone || 'America/Santo_Domingo',
                    theme: setting.theme || 'light'
                });

                // Configurar horarios de negocio
                const businessHours = setting.business_hours || {};
                this.daysOfWeek.forEach((day) => {
                    this.settingForm.get(`business_hours.${day.key}`)?.setValue(businessHours[day.key] || (day.key === 'sunday' ? 'Cerrado' : '9:00-18:00'));
                });

                // Configurar preferencias
                const preferences = setting.preferences || {};
                this.settingForm.get('preferences.notifications_enabled')?.setValue(preferences.notifications_enabled ?? true);
                this.settingForm.get('preferences.auto_backup')?.setValue(preferences.auto_backup ?? true);
                this.settingForm.get('preferences.maintenance_mode')?.setValue(preferences.maintenance_mode ?? false);

                this.loading = false;
            },
            error: (error: any) => {
                if (error.status === 404) {
                    this.currentSetting = null;
                    this.clearForm();
                    this.resetFormForNewSetting();
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error al cargar configuración'
                    });
                }
                this.loading = false;
            }
        });
    }

    resetFormForNewSetting() {
        const branchId = this.settingForm.get('branch')?.value;
        this.settingForm.patchValue({
            branch: branchId,
            business_name: '',
            business_email: '',
            phone_number: '',
            address: '',
            currency: 'DOP',
            tax_percentage: 0,
            timezone: 'America/Santo_Domingo',
            theme: 'light'
        });

        // Establecer horarios por defecto
        this.daysOfWeek.forEach((day) => {
            this.settingForm.get(`business_hours.${day.key}`)?.setValue(day.key === 'sunday' ? 'Cerrado' : day.key === 'saturday' ? '9:00-17:00' : '9:00-18:00');
        });

        // Establecer preferencias por defecto
        this.settingForm.get('preferences.notifications_enabled')?.setValue(true);
        this.settingForm.get('preferences.auto_backup')?.setValue(true);
        this.settingForm.get('preferences.maintenance_mode')?.setValue(false);
    }

    resetForm() {
        if (this.currentSetting && this.selectedBranch) {
            this.loadSettings(this.selectedBranch.id);
        }
    }

    saveSetting() {
        if (this.settingForm.invalid) {
            this.markFormGroupTouched(this.settingForm);
            return;
        }

        this.saving = true;
        const formData = this.settingForm.value;

        const request = this.currentSetting ? this.settingsService.updateSettings(formData.branch, formData) : this.settingsService.createSettings(formData);

        request.subscribe({
            next: (setting: Setting) => {
                this.currentSetting = setting;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Configuración guardada correctamente'
                });
                this.saving = false;
            },
            error: (error: any) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al guardar configuración'
                });
                this.saving = false;
            }
        });
    }

    exportSettings() {
        if (!this.selectedBranch) return;

        this.settingsService.exportSettings(this.selectedBranch.id).subscribe({
            next: (data: any) => {
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `configuracion-${this.selectedBranch?.name}.json`;
                link.click();
                window.URL.revokeObjectURL(url);

                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Configuración exportada correctamente'
                });
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al exportar configuración'
                });
            }
        });
    }

    onFileUpload(event: any) {
        const file = event.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                try {
                    const config = JSON.parse(e.target.result);
                    this.confirmationService.confirm({
                        message: '¿Está seguro de importar esta configuración? Se sobrescribirá la configuración actual.',
                        header: 'Confirmar Importación',
                        icon: 'pi pi-exclamation-triangle',
                        accept: () => {
                            this.importSettings(config);
                        }
                    });
                } catch (error) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Archivo de configuración inválido'
                    });
                }
            };
            reader.readAsText(file);
        }
    }

    importSettings(config: any) {
        this.settingsService.importSettings(config).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Configuración importada correctamente'
                });
                if (this.selectedBranch) {
                    this.loadSettings(this.selectedBranch.id);
                }
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al importar configuración'
                });
            }
        });
    }

    getFieldError(fieldName: string): string | null {
        const field = this.settingForm.get(fieldName);
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
