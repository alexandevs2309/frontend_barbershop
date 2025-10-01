import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { Router } from '@angular/router';
import { FadeInOnScrollDirective } from '../../../shared/directives/fade-in-on-scroll.directive';

@Component({
    selector: 'hero-widget',
    imports: [ButtonModule, RippleModule, FadeInOnScrollDirective],
    template: `
    <div 
        id="hero"
        class="flex flex-col pt-6 px-6 lg:px-20 overflow-hidden"
                    style="background: linear-gradient(0deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.2)), radial-gradient(77.36% 256.97% at 77.36% 57.52%, rgb(238, 239, 175) 0%, rgb(195, 227, 250) 100%); clip-path: ellipse(150% 87% at 93% 13%)"

    >
        <div class="mx-6 md:mx-20 mt-0 md:mt-6">
            
            <h1 
                [appFadeInOnScroll]="'bottom'" 
                [animationDelay]="200"
                class="text-6xl font-bold text-gray-900 leading-tight">
                <span class="font-light block">Gestiona tu</span>Barbería Digital
            </h1>
            
            <p 
                [appFadeInOnScroll]="'bottom'" 
                [animationDelay]="400" 
                class="font-normal text-2xl leading-normal md:mt-4 text-gray-700">
                Simplifica la gestión de citas, empleados y ventas. La plataforma completa para modernizar tu barbería y aumentar tus ingresos.
            </p>
            
          <button 
                    pButton pRipple [rounded]="true" type="button" 
                    label="Comenzar Ahora" 
                    (click)="scrollToPricing()"  
                    [appFadeInOnScroll]="'bottom'" 
                    [animationDelay]="600" 
                    class="!text-xl mt-8 !px-4"
                ></button>
        </div>
        
        <div class="flex justify-center md:justify-end">
            <img src="https://primefaces.org/cdn/templates/sakai/landing/screen-1.png" alt="Hero Image" class="w-9/12 md:w-auto" />
        </div>
    </div>
`
})
export class HeroWidget {

    constructor(private router: Router) {}

    scrollToPricing() {
       
        this.router.navigate([], { fragment: 'pricing' }).then(() => {
            
            setTimeout(() => {
                const element = document.getElementById('pricing');
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100); 
        });
    }
}


