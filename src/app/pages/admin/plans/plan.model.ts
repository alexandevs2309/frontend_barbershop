// src/app/pages/admin/plans/plan.model.ts
export interface Plan {
  id?: number;
  name: string;
  description?: string | null;
  price: number;
  // Si luego quieres mostrar duración, agrégala a la tabla:
  durationMonths?: number;          // server: duration_month
  employeesLimit: number | null;    // server: max_employees (0 => null en UI)
  isActive: boolean;                // server: is_active
  features: string[];               // si tu backend devuelve array; si es objeto, ajustamos en el service
  createdAt?: string;               // server: created_at
  updatedAt?: string;               // server: updated_at
}



export interface PlanUpdate {
  id: number;
  name?: string;
  price?: number;
  description?: string;
  employeesLimit?: number;
  features?: string[];
  isActive?: boolean;
}
export interface PlanCreate {
  name: string;
  price: number;
  description: string;
  employeesLimit: number;
  features: string[];
  isActive: boolean;
}
