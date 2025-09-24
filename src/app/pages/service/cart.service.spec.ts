import { TestBed } from '@angular/core/testing';
import { CartService } from './cart.service';

describe('CartService', () => {
  let service: CartService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CartService]
    });
    service = TestBed.inject(CartService);
  });

  afterEach(() => {
    service.clearCart();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add item to cart', () => {
    const item = {
      name: 'Corte Clásico',
      quantity: 1,
      price: 25.00,
      item_type: 'service' as const,
      object_id: 1
    };

    service.addItem(item);
    
    expect(service.details().length).toBe(1);
    expect(service.details()[0].name).toBe('Corte Clásico');
    expect(service.totalItems()).toBe(1);
  });

  it('should increase quantity when adding existing item', () => {
    const item = {
      name: 'Corte Clásico',
      quantity: 1,
      price: 25.00,
      item_type: 'service' as const,
      object_id: 1
    };

    service.addItem(item);
    service.addItem(item);
    
    expect(service.details().length).toBe(1);
    expect(service.details()[0].quantity).toBe(2);
    expect(service.totalItems()).toBe(2);
  });

  it('should remove item from cart', () => {
    const item = {
      name: 'Corte Clásico',
      quantity: 1,
      price: 25.00,
      item_type: 'service' as const,
      object_id: 1
    };

    service.addItem(item);
    expect(service.details().length).toBe(1);
    
    service.removeItem(service.details()[0]);
    expect(service.details().length).toBe(0);
  });

  it('should update item quantity', () => {
    const item = {
      name: 'Corte Clásico',
      quantity: 1,
      price: 25.00,
      item_type: 'service' as const,
      object_id: 1
    };

    service.addItem(item);
    const cartItem = service.details()[0];
    
    service.updateQuantity(cartItem, 2);
    expect(cartItem.quantity).toBe(3);
    
    service.updateQuantity(cartItem, -1);
    expect(cartItem.quantity).toBe(2);
  });

  it('should not allow quantity below 1', () => {
    const item = {
      name: 'Corte Clásico',
      quantity: 1,
      price: 25.00,
      item_type: 'service' as const,
      object_id: 1
    };

    service.addItem(item);
    const cartItem = service.details()[0];
    
    service.updateQuantity(cartItem, -2);
    expect(cartItem.quantity).toBe(1);
  });

  it('should calculate subtotal correctly', () => {
    const item1 = {
      name: 'Corte Clásico',
      quantity: 2,
      price: 25.00,
      item_type: 'service' as const,
      object_id: 1
    };
    const item2 = {
      name: 'Barba',
      quantity: 1,
      price: 15.00,
      item_type: 'service' as const,
      object_id: 2
    };

    service.addItem(item1);
    service.addItem(item2);
    
    expect(service.subtotal()).toBe(65.00); // (2 * 25) + (1 * 15)
  });

  it('should calculate total with percentage discount', () => {
    const item = {
      name: 'Corte Clásico',
      quantity: 1,
      price: 100.00,
      item_type: 'service' as const,
      object_id: 1
    };

    service.addItem(item);
    
    const total = service.total(10, true); // 10% discount
    expect(total).toBe(90.00);
  });

  it('should calculate total with fixed discount', () => {
    const item = {
      name: 'Corte Clásico',
      quantity: 1,
      price: 100.00,
      item_type: 'service' as const,
      object_id: 1
    };

    service.addItem(item);
    
    const total = service.total(15, false); // $15 discount
    expect(total).toBe(85.00);
  });

  it('should calculate change correctly', () => {
    const item = {
      name: 'Corte Clásico',
      quantity: 1,
      price: 25.00,
      item_type: 'service' as const,
      object_id: 1
    };

    service.addItem(item);
    
    const change = service.change(30.00);
    expect(change).toBe(5.00);
  });

  it('should check if product is in cart', () => {
    const product = {
      name: 'Shampoo',
      quantity: 1,
      price: 12.00,
      item_type: 'product' as const,
      object_id: 5,
      stock: 10
    };

    service.addItem(product);
    
    expect(service.isProductInCart(5)).toBe(true);
    expect(service.isProductInCart(6)).toBe(false);
  });

  it('should validate if sale can be processed', () => {
    const item = {
      name: 'Corte Clásico',
      quantity: 1,
      price: 25.00,
      item_type: 'service' as const,
      object_id: 1
    };

    // Empty cart
    expect(service.canProcessSale(30.00)).toBe(false);
    
    // With items and sufficient payment
    service.addItem(item);
    expect(service.canProcessSale(30.00)).toBe(true);
    
    // With items but insufficient payment
    expect(service.canProcessSale(20.00)).toBe(false);
  });

  it('should handle product stock limits', () => {
    const product = {
      name: 'Shampoo',
      quantity: 1,
      price: 12.00,
      item_type: 'product' as const,
      object_id: 5,
      stock: 2
    };

    service.addItem(product);
    service.addItem(product); // Should increase to 2
    
    const cartItem = service.details()[0];
    expect(cartItem.quantity).toBe(2);
    
    // Try to add more than stock
    service.updateQuantity(cartItem, 1);
    expect(cartItem.quantity).toBe(2); // Should remain 2
  });

  it('should clear cart', () => {
    const item = {
      name: 'Corte Clásico',
      quantity: 1,
      price: 25.00,
      item_type: 'service' as const,
      object_id: 1
    };

    service.addItem(item);
    expect(service.details().length).toBe(1);
    
    service.clearCart();
    expect(service.details().length).toBe(0);
    expect(service.subtotal()).toBe(0);
  });

  it('should emit messages on cart operations', (done) => {
    const item = {
      name: 'Corte Clásico',
      quantity: 1,
      price: 25.00,
      item_type: 'service' as const,
      object_id: 1
    };

    service.messages$.subscribe(message => {
      expect(message.severity).toBe('success');
      expect(message.detail).toContain('Corte Clásico');
      done();
    });

    service.addItem(item);
  });
});