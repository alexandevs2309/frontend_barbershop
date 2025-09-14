import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule, FormsModule, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RoleService, Role, Permission } from '../roles/roles.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AccordionModule } from 'primeng/accordion';

@Component({
  selector: 'app-role',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ToastModule,
    ToolbarModule,
    TableModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    DropdownModule,
    CheckboxModule,
    ConfirmDialogModule,
    AccordionModule
  ],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class RoleComponent implements OnInit {
  roles: Role[] = [];
  permissions: Permission[] = [];
  groupedPermissions: { [key: string]: Permission[] } = {};
  selectedRole: Role | null = null;
  roleForm: FormGroup;
  dialogVisible = false;
  
  loadingStates = {
    roles: false,
    permissions: false,
    saving: false,
    deleting: false
  };
  
  // Backward compatibility
  get loading() { return this.loadingStates.roles; }
  get permissionsLoading() { return this.loadingStates.permissions; }

  scopeOptions = [
    { label: 'Global', value: 'GLOBAL' },
    { label: 'Tenant', value: 'TENANT' },
    { label: 'Módulo', value: 'MODULE' }
  ];

  constructor(
    private fb: FormBuilder,
    private roleService: RoleService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef
  ) {
    this.roleForm = this.fb.group({
      id: [null],
      name: ['', [Validators.required, this.uniqueRoleValidator.bind(this)]],
      description: [''],
      scope: ['GLOBAL', Validators.required],
      module: [null],
      limits: this.fb.group({
        max_users: [null],
        max_storage: [null]
      }),
      permissions: [[]]
    });
  }

  ngOnInit(): void {
    this.loadRoles();
    this.loadPermissions();
    this.setupScopeWatcher();
  }

  setupScopeWatcher() {
    this.roleForm.get('scope')?.valueChanges.subscribe(scope => {
      if (scope !== 'MODULE') {
        this.roleForm.patchValue({ module: null });
      }
    });
  }

  loadRoles() {
    this.loadingStates.roles = true;
    this.roleService.getRoles().subscribe({
      next: data => {
        this.roles = data;
        this.loadingStates.roles = false;
      },
      error: () => this.loadingStates.roles = false
    });
  }

  loadPermissions() {
    this.loadingStates.permissions = true;
    this.roleService.getPermissions().subscribe({
      next: data => {
        this.permissions = data;
        this.groupedPermissions = this.getGroupedPermissions(data);
        this.loadingStates.permissions = false;
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Error cargando permisos:', error);
        this.loadingStates.permissions = false;
        this.permissions = [];
        this.groupedPermissions = {};
        this.cdr.detectChanges();
      }
    });
  }

  openNew() {
    this.roleForm.reset({
      scope: 'GLOBAL',
      permissions: [],
      limits: { max_users: null, max_storage: null }
    });
    this.selectedRole = null;
    this.dialogVisible = true;
  }

  editRole(role: Role) {
    this.roleForm.patchValue({
      id: role.id,
      name: role.name,
      description: role.description || '',
      scope: role.scope,
      module: role.module || '',
      limits: {
        max_users: role.limits?.['max_users'] || null,
        max_storage: role.limits?.['max_storage'] || null
      },
      permissions: role.permissions || []
    });
    this.selectedRole = role;
    this.dialogVisible = true;
  }

  saveRole() {
    if (this.roleForm.invalid) {
      this.markFormGroupTouched(this.roleForm);
      return;
    }

    this.loadingStates.saving = true;
    const formValue = this.roleForm.value;
    const roleData: any = {
      id: formValue.id,
      name: formValue.name,
      description: formValue.description || '',
      scope: formValue.scope,
      module: formValue.scope === 'MODULE' ? formValue.module : '',
      limits: formValue.limits || {},
      permissions: formValue.permissions || []
    };

    const request = roleData.id
      ? this.roleService.updateRole(roleData.id, roleData)
      : this.roleService.createRole(roleData);

    request.subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Rol guardado correctamente' });
        this.dialogVisible = false;
        this.loadRoles();
        this.loadingStates.saving = false;
      },
      error: (error) => {
        console.error('Error saving role:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar el rol' });
        this.loadingStates.saving = false;
      }
    });
  }

  deleteRole(role: Role) {
    if (!role.id) return;
    
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar el rol "${role.name}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.loadingStates.deleting = true;
        this.roleService.deleteRole(role.id!).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Rol eliminado correctamente' });
            this.loadRoles();
            this.loadingStates.deleting = false;
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el rol' });
            this.loadingStates.deleting = false;
          }
        });
      }
    });
  }

  togglePermission(id: number, checked: boolean) {
    const currentPermissions = this.roleForm.get('permissions')?.value || [];
    let newPermissions: number[];
    
    if (checked) {
      newPermissions = [...currentPermissions, id];
    } else {
      newPermissions = currentPermissions.filter((p: number) => p !== id);
    }
    
    this.roleForm.patchValue({ permissions: newPermissions });
    
    // Forzar actualización visual
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);
  }

  isPermissionSelected(id: number): boolean {
    const permissions = this.roleForm.get('permissions')?.value || [];
    return permissions.includes(id);
  }

  toggleAllPermissions(checked: boolean) {
    if (checked) {
      const allPermissionIds = this.permissions.map(p => p.id);
      this.roleForm.patchValue({ permissions: allPermissionIds });
    } else {
      this.roleForm.patchValue({ permissions: [] });
    }
    
    // Forzar actualización visual
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);
  }

  areAllPermissionsSelected(): boolean {
    const selectedPermissions = this.roleForm.get('permissions')?.value || [];
    return this.permissions.length > 0 && selectedPermissions.length === this.permissions.length;
  }

  getSelectedPermissionsCount(): number {
    const selectedPermissions = this.roleForm.get('permissions')?.value || [];
    return selectedPermissions.length;
  }

  translatePermission(name: string): string {
    const translations: { [key: string]: string } = {
      // Admin
      'Can add log entry': 'Puede agregar entrada de log',
      'Can change log entry': 'Puede modificar entrada de log',
      'Can delete log entry': 'Puede eliminar entrada de log',
      'Can view log entry': 'Puede ver entrada de log',
      
      // Appointments
      'Can add Cita': 'Puede agregar cita',
      'Can change Cita': 'Puede modificar cita',
      'Can delete Cita': 'Puede eliminar cita',
      'Can view Cita': 'Puede ver cita',
      
      // Users
      'Can add user': 'Puede agregar usuario',
      'Can change user': 'Puede modificar usuario',
      'Can delete user': 'Puede eliminar usuario',
      'Can view user': 'Puede ver usuario',
      
      // Clients
      'Can add client': 'Puede agregar cliente',
      'Can change client': 'Puede modificar cliente',
      'Can delete client': 'Puede eliminar cliente',
      'Can view client': 'Puede ver cliente',
      
      // Employees
      'Can add employee': 'Puede agregar empleado',
      'Can change employee': 'Puede modificar empleado',
      'Can delete employee': 'Puede eliminar empleado',
      'Can view employee': 'Puede ver empleado',
      
      // Services
      'Can add service': 'Puede agregar servicio',
      'Can change service': 'Puede modificar servicio',
      'Can delete service': 'Puede eliminar servicio',
      'Can view service': 'Puede ver servicio',
      
      // Products
      'Can add product': 'Puede agregar producto',
      'Can change product': 'Puede modificar producto',
      'Can delete product': 'Puede eliminar producto',
      'Can view product': 'Puede ver producto'
    };
    
    return translations[name] || name;
  }

  trackByPermissionId(index: number, permission: Permission): number {
    return permission.id;
  }

  getModuleDisplay(module: string | null | undefined): string {
    if (!module || module.trim() === '') {
      return '-';
    }
    return module;
  }

  uniqueRoleValidator(control: AbstractControl) {
    if (!control.value) return null;
    
    const name = control.value.toLowerCase().trim();
    const exists = this.roles.some(r => 
      r.name.toLowerCase() === name && 
      r.id !== this.selectedRole?.id
    );
    return exists ? { uniqueName: true } : null;
  }

  getGroupedPermissions(permissions: Permission[]): { [key: string]: Permission[] } {
    return permissions.reduce((groups, perm) => {
      const module = this.getModuleName(perm.app_label);
      if (!groups[module]) groups[module] = [];
      groups[module].push(perm);
      return groups;
    }, {} as {[key: string]: Permission[]});
  }

  getModuleName(appLabel: string): string {
    const moduleNames: { [key: string]: string } = {
      'admin': 'Administración',
      'auth': 'Autenticación',
      'auth_api': 'Usuarios',
      'appointments_api': 'Citas',
      'clients_api': 'Clientes',
      'employees_api': 'Empleados',
      'services_api': 'Servicios',
      'inventory_api': 'Inventario',
      'billing_api': 'Facturación',
      'pos_api': 'Punto de Venta',
      'reports_api': 'Reportes',
      'audit_api': 'Auditoría',
      'roles_api': 'Roles',
      'tenants_api': 'Inquilinos',
      'subscriptions_api': 'Suscripciones'
    };
    return moduleNames[appLabel] || appLabel;
  }

  getGroupKeys(): string[] {
    return Object.keys(this.groupedPermissions).sort();
  }

  toggleGroupPermissions(groupKey: string, checked: boolean) {
    const groupPermissions = this.groupedPermissions[groupKey] || [];
    const currentPermissions = this.roleForm.get('permissions')?.value || [];
    
    let newPermissions: number[];
    if (checked) {
      const groupIds = groupPermissions.map(p => p.id);
      newPermissions = [...new Set([...currentPermissions, ...groupIds])];
    } else {
      const groupIds = groupPermissions.map(p => p.id);
      newPermissions = currentPermissions.filter((id: number) => !groupIds.includes(id));
    }
    
    this.roleForm.patchValue({ permissions: newPermissions });
    setTimeout(() => this.cdr.detectChanges(), 0);
  }

  isGroupSelected(groupKey: string): boolean {
    const groupPermissions = this.groupedPermissions[groupKey] || [];
    const selectedPermissions = this.roleForm.get('permissions')?.value || [];
    return groupPermissions.length > 0 && 
           groupPermissions.every(p => selectedPermissions.includes(p.id));
  }

  isGroupPartiallySelected(groupKey: string): boolean {
    const groupPermissions = this.groupedPermissions[groupKey] || [];
    const selectedPermissions = this.roleForm.get('permissions')?.value || [];
    const selectedInGroup = groupPermissions.filter(p => selectedPermissions.includes(p.id));
    return selectedInGroup.length > 0 && selectedInGroup.length < groupPermissions.length;
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getFieldError(fieldName: string): string | null {
    const field = this.roleForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return 'Este campo es requerido';
      if (field.errors['uniqueName']) return 'Ya existe un rol con este nombre';
    }
    return null;
  }
}
