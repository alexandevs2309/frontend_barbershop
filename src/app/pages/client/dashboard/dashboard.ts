import { Component, OnInit } from '@angular/core';
import { StatsWidget } from './components/statswidget';
import { RecentSalesWidget } from './components/recentsaleswidget';
import { BestSellingWidget } from './components/bestsellingwidget';
import { RevenueStreamWidget } from './components/revenuestreamwidget';
import { NotificationsWidget } from './components/notificationswidget';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environment';
import { AppointmentsService } from '../appointments/appointments.service';
import { ClientsService } from '../clients/clients.service';

@Component({
    selector: 'app-dashboard',
    imports: [StatsWidget, RecentSalesWidget, BestSellingWidget, RevenueStreamWidget, NotificationsWidget],
    template: `
        <div class="grid grid-cols-12 gap-8">
            <app-stats-widget class="contents" [data]="statsData" />
            <div class="col-span-12 xl:col-span-6">
                <app-recent-sales-widget />
                <app-best-selling-widget />
            </div>
            <div class="col-span-12 xl:col-span-6">
                <app-revenue-stream-widget />
                <app-notifications-widget />
            </div>
        </div>
    `
})
export class Dashboard implements OnInit {
    statsData = {
        todayAppointments: 0,
        todayRevenue: 0,
        totalClients: 0,
        pendingAppointments: 0
    };

    constructor(
        private http: HttpClient,
        private appointmentsService: AppointmentsService,
        private clientsService: ClientsService
    ) {}

    ngOnInit() {
        this.loadDashboardData();
    }

    loadDashboardData() {
        const today = new Date().toISOString().split('T')[0];
        
        this.appointmentsService.getAppointments({ date: today }).subscribe({
            next: (data) => {
                const appointments = data.results || data;
                this.statsData.todayAppointments = appointments.length;
                this.statsData.pendingAppointments = appointments.filter((a: any) => a.status === 'scheduled').length;
            },
            error: () => console.error('Error loading appointments')
        });

        this.clientsService.getClients({ page_size: 1 }).subscribe({
            next: (data) => this.statsData.totalClients = data.count,
            error: () => console.error('Error loading clients count')
        });

        this.http.get(`${environment.apiUrl}/pos/sales/?date=${today}`).subscribe({
            next: (data: any) => {
                const sales = data.results || data;
                this.statsData.todayRevenue = sales.reduce((sum: number, sale: any) => sum + (sale.total || 0), 0);
            },
            error: () => console.error('Error loading revenue')
        });
    }
}
