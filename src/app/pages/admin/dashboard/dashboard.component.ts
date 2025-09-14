import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Card } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { Badge } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { UIChart } from 'primeng/chart';
import { DashboardService } from './dashboard.service';
import { WidgetAdminComponent } from './components/widget-admin/widget-admin.component';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    imports: [Card, TableModule, Badge, ButtonModule, RouterModule, CommonModule, UIChart, WidgetAdminComponent]
})
export class DashboardComponent implements OnInit {
    summaryCards: any[] = [];
    loading = true;
    lastUpdate = new Date();
    dataSource = 'API';

    activities: any[] = [];

    lineChartData = {
        labels: [] as string[],
        datasets: [
            {
                label: 'Suscripciones',
                data: [] as number[],
                fill: false,
                tension: 0.4,
                borderColor: '#42A5F5'
            }
        ]
    };

    pieChartData = {
        labels: ['free', 'Básico', 'Premium', 'Standar', 'Empresarial'],
        datasets: [
            {
                data: [] as number[],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#D002F3', '#4CAF50'], // 5 colores
                hoverBackgroundColor: ['#FF6384aa', '#36A2EBaa', '#FFCE56aa', '#D002F3aa', '#4CAF50aa']
            }
        ]
    };

    chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: '#495057'
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: '#495057'
                },
                grid: {
                    color: '#ebedef'
                }
            },
            y: {
                ticks: {
                    color: '#495057'
                },
                grid: {
                    color: '#ebedef'
                }
            }
        }
    };

    constructor(private dashboardService: DashboardService) {}

    ngOnInit(): void {
        this.loadDashboardData();
        this.loadChartData();
        this.loadActivities();
    }

    loadDashboardData() {
        this.dashboardService.getDashboardStats().subscribe({
            next: (stats) => {
                this.summaryCards = [
                    { title: 'Tenants', value: stats.totals.tenants || 0, icon: 'pi pi-building', color: 'linear-gradient(to right, #00b09b, #96c93d)' },
                    { title: 'Usuarios', value: stats.totals.users || 0, icon: 'pi pi-users', color: 'linear-gradient(to right, #396afc, #2948ff)' },
                    { title: 'Ingresos', value: `$${stats.totals.revenue || 0}`, icon: 'pi pi-dollar', color: 'linear-gradient(to right, #f7971e, #ffd200)' },
                    { title: 'Suscripciones', value: stats.totals.subscriptions || 0, icon: 'pi pi-id-card', color: 'linear-gradient(to right, #e53935, #e35d5b)' }
                ];
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading dashboard data:', error);
                // Mantener datos por defecto en caso de error
                this.summaryCards = [
                    { title: 'Tenants', value: 0, icon: 'pi pi-building', color: 'linear-gradient(to right, #00b09b, #96c93d)' },
                    { title: 'Usuarios', value: 0, icon: 'pi pi-users', color: 'linear-gradient(to right, #396afc, #2948ff)' },
                    { title: 'Ingresos', value: '$0', icon: 'pi pi-dollar', color: 'linear-gradient(to right, #f7971e, #ffd200)' },
                    { title: 'Suscripciones', value: 0, icon: 'pi pi-id-card', color: 'linear-gradient(to right, #e53935, #e35d5b)' }
                ];
                this.loading = false;
            }
        });
    }

    loadChartData() {
        console.log('🔄 Cargando datos de gráficos desde API...');
        this.dashboardService.getChartData().subscribe({
            next: (data) => {
                console.log('📊 Datos de gráficos recibidos (RAW):', JSON.stringify(data, null, 2));

                this.lastUpdate = new Date();
                this.dataSource = 'API';

                // Definir todos los meses del año
                const allMonths = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

                // Inicializar datos de suscripciones con 0
                const subscriptionsByMonth = new Array(12).fill(0);

                // Suscripciones por mes
                if (data.subscriptions_by_month) {
                    if (data.month_labels) {
                        // Si vienen etiquetas, usar esas
                        data.month_labels.forEach((month: string, index: number) => {
                            const monthIndex = allMonths.indexOf(month);
                            if (monthIndex > -1) {
                                subscriptionsByMonth[monthIndex] = data.subscriptions_by_month[index];
                            }
                        });
                    } else {
                        // Si no vienen etiquetas, usar los datos directamente
                        for (let i = 0; i < Math.min(data.subscriptions_by_month.length, 12); i++) {
                            subscriptionsByMonth[i] = data.subscriptions_by_month[i];
                        }
                    }
                    console.log('📈 Datos de suscripciones actualizados:', subscriptionsByMonth);
                } else {
                    console.warn("⚠️ No llegaron datos de 'subscriptions_by_month'");
                }

                // Actualizar gráfico de línea (crear nuevo objeto para forzar actualización)
                this.lineChartData = {
                    labels: allMonths,
                    datasets: [
                        {
                            label: 'Suscripciones',
                            data: subscriptionsByMonth,
                            fill: false,
                            tension: 0.4,
                            borderColor: '#42A5F5'
                        }
                    ]
                };

                // Distribución de planes (crear nuevo objeto para forzar actualización)
                if (data.plan_distribution) {
                    const planNames = Object.keys(data.plan_distribution);
                    const planValues = Object.values(data.plan_distribution) as number[];
                    
                    // Generar colores dinámicamente
                    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50', '#9C27B0', '#FF9F40', '#C9CBCF', '#4BC0C0'];
                    const backgroundColor = planNames.map((_, index) => colors[index % colors.length]);
                    const hoverBackgroundColor = backgroundColor.map(color => color + 'aa');
                    
                    this.pieChartData = {
                        labels: planNames,
                        datasets: [
                            {
                                data: planValues,
                                backgroundColor: backgroundColor,
                                hoverBackgroundColor: hoverBackgroundColor
                            }
                        ]
                    };
                    console.log('🥧 Datos de distribución de planes actualizados:', { planNames, planValues });
                } else {
                    console.warn("⚠️ No llegaron datos de 'plan_distribution'");
                }
            },
            error: (error) => {
                console.error('❌ Error loading chart data:', error);
                this.dataSource = 'Fallback';
            }
        });
    }

    loadActivities() {
        console.log('🔄 Cargando actividades recientes desde API...');
        this.dashboardService.getRecentActivities().subscribe({
            next: (response) => {
                console.log('📋 Actividades recibidas:', response);
                this.activities =
                    response.recent_activity?.map((activity: any) => ({
                        event: activity.description || activity.action,
                        user: `${activity.user?.first_name || ''} ${activity.user?.last_name || ''}`.trim() || 'Usuario',
                        date: new Date(activity.timestamp),
                        type: this.getActivityType(activity.action),
                        severity: this.getActivitySeverity(activity.action),
                        icon: this.getActivityIcon(activity.action)
                    })) || [];
                console.log('✅ Actividades procesadas:', this.activities.length, 'elementos');
            },
            error: (error) => {
                console.error('❌ Error loading activities:', error);
                this.activities = [
                    { event: 'Nuevo registro', user: 'BarberShop X', date: new Date(), type: 'Registro', severity: 'success', icon: 'pi pi-plus-circle' },
                    { event: 'Cambio de plan', user: 'Salon Bella', date: new Date(), type: 'Actualización', severity: 'info', icon: 'pi pi-refresh' },
                    { event: 'Fallo de pago', user: 'Stylo Studio', date: new Date(), type: 'Error', severity: 'danger', icon: 'pi pi-times' }
                ];
                console.log('🔄 Usando datos de respaldo para actividades');
            }
        });
    }

    getTotalPlans(): number {
        return this.pieChartData.datasets[0].data.reduce((sum: number, value: number) => sum + value, 0);
    }

    getActivityType(action: string): string {
        const typeMap: { [key: string]: string } = {
            CREATE: 'Registro',
            UPDATE: 'Actualización',
            DELETE: 'Eliminación',
            LOGIN: 'Acceso',
            LOGOUT: 'Salida',
            ERROR: 'Error'
        };
        return typeMap[action] || 'Actividad';
    }

    getActivitySeverity(action: string): string {
        const severityMap: { [key: string]: string } = {
            CREATE: 'success',
            UPDATE: 'info',
            DELETE: 'warning',
            LOGIN: 'success',
            LOGOUT: 'info',
            ERROR: 'danger'
        };
        return severityMap[action] || 'info';
    }

    getActivityIcon(action: string): string {
        const iconMap: { [key: string]: string } = {
            CREATE: 'pi pi-plus-circle',
            UPDATE: 'pi pi-refresh',
            DELETE: 'pi pi-trash',
            LOGIN: 'pi pi-sign-in',
            LOGOUT: 'pi pi-sign-out',
            ERROR: 'pi pi-times'
        };
        return iconMap[action] || 'pi pi-info-circle';
    }
}
