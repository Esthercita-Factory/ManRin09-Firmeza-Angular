import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface PlanDto {
  id: number;
  nombre: string;
  descripcion: string;
  precioMensual: number;
  precioAnual: number;
  caracteristicas: string[];
  esRecomendado: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly baseUrl = 'http://localhost:5235/api';

  getHomeData(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/auth/home-data`);
  }

  getDashboardData(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/dashboard`);
  }

  getPlans(): Observable<PlanDto[]> {
    return this.http.get<PlanDto[]>(`${this.baseUrl}/plans`);
  }

  login(credentials: any): Observable<any> {
    return this.authService.login(credentials);
  }

  register(userData: any): Observable<any> {
    return this.authService.register(userData);
  }
}
