export interface Client {
  id?: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  birth_date?: string;
  notes?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  last_visit?: string;
  total_visits?: number;
  total_spent?: number;
}