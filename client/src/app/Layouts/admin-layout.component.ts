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
      <!-- Sidebar Lateral Corporativo -->
      <aside class="sidebar">
        <!-- Brand / Logotipo idéntico a Home y Login -->
        <div class="sidebar-brand">
          <a routerLink="/app/dashboard" class="brand-link">
            <span class="brand-logo">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </span>
            <div class="brand-text">
              <span class="brand-title">Firmeza</span>
              <span class="brand-subtitle">INVENTORY PLATFORM</span>
            </div>
          </a>
        </div>

        <!-- Navegación Primaria -->
        <nav class="sidebar-nav">
          <span class="nav-heading">OPERACIÓN & LOGÍSTICA</span>

          <a routerLink="/app/dashboard" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="9"></rect>
                <rect x="14" y="3" width="7" height="5"></rect>
                <rect x="14" y="12" width="7" height="9"></rect>
                <rect x="3" y="16" width="7" height="5"></rect>
              </svg>
            </span>
            <span class="nav-label">Dashboard General</span>
          </a>

          <a routerLink="/app/clients" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </span>
            <span class="nav-label">Clientes & Cuentas</span>
          </a>

          <a routerLink="/app/enterprises" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </span>
            <span class="nav-label">Empresas & Sedes</span>
          </a>

          <span class="nav-heading">PLATAFORMA & RECURSOS</span>

          <a routerLink="/plans" class="nav-item">
            <span class="nav-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </span>
            <span class="nav-label">Planes & Capacidad</span>
          </a>

          <a routerLink="/" class="nav-item">
            <span class="nav-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </span>
            <span class="nav-label">Portal Público</span>
          </a>
        </nav>

        <!-- Footer del Sidebar -->
        <div class="sidebar-footer">
          <div class="tenant-box">
            <div class="tenant-dot"></div>
            <div class="tenant-info">
              <span class="tenant-name">Firmeza Corp Node</span>
              <span class="tenant-status">API Online · v1.0</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- Panel Principal -->
      <div class="main-container">
        <!-- Topbar Superior con Estilo Ejecutivo -->
        <header class="topbar">
          <div class="topbar-left">
            <div class="breadcrumb">
              <span class="bc-root">Firmeza</span>
              <span class="bc-divider">/</span>
              <span class="bc-active">Consola de Administración</span>
            </div>
          </div>

          <div class="topbar-right">
            <!-- Píldora de Perfil de Usuario -->
            <div class="profile-card">
              <div class="avatar-circle">
                {{ userInitials }}
              </div>
              <div class="profile-info">
                <span class="name">{{ userName }}</span>
                <span class="role">{{ userRole }}</span>
              </div>
            </div>

            <!-- Botón de Salir -->
            <button (click)="logout()" class="btn-logout" title="Cerrar Sesión">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Cerrar Sesión</span>
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
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }

    .layout-wrapper {
      display: flex;
      width: 100%;
      height: 100vh;
      overflow: hidden;
    }

    /* Sidebar */
    .sidebar {
      width: 260px;
      min-width: 260px;
      background-color: #0b1120;
      border-right: 1px solid #1e293b;
      display: flex;
      flex-direction: column;
      z-index: 30;
      user-select: none;
    }

    .sidebar-brand {
      padding: 1.25rem 1.4rem;
      border-bottom: 1px solid #1e293b;
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
      color: #3b82f6;
      background: rgba(37, 99, 235, 0.12);
      border: 1px solid rgba(59, 130, 246, 0.25);
      padding: 0.4rem 0.55rem;
      border-radius: 8px;
      box-shadow: 0 0 12px rgba(37, 99, 235, 0.15);
    }

    .brand-text {
      display: flex;
      flex-direction: column;
    }

    .brand-title {
      font-weight: 800;
      font-size: 1.15rem;
      letter-spacing: -0.025em;
      color: #ffffff;
      line-height: 1.1;
    }

    .brand-subtitle {
      font-size: 0.6rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #94a3b8;
    }

    .sidebar-nav {
      flex: 1;
      padding: 1.35rem 0.85rem;
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      overflow-y: auto;
    }

    .nav-heading {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.09em;
      color: #64748b;
      padding: 0.75rem 0.75rem 0.35rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.65rem 0.75rem;
      border-radius: 8px;
      color: #94a3b8;
      text-decoration: none;
      font-size: 0.86rem;
      font-weight: 600;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .nav-item:hover {
      background-color: rgba(255, 255, 255, 0.05);
      color: #ffffff;
      transform: translateX(2px);
    }

    .nav-item.active {
      background: linear-gradient(135deg, rgba(37, 99, 235, 0.95), rgba(29, 78, 216, 0.95));
      color: #ffffff;
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);
    }

    .sidebar-footer {
      padding: 1rem 1.25rem;
      border-top: 1px solid #1e293b;
      background: rgba(15, 23, 42, 0.4);
    }

    .tenant-box {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }

    .tenant-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
    }

    .tenant-info {
      display: flex;
      flex-direction: column;
    }

    .tenant-name {
      font-size: 0.76rem;
      font-weight: 700;
      color: #f1f5f9;
    }

    .tenant-status {
      font-size: 0.66rem;
      color: #64748b;
    }

    /* Main Container */
    .main-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
      min-width: 0;
    }

    /* Topbar */
    .topbar {
      height: 60px;
      min-height: 60px;
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2rem;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.02);
      z-index: 20;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
    }

    .bc-root {
      font-weight: 500;
      color: #64748b;
    }

    .bc-divider {
      color: #cbd5e1;
    }

    .bc-active {
      font-weight: 600;
      color: #0f172a;
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }

    .profile-card {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.25rem 0.5rem;
    }

    .avatar-circle {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      color: #ffffff;
      font-size: 0.82rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
    }

    .profile-info {
      display: flex;
      flex-direction: column;
    }

    .profile-info .name {
      font-size: 0.84rem;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.15;
    }

    .profile-info .role {
      font-size: 0.68rem;
      font-weight: 600;
      color: #2563eb;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .btn-logout {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.48rem 0.85rem;
      border: 1px solid #e2e8f0;
      background: #ffffff;
      color: #ef4444;
      font-size: 0.82rem;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-logout:hover {
      background: #fef2f2;
      border-color: #fecaca;
      transform: translateY(-1px);
    }

    /* Page Viewport */
    .page-viewport {
      flex: 1;
      overflow-y: auto;
      background-color: #f8fafc;
    }

    @media (max-width: 768px) {
      .sidebar {
        width: 68px;
        min-width: 68px;
      }
      .brand-text, .nav-label, .nav-heading, .tenant-info {
        display: none;
      }
      .sidebar-brand {
        padding: 1rem 0;
        justify-content: center;
      }
      .nav-item {
        justify-content: center;
        padding: 0.75rem;
      }
      .topbar {
        padding: 0 1rem;
      }
    }
  `]
})
export class AdminLayoutComponent {
  private readonly authService = inject(AuthService);

  get currentUser() {
    return this.authService.currentUser() || this.authService.getUser();
  }

  get userName(): string {
    return this.currentUser?.fullName || this.currentUser?.email || 'Operador Firmeza';
  }

  get userRole(): string {
    return this.currentUser?.role || 'Administrador';
  }

  get userInitials(): string {
    const name = this.userName.trim();
    if (!name) return 'OF';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  logout(): void {
    this.authService.logout();
  }
}

export const DashboardLayoutComponent = AdminLayoutComponent;
