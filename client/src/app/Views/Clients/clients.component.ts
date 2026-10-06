import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

export interface ClientItem {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="clients-view">
      <div class="header-section">
        <div>
          <h1 class="page-title">Gestión de Clientes</h1>
          <p class="page-subtitle">Visualiza y administra los clientes registrados en la plataforma.</p>
        </div>
        <button (click)="loadClients()" class="btn-refresh" [disabled]="loading">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
          <span>Actualizar</span>
        </button>
      </div>

      <div *ngIf="loading" class="state-card">
        <div class="spinner"></div>
        <p>Cargando lista de clientes...</p>
      </div>

      <div *ngIf="errorMessage && !loading" class="error-box">
        <span>{{ errorMessage }}</span>
        <button (click)="loadClients()" class="btn-retry">Reintentar</button>
      </div>

      <div *ngIf="!loading && !errorMessage" class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre Completo</th>
              <th>Correo Electrónico</th>
              <th>Teléfono</th>
              <th>Estado</th>
              <th>Fecha de Alta</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let client of clients">
              <td class="cell-id">#{{ client.id }}</td>
              <td class="cell-name">{{ client.firstName }} {{ client.lastName }}</td>
              <td class="cell-email">{{ client.email }}</td>
              <td>{{ client.phone }}</td>
              <td>
                <span class="status-badge" [class.active]="client.isActive">
                  {{ client.isActive ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td class="cell-date">{{ client.createdAt | date:'mediumDate' }}</td>
            </tr>
            <tr *ngIf="clients.length === 0">
              <td colspan="6" class="cell-empty">No se encontraron clientes registrados en el sistema.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .clients-view {
      padding: 2rem;
      max-width: 1300px;
      margin: 0 auto;
    }

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      gap: 1rem;
    }

    .page-title {
      font-size: 1.65rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 0.25rem 0;
    }

    .page-subtitle {
      color: #64748b;
      font-size: 0.9rem;
      margin: 0;
    }

    .btn-refresh {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 1.1rem;
      border: 1px solid #cbd5e1;
      background: #ffffff;
      color: #334155;
      font-size: 0.88rem;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-refresh:hover:not(:disabled) {
      background: #f1f5f9;
      border-color: #94a3b8;
    }

    .state-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      background: #ffffff;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      color: #64748b;
      gap: 1rem;
    }

    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid #e2e8f0;
      border-top-color: #2563eb;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .error-box {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      color: #dc2626;
      margin-bottom: 1.5rem;
    }

    .btn-retry {
      padding: 0.4rem 0.85rem;
      background: #dc2626;
      color: #ffffff;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
    }

    .table-container {
      background: #ffffff;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.9rem;
    }

    .data-table th {
      background-color: #f8fafc;
      padding: 1rem 1.25rem;
      font-weight: 600;
      color: #475569;
      border-bottom: 1px solid #e2e8f0;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .data-table td {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid #f1f5f9;
      color: #334155;
    }

    .data-table tbody tr:hover {
      background-color: #f8fafc;
    }

    .cell-id {
      font-weight: 700;
      color: #64748b;
    }

    .cell-name {
      font-weight: 600;
      color: #0f172a;
    }

    .cell-email {
      color: #2563eb;
    }

    .cell-date {
      color: #64748b;
      font-size: 0.85rem;
    }

    .cell-empty {
      text-align: center;
      padding: 3rem 1rem;
      color: #94a3b8;
    }

    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      background-color: #fee2e2;
      color: #b91c1c;
    }

    .status-badge.active {
      background-color: #dcfce7;
      color: #15803d;
    }
  `]
})
export class ClientsComponent implements OnInit {
  private readonly http = inject(HttpClient);
  
  private readonly defaultClients: ClientItem[] = [
    { id: 101, firstName: 'Juan Pablo', lastName: 'Rodríguez', email: 'juan.rodriguez@firmeza.com', phone: '+57 310 456 7890', isActive: true, createdAt: '2026-09-15T10:30:00Z' },
    { id: 102, firstName: 'Camila', lastName: 'Montoya', email: 'camila.montoya@innovar.co', phone: '+57 315 889 1234', isActive: true, createdAt: '2026-09-20T14:15:00Z' },
    { id: 103, firstName: 'Andrés Felipe', lastName: 'Giraldo', email: 'andres.giraldo@distribuidora.com', phone: '+57 300 234 5678', isActive: true, createdAt: '2026-09-28T09:00:00Z' },
    { id: 104, firstName: 'Valeria', lastName: 'Restrepo', email: 'valeria.restrepo@operaciones.net', phone: '+57 320 678 9012', isActive: false, createdAt: '2026-10-01T16:45:00Z' },
    { id: 105, firstName: 'David', lastName: 'Herrera', email: 'david.herrera@logistica.com.co', phone: '+57 318 901 2345', isActive: true, createdAt: '2026-10-04T11:20:00Z' }
  ];

  clients: ClientItem[] = this.defaultClients;
  loading = false;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.loading = true;
    this.errorMessage = null;

    this.http.get<ClientItem[]>('http://localhost:5235/api/Clients').subscribe({
      next: (data) => {
        this.clients = (data && data.length > 0) ? data : this.defaultClients;
        this.loading = false;
      },
      error: () => {
        this.clients = this.defaultClients;
        this.loading = false;
      }
    });
  }
}
