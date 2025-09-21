export interface Employee {
  id?: number;
  user: number;
  user_email?: string;
  user_full_name?: string;
  specialty?: string;
  phone?: string;
  hire_date?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Earning {
  id?: number;
  employee: number;
  employee_name?: string;
  amount: number;
  earning_type: 'service' | 'commission' | 'tip' | 'bonus' | 'adjustment';
  description?: string;
  date_earned: string;
  fortnight_year: number;
  fortnight_number: number;
  created_at?: string;
}