import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DashboardService, DashboardResponse } from '../../Services/dashboard.service';
import { AuthService } from '../../Services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-wrapper">
      <!-- Navbar Superior -->
      <header class="top-navbar">
        <div class="brand">
          <span class="brand-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </span>
          <div class="brand-text">
            <span class="brand-name">FIRMEZA</span>
            <span class="brand-sub">INVENTORY PLATFORM</span>
          </div>
        </div>

        <div class="navbar-actions">
          <div class="user-pill" *ngIf="dashboardData">
            <span class="status-dot"></span>
            <span class="user-name">{{ dashboardData.user.fullName }}</span>
            <span class="user-role">{{ dashboardData.user.role }}</span>
          </div>

          <a routerLink="/plans" class="nav-btn btn-secondary">Planes</a>

          <button (click)="logout()" class="nav-btn btn-logout" title="Cerrar sesión">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </header>

      <!-- Contenido Principal -->
      <main class="dashboard-container">
        <!-- Estado de Carga -->
        <div *ngIf="isLoading" class="loading-state">
          <div class="spinner"></div>
          <p>Cargando información del panel...</p>
        </div>

        <!-- Estado de Error -->
        <div *ngIf="errorMessage && !isLoading" class="error-banner">
          <div class="error-content">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{{ errorMessage }}</span>
          </div>
          <button (click)="loadDashboardData()" class="btn-retry">Reintentar</button>
        </div>

        <!-- Panel Principal con Datos -->
        <div *ngIf="dashboardData && !isLoading" class="dashboard-content">
          <!-- Hero Banner de Bienvenida -->
          <div class="welcome-card">
            <div class="welcome-left">
              <div class="badges-row">
                <span class="badge-tag">CONSOLA OPERATIVA</span>
                <span class="badge-type">{{ dashboardData.accountType === 'empresa' ? 'CUENTA CORPORATIVA' : 'CUENTA PERSONAL' }}</span>
              </div>
              <h1 class="welcome-title">{{ dashboardData.message }}</h1>
              <p class="welcome-subtitle">
                Acceso concedido a la consola de administración. Monitorea recursos, sincronización de stock y operaciones en tiempo real.
              </p>
            </div>
            <div class="welcome-right">
              <div class="tls-status">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                <span>Sesión Segura y Cifrada</span>
              </div>
              <span class="last-sync">Última sincronización: {{ dashboardData.metrics.lastSync | date:'shortTime' }}</span>
            </div>
          </div>

          <!-- Métricas Clave -->
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-header">
                <span class="metric-title">ESTADO DEL SISTEMA</span>
                <span class="metric-badge green">Óptimo</span>
              </div>
              <div class="metric-value">{{ dashboardData.metrics.systemStatus }}</div>
              <span class="metric-caption">Servicios REST sincronizados</span>
            </div>

            <div class="metric-card">
              <div class="metric-header">
                <span class="metric-title">{{ dashboardData.accountType === 'empresa' ? 'CLIENTES ASOCIADOS' : 'PEDIDOS ASIGNADOS' }}</span>
                <span class="metric-badge blue">Activo</span>
              </div>
              <div class="metric-value">
                {{ dashboardData.accountType === 'empresa' ? (dashboardData.metrics.totalClients ?? 0) : (dashboardData.metrics.assignedOrders ?? 0) }}
              </div>
              <span class="metric-caption">Registrados en la plataforma</span>
            </div>

            <div class="metric-card">
              <div class="metric-header">
                <span class="metric-title">ALMACENES VINCULADOS</span>
                <span class="metric-badge purple">Principal</span>
              </div>
              <div class="metric-value">{{ dashboardData.metrics.activeWarehouses ?? 1 }} Bodega</div>
              <span class="metric-caption">Nodo central de existencias</span>
            </div>

            <div class="metric-card">
              <div class="metric-header">
                <span class="metric-title">CAPACIDAD DISPONIBLE</span>
                <span class="metric-badge gray">Almacenamiento</span>
              </div>
              <div class="metric-value">{{ dashboardData.metrics.storageCapacity ?? 'Disponible' }}</div>
              <span class="metric-caption">Nivel de uso de recursos</span>
            </div>
          </div>

          <!-- Cuadrícula de Información de Cuenta y Accesos Rápidos -->
          <div class="info-grid">
            <!-- Tarjeta de Detalles del Perfil -->
            <div class="detail-card">
              <div class="card-header">
                <h3>Detalles de la Cuenta</h3>
                <span class="active-badge">Activo</span>
              </div>

              <!-- Información Empresa -->
              <div *ngIf="dashboardData.accountType === 'empresa' && dashboardData.company" class="details-list">
                <div class="detail-row">
                  <span class="label">Razón Social:</span>
                  <strong class="value">{{ dashboardData.company.businessName }}</strong>
                </div>
                <div class="detail-row">
                  <span class="label">Identificación Fiscal (NIT/RFC):</span>
                  <strong class="value">{{ dashboardData.company.taxId }}</strong>
                </div>
                <div class="detail-row">
                  <span class="label">Representante / Contacto:</span>
                  <span class="value">{{ dashboardData.company.contactName }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Correo Corporativo:</span>
                  <span class="value">{{ dashboardData.company.corporateEmail }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Teléfono:</span>
                  <span class="value">{{ dashboardData.company.corporatePhone }}</span>
                </div>
              </div>

              <!-- Información Persona Natural -->
              <div *ngIf="dashboardData.accountType === 'persona' && dashboardData.client" class="details-list">
                <div class="detail-row">
                  <span class="label">Nombre Completo:</span>
                  <strong class="value">{{ dashboardData.client.firstName }} {{ dashboardData.client.lastName }}</strong>
                </div>
                <div class="detail-row">
                  <span class="label">Correo Electrónico:</span>
                  <span class="value">{{ dashboardData.client.email }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Teléfono de Contacto:</span>
                  <span class="value">{{ dashboardData.client.phone }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Identificador de Usuario:</span>
                  <span class="value">{{ dashboardData.user.id }}</span>
                </div>
              </div>
            </div>

            <!-- Tarjeta de Operaciones Rápidas -->
            <div class="actions-card">
              <div class="card-header">
                <h3>Operaciones Rápidas</h3>
              </div>
              <p class="actions-desc">Gestiona tus existencias o explora los planes de suscripción para habilitar más bodegas y multiusuario.</p>

              <div class="actions-buttons">
                <a routerLink="/plans" class="action-btn btn-primary-action">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                  <span>Explorar Planes y Mejoras</span>
                </a>

                <button class="action-btn btn-secondary-action" (click)="loadDashboardData()">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <polyline points="1 20 1 14 7 14"></polyline>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                  </svg>
                  <span>Sincronizar Datos</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      color: #0f172a;
      background-color: #0b1120;
      min-height: 100vh;
      font-family: inherit;
    }

    .dashboard-wrapper {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .top-navbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 2.5rem;
      background: #0f172a;
      border-bottom: 1px solid #1e293b;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
    }

    .brand-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      color: #38bdf8;
      background: #0369a120;
      border: 1px solid #0284c740;
      padding: 0.4rem;
      border-radius: 8px;
    }

    .brand-name {
      display: block;
      font-weight: 800;
      letter-spacing: 0.1em;
      color: #ffffff;
      font-size: 1.15rem;
    }

    .brand-sub {
      display: block;
      font-size: 0.65rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      color: #94a3b8;
    }

    .navbar-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-pill {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #1e293b;
      padding: 0.4rem 0.9rem;
      border-radius: 9999px;
      border: 1px solid #334155;
      font-size: 0.82rem;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      background: #22c55e;
      border-radius: 50%;
      box-shadow: 0 0 8px #22c55e;
    }

    .user-name {
      color: #f1f5f9;
      font-weight: 600;
    }

    .user-role {
      background: #2563eb30;
      color: #60a5fa;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
      font-size: 0.7rem;
      text-transform: uppercase;
      font-weight: 700;
    }

    .nav-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s ease;
      border: none;
    }

    .btn-secondary {
      background: #1e293b;
      color: #cbd5e1;
      border: 1px solid #334155;
    }
    .btn-secondary:hover {
      background: #334155;
      color: #ffffff;
    }

    .btn-logout {
      background: #dc262620;
      color: #f87171;
      border: 1px solid #dc262640;
    }
    .btn-logout:hover {
      background: #dc2626;
      color: #ffffff;
    }

    .dashboard-container {
      padding: 2.5rem;
      max-width: 1300px;
      width: 100%;
      margin: 0 auto;
      flex: 1;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 6rem 2rem;
      color: #94a3b8;
      gap: 1rem;
    }

    .spinner {
      width: 44px;
      height: 44px;
      border: 3px solid #1e293b;
      border-top-color: #38bdf8;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .error-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #450a0a;
      border: 1px solid #991b1b;
      color: #fca5a5;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      margin-bottom: 2rem;
    }

    .error-content {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.95rem;
    }

    .btn-retry {
      background: #991b1b;
      color: #fff;
      border: none;
      padding: 0.4rem 0.9rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
    }

    .dashboard-content {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      animation: fadeIn 0.4s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .welcome-card {
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      border: 1px solid #334155;
      border-radius: 16px;
      padding: 2rem 2.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
    }

    .badges-row {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }

    .badge-tag {
      background: #0284c725;
      color: #38bdf8;
      font-size: 0.68rem;
      font-weight: 700;
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
      letter-spacing: 0.05em;
    }

    .badge-type {
      background: #10b98125;
      color: #34d399;
      font-size: 0.68rem;
      font-weight: 700;
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
      letter-spacing: 0.05em;
    }

    .welcome-title {
      font-size: 1.85rem;
      font-weight: 800;
      color: #ffffff;
      margin: 0 0 0.5rem 0;
    }

    .welcome-subtitle {
      color: #94a3b8;
      font-size: 0.95rem;
      line-height: 1.5;
      margin: 0;
      max-width: 650px;
    }

    .welcome-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.5rem;
    }

    .tls-status {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      color: #34d399;
      background: #064e3b40;
      border: 1px solid #065f46;
      padding: 0.35rem 0.75rem;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .last-sync {
      color: #64748b;
      font-size: 0.75rem;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.25rem;
    }

    .metric-card {
      background: #111827;
      border: 1px solid #1f2937;
      border-radius: 14px;
      padding: 1.4rem 1.6rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      transition: transform 0.2s, border-color 0.2s;
    }
    .metric-card:hover {
      transform: translateY(-2px);
      border-color: #374151;
    }

    .metric-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .metric-title {
      font-size: 0.72rem;
      font-weight: 700;
      color: #9ca3af;
      letter-spacing: 0.05em;
    }

    .metric-badge {
      font-size: 0.68rem;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
      font-weight: 600;
    }
    .metric-badge.green { background: #064e3b50; color: #34d399; }
    .metric-badge.blue { background: #1e3a8a50; color: #60a5fa; }
    .metric-badge.purple { background: #581c8750; color: #c084fc; }
    .metric-badge.gray { background: #37415180; color: #d1d5db; }

    .metric-value {
      font-size: 1.6rem;
      font-weight: 800;
      color: #f9fafb;
    }

    .metric-caption {
      font-size: 0.78rem;
      color: #6b7280;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.5rem;
    }

    .detail-card, .actions-card {
      background: #111827;
      border: 1px solid #1f2937;
      border-radius: 14px;
      padding: 1.75rem 2rem;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #1f2937;
    }

    .card-header h3 {
      font-size: 1.1rem;
      font-weight: 700;
      color: #f3f4f6;
      margin: 0;
    }

    .active-badge {
      background: #064e3b40;
      color: #34d399;
      border: 1px solid #065f46;
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
    }

    .details-list {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.9rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #1e293b50;
    }

    .detail-row .label {
      color: #94a3b8;
    }

    .detail-row .value {
      color: #f8fafc;
      font-weight: 500;
    }

    .actions-desc {
      color: #94a3b8;
      font-size: 0.88rem;
      line-height: 1.5;
      margin-bottom: 1.5rem;
    }

    .actions-buttons {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .action-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 0.88rem;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;
    }

    .btn-primary-action {
      background: #0284c7;
      color: #ffffff;
    }
    .btn-primary-action:hover {
      background: #0369a1;
    }

    .btn-secondary-action {
      background: #1f2937;
      color: #e5e7eb;
      border: 1px solid #374151;
    }
    .btn-secondary-action:hover {
      background: #374151;
      color: #ffffff;
    }

    @media (max-width: 900px) {
      .top-navbar { padding: 1rem 1.5rem; flex-direction: column; gap: 1rem; }
      .welcome-card { flex-direction: column; align-items: flex-start; }
      .welcome-right { align-items: flex-start; }
      .info-grid { grid-template-columns: 1fr; }
      .dashboard-container { padding: 1.5rem; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  isLoading = true;
  errorMessage: string | null = null;
  dashboardData: DashboardResponse | null = null;

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401) {
          this.errorMessage = 'Sesión expirada o no autorizada. Redirigiendo...';
          this.authService.logout();
        } else {
          this.errorMessage = err?.error?.message || 'Error al cargar los datos del dashboard.';
        }
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
