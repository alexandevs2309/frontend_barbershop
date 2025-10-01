import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environment';
import { AppointmentsService } from '../../appointments/appointments.service';
import { ClientsService } from '../../clients/clients.service';

@Component({
    standalone: true,
    selector: 'app-notifications-widget',
    imports: [CommonModule, ButtonModule, MenuModule],
    template: `<div class="card">
        <div class="flex items-center justify-between mb-6">
            <div class="font-semibold text-xl">Notifications</div>
            <div>
                <button pButton type="button" icon="pi pi-ellipsis-v" class="p-button-rounded p-button-text p-button-plain" (click)="menu.toggle($event)"></button>
                <p-menu #menu [popup]="true" [model]="items"></p-menu>
            </div>
        </div>

        <span class="block text-muted-color font-medium mb-4">HOY</span>
        <ul class="p-0 mx-0 mt-0 mb-6 list-none">
            <li *ngFor="let appointment of upcomingAppointments" class="flex items-center py-2 border-b border-surface">
                <div class="w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-full mr-4 shrink-0">
                    <i class="pi pi-calendar !text-xl text-blue-500"></i>
                </div>
                <span class="text-surface-900 dark:text-surface-0 leading-normal">
                    {{ appointment.client_name }}
                    <span class="text-surface-700 dark:text-surface-100">tiene cita a las <span class="text-primary font-bold">{{ appointment.date_time | date:'HH:mm' }}</span></span>
                </span>
            </li>
            <li *ngFor="let birthday of birthdayClients" class="flex items-center py-2">
                <div class="w-12 h-12 flex items-center justify-center bg-pink-100 dark:bg-pink-400/10 rounded-full mr-4 shrink-0">
                    <i class="pi pi-gift !text-xl text-pink-500"></i>
                </div>
                <span class="text-surface-700 dark:text-surface-100 leading-normal">¡Cumpleaños de <span class="text-primary font-bold">{{ birthday.full_name }}</span> hoy!</span>
            </li>
        </ul>

        <span class="block text-muted-color font-medium mb-4" *ngIf="lowStockProducts.length">INVENTARIO</span>
        <ul class="p-0 m-0 list-none mb-6" *ngIf="lowStockProducts.length">
            <li *ngFor="let product of lowStockProducts" class="flex items-center py-2 border-b border-surface">
                <div class="w-12 h-12 flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-full mr-4 shrink-0">
                    <i class="pi pi-exclamation-triangle !text-xl text-orange-500"></i>
                </div>
                <span class="text-surface-900 dark:text-surface-0 leading-normal">
                    {{ product.name }}
                    <span class="text-surface-700 dark:text-surface-100">stock bajo: <span class="text-primary font-bold">{{ product.stock }}</span> unidades</span>
                </span>
            </li>
        </ul>
        
        <div *ngIf="!upcomingAppointments.length && !birthdayClients.length && !lowStockProducts.length" class="text-center p-4">
            <i class="pi pi-check-circle text-4xl text-green-500 mb-2 block"></i>
            <p class="text-600 m-0">No hay notificaciones pendientes</p>
        </div>
    </div>`
})
export class NotificationsWidget implements OnInit {
    upcomingAppointments: any[] = [];
    birthdayClients: any[] = [];
    lowStockProducts: any[] = [];
    
    items = [
        { label: 'Marcar como leído', icon: 'pi pi-fw pi-check' },
        { label: 'Ver todas', icon: 'pi pi-fw pi-eye' }
    ];

    constructor(
        private http: HttpClient,
        private appointmentsService: AppointmentsService,
        private clientsService: ClientsService
    ) {}

    ngOnInit() {
        this.loadNotifications();
    }

    loadNotifications() {
        this.loadUpcomingAppointments();
        this.loadBirthdayClients();
        this.loadLowStockProducts();
    }

    loadUpcomingAppointments() {
        const today = new Date().toISOString().split('T')[0];
        const now = new Date();
        const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        
        this.appointmentsService.getAppointments({ date: today, status: 'scheduled' }).subscribe({
            next: (data) => {
                const appointments = data.results || data || [];
                if (Array.isArray(appointments)) {
                    this.upcomingAppointments = appointments.filter((apt: any) => {
                        const aptTime = new Date(apt.date_time);
                        return aptTime >= now && aptTime <= twoHoursLater;
                    }).slice(0, 3);
                }
            },
            error: () => this.upcomingAppointments = []
        });
    }

    loadBirthdayClients() {
        this.clientsService.getBirthdaysThisMonth().subscribe({
            next: (clients) => {
                const today = new Date();
                if (Array.isArray(clients)) {
                    this.birthdayClients = clients.filter(client => {
                        if (!client.birthday) return false;
                        const birthday = new Date(client.birthday);
                        return birthday.getDate() === today.getDate() && birthday.getMonth() === today.getMonth();
                    }).slice(0, 2);
                }
            },
            error: () => this.birthdayClients = []
        });
    }

    loadLowStockProducts() {
        this.http.get(`${environment.apiUrl}/inventory/products/?low_stock=true`).subscribe({
            next: (data: any) => {
                const products = data.results || data || [];
                if (Array.isArray(products)) {
                    this.lowStockProducts = products.slice(0, 3);
                }
            },
            error: () => this.lowStockProducts = []
        });
    }
}
