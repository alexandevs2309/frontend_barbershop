// En src/app/pages/landing/components/highlightswidget.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necesario para 'standalone: true'
import { FadeInOnScrollDirective } from '../../../shared/directives/fade-in-on-scroll.directive';

@Component({
    selector: 'highlights-widget',
    standalone: true, // Asegúrate de que esto esté presente
    imports: [CommonModule, FadeInOnScrollDirective], // <-- ¡Añadir aquí!
    template: `
        <div id="highlights" class="py-6 px-6 lg:px-20 mx-0 my-12 lg:mx-20">
                
                <div [appFadeInOnScroll]="'bottom'" [animationDelay]="100" class="text-center">
                    <div class="text-surface-900 dark:text-surface-0 font-normal mb-2 text-4xl">Potente para tu Barbería</div>
                    <span class="text-muted-color text-2xl">La solución integral para gestionar tu negocio desde cualquier dispositivo</span>
                </div>

            <div 
                [appFadeInOnScroll]="'right'" 
                [animationDelay]="300"
                class="grid grid-cols-12 gap-4 mt-20 pb-2 md:pb-20">
                
                <div class="flex justify-center col-span-12 lg:col-span-6 bg-purple-100 p-0 order-1 lg:order-none" style="border-radius: 8px">
                    <img src="https://primefaces.org/cdn/templates/sakai/landing/mockup.png" class="w-11/12" alt="mockup mobile" />
                </div>

                <div class="col-span-12 lg:col-span-6 my-auto flex flex-col lg:items-end text-center lg:text-right gap-4">
                    </div>
            </div>

            <div 
                [appFadeInOnScroll]="'left'" 
                [animationDelay]="300"
                class="grid grid-cols-12 gap-4 my-20 pt-2 md:pt-20">
                
                <div class="col-span-12 lg:col-span-6 my-auto flex flex-col text-center lg:text-left lg:items-start gap-4">
                    </div>

                <div class="flex justify-end order-1 sm:order-2 col-span-12 lg:col-span-6 bg-yellow-100 p-0" style="border-radius: 8px">
                    <img src="https://primefaces.org/cdn/templates/sakai/landing/mockup-desktop.png" class="w-11/12" alt="mockup" />
                </div>
            </div>
        </div>
    `
})
export class HighlightsWidget {}