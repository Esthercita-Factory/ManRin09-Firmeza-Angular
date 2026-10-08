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
      <!-- Sidebar Lateral Blanco (Enterprise IMS) -->
      <aside class="sidebar" [class.collapsed]="isSidebarCollapsed">
        <!-- Brand / Logotipo -->
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

        <!-- Navegación Primaria -->
        <nav class="sidebar-nav">
          <span class="nav-heading">GESTIÓN PRINCIPAL</span>

          <a routerLink="/app/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: false}" class="nav-item">
            <span class="nav-icon">
              <!-- Grid 4 cuadrados -->
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
              <!-- Caja inventario -->
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
              <!-- Flechas de movimiento horizontal -->
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m7 16-4-4 4-4"></path>
                <path d="M3 12h18"></path>
                <path d="m17 8 4 4-4 4"></path>
              </svg>
            </span>
            <span class="nav-label">Movimientos y Pedidos</span>
          </a>

          <a routerLink="/app/clients" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">
              <!-- Camión proveedores -->
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
            </span>
            <span class="nav-label">Proveedores</span>
          </a>

          <a routerLink="/app/reports" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">
              <!-- Gráfica analíticas -->
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
              <!-- Icono Usuarios / Empleados -->
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </span>
            <span class="nav-label">Administrar Empleados</span>
          </a>

          <a routerLink="/app/dashboard" class="nav-item">
            <span class="nav-icon">
              <!-- Engranaje configuración -->
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </span>
            <span class="nav-label">Configuración</span>
          </a>
        </nav>

        <!-- Footer del Sidebar con estado SCANNER ONLINE WH-01 -->
        <div class="sidebar-footer">
          <div class="scanner-badge">
            <div class="scanner-status">
              <span class="scanner-dot"></span>
              <span class="scanner-text">SCANNER ONLINE</span>
            </div>
            <span class="scanner-wh">WH-01</span>
          </div>
        </div>
      </aside>

      <!-- Panel Principal -->
      <div class="main-container">
        <!-- Topbar Superior Empresarial -->
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

            <div class="topbar-search">
              <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input 
                type="text" 
                placeholder="Buscar por SKU, código de barras o lote..." 
                class="search-input" 
              />
              <svg class="barcode-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 7V5a2 2 0 0 1 2-2h2"></path>
                <path d="M17 3h2a2 2 0 0 1 2 2v2"></path>
                <path d="M21 17v2a2 2 0 0 1-2 2h-2"></path>
                <path d="M7 21H5a2 2 0 0 1-2-2v-2"></path>
                <line x1="7" y1="12" x2="17" y2="12"></line>
              </svg>
            </div>
          </div>

          <div class="topbar-right">
            <!-- Botón Notificaciones -->
            <button class="topbar-icon-btn" title="Notificaciones">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <span class="red-notification-dot"></span>
            </button>

            <!-- Botón Historial -->
            <button class="topbar-icon-btn" title="Historial">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </button>

            <!-- Perfil de Usuario -->
            <div class="user-profile-widget">
              <div class="profile-info-block">
                <span class="profile-name">{{ userName }}</span>
                <span class="profile-role">{{ userRole }}</span>
              </div>
              <div class="profile-avatar-circle">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
            </div>

            <!-- Botón Logout -->
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

    /* Sidebar Blanco Corporativo con sombras sutiles y profundidad */
    .sidebar {
      width: 220px;
      min-width: 220px;
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
      margin-left: -220px;
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
      box-shadow: 0 4px 14px -1px rgba(37, 99, 235, 0.35), 0 2px 4px -1px rgba(37, 99, 235, 0.2);
    }

    .nav-item.active:hover {
      transform: none;
    }

    .nav-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      flex-shrink: 0;
    }

    .sidebar-footer {
      padding: 0.95rem;
      border-top: 1px solid rgba(241, 245, 249, 0.9);
      background: #ffffff;
    }

    .scanner-badge {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 0.45rem 0.75rem;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8);
    }

    .scanner-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .scanner-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #3b82f6;
      box-shadow: 0 0 8px rgba(59, 130, 246, 0.8);
      animation: scannerPulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1);
    }

    @keyframes scannerPulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.9); }
    }

    .scanner-text {
      font-size: 0.62rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      color: #475569;
    }

    .scanner-wh {
      font-size: 0.62rem;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      color: #1e293b;
      background: #e2e8f0;
      padding: 0.1rem 0.35rem;
      border-radius: 4px;
    }

    /* Main Container */
    .main-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
      min-width: 0;
      background: #f8fafc;
    }

    /* Topbar con elevación sutil y aspecto moderno */
    .topbar {
      height: 56px;
      min-height: 56px;
      background: #ffffff;
      border-bottom: 1px solid rgba(226, 232, 240, 0.85);
      box-shadow: 0 1px 4px 0 rgba(15, 23, 42, 0.03), 0 4px 16px -2px rgba(15, 23, 42, 0.03);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.75rem;
      z-index: 20;
    }

    .topbar-left {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      flex: 1;
    }

    .hamburger-btn {
      color: #475569;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
    }

    .hamburger-btn:hover {
      background: #eff6ff;
      color: #2563eb;
      border-color: #bfdbfe;
    }

    .hamburger-btn.active {
      background: #eff6ff;
      color: #2563eb;
      border-color: #bfdbfe;
    }

    .topbar-search {
      display: flex;
      align-items: center;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 0.4rem 0.75rem;
      width: 440px;
      max-width: 45%;
      gap: 0.55rem;
      box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.03), inset 0 1px 2px 0 rgba(15, 23, 42, 0.02);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .topbar-search:focus-within {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12), 0 2px 6px rgba(15, 23, 42, 0.05);
    }

    .search-icon, .barcode-icon {
      color: #94a3b8;
      flex-shrink: 0;
      transition: color 0.15s ease;
    }

    .topbar-search:focus-within .search-icon {
      color: #2563eb;
    }

    .search-input {
      border: none;
      outline: none;
      background: transparent;
      font-size: 0.78rem;
      font-family: inherit;
      color: #0f172a;
      width: 100%;
    }

    .search-input::placeholder {
      color: #94a3b8;
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .topbar-icon-btn {
      position: relative;
      background: transparent;
      border: 1px solid transparent;
      color: #64748b;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.45rem;
      border-radius: 8px;
      transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .topbar-icon-btn:hover {
      background: #f1f5f9;
      color: #0f172a;
      border-color: #e2e8f0;
      box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
      transform: translateY(-1px);
    }

    .red-notification-dot {
      position: absolute;
      top: 5px;
      right: 5px;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #ef4444;
      border: 1.5px solid #ffffff;
      box-shadow: 0 0 4px rgba(239, 68, 68, 0.5);
    }

    .user-profile-widget {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.3rem 0.55rem;
      border-radius: 8px;
      border: 1px solid transparent;
      transition: all 0.15s ease;
      cursor: default;
    }

    .user-profile-widget:hover {
      background: #f8fafc;
      border-color: #f1f5f9;
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
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, #2563eb, #1e40af);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.28);
      border: 2px solid #ffffff;
    }

    /* Page Viewport */
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

  get currentUser() {
    return this.authService.currentUser() || this.authService.getUser();
  }

  get userName(): string {
    return this.currentUser?.fullName || this.currentUser?.email || 'Admin Inventario';
  }

  get userRole(): string {
    return this.currentUser?.role || 'Super Administrador';
  }

  logout(): void {
    this.authService.logout();
  }
}

export const DashboardLayoutComponent = AdminLayoutComponent;
