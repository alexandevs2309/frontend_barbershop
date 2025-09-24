import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { debounceTime, Subscription } from 'rxjs';
import { LayoutService } from '../../../../layout/service/layout.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environment';

@Component({
    standalone: true,
    selector: 'app-revenue-stream-widget',
    imports: [ChartModule],
    template: `<div class="card !mb-8">
        <div class="font-semibold text-xl mb-4">Revenue Stream</div>
        <p-chart type="bar" [data]="chartData" [options]="chartOptions" class="h-80" />
    </div>`
})
export class RevenueStreamWidget implements OnInit, OnDestroy {
    chartData: any;
    chartOptions: any;
    subscription!: Subscription;

    constructor(public layoutService: LayoutService, private http: HttpClient) {
        this.subscription = this.layoutService.configUpdate$.pipe(debounceTime(25)).subscribe(() => {
            this.initChart();
        });
    }

    ngOnInit() {
        this.loadRevenueData();
    }

    loadRevenueData() {
        this.http.get(`${environment.apiUrl}/reports/?type=sales`).subscribe({
            next: (data: any) => {
                const dailySales = data.daily_sales || [];
                this.processRevenueData(dailySales);
            },
            error: () => {
                this.initChart(); // Fallback a datos estáticos
            }
        });
    }

    processRevenueData(dailySales: any[]) {
        // Agrupar por semanas del mes actual
        const weeks = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];
        const weeklyData = [0, 0, 0, 0];
        
        dailySales.forEach(sale => {
            const date = new Date(sale.day);
            const dayOfMonth = date.getDate();
            const weekIndex = Math.min(Math.floor((dayOfMonth - 1) / 7), 3);
            weeklyData[weekIndex] += parseFloat(sale.total || 0);
        });
        
        this.initChartWithData(weeks, weeklyData);
    }

    initChart() {
        this.initChartWithData(['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'], [0, 0, 0, 0]);
    }

    initChartWithData(labels: string[], revenueData: number[]) {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const borderColor = documentStyle.getPropertyValue('--surface-border');
        const textMutedColor = documentStyle.getPropertyValue('--text-color-secondary');

        this.chartData = {
            labels: labels,
            datasets: [
                {
                    type: 'bar',
                    label: 'Servicios',
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-400'),
                    data: revenueData.map(val => val * 0.7), // 70% servicios
                    barThickness: 32
                },
                {
                    type: 'bar',
                    label: 'Productos',
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-300'),
                    data: revenueData.map(val => val * 0.3), // 30% productos
                    barThickness: 32
                },
                {
                    type: 'bar',
                    label: 'Total',
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-200'),
                    data: revenueData,
                    borderRadius: {
                        topLeft: 8,
                        topRight: 8,
                        bottomLeft: 0,
                        bottomRight: 0
                    },
                    borderSkipped: false,
                    barThickness: 32
                }
            ]
        };

        this.chartOptions = {
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    ticks: {
                        color: textMutedColor
                    },
                    grid: {
                        color: 'transparent',
                        borderColor: 'transparent'
                    }
                },
                y: {
                    stacked: true,
                    ticks: {
                        color: textMutedColor
                    },
                    grid: {
                        color: borderColor,
                        borderColor: 'transparent',
                        drawTicks: false
                    }
                }
            }
        };
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
