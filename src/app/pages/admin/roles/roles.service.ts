
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

 getRoles(): Observable<Role[]> {
  return this.http.get<{ results: Role[] }>(this.apiUrl).pipe(
    map(response => response.results)
  );

}


}


