import { CommonModule } from '@angular/common';
import { Component, OnInit ,} from '@angular/core';
import { Card } from "primeng/card";
import { TableModule } from "primeng/table";
import { Badge } from "primeng/badge";
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { UIChart } from "primeng/chart";
import { WidgetAdminComponent } from "./components/widget-admin/widget-admin.component";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [Card, TableModule, Badge, ButtonModule, RouterModule, CommonModule, UIChart, WidgetAdminComponent]
})
export class DashboardComponent implements OnInit {

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


  constructor() {}

  ngOnInit(): void {}
}
