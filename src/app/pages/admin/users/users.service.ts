import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environment';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { User } from './user.model';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = `${environment.apiUrl}/users/`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener lista de usuarios
   */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl).pipe(
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Crear nuevo usuario
   */
  createUser(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, user).pipe(
      tap(created => console.log('Usuario creado:', created)),
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Actualizar un usuario existente
   */
  updateUser(user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}${user.id}/`, user).pipe(
      tap(updated => console.log('Usuario actualizado:', updated)),
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Eliminar un usuario
   */
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`).pipe(
      tap(() => console.log('Usuario eliminado')),
      catchError(error => throwError(() => error))
    );
  }
}
