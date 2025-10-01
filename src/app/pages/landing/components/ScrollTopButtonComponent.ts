import { Component, HostListener, Inject, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-scroll-top-button',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <p-button 
      *ngIf="showButton" 
      icon="pi pi-angle-up" 
      (onClick)="scrollToTop()" 
      styleClass="p-button-rounded p-button-primary"
      class="fixed bottom-0 right-0 z-50 mr-4 mb-4 lg:mr-8 lg:mb-8 transition-opacity duration-300">
    </p-button>
  `,
  styles: [`
    /* Opcional: añade más estilos si necesitas un control más fino del posicionamiento o animación */
    .p-button-primary {
        background: var(--primary-color); /* Usa el color primario de tu tema PrimeNG */
        border: 1px solid var(--primary-color);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
  `]
})
export class ScrollTopButtonComponent {

  public showButton: boolean = false;
  private scrollThreshold: number = 200; // Distancia en píxeles antes de mostrar el botón

  constructor(
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {}

  /**
   * Escucha el evento de scroll en la ventana y actualiza la visibilidad del botón.
   */
  @HostListener('window:scroll', [])
  onWindowScroll() {
    // Obtiene la posición actual de scroll
    const scrollPosition = this.document.documentElement.scrollTop || this.document.body.scrollTop;
    
    // Muestra/oculta el botón si se supera el umbral
    this.showButton = scrollPosition > this.scrollThreshold;
  }

  /**
   * Hace scroll suavemente hasta la parte superior de la página.
   */
  scrollToTop() {
    this.document.defaultView?.scrollTo({ top: 0, behavior: 'smooth' });
  }
}