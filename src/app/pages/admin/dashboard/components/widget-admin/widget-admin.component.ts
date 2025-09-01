import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from "primeng/table";
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';


@Component({
  selector: 'app-widget-admin',
  imports: [CommonModule, TableModule, ButtonModule, RouterModule,],
  template: `

  <!-- Tarjetas de resumen -->
  <div class="col-span-12 lg:col-span-6 xl:col-span-3" *ngFor="let card of summaryCards">
    <div class="card mb-0">
      <div class="flex justify-between mb-4">
        <div>
          <span class="block text-xl font-bold mb-4">{{card.title}}</span>
          <div class="text-surface-900 dark:text-surface-0 font-medium text-xl"></div>
        </div>
        <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem" >
          <i [ngClass]="card.icon + ' text-blue-500 text-xl'"></i>
        </div>
      </div>
      <span class=" text-2xl mx-2"  [style.background]="card.color">{{card.value}}</span>
      <span class="text-muted-color">since last visit</span>
    </div>
  </div>

  <!-- Botones de acceso rápido -->
  <div class="col-span-12">
    <div class="card">
      <h5 class="mb-4">Acceso Rápido</h5>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
       <button *ngFor="let item of quickAccess"
        pButton
        [icon]="item.icon"
        [label]="item.label"
        class="p-button-outlined"
        (click)="item.command()">
</button>

      </div>
    </div>
  </div>

  `

})
export class WidgetAdminComponent {
 summaryCards = [
    { title: 'Peluquerías', value: 42, icon: 'pi pi-building', color: 'linear-gradient(to right, #00b09b, #96c93d)' },
    { title: 'Usuarios', value: 180, icon: 'pi pi-users', color: 'linear-gradient(to right, #396afc, #2948ff)' },
    { title: 'Ingresos', value: '$8,200', icon: 'pi pi-dollar', color: 'linear-gradient(to right, #f7971e, #ffd200)' },
    { title: 'Suscripciones', value: 38, icon: 'pi pi-id-card', color: 'linear-gradient(to right, #e53935, #e35d5b)' }
  ];

  activities = [
    { event: 'Nuevo registro', user: 'BarberShop X', date: new Date(), type: 'Registro', severity: 'success', icon: 'pi pi-plus-circle' },
    { event: 'Cambio de plan', user: 'Salon Bella', date: new Date(), type: 'Actualización', severity: 'info', icon: 'pi pi-refresh' },
    { event: 'Fallo de pago', user: 'Stylo Studio', date: new Date(), type: 'Error', severity: 'danger', icon: 'pi pi-times' }
  ];

quickAccess = [
  { label: 'Ver Logs', icon: 'pi pi-eye', command: () => this.router.navigate(['/admin/audit-log']) },
  { label: 'Crear Plan', icon: 'pi pi-plus', command: () => this.router.navigate(['/admin/plans']) },
  { label: 'Usuarios', icon: 'pi pi-users', command: () => this.router.navigate(['/admin/users']) },
  { label: 'Tenants', icon: 'pi pi-briefcase', command: () => this.router.navigate(['/admin/tenants']) }
];


lineChartData = {
  labels: ['Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul'],
  datasets: [
    {
      label: 'Suscripciones',
      data: [5, 12, 19, 23, 34, 38],
      fill: false,
      tension: 0.4,
      borderColor: '#42A5F5'
    }
  ]
};

pieChartData = {
  labels: ['Básico', 'Pro', 'Premium'],
  datasets: [
    {
      data: [12, 18, 8],
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
      hoverBackgroundColor: ['#FF6384aa', '#36A2EBaa', '#FFCE56aa']
    }
  ]
};


 chartOptions = {
  responsive: true,
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


constructor(private router: Router) {}

  ngOnInit(): void {}
}
