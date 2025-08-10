export interface Role {
    id: number;
    name: string;
}

export interface User {
    id: number;
    full_name: string;
    email: string;
    roles?: Role[];
    role_ids?: number[];
    is_active: boolean;
    date_joined: string;
    tenant?: string; // opcional si no está definido en backend
}
export interface UserUpdate {
    fullName?: string;
    email?: string;
    role?: 'Admin' | 'Manager' | 'SuperAdmin';
    isActive?: boolean;
    tenant?: string; // Nombre del negocio si aplica
}
export interface UserCreate {
    fullName: string;
    email: string;
    role: 'Admin' | 'Manager' | 'SuperAdmin';
    isActive: boolean;
    tenant?: string; // Nombre del negocio si aplica
}
