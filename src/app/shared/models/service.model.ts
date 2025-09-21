export interface Service {
  id?: number;
  name: string;
  description?: string;
  price: number;
  duration: number;
  category?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceCategory {
  id?: number;
  name: string;
  description?: string;
  is_active: boolean;
}