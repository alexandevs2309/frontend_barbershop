export interface SubscriptionPlan {
  id: number;
  name: string;
  description?: string;
  price: number;
  duration_month: number;
  is_active: boolean;
  max_employees: number;
  features: any;
  created_at: string;
  updated_at: string;
}

export interface Tenant {
  id?: number;
  name: string;
  subdomain: string;
  contact_email: string;
  contact_phone?: string;
  address?: string;
  plan_type: string; // Tipo de plan (free, basic, premium)
  subscription_plan_details?: SubscriptionPlan;
  max_users: number;
  max_employees: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  current_user_count?: number;
  current_employee_count?: number;
  can_add_user?: boolean;
  can_add_employee?: boolean;
}

export interface TenantStats {
  total_tenants: number;
  active_tenants: number;
  inactive_tenants: number;
}

export interface TenantCreateRequest {
  name: string;
  subdomain: string;
  contact_email: string;
  contact_phone?: string;
  address?: string;
  plan_type: string;
  max_users: number;
  max_employees: number;
  is_active: boolean;
}

export interface TenantUpdateRequest {
  name?: string;
  subdomain?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  plan_type?: string;
  max_users?: number;
  max_employees?: number;
  is_active?: boolean;
}
