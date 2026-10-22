import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../Services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="layout-wrapper">
      <!-- Sidebar Lateral con soporte dinámico para Empleado y Empresa -->
      <aside class="sidebar" [class.collapsed]="isSidebarCollapsed">
        <!-- CASO 1: SIDEBAR DE OPERACIÓN ALMACÉN (EMPLEADOS) -->
        <ng-container *ngIf="isEmployee; else enterpriseSidebar">
          <div class="sidebar-brand employee-brand">
            <div class="brand-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
            </div>
            <div class="brand-text">
              <span class="brand-name">FIRMEZA</span>
              <span class="brand-sub">IMS OPERACIÓN</span>
            </div>
          </div>

          <nav class="sidebar-nav">
            <span class="nav-heading">OPERACIÓN ALMACÉN</span>

            <a routerLink="/app/employee-dashboard" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
                  <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
                  <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
                  <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
                </svg>
              </span>
              <span class="nav-label">Panel Operativo</span>
            </a>

            <a routerLink="/app/inventory" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
              </span>
              <span class="nav-label">Inventario y Productos</span>
            </a>

            <a routerLink="/app/enterprises" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m7 16-4-4 4-4"></path>
                  <path d="M3 12h18"></path>
                  <path d="m17 8 4 4-4 4"></path>
                </svg>
              </span>
              <span class="nav-label">Movimientos y Pedidos</span>
            </a>
          </nav>
        </ng-container>

        <!-- CASO 2: SIDEBAR GESTIÓN EMPRESARIAL / ADMINISTRADOR -->
        <ng-template #enterpriseSidebar>
          <div class="sidebar-brand">
            <a routerLink="/app/dashboard" class="brand-link">
              <span class="brand-logo">
                <img src="/favicon.png" width="22" height="22" alt="Firmeza IMS" style="border-radius: 4px; display: block;" />
              </span>
              <div class="brand-text">
                <span class="brand-title">Firmeza</span>
                <span class="brand-subtitle">ENTERPRISE IMS</span>
              </div>
            </a>
          </div>

          <nav class="sidebar-nav">
            <span class="nav-heading">GESTIÓN PRINCIPAL</span>

            <a routerLink="/app/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: false}" class="nav-item">
              <span class="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
                  <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
                  <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
                  <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
                </svg>
              </span>
              <span class="nav-label">Dashboard / Inicio</span>
            </a>

            <a routerLink="/app/inventory" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
              </span>
              <span class="nav-label">Inventario y Productos</span>
            </a>

            <a routerLink="/app/enterprises" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m7 16-4-4 4-4"></path>
                  <path d="M3 12h18"></path>
                  <path d="m17 8 4 4-4 4"></path>
                </svg>
              </span>
              <span class="nav-label">Movimientos y Pedidos</span>
            </a>

            <a routerLink="/app/reports" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
              </span>
              <span class="nav-label">Reportes y Analíticas</span>
            </a>

            <a routerLink="/app/employees" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </span>
              <span class="nav-label">Administrar Empleados</span>
            </a>
          </nav>
        </ng-template>
      </aside>

      <!-- Panel Principal -->
      <div class="main-container">
        <header class="topbar">
          <div class="topbar-left">
            <button 
              (click)="toggleSidebar()" 
              class="topbar-icon-btn hamburger-btn" 
              [class.active]="isSidebarCollapsed"
              title="Alternar menú lateral"
              aria-label="Abrir o cerrar menú lateral"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="topbar-right">
            <div class="user-profile-widget">
              <div class="profile-info-block">
                <span class="profile-name">{{ isEmployee ? employeeName : userName }}</span>
                <span class="profile-role">{{ isEmployee ? employeeRole : userRole }}</span>
              </div>
              <div class="profile-avatar-circle">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
            </div>

            <button (click)="logout()" class="topbar-icon-btn" title="Cerrar Sesión">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </div>
        </header>

        <!-- Área de Contenido Dinámico de la SPA -->
        <main class="page-viewport">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100vh;
      overflow: hidden;
      color: #0f172a;
      background-color: #f8fafc;
      font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      letter-spacing: -0.012em;
    }

    .layout-wrapper {
      display: flex;
      width: 100%;
      height: 100vh;
      overflow: hidden;
      background: #f8fafc;
    }

    .sidebar {
      width: 240px;
      min-width: 240px;
      background-color: #ffffff;
      border-right: 1px solid rgba(226, 232, 240, 0.85);
      box-shadow: 2px 0 12px 0 rgba(15, 23, 42, 0.03), 6px 0 24px -4px rgba(15, 23, 42, 0.03);
      display: flex;
      flex-direction: column;
      z-index: 30;
      user-select: none;
      transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease;
    }

    .sidebar.collapsed {
      margin-left: -240px;
      opacity: 0;
      pointer-events: none;
    }

    .sidebar-brand {
      padding: 1.15rem 1.25rem;
      border-bottom: 1px solid rgba(241, 245, 249, 0.9);
    }

    .brand-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
    }

    .brand-logo {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.35rem;
      background: #eff6ff;
      border-radius: 8px;
      border: 1px solid #dbeafe;
      box-shadow: 0 2px 4px rgba(37, 99, 235, 0.08);
      transition: all 0.2s ease;
    }

    .brand-link:hover .brand-logo {
      box-shadow: 0 3px 8px rgba(37, 99, 235, 0.18);
      transform: translateY(-1px);
    }

    .brand-text {
      display: flex;
      flex-direction: column;
    }

    .brand-title {
      font-weight: 800;
      font-size: 1rem;
      letter-spacing: -0.03em;
      color: #0f172a;
      line-height: 1.15;
    }

    .brand-subtitle {
      font-size: 0.58rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      color: #64748b;
      text-transform: uppercase;
      margin-top: 1px;
    }

    .sidebar-brand.employee-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1.15rem 1.25rem;
    }

    .employee-brand .brand-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: #2563eb;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
    }

    .employee-brand .brand-name {
      font-weight: 800;
      font-size: 1.05rem;
      color: #0f172a;
      letter-spacing: -0.02em;
      line-height: 1.1;
    }

    .employee-brand .brand-sub {
      font-size: 0.6rem;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .sidebar-nav {
      flex: 1;
      padding: 1.1rem 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      overflow-y: auto;
    }

    .nav-heading {
      font-size: 0.62rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: #94a3b8;
      padding: 0.5rem 0.75rem 0.35rem;
      text-transform: uppercase;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.6rem 0.85rem;
      border-radius: 8px;
      color: #475569;
      text-decoration: none;
      font-size: 0.81rem;
      font-weight: 500;
      letter-spacing: -0.01em;
      transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .nav-item:hover {
      background-color: #f1f5f9;
      color: #0f172a;
      transform: translateX(2px);
    }

    .nav-item.active {
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      color: #ffffff;
      font-weight: 600;
      box-shadow: 0 4px 12px -2px rgba(37, 99, 235, 0.35);
    }

    .nav-item.active .nav-icon {
      color: #ffffff;
    }

    .nav-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      color: #64748b;
      transition: color 0.15s ease;
    }

    .nav-item:hover .nav-icon {
      color: #2563eb;
    }

    .nav-label {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .main-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      height: 100vh;
      overflow: hidden;
      background-color: #f8fafc;
    }

    .topbar {
      height: 60px;
      background-color: #ffffff;
      border-bottom: 1px solid rgba(226, 232, 240, 0.85);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
      z-index: 20;
      box-shadow: 0 1px 4px rgba(15, 23, 42, 0.02);
    }

    .topbar-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .topbar-icon-btn {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      background-color: #ffffff;
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s ease;
      position: relative;
    }

    .topbar-icon-btn:hover {
      background-color: #f8fafc;
      color: #0f172a;
      border-color: #cbd5e1;
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .user-profile-widget {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.25rem 0.5rem;
      border-radius: 8px;
      transition: background-color 0.15s ease;
    }

    .profile-info-block {
      display: flex;
      flex-direction: column;
      text-align: right;
    }

    .profile-name {
      font-size: 0.8rem;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.2;
      letter-spacing: -0.015em;
    }

    .profile-role {
      font-size: 0.65rem;
      font-weight: 500;
      color: #64748b;
    }

    .profile-avatar-circle {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: linear-gradient(135deg, #2563eb, #1e40af);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.28);
      border: 2px solid #ffffff;
    }

    .page-viewport {
      flex: 1;
      overflow-y: auto;
      background-color: #f8fafc;
    }
  `]
})
export class AdminLayoutComponent {
  private readonly authService = inject(AuthService);
  isSidebarCollapsed = false;

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  get isEmployee(): boolean {
    return this.authService.isEmployee();
  }

  get currentUser() {
    return this.authService.currentUser() || this.authService.getUser();
  }

  get userName(): string {
    return this.currentUser?.fullName || this.currentUser?.email || 'Administrador';
  }

  get userRole(): string {
    return this.currentUser?.role === 'Enterprise' ? 'Empresa' : (this.currentUser?.role || 'Administrador');
  }

  get employeeName(): string {
    return this.currentUser?.fullName || 'Operador';
  }

  get employeeRole(): string {
    const role = this.currentUser?.role;
    if (role === 'Employee' || role === 'Empleado' || !role) {
      return 'Operador Logístico';
    }
    return role;
  }

  logout(): void {
    this.authService.logout();
  }
}

export const DashboardLayoutComponent = AdminLayoutComponent;
