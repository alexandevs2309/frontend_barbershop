import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { AuthService } from '../../pages/auth/service/auth.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})
export class AppMenu implements OnInit, OnDestroy {
    model: MenuItem[] = [];
    private userSubscription?: Subscription;

    private readonly PRINCIPAL_ITEMS: MenuItem[] = [
        { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/client/home'] },
        { label: 'Clientes', icon: 'pi pi-fw pi-users', routerLink: ['/client/clients'] }
    ];

    private readonly GESTION_ITEMS: MenuItem[] = [
        { label: 'Servicios', icon: 'pi pi-fw pi-list', routerLink: ['/client/services'] },
        { label: 'Empleados', icon: 'pi pi-fw pi-user-plus', routerLink: ['/client/employees'] },
        { label: 'Ganancias', icon: 'pi pi-fw pi-money-bill', routerLink: ['/client/earnings'] },
        { label: 'Inventario', icon: 'pi pi-fw pi-box', routerLink: ['/client/inventory'] },
        { label: 'Citas', icon: 'pi pi-fw pi-calendar', routerLink: ['/client/appointments'] },
        { label: 'POS/Caja', icon: 'pi pi-fw pi-shopping-cart', routerLink: ['/client/pos'] },
        { label: 'Reportes', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/client/reports'] }
    ];

    private readonly CONFIG_ITEMS: MenuItem[] = [
        { label: 'Mi Negocio', icon: 'pi pi-fw pi-building', routerLink: ['/client/settings'] }
    ];

    private readonly STAFF_ITEMS: MenuItem[] = [
        { label: 'Mis Citas', icon: 'pi pi-fw pi-calendar', routerLink: ['/client/my-appointments'] },
        { label: 'Mis Ganancias', icon: 'pi pi-fw pi-money-bill', routerLink: ['/client/my-earnings'] }
    ];

    private readonly CASHIER_ITEMS: MenuItem[] = [
        { label: 'POS/Caja', icon: 'pi pi-fw pi-shopping-cart', routerLink: ['/client/pos'] },
        { label: 'Historial Ventas', icon: 'pi pi-fw pi-history', routerLink: ['/client/sales-history'] }
    ];

    constructor(private authService: AuthService) {}

    ngOnInit() {
        this.userSubscription = this.authService.currentUser$.subscribe(user => {
            this.buildMenu(user);
        });
    }

    ngOnDestroy() {
        this.userSubscription?.unsubscribe();
    }

    private buildMenu(user: any) {
        if (!user) {
            this.model = [];
            return;
        }

        const userRole = user.roles?.[0]?.name;

        if (userRole === 'Super-Admin') {
            this.model = this.getSuperAdminMenu();
        } else if (userRole === 'Soporte') {
            this.model = this.getSoporteMenu();
        } else if (['Client-Admin', 'Admin', 'Manager', 'Client-Staff', 'Cajera'].includes(userRole)) {
            this.model = this.getTenantMenu(userRole);
        } else {
            this.model = [];
        }
    }

    private getSuperAdminMenu(): MenuItem[] {
        return [
            {
                label: 'Administración',
                items: [
                    { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/admin/dashboard'] },
                    { label: 'Usuarios', icon: 'pi pi-fw pi-users', routerLink: ['/admin/users'] },
                    { label: 'Planes', icon: 'pi pi-fw pi-credit-card', routerLink: ['/admin/plans'] },
                    { label: 'Tenants', icon: 'pi pi-fw pi-building', routerLink: ['/admin/tenants'] },
                    { label: 'Reportes', icon: 'pi pi-fw pi-chart-line', routerLink: ['/admin/reports'] }
                ]
            },
            {
                label: 'Sistema',
                items: [
                    { label: 'Roles', icon: 'pi pi-fw pi-shield', routerLink: ['/admin/roles'] },
                    { label: 'Configuración', icon: 'pi pi-fw pi-cog', routerLink: ['/admin/system-settings'] },
                    { label: 'Auditoría', icon: 'pi pi-fw pi-eye', routerLink: ['/admin/audit-log'] }
                ]
            }
        ];
    }

    private getSoporteMenu(): MenuItem[] {
        return [
            {
                label: 'Soporte',
                items: [
                    { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/admin/dashboard'] },
                    { label: 'Tenants', icon: 'pi pi-fw pi-building', routerLink: ['/admin/tenants'] },
                    { label: 'Usuarios', icon: 'pi pi-fw pi-users', routerLink: ['/admin/users'] },
                    { label: 'Reportes', icon: 'pi pi-fw pi-chart-line', routerLink: ['/admin/reports'] },
                    { label: 'Auditoría', icon: 'pi pi-fw pi-eye', routerLink: ['/admin/audit-log'] }
                ]
            }
        ];
    }

    private getTenantMenu(role: string): MenuItem[] {
        const baseMenu = [
            {
                label: 'Principal',
                items: [
                    { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/client/home'] },
                    { label: 'Clientes', icon: 'pi pi-fw pi-users', routerLink: ['/client/clients'] }
                ]
            }
        ];

        if (role === 'Client-Admin' || role === 'Admin') {
            baseMenu.push({
                label: 'Gestión',
                items: [
                    { label: 'Usuarios', icon: 'pi pi-fw pi-user', routerLink: ['/client/users'] },
                    { label: 'Servicios', icon: 'pi pi-fw pi-list', routerLink: ['/client/services'] },
                    { label: 'Empleados', icon: 'pi pi-fw pi-user-plus', routerLink: ['/client/employees'] },
                    { label: 'Ganancias', icon: 'pi pi-fw pi-money-bill', routerLink: ['/client/earnings'] },
                    { label: 'Inventario', icon: 'pi pi-fw pi-box', routerLink: ['/client/inventory'] },
                    { label: 'Citas', icon: 'pi pi-fw pi-calendar', routerLink: ['/client/appointments'] },
                    { label: 'POS/Caja', icon: 'pi pi-fw pi-shopping-cart', routerLink: ['/client/pos'] },
                    { label: 'Reportes', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/client/reports'] }
                ]
            });
            baseMenu.push({
                label: 'Configuración',
                items: [
                    { label: 'Mi Negocio', icon: 'pi pi-fw pi-building', routerLink: ['/client/settings'] }
                ]
            });
        } else if (role === 'Manager') {
            baseMenu.push({
                label: 'Gestión',
                items: [
                    { label: 'Servicios', icon: 'pi pi-fw pi-list', routerLink: ['/client/services'] },
                    { label: 'Empleados', icon: 'pi pi-fw pi-user-plus', routerLink: ['/client/employees'] },
                    { label: 'Ganancias', icon: 'pi pi-fw pi-money-bill', routerLink: ['/client/earnings'] },
                    { label: 'Inventario', icon: 'pi pi-fw pi-box', routerLink: ['/client/inventory'] },
                    { label: 'Citas', icon: 'pi pi-fw pi-calendar', routerLink: ['/client/appointments'] },
                    { label: 'POS/Caja', icon: 'pi pi-fw pi-shopping-cart', routerLink: ['/client/pos'] },
                    { label: 'Reportes', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/client/reports'] }
                ]
            });
        } else if (role === 'Client-Staff') {
            baseMenu.push({
                label: 'Mi Trabajo',
                items: [
                    { label: 'Mis Citas', icon: 'pi pi-fw pi-calendar', routerLink: ['/client/my-appointments'] },
                    { label: 'Mis Ganancias', icon: 'pi pi-fw pi-money-bill', routerLink: ['/client/my-earnings'] }
                ]
            });
        } else if (role === 'Cajera') {
            baseMenu.push({
                label: 'Punto de Venta',
                items: [
                    { label: 'POS/Caja', icon: 'pi pi-fw pi-shopping-cart', routerLink: ['/client/pos'] },
                    { label: 'Historial Ventas', icon: 'pi pi-fw pi-history', routerLink: ['/client/sales-history'] }
                ]
            });
        }

        return baseMenu;
    }
}
