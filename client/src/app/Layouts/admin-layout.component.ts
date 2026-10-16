import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
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
          <!-- Logo Operativo Empleado -->
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
              <span class="brand-sub">INS ENTERPRISE</span>
            </div>
          </div>

          <!-- Navegación Operativa Empleado -->
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

          <!-- Footer Estación Activa Empleado -->
          <div class="sidebar-footer">
            <div class="station-card">
              <div class="station-header">
                <span class="station-label">ESTACIÓN ACTIVA</span>
                <span class="terminal-pill">
                  <span class="dot-online"></span>
                  TER-04
                </span>
              </div>
              <div class="scanner-status-row">
                <span class="scanner-text">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 7V5a2 2 0 0 1 2-2h2"></path>
                    <path d="M17 3h2a2 2 0 0 1 2 2v2"></path>
                    <path d="M21 17v2a2 2 0 0 1-2 2h-2"></path>
                    <path d="M7 21H5a2 2 0 0 1-2-2v-2"></path>
                    <line x1="7" y1="12" x2="17" y2="12"></line>
                  </svg>
                  Escáner Laser
                </span>
                <span class="scanner-badge-ok">V39-OK</span>
              </div>
            </div>
          </div>
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

          <div class="sidebar-footer">
            <div class="scanner-badge">
              <div class="scanner-status">
                <span class="scanner-dot"></span>
                <span class="scanner-text">SCANNER ONLINE</span>
              </div>
              <span class="scanner-wh">WH-01</span>
            </div>
          </div>
        </ng-template>
      </aside>

      <!-- Panel Principal -->
      <div class="main-container">
        <!-- Topbar Superior con adaptación dinámica -->
        <header class="topbar">
          <!-- TOPBAR PARA EMPLEADOS (Panel Operativo) -->
          <ng-container *ngIf="isEmployee; else enterpriseTopbar">
            <div class="topbar-left employee-topbar-left">
              <button 
                (click)="toggleSidebar()" 
                class="topbar-icon-btn hamburger-btn" 
                [class.active]="isSidebarCollapsed"
                title="Alternar menú lateral"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>

              <div class="badge-warehouse">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <span>Almacén Central <span class="wh-tag">(WH-01)</span></span>
              </div>

              <div class="badge-laser-online">
                <span class="dot-pulse"></span>
                <span>LASER SCANNER ONLINE</span>
              </div>
            </div>

            <div class="topbar-right">
              <button class="topbar-icon-btn" title="Notificaciones de almacén">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <span class="red-notification-dot"></span>
              </button>

              <div class="user-profile-widget">
                <div class="profile-info-block">
                  <span class="profile-name">{{ employeeName }}</span>
                  <span class="profile-role">{{ employeeRole }}</span>
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
          </ng-container>

          <!-- TOPBAR PARA GESTIÓN EMPRESARIAL / ADMINISTRADOR -->
          <ng-template #enterpriseTopbar>
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
              <button class="topbar-icon-btn" title="Notificaciones">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <span class="red-notification-dot"></span>
              </button>

              <button class="topbar-icon-btn" title="Historial">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </button>

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

              <button (click)="logout()" class="topbar-icon-btn" title="Cerrar Sesión">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            </div>
          </ng-template>
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

    /* Sidebar con sombras sutiles y ancho óptimo */
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

    /* Estilos de marca específicos del Operador Logístico / Empleado */
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

    /* Footer del Sidebar */
    .sidebar-footer {
      padding: 0.85rem;
      border-top: 1px solid rgba(241, 245, 249, 0.9);
      background-color: #ffffff;
    }

    .scanner-badge {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.55rem 0.75rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
    }

    .scanner-status {
      display: flex;
      align-items: center;
      gap: 0.45rem;
    }

    .scanner-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background-color: #10b981;
      box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
      animation: pulseDot 2s infinite;
    }

    .scanner-text {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: #334155;
    }

    .scanner-wh {
      font-size: 0.65rem;
      font-weight: 700;
      color: #2563eb;
      background: #eff6ff;
      padding: 0.1rem 0.4rem;
      border-radius: 4px;
      border: 1px solid #dbeafe;
    }

    /* Tarjeta de Estación Activa del Empleado */
    .station-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 0.65rem 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .station-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .station-label {
      font-size: 0.62rem;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 0.05em;
    }

    .terminal-pill {
      font-size: 0.65rem;
      font-weight: 700;
      color: #166534;
      background: #dcfce7;
      padding: 0.15rem 0.45rem;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }

    .dot-online {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #22c55e;
      animation: pulseDot 2s infinite;
    }

    .scanner-status-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.7rem;
      color: #475569;
    }

    .scanner-badge-ok {
      background: #eff6ff;
      color: #2563eb;
      font-weight: 700;
      font-size: 0.65rem;
      padding: 0.1rem 0.4rem;
      border-radius: 4px;
    }

    /* Contenedor Principal */
    .main-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      height: 100vh;
      overflow: hidden;
      background-color: #f8fafc;
    }

    /* Topbar Superior */
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

    .employee-topbar-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .badge-warehouse {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      background: #eff6ff;
      color: #1e40af;
      border: 1px solid #dbeafe;
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      font-size: 0.78rem;
      font-weight: 600;
    }

    .wh-tag {
      color: #2563eb;
      font-weight: 700;
    }

    .badge-laser-online {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      background: #f0fdf4;
      color: #15803d;
      border: 1px solid #bbf7d0;
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.03em;
    }

    .dot-pulse {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #22c55e;
      animation: pulseDot 1.5s infinite;
    }

    @keyframes pulseDot {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 5px rgba(34, 197, 94, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
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

    .red-notification-dot {
      position: absolute;
      top: 6px;
      right: 6px;
      width: 7px;
      height: 7px;
      background-color: #ef4444;
      border-radius: 50%;
      border: 1.5px solid #ffffff;
    }

    .topbar-search {
      position: relative;
      width: 320px;
    }

    .search-icon {
      position: absolute;
      left: 11px;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
    }

    .search-input {
      width: 100%;
      height: 36px;
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 0 2.2rem 0 2.3rem;
      font-size: 0.78rem;
      color: #0f172a;
      transition: all 0.15s ease;
    }

    .search-input:focus {
      outline: none;
      background-color: #ffffff;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
    }

    .barcode-icon {
      position: absolute;
      right: 11px;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
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
  private readonly router = inject(Router);
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
    return this.currentUser?.fullName || this.currentUser?.email || 'Admin Inventario';
  }

  get userRole(): string {
    return this.currentUser?.role || 'Super Administrador';
  }

  get employeeName(): string {
    return this.currentUser?.fullName || 'Carlos Mendoza';
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
