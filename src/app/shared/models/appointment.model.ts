export interface Appointment {
  id?: number;
  client: number;
  client_name?: string;
  employee: number;
  employee_name?: string;
  service: number;
  service_name?: string;
  date: string;
  time: string;
  duration: number;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  price: number;
  created_at?: string;
  updated_at?: string;
}