export interface User {
  id: number;
  fullName: string;
  email: string;
  role: 'ClientAdmin' | 'ClientStaff' | 'SuperAdmin';
  isActive: boolean;
  tenant?: string; // Nombre del negocio si aplica
  createdAt: string;
}
export interface UserUpdate {
  fullName?: string;
  email?: string;
  role?: 'ClientAdmin' | 'ClientStaff' | 'SuperAdmin';
  isActive?: boolean;
  tenant?: string; // Nombre del negocio si aplica
}
export interface UserCreate {
  fullName: string;
  email: string;
  role: 'ClientAdmin' | 'ClientStaff' | 'SuperAdmin';
  isActive: boolean;
  tenant?: string; // Nombre del negocio si aplica
}