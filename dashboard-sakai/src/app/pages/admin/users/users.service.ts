import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { User } from './user.model';

@Injectable({ providedIn: 'root' })
export class UsersService {
  getUsers() {
    const data: User[] = [
      {
        id: 1,
        fullName: 'Juan Pérez',
        email: 'juan@peluqueriax.com',
        role: 'ClientAdmin',
        isActive: true,
        tenant: 'Peluquería X',
        createdAt: '2025-07-01T10:00:00Z'
      },
      {
        id: 2,
        fullName: 'Laura González',
        email: 'laura@stylo.com',
        role: 'ClientStaff',
        isActive: false,
        tenant: 'Stylo Studio',
        createdAt: '2025-06-15T12:30:00Z'
      }
    ];
    return of(data);
  }
}
