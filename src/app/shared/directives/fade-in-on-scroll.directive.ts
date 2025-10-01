import { Directive, ElementRef, HostListener, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appFadeInOnScroll]',
  standalone: true
})
export class FadeInOnScrollDirective implements OnInit {
    
    @Input('appFadeInOnScroll') animationType: 'left' | 'right' | 'bottom' = 'bottom';
    @Input() animationDelay: number = 0; // en milisegundos

    private isCurrentlyVisible: boolean = false; // Bandera de estado

    constructor(
        private el: ElementRef, 
        private renderer: Renderer2
    ) {}

    ngOnInit() {
        // 1. Configuración inicial: Clases de transición globales
        this.renderer.addClass(this.el.nativeElement, 'transition-all');
        this.renderer.addClass(this.el.nativeElement, 'duration-700');
        this.renderer.addClass(this.el.nativeElement, 'ease-out');
        
        // 2. Estado inicial: Oculto
        this.setHiddenClasses();
        
        // 3. Comprobación inicial: Para animar elementos visibles al cargar
        this.checkVisibility(); 
    }
    
    // Define la posición inicial oculta (opacidad y traducción)
    private setHiddenClasses() {
        this.renderer.addClass(this.el.nativeElement, 'opacity-0');
        this.renderer.removeClass(this.el.nativeElement, 'opacity-100');
        
        // Remueve clases de posición final
        this.renderer.removeClass(this.el.nativeElement, 'translate-x-0');
        this.renderer.removeClass(this.el.nativeElement, 'translate-y-0');

        // Aplica clases de posición inicial (off-screen)
        if (this.animationType === 'left') {
            this.renderer.addClass(this.el.nativeElement, '-translate-x-12');
            this.renderer.removeClass(this.el.nativeElement, 'translate-x-12');
        } else if (this.animationType === 'right') {
            this.renderer.addClass(this.el.nativeElement, 'translate-x-12');
            this.renderer.removeClass(this.el.nativeElement, '-translate-x-12');
        } else { // 'bottom'
            this.renderer.addClass(this.el.nativeElement, 'translate-y-6');
        }
        this.isCurrentlyVisible = false;
    }
    
    // Aplica la posición visible (opacidad y posición final)
    private setVisibleClasses() {
        this.setDelay();
        
        this.renderer.removeClass(this.el.nativeElement, 'opacity-0');
        this.renderer.addClass(this.el.nativeElement, 'opacity-100');
        
        this.renderer.removeClass(this.el.nativeElement, '-translate-x-12');
        this.renderer.removeClass(this.el.nativeElement, 'translate-x-12');
        this.renderer.removeClass(this.el.nativeElement, 'translate-y-6');

        this.renderer.addClass(this.el.nativeElement, 'translate-x-0');
        this.renderer.addClass(this.el.nativeElement, 'translate-y-0');
        
        this.isCurrentlyVisible = true;
    }
    
    private setDelay() {
        if (this.animationDelay > 0) {
            this.renderer.setStyle(this.el.nativeElement, 'transition-delay', `${this.animationDelay}ms`);
        } else {
            this.renderer.removeStyle(this.el.nativeElement, 'transition-delay');
        }
    }


    /**
     * Escucha el evento de scroll y maneja la lógica de entrada/salida.
     */
    @HostListener('window:scroll', [])
    checkVisibility() {
        const componentElement = this.el.nativeElement;
        const viewportHeight = window.innerHeight;
        const rect = componentElement.getBoundingClientRect();

        // Entra en la vista: La parte superior del elemento está a menos de 150px del fondo del viewport.
        const entersView = rect.top < viewportHeight - 150;
        
        // Sale de la vista: El elemento se fue completamente por encima o completamente por debajo.
        const leavesView = rect.bottom < 0 || rect.top > viewportHeight;

        if (entersView && !this.isCurrentlyVisible) {
            // ANIMA ENTRADA
            this.setVisibleClasses();
        } else if (leavesView && this.isCurrentlyVisible) {
            // ANIMA SALIDA (RESET)
            this.setHiddenClasses();
        }
    }
}