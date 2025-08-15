import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment'; // ajusta el path
import { Plan } from './plan.model';

export interface PlansQuery {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;           // ej: '-created_at' | 'price' | '-price' | 'duration_month'
  is_active?: 'true' | 'false' | '';
}
export interface Paginated<T> { count: number; results: T[]; }

// Helper para unir URLs sin liarla con los slashes
function joinUrl(base: string, path: string): string {
  if (!base.endsWith('/')) base += '/';
  if (path.startsWith('/')) path = path.slice(1);
  return base + path;
}

@Injectable()
export class PlansService {
  // 1) Base de la API desde environment
  private readonly baseUrl = environment.apiUrl;               // p.ej. 'http://localhost:8000/api'
  private readonly plansUrl = joinUrl(this.baseUrl, 'subscriptions/plans/'); // '.../api/subscriptions/plans/'

  constructor(private http: HttpClient) {}

  // 2) Mapeo API -> UI (snake_case -> camelCase)
  private toUi = (p: any): Plan => ({
    id: p.id,
    name: p.name,
    description: p.description ?? '',
    price: Number(p.price),
    durationMonths: Number(p.duration_month ?? 1),
    // En tu UI, null = ilimitado. En el backend, 0 = ilimitado.
    employeesLimit: (p.max_employees ?? 0) === 0 ? null : Number(p.max_employees),
    isActive: !!p.is_active,
    // Si backend manda objeto, lo convertimos a array; si ya es array, se deja.
    features: Array.isArray(p.features) ? p.features : (p.features ? Object.values(p.features) : []),
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  });

  // 3) Mapeo UI -> API (camelCase -> snake_case)
  private toServer = (ui: Partial<Plan>) => ({
    name: ui.name,
    description: ui.description ?? '',
    price: ui.price != null ? Number(ui.price) : ui.price,
    duration_month: ui.durationMonths != null ? Number(ui.durationMonths) : ui.durationMonths,
    is_active: ui.isActive,
    // null/undefined en UI => 0 (ilimitado) para el backend
    max_employees: ui.employeesLimit == null ? 0 : Number(ui.employeesLimit),
    // si usas chips (array), se manda array; ajusta si tu backend espera otra cosa
    features: ui.features ?? [],
  });

  // 4) Listar con paginación/orden/búsqueda/filtros
  list(q: PlansQuery): Observable<Paginated<Plan>> {
    let params = new HttpParams();
    if (q.page)       params = params.set('page', String(q.page));
    if (q.page_size)  params = params.set('page_size', String(q.page_size));
    if (q.search)     params = params.set('search', q.search);
    if (q.ordering)   params = params.set('ordering', q.ordering);
    if (q.is_active)  params = params.set('is_active', q.is_active);

    return this.http.get<any>(this.plansUrl, { params }).pipe(
      map(res => ({
        count: res.count ?? 0,
        results: (res.results ?? []).map(this.toUi),
      }))
    );
  }

  // 5) Crear (POST) — recibe Plan en camelCase, lo convierte y devuelve en camelCase
  createPlan(plan: Plan): Observable<Plan> {
    return this.http.post<any>(this.plansUrl, this.toServer(plan)).pipe(map(this.toUi));
  }

  // 6) Actualizar parcial (PATCH) — usa detalle con slash final /:id/
  updatePlan(id: number, plan: Partial<Plan>): Observable<Plan> {
    return this.http.patch<any>(joinUrl(this.plansUrl, `${id}/`), this.toServer(plan)).pipe(map(this.toUi));
  }

  // 7) Eliminar
  deletePlan(id: number) {
    return this.http.delete(joinUrl(this.plansUrl, `${id}/`));
  }

  // 8) OPTIONS para choices (dropdown de name)
  options() {
    return this.http.options<any>(this.plansUrl);
  }
}
