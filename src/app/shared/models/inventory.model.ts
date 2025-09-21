export interface Product {
  id?: number;
  name: string;
  description?: string;
  sku: string;
  price: number;
  cost: number;
  stock: number;
  min_stock: number;
  category?: string;
  image?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface StockMovement {
  id?: number;
  product: number;
  product_name?: string;
  movement_type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason?: string;
  created_at?: string;
}