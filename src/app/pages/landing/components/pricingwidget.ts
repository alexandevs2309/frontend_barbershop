import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { RippleModule } from 'primeng/ripple';
import { FadeInOnScrollDirective } from '../../../shared/directives/fade-in-on-scroll.directive';

@Component({
    selector: 'pricing-widget',
    imports: [CommonModule, DividerModule, ButtonModule, RippleModule, FadeInOnScrollDirective],
    template: `
        <div id="pricing" class="py-6 px-6 lg:px-20 my-2 md:my-6">
            <div class="text-center mb-6">
                <div class="text-surface-900 dark:text-surface-0 font-normal mb-2 text-4xl">
                    Planes para tu Barbería
                </div>
                <span class="text-muted-color text-2xl">Elige el plan perfecto para tu negocio</span>
            </div>

            <!-- Toggle mensual / anual -->
            <div class="flex justify-center items-center gap-4 mb-10">
                <button
                    class="px-4 py-2 rounded-lg transition-colors duration-300"
                    [ngClass]="frequency === 'monthly'
                        ? 'bg-blue-500 text-white'
                        : 'bg-surface-200 dark:bg-surface-700 text-surface-900 dark:text-surface-0'"
                    (click)="toggleFrequency('monthly')">
                    Mensual
                </button>
                <button
                    class="px-4 py-2 rounded-lg transition-colors duration-300"
                    [ngClass]="frequency === 'yearly'
                        ? 'bg-blue-500 text-white'
                        : 'bg-surface-200 dark:bg-surface-700 text-surface-900 dark:text-surface-0'"
                    (click)="toggleFrequency('yearly')">
                    Anual
                </button>
            </div>

            <!-- Grid de planes -->
            <div class="grid grid-cols-12 gap-6">
           <div *ngFor="let plan of plansList; let i = index" 
     [appFadeInOnScroll]="i % 2 === 0 ? 'left' : 'right'" 
     [animationDelay]="i * 150"  
     class="col-span-12 md:col-span-6 lg:col-span-3">
   
                    <div class="p-6 flex flex-col border-surface-200 dark:border-surface-600 pricing-card cursor-pointer border-2 hover:border-primary duration-300 transition-all rounded-xl h-full">
                        <div class="text-surface-900 dark:text-surface-0 text-center my-6 text-2xl font-semibold">
                            {{ plan.name }}
                        </div>
                        <img [src]="plan.icon" class="w-8/12 mx-auto" [alt]="plan.name" />

                        <div class="my-6 flex flex-col items-center gap-2">
                            <div class="flex items-baseline">
                                <span class="text-4xl font-bold mr-2 text-surface-900 dark:text-surface-0">
                                    {{ plan.price[frequency] }}
                                </span>
                                <span class="text-surface-600 dark:text-surface-200">
                                    {{ frequency === 'monthly' ? 'por mes' : 'por año' }}
                                </span>
                            </div>
                            <div *ngIf="frequency === 'yearly'" class="text-green-500 text-sm font-medium">
                                {{ plan.yearlyBonus }}
                            </div>
                            <button pButton pRipple label="Comenzar Ahora" (click)="selectPlan(plan.id)"
                                class="p-button-rounded border-0 mt-2 font-light leading-tight bg-blue-500 text-white"></button>
                        </div>

                        <p-divider class="w-full bg-surface-200"></p-divider>

                        <ul class="my-6 list-none p-0 flex text-surface-900 dark:text-surface-0 flex-col px-6">
                            <li *ngFor="let feature of plan.features[frequency]" class="py-2 flex items-center">
                                <i class="pi pi-fw pi-check text-lg text-cyan-500 mr-2"></i>
                                <span class="text-base leading-normal"> {{ feature }}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class PricingWidget {
    frequency: 'monthly' | 'yearly' = 'monthly';

    plansList = [
        {
            id: 'basic',
            name: 'Básico',
            icon: 'assets/plans/digital-calendar.svg',
            price: { monthly: 19, yearly: 190 },
            yearlyBonus: '2 meses gratis',
            features: {
                monthly: [
                    'Hasta 3 empleados',
                    'Agenda básica',
                    'POS simple',
                    'Reportes limitados'
                ],
                yearly: [
                    'Hasta 3 empleados',
                    'Agenda básica',
                    'POS simple',
                    'Reportes limitados',
                    'Soporte extendido en horarios laborales'
                ]
            }
        },
        {
            id: 'pro',
            name: 'Pro',
            icon: 'assets/plans/web-app.svg',
            price: { monthly: 49, yearly: 490 },
            yearlyBonus: '2 meses gratis + 1 mes de asesoría',
            features: {
                monthly: [
                    'Hasta 10 empleados',
                    'Gestión de citas avanzada',
                    'POS completo + inventario',
                    'Reportes detallados'
                ],
                yearly: [
                    'Hasta 10 empleados',
                    'Gestión de citas avanzada',
                    'POS completo + inventario',
                    'Reportes detallados',
                    'Descuento en comisiones de pago online'
                ]
            }
        },
        {
            id: 'premium',
            name: 'Premium',
            icon: 'assets/plans/data-trends.svg',
            price: { monthly: 79, yearly: 790 },
            yearlyBonus: '2 meses gratis + soporte premium',
            features: {
                monthly: [
                    'Hasta 25 empleados',
                    'Sucursales múltiples',
                    'POS avanzado + control de stock',
                    'Reportes avanzados'
                ],
                yearly: [
                    'Hasta 25 empleados',
                    'Sucursales múltiples',
                    'POS avanzado + control de stock',
                    'Reportes avanzados',
                    'Soporte prioritario 24/7'
                ]
            }
        },
        {
            id: 'enterprise',
            name: 'Empresarial',
            icon: 'assets/plans/financial-data.svg',
            price: { monthly: 149, yearly: 1490 },
            yearlyBonus: '2 meses gratis + consultoría personalizada',
            features: {
                monthly: [
                    'Empleados ilimitados',
                    'Sucursales ilimitadas',
                    'API integrada',
                    'Reportes ejecutivos'
                ],
                yearly: [
                    'Empleados ilimitados',
                    'Sucursales ilimitadas',
                    'API integrada + soporte técnico dedicado',
                    'Reportes ejecutivos + consultoría trimestral'
                ]
            }
        }
    ];

    constructor(private router: Router) {}

    toggleFrequency(value: 'monthly' | 'yearly') {
        this.frequency = value;
    }

    selectPlan(planType: string) {
        this.router.navigate(['/auth/register'], {
            queryParams: { plan: planType, billing: this.frequency }
        });
    }
}
