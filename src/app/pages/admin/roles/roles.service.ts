import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environment';

export interface Role {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = `${environment.apiUrl}/roles/roles/`;

  constructor(private http: HttpClient) {}

  // Listar todos los roles
  getRoles(): Observable<Role[]> {
    return this.http.get<{ results: Role[] }>(this.apiUrl).pipe(
      map(response => response.results)
    );
  }

  // Obtener un rol por ID
  getRole(id: number): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}${id}/`);
  }

  // Crear un nuevo rol
  createRole(role: { name: string }): Observable<Role> {
    return this.http.post<Role>(this.apiUrl, role);
  }

  // Actualizar un rol existente
  updateRole(id: number, role: { name: string }): Observable<Role> {
    return this.http.put<Role>(`${this.apiUrl}${id}/`, role);
  }

  // Eliminar un rol
  deleteRole(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`);
  }

  // Asignar roles a un usuario
  assignRolesToUser(userId: number, roleIds: number[]): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/users/users/${userId}/`, {
      roles: roleIds
    });
  }
}
