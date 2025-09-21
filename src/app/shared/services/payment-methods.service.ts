import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { SystemConfigService } from '../../core/services/system-config.service';

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentMethodsService {

  constructor(private systemConfig: SystemConfigService) {}

  getAvailablePaymentMethods(): Observable<PaymentMethod[]> {
    return this.systemConfig.config$.pipe(
      map(config => {
        const methods: PaymentMethod[] = [
          {
            id: 'cash',
            name: 'Efectivo',
            icon: 'pi pi-money-bill',
            enabled: true
          },
          {
            id: 'stripe',
            name: 'Tarjeta (Stripe)',
            icon: 'pi pi-credit-card',
            enabled: config?.stripe_enabled || false
          },
          {
            id: 'paypal',
            name: 'PayPal',
            icon: 'pi pi-paypal',
            enabled: config?.paypal_enabled || false
          }
        ];

        return methods.filter(method => method.enabled);
      })
    );
  }
}