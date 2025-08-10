import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { Plan } from './plan.model';

@Injectable({ providedIn: 'root' })
export class PlansService {
  getPlans() {
    const mock: Plan[] = [
      {
        id: 1,
        name: 'Básico',
        price: 15,
        description: 'Ideal para una sola peluquería pequeña.',
        usersLimit: 2,
        features: ['Agendas', 'Clientes'],
        isActive: true,
        createdAt: '2025-07-01T09:00:00Z'
      },
      {
        id: 2,
        name: 'Premium',
        price: 49,
        description: 'Para negocios con múltiples empleados.',
        usersLimit: 10,
        features: ['Agendas', 'Inventario', 'Reportes'],
        isActive: false,
        createdAt: '2025-07-10T15:00:00Z'
      }
    ];
    return of(mock);
  }
}
