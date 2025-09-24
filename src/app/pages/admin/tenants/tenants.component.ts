import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';

import { HttpClient } from '@angular/common/http';
import { TenantsService } from './tenants.service';
import { PermissionsService } from './permissions.service';
import { Tenant, SubscriptionPlan } from './tenant.model';
import { environment } from '../../../../environment';

@Component({
  selector: 'app-tenants',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    TagModule,
    ConfirmDialogModule,
    ToastModule
  ],
  templateUrl: './tenants.component.html',
  styleUrl: './tenants.component.scss',
  providers: [ConfirmationService, MessageService, TenantsService, ]
})
export class TenantsComponent implements OnInit {
  tenants: Tenant[] = [];
  selectedTenant: Tenant | null = null;
  tenantDialog: boolean = false;
  submitted: boolean = false;
  loading: boolean = false;

  // Datos para el formulario
  tenant: Partial<Tenant> = {};
  subscriptionPlans: SubscriptionPlan[] = [];

  constructor(
    private tenantsService: TenantsService,
    private http: HttpClient,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loadTenants();
    this.loadSubscriptionPlans();
  }

  loadSubscriptionPlans() {
    this.http.get<any>(`${environment.apiUrl}/subscriptions/plans/`).subscribe({
      next: (response) => {
        console.log('Raw subscription plans response:', response);
        this.subscriptionPlans = Array.isArray(response) ? response : (response.results || []);
        console.log('Processed subscription plans:', this.subscriptionPlans);
        console.log('Number of plans:', this.subscriptionPlans.length);
      },
      error: (error) => {
        console.error('Error loading subscription plans:', error);
        this.subscriptionPlans = [];
      }
    });
  }

  loadTenants() {
    this.loading = true;
    console.log('Loading tenants...');
    this.tenantsService.getTenants().subscribe({
      next: (data) => {
        console.log('Raw API response:', data);
        console.log('Type of data:', typeof data);
        console.log('Is array?', Array.isArray(data));

        // Asegurarse de que los datos son un array antes de asignarlos
        this.tenants = Array.isArray(data) ? data : [];
        console.log('Tenants assigned:', this.tenants);
        console.log('Number of tenants:', this.tenants.length);

        // Debug subscription plan data for each tenant
        this.tenants.forEach((tenant, index) => {
          console.log(`Tenant ${index + 1}:`, {
            id: tenant.id,
            name: tenant.name,
            plan_type: tenant.plan_type,
            subscription_plan: tenant.subscription_plan,
            subscription_plan_details: tenant.subscription_plan_details
          });
        });

        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading tenants:', error);
        console.error('Error status:', error.status);
        console.error('Error details:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los tenants: ' + (error.message || 'Error desconocido')
        });
        this.tenants = []; // Asegurar que siempre sea un array
        this.loading = false;
      }
    });
  }

  openNew() {
    this.tenant = {
      name: '',
      subdomain: '',
      contact_email: '',
      contact_phone: '',
      address: '',
      subscription_plan: undefined,
      max_users: 1,
      max_employees: 1,
      is_active: true
    };
    this.submitted = false;
    this.tenantDialog = true;
  }

  editTenant(tenant: Tenant) {
    // Buscar los detalles del plan en la lista de planes disponibles
    const planDetails = this.subscriptionPlans.find(plan => plan.id === tenant.subscription_plan);

    // Copiar todos los campos del tenant
    this.tenant = {
      ...tenant,
      // Asegurar que subscription_plan sea el ID correcto para el dropdown
      subscription_plan: tenant.subscription_plan || undefined
    };

    console.log('Editing tenant:', tenant);
    console.log('Form data after copy:', this.tenant);
    console.log('Subscription plan ID:', this.tenant.subscription_plan);
    console.log('Plan details found:', planDetails);

    this.tenantDialog = true;
  }

  deleteTenant(tenant: Tenant) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que quieres eliminar el tenant "${tenant.name}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.tenantsService.deleteTenant(tenant.id!).subscribe({
          next: () => {
            this.tenants = this.tenants.filter(val => val.id !== tenant.id);
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Tenant eliminado correctamente'
            });
          },
          error: (error) => {
            console.error('Error deleting tenant:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al eliminar el tenant'
            });
          }
        });
      }
    });
  }

  hideDialog() {
    this.tenantDialog = false;
    this.submitted = false;
  }

  saveTenant() {
    this.submitted = true;

    if (this.tenant.name?.trim() && this.tenant.subdomain?.trim()) {
      // Preparar los datos para enviar al backend
      const tenantData = {
        name: this.tenant.name,
        subdomain: this.tenant.subdomain,
        contact_email: this.tenant.contact_email,
        contact_phone: this.tenant.contact_phone,
        address: this.tenant.address,
        subscription_plan: this.tenant.subscription_plan, // ID del plan de suscripción
        max_users: this.tenant.max_users || 1,
        max_employees: this.tenant.max_employees || 1,
        is_active: this.tenant.is_active !== undefined ? this.tenant.is_active : true
      };

      console.log('Sending tenant data:', tenantData);
      console.log('Tenant ID for update:', this.tenant.id);

      if (this.tenant.id) {
        // Actualizar tenant existente
        console.log('Updating tenant with data:', tenantData);
        this.tenantsService.updateTenant(this.tenant.id, tenantData).subscribe({
          next: (updatedTenant) => {
            console.log('Tenant updated successfully:', updatedTenant);
            const index = this.tenants.findIndex(t => t.id === updatedTenant.id);
            if (index !== -1) {
              this.tenants[index] = updatedTenant;
            }
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Tenant actualizado correctamente'
            });
            this.tenantDialog = false;
            this.tenant = {};
          },
          error: (error) => {
            console.error('Error updating tenant:', error);
            console.error('Error response:', error.error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al actualizar el tenant: ' + (error.error?.detail || error.message || 'Error desconocido')
            });
          }
        });
      } else {
        // Crear nuevo tenant
        this.tenantsService.createTenant(tenantData as any).subscribe({
          next: (newTenant) => {
            console.log('Tenant created successfully:', newTenant);
            this.tenants.push(newTenant);
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Tenant creado correctamente'
            });
            this.tenantDialog = false;
            this.tenant = {};
          },
          error: (error) => {
            console.error('Error creating tenant:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al crear el tenant: ' + (error.error?.detail || error.message || 'Error desconocido')
            });
          }
        });
      }
    }
  }

  getStatusSeverity(status: boolean): string {
    return status ? 'success' : 'danger';
  }

  getStatusLabel(status: boolean): string {
    return status ? 'Activo' : 'Inactivo';
  }

  getPlanDisplayName(tenant: Tenant): string {
    if (!tenant.subscription_plan) {
      return tenant.plan_type || 'Sin plan';
    }

    // Buscar el plan en la lista de planes disponibles
    const plan = this.subscriptionPlans.find(p => p.id === tenant.subscription_plan);
    if (plan) {
      return plan.description || plan.name || `Plan ${tenant.subscription_plan}`;
    }

    return `Plan ${tenant.subscription_plan}`;
  }

  activateTenant(tenant: Tenant) {
    console.log('Activating tenant:', tenant.name, 'ID:', tenant.id);
    this.tenantsService.activateTenant(tenant.id!).subscribe({
      next: (updatedTenant) => {
        console.log('Tenant activated successfully:', updatedTenant);
        console.log('Previous state:', tenant.is_active, 'New state:', updatedTenant.is_active);

        const index = this.tenants.findIndex(t => t.id === updatedTenant.id);
        if (index !== -1) {
          this.tenants[index] = updatedTenant;
          console.log('Tenant updated in array at index:', index);
        } else {
          console.warn('Tenant not found in array for update');
        }

        // Forzar refresco de la vista
        this.tenants = [...this.tenants];

        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Tenant activado correctamente'
        });
      },
      error: (error) => {
        console.error('Error activating tenant:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al activar el tenant'
        });
      }
    });
  }

  deactivateTenant(tenant: Tenant) {
    console.log('Deactivating tenant:', tenant.name, 'ID:', tenant.id);
    this.tenantsService.deactivateTenant(tenant.id!).subscribe({
      next: (updatedTenant) => {
        console.log('Tenant deactivated successfully:', updatedTenant);
        console.log('Previous state:', tenant.is_active, 'New state:', updatedTenant.is_active);

        const index = this.tenants.findIndex(t => t.id === updatedTenant.id);
        if (index !== -1) {
          this.tenants[index] = updatedTenant;
          console.log('Tenant updated in array at index:', index);
        } else {
          console.warn('Tenant not found in array for update');
        }

        // Forzar refresco de la vista
        this.tenants = [...this.tenants];

        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Tenant desactivado correctamente'
        });
      },
      error: (error) => {
        console.error('Error deactivating tenant:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al desactivar el tenant'
        });
      }
    });
  }

  onPlanChange(event: any) {
    const selectedPlanId = event.value;
    const selectedPlan = this.subscriptionPlans.find(p => p.id === selectedPlanId);

    if (selectedPlan) {
      // Heredar TODAS las características del plan desde la BD
      if (selectedPlan.max_employees === 0) {
        this.tenant.max_employees = null; // Ilimitado
      } else {
        this.tenant.max_employees = selectedPlan.max_employees;
      }

      if (selectedPlan.max_users === 0) {
        this.tenant.max_users = null; // Ilimitado
      } else {
        this.tenant.max_users = selectedPlan.max_users;
      }

      console.log(`Plan ${selectedPlan.name} heredado desde BD:`);
      console.log(`- Max Employees: ${selectedPlan.max_employees}`);
      console.log(`- Max Users: ${selectedPlan.max_users}`);
      console.log(`- Duration: ${selectedPlan.duration_month} meses`);
      console.log(`- Price: $${selectedPlan.price}`);
      console.log(`- Features:`, selectedPlan.features);
    }
  }
}
