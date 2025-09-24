import { Component, OnInit } from '@angular/core';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environment';

@Component({
    standalone: true,
    selector: 'app-recent-sales-widget',
    imports: [CommonModule, TableModule, ButtonModule, RippleModule],
    template: `<div class="card !mb-8">
        <div class="font-semibold text-xl mb-4">Recent Sales</div>
        <p-table [value]="sales" [paginator]="true" [rows]="5" responsiveLayout="scroll">
            <ng-template #header>
                <tr>
                    <th>Cliente</th>
                    <th>Servicio</th>
                    <th>Total</th>
                    <th>Hora</th>
                </tr>
            </ng-template>
            <ng-template #body let-sale>
                <tr>
                    <td style="width: 30%;">{{ sale.client_name || 'Cliente' }}</td>
                    <td style="width: 35%;">{{ sale.service_name || 'Servicio' }}</td>
                    <td style="width: 20%;">{{ sale.total | currency: 'USD' }}</td>
                    <td style="width: 15%;">{{ sale.date_time | date:'HH:mm' }}</td>
                </tr>
            </ng-template>
        </p-table>
    </div>`
})
export class RecentSalesWidget implements OnInit {
    sales: any[] = [];

    constructor(private http: HttpClient) {}

    ngOnInit() {
        this.loadRecentSales();
    }

    loadRecentSales() {
        const today = new Date().toISOString().split('T')[0];
        this.http.get(`${environment.apiUrl}/pos/sales/?date=${today}&ordering=-date_time`).subscribe({
            next: (data: any) => {
                this.sales = (data.results || data).slice(0, 10);
            },
            error: () => {
                this.sales = [];
            }
        });
    }
}
