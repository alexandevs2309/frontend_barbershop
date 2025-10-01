import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FadeInOnScrollDirective } from '../../../shared/directives/fade-in-on-scroll.directive'; // <-- ¡Importar la directiva!

@Component({
    selector: 'features-widget',
    standalone: true,
    imports: [CommonModule, FadeInOnScrollDirective],

    
    template: ` <div id="features" class="py-6 px-6 lg:px-20 mt-8 mx-0 lg:mx-20">
        <div class="grid grid-cols-12 gap-4 justify-center">
            <div class="col-span-12 text-center mt-20 mb-6">
                <div class="text-surface-900 dark:text-surface-0 font-normal mb-2 text-4xl">Características Poderosas</div>
                <span class="text-muted-color text-2xl">Todo lo que necesitas para gestionar tu barbería</span>
            </div>

            <div *ngFor="let feature of featuresList; let i = index" 
                 [appFadeInOnScroll]="i % 2 === 0 ? 'left' : 'right'" 
                 [animationDelay]="i * 100" 
                 class="col-span-12 md:col-span-12 lg:col-span-4 p-0 lg:pr-8 lg:pb-8 mt-6 lg:mt-0">
                
                <div [ngStyle]="{'height': '160px', 'padding': '2px', 'border-radius': '10px', 'background': feature.backgroundGradient}">
                    <div class="p-4 bg-surface-0 dark:bg-surface-900 h-full" style="border-radius: 8px">
                        
                        <div [ngClass]="feature.iconBg" class="flex items-center justify-center mb-4" style="width: 3.5rem; height: 3.5rem; border-radius: 10px">
                            <i [class]="feature.iconClass"></i>
                        </div>
                        
                        <h5 class="mb-2 text-surface-900 dark:text-surface-0 text-xl font-semibold">{{ feature.title }}</h5>
                        <span class="text-surface-600 dark:text-surface-200 text-base leading-normal">{{ feature.description }}</span>
                    </div>
                </div>
            </div>

            <div
                [appFadeInOnScroll]="'bottom'" 
                [animationDelay]="500" 
                class="col-span-12 mt-20 mb-20 p-2 md:p-20"
                style="border-radius: 20px; background: linear-gradient(0deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.6)), radial-gradient(77.36% 256.97% at 77.36% 57.52%, #efe1af 0%, #c3dcfa 100%)"
            >
                <div class="flex flex-col justify-center items-center text-center px-4 py-4 md:py-0">
                    <div class="text-gray-900 mb-2 text-3xl font-semibold">Carlos Rodríguez</div>
                    <span class="text-gray-600 text-2xl">Barbería El Estilo</span>
                    <p class="text-gray-900 sm:line-height-2 md:line-height-4 text-2xl mt-6" style="max-width: 800px">
                        "BarberPro ha transformado mi negocio. Ahora gestiono citas y empleados con facilidad, y mis clientes están más satisfechos. ¡Recomiendo esta plataforma a todos los barberos!"
                    </p>
                    <img src="https://primefaces.org/cdn/templates/sakai/landing/peak-logo.svg" class="mt-6" alt="Company logo" />
                </div>
            </div>
        </div>
    </div>`,
   
})
export class FeaturesWidget {
    // Lista de datos extraída de tu HTML original
    featuresList = [
        {
            title: 'Gestión de Citas',
            description: 'Agenda citas en línea, recordatorios automáticos y gestión de horarios.',
            iconClass: 'pi pi-calendar-plus !text-2xl text-yellow-700',
            iconBg: 'bg-yellow-200',
            backgroundGradient: 'linear-gradient(90deg, rgba(253, 228, 165, 0.2), rgba(187, 199, 205, 0.2)), linear-gradient(180deg, rgba(253, 228, 165, 0.2), rgba(187, 199, 205, 0.2))'
        },
        {
            title: 'Control de Empleados',
            description: 'Gestiona horarios, comisiones y rendimiento de tu equipo.',
            iconClass: 'pi pi-fw pi-users !text-2xl text-cyan-700',
            iconBg: 'bg-cyan-200',
            backgroundGradient: 'linear-gradient(90deg, rgba(145, 226, 237, 0.2), rgba(251, 199, 145, 0.2)), linear-gradient(180deg, rgba(253, 228, 165, 0.2), rgba(172, 180, 223, 0.2))'
        },
        {
            title: 'Punto de Venta',
            description: 'Sistema POS completo con inventario y gestión de ventas.',
            iconClass: 'pi pi-fw pi-shopping-cart !text-2xl text-indigo-700',
            iconBg: 'bg-indigo-200',
            backgroundGradient: 'linear-gradient(90deg, rgba(145, 226, 237, 0.2), rgba(172, 180, 223, 0.2)), linear-gradient(180deg, rgba(172, 180, 223, 0.2), rgba(246, 158, 188, 0.2))'
        },
        {
            title: 'Reportes y Analytics',
            description: 'Informes detallados de ventas, clientes y rendimiento.',
            iconClass: 'pi pi-fw pi-chart-line !text-2xl text-slate-700',
            iconBg: 'bg-slate-200',
            backgroundGradient: 'linear-gradient(90deg, rgba(187, 199, 205, 0.2), rgba(251, 199, 145, 0.2)), linear-gradient(180deg, rgba(253, 228, 165, 0.2), rgba(145, 210, 204, 0.2))'
        },
        {
            title: 'Gestión de Clientes',
            description: 'Base de datos de clientes con historial y preferencias.',
            iconClass: 'pi pi-fw pi-id-card !text-2xl text-orange-700',
            iconBg: 'bg-orange-200',
            backgroundGradient: 'linear-gradient(90deg, rgba(187, 199, 205, 0.2), rgba(246, 158, 188, 0.2)), linear-gradient(180deg, rgba(145, 226, 237, 0.2), rgba(160, 210, 250, 0.2))'
        },
        {
            title: 'Inventario Inteligente',
            description: 'Control automático de stock y alertas de reposición.',
            iconClass: 'pi pi-fw pi-box !text-2xl text-pink-700',
            iconBg: 'bg-pink-200',
            backgroundGradient: 'linear-gradient(90deg, rgba(251, 199, 145, 0.2), rgba(246, 158, 188, 0.2)), linear-gradient(180deg, rgba(172, 180, 223, 0.2), rgba(212, 162, 221, 0.2))'
        },
        {
            title: 'Multi-sucursal',
            description: 'Gestiona múltiples barberías desde un solo panel.',
            iconClass: 'pi pi-fw pi-building !text-2xl text-teal-700',
            iconBg: 'bg-teal-200',
            backgroundGradient: 'linear-gradient(90deg, rgba(145, 210, 204, 0.2), rgba(160, 210, 250, 0.2)), linear-gradient(180deg, rgba(187, 199, 205, 0.2), rgba(145, 210, 204, 0.2))'
        },
        {
            title: 'App Móvil',
            description: 'Accede a tu barbería desde cualquier lugar con nuestra app.',
            iconClass: 'pi pi-fw pi-mobile !text-2xl text-blue-700',
            iconBg: 'bg-blue-200',
            backgroundGradient: 'linear-gradient(90deg, rgba(145, 210, 204, 0.2), rgba(212, 162, 221, 0.2)), linear-gradient(180deg, rgba(251, 199, 145, 0.2), rgba(160, 210, 250, 0.2))'
        },
        {
            title: 'Soporte 24/7',
            description: 'Equipo de soporte siempre disponible para ayudarte.',
            iconClass: 'pi pi-fw pi-headphones !text-2xl text-purple-700',
            iconBg: 'bg-purple-200',
            backgroundGradient: 'linear-gradient(90deg, rgba(55, 56, 58, 0.2), rgba(212, 162, 221, 0.2)), linear-gradient(180deg, rgba(246, 158, 188, 0.2), rgba(212, 162, 221, 0.2))'
        },
    ];
}