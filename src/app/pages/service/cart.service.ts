// cart.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';


interface CartItem {
  name: string;
  quantity: number;
  price: number;
  item_type: 'service' | 'product';
  object_id: number;
  stock?: number;
  employee_id?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  public cartItems$ = this.cartItemsSubject.asObservable();
  private messagesSubject = new Subject<{severity: string, summary: string, detail: string}>();
  public messages$ = this.messagesSubject.asObservable();

  constructor() {}

  addItem(newItem: CartItem) {
    const currentItems = this.cartItemsSubject.getValue();

    // Check if the item already exists in the cart
    const existingItemIndex = currentItems.findIndex(item =>
      item.object_id === newItem.object_id && item.item_type === newItem.item_type
    );

    if (existingItemIndex > -1) {
      const existingItem = currentItems[existingItemIndex];
      // Check for stock if it's a product
      if (existingItem.item_type === 'product' && existingItem.stock! <= existingItem.quantity) {
        this.messagesSubject.next({ severity: 'warn', summary: 'Advertencia', detail: 'Producto sin stock disponible.' });
        return;
      }
      existingItem.quantity++;
      this.messagesSubject.next({ severity: 'info', summary: 'Actualizado', detail: `Cantidad de "${newItem.name}" aumentada.` });
    } else {
      currentItems.push({ ...newItem, quantity: 1 });
      this.messagesSubject.next({ severity: 'success', summary: 'Agregado', detail: `"${newItem.name}" agregado al carrito.` });
    }
    this.cartItemsSubject.next(currentItems);
  }

  removeItem(itemToRemove: CartItem) {
    const currentItems = this.cartItemsSubject.getValue();
    const updatedItems = currentItems.filter(item => item !== itemToRemove);
    this.cartItemsSubject.next(updatedItems);
    this.messagesSubject.next({ severity: 'info', summary: 'Eliminado', detail: `"${itemToRemove.name}" eliminado del carrito.` });
  }

  updateQuantity(itemToUpdate: CartItem, change: number) {
    const currentItems = this.cartItemsSubject.getValue();
    const item = currentItems.find(i => i === itemToUpdate);
    if (item) {
      const newQuantity = item.quantity + change;
      if (newQuantity < 1) return;

      if (item.item_type === 'product' && newQuantity > item.stock!) {
        this.messagesSubject.next({ severity: 'warn', summary: 'Advertencia', detail: 'No hay más stock disponible.' });
        return;
      }
      item.quantity = newQuantity;
      this.cartItemsSubject.next(currentItems);
    }
  }

  clearCart() {
    this.cartItemsSubject.next([]);
    this.messagesSubject.next({ severity: 'info', summary: 'Información', detail: 'Carrito limpiado.' });
  }

  details = () => this.cartItemsSubject.getValue();

  subtotal = () => this.details().reduce((sum, d) => sum + (d.quantity * d.price), 0);

  total = (discount: number = 0, isPercentage: boolean = false) => {
    const subtotal = this.subtotal();
    const discountAmount = isPercentage ? (subtotal * discount / 100) : discount;
    return Math.max(0, subtotal - discountAmount);
  };
  
  getDiscountAmount = (discount: number = 0, isPercentage: boolean = false) => {
    const subtotal = this.subtotal();
    return isPercentage ? (subtotal * discount / 100) : discount;
  };

  totalItems = () => this.details().reduce((sum, d) => sum + d.quantity, 0);

  change = (paidAmount: number, discount: number = 0, isPercentage: boolean = false) => paidAmount - this.total(discount, isPercentage);

  isProductInCart(productId: number): boolean {
    return this.details().some(d => d.item_type === 'product' && d.object_id === productId);
  }

  canProcessSale(paidAmount: number, discount: number = 0, isPercentage: boolean = false): boolean {
    return this.details().length > 0 && this.change(paidAmount, discount, isPercentage) >= 0;
  }
}
