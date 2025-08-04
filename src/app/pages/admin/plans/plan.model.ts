export interface Plan {
  id: number;
  name: string;
  price: number;
  description: string;
  usersLimit: number;
  features: string[];
  isActive: boolean;
  createdAt: string;
}
export interface PlanUpdate {
  id: number;
  name?: string;
  price?: number;
  description?: string;
  usersLimit?: number;
  features?: string[];
  isActive?: boolean;
}
export interface PlanCreate {
  name: string;
  price: number;
  description: string;
  usersLimit: number;
  features: string[];
  isActive: boolean;
}