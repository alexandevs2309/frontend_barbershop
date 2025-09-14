import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface KeyboardShortcut {
  key: string;
  action: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class KeyboardService {
  private shortcutSubject = new Subject<string>();
  public shortcut$ = this.shortcutSubject.asObservable();

  shortcuts: KeyboardShortcut[] = [
    { key: 'F1', action: 'help', description: 'Ayuda' },
    { key: 'F2', action: 'new_sale', description: 'Nueva Venta' },
    { key: 'F3', action: 'search_product', description: 'Buscar Producto' },
    { key: 'F4', action: 'search_client', description: 'Buscar Cliente' },
    { key: 'F5', action: 'discount', description: 'Aplicar Descuento' },
    { key: 'F6', action: 'payment', description: 'Procesar Pago' },
    { key: 'F7', action: 'cash_register', description: 'Caja' },
    { key: 'F8', action: 'reports', description: 'Reportes' },
    { key: 'F9', action: 'print_receipt', description: 'Imprimir Recibo' },
    { key: 'F10', action: 'settings', description: 'Configuración' },
    { key: 'F11', action: 'logout', description: 'Cerrar Sesión' },
    { key: 'F12', action: 'close_sale', description: 'Cerrar Venta' },
    { key: 'Enter', action: 'process_sale', description: 'Procesar Venta' },
    { key: 'Escape', action: 'cancel', description: 'Cancelar' },
    { key: 'Delete', action: 'clear_cart', description: 'Limpiar Carrito' }
  ];

  constructor() {
    this.setupKeyboardListener();
  }

  private setupKeyboardListener() {
    document.addEventListener('keydown', (event) => {
      // Ignore if typing in input fields
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const key = event.key;
      const shortcut = this.shortcuts.find(s => s.key === key);
      
      if (shortcut) {
        event.preventDefault();
        this.shortcutSubject.next(shortcut.action);
      }

      // Number keys for quick quantity
      if (/^[1-9]$/.test(key)) {
        event.preventDefault();
        this.shortcutSubject.next(`quantity_${key}`);
      }
    });
  }

  getShortcutByAction(action: string): KeyboardShortcut | undefined {
    return this.shortcuts.find(s => s.action === action);
  }
}