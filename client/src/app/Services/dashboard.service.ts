import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardResponse {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    createdAt: string;
  };
  accountType: 'empresa' | 'persona';
  company?: {
    id: number;
    businessName: string;
    taxId: string;
    contactName: string;
    corporateEmail: string;
    corporatePhone: string;
    isActive: boolean;
    totalClients: number;
  };
  client?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    isActive: boolean;
  };
  metrics: {
    totalClients?: number;
    activeWarehouses?: number;
    totalProducts?: number;
    storageCapacity?: string;
    assignedOrders?: number;
    pendingDeliveries?: number;
    systemStatus: string;
    notifications?: number;
    lastSync: string;
  };
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5235/api/dashboard';

  getDashboardData(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(this.apiUrl);
  }
}
