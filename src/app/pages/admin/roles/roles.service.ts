import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environment';

export interface Role {
  id?: number;
  name: string;
  description?: string;
  scope: 'GLOBAL' | 'TENANT' | 'MODULE';
  module?: string | null;
  limits?: { [key: string]: any };
  permissions: number[]; // IDs de permisos
}

export interface Permission {
  id: number;
  codename: string;
  name: string;
  app_label: string;
  model: string;
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = `${environment.apiUrl}/roles/roles/`;

  constructor(private http: HttpClient) {}

  // Listar roles
  getRoles(): Observable<Role[]> {
    return this.http.get<{ results: Role[] }>(this.apiUrl).pipe(
      map(response => response.results)
    );
  }

  // Obtener rol por ID
  getRole(id: number): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}${id}/`);
  }

  // Crear rol
  createRole(role: Role): Observable<Role> {
    return this.http.post<Role>(this.apiUrl, role);
  }

  // Actualizar rol
  updateRole(id: number, role: Role): Observable<Role> {
    return this.http.put<Role>(`${this.apiUrl}${id}/`, role);
  }

  // Eliminar rol
  deleteRole(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`);
  }

  // Obtener todos los permisos disponibles
  getPermissions(): Observable<Permission[]> {
    return this.http.get<{ results: Permission[] }>(`${environment.apiUrl}/roles/roles/permissions/`).pipe(
      map(response => response.results || [])
    );
  }

  // Asignar roles a usuario (si tu backend lo soporta)
  assignRolesToUser(userId: number, roleIds: number[]): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/users/users/${userId}/`, {
      roles: roleIds
    });
  }
}
