import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../Services/Api.Service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="home-container">
      <!-- Top Navigation Header -->
      <header class="navbar">
        <div class="nav-left">
          <a routerLink="/" class="brand">
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

        <nav class="nav-links">
          <a href="#caracteristicas">Módulos</a>
          <a href="#metricas">Beneficios</a>
          <a routerLink="/plans">Planes</a>
        </nav>

        <div class="nav-right">
          <a routerLink="/login" class="btn-link-nav">Iniciar Sesión</a>
          <a routerLink="/register" class="btn-primary">Crear Cuenta</a>
        </div>
      </header>

      <!-- Hero Section -->
      <section class="hero-section">
        <div class="badge-pill">
          <span class="badge-blue">{{ apiStatus }}</span>
          <span class="badge-text">Gestión empresarial de inventario, ventas, pedidos y personal</span>
        </div>

        <h1 class="hero-title">
          Control total de inventario y operaciones comerciales en <span class="highlight">Firmeza</span>
        </h1>

        <p class="hero-subtitle">
          Centraliza tu catálogo de productos, controla alertas de stock mínimo, registra pedidos y ventas en tiempo real, y gestiona el acceso de tus empleados desde una sola plataforma.
        </p>

        <div class="hero-actions">
          <a routerLink="/register" class="btn-primary-large">Registrar organización</a>
          <a routerLink="/login" class="btn-secondary-large">Iniciar sesión</a>
        </div>

        <div class="hero-footers">
          <div class="hero-footer-item">
            <span class="check-dot">✓</span>
            <span>Catálogo y stock en tiempo real</span>
          </div>
          <div class="hero-footer-item">
            <span class="check-dot">✓</span>
            <span>Portal para empresas y empleados</span>
          </div>
          <div class="hero-footer-item">
            <span class="check-dot">✓</span>
            <span>Reportes de ingresos y rotación</span>
          </div>
        </div>
      </section>

      <!-- Key Benefits Section -->
      <section id="metricas" class="metrics-section">
        <div class="section-header center">
          <span class="tag-blue">GESTIÓN CENTRALIZADA</span>
          <h2>Todo lo que necesitas para operar tu almacén y ventas</h2>
          <p>Herramientas prácticas conectadas directamente a la base de datos de tu empresa.</p>
        </div>

        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon blue-bg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              </svg>
            </div>
            <div class="metric-title">Control de Inventario</div>
            <div class="metric-desc">Registra productos con SKU, categoría, ubicación, precio de costo, precio de venta y umbral de stock mínimo.</div>
            <div class="metric-foot">ALERTAS AUTOMÁTICAS DE STOCK</div>
          </div>

          <div class="metric-card">
            <div class="metric-icon red-bg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div class="metric-title">Pedidos y Ventas</div>
            <div class="metric-desc">Diferencia claramente pedidos pendientes de cobro (en rojo) y ventas completadas (en verde) con descuento automático de stock.</div>
            <div class="metric-foot">CONTROL DE FLUJO DE CAJA</div>
          </div>

          <div class="metric-card">
            <div class="metric-icon purple-bg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
              </svg>
            </div>
            <div class="metric-title">Portal de Empleados</div>
            <div class="metric-desc">Da de alta a tu personal operativo para que accedan con su número de cédula a sus tareas de inventario y despacho.</div>
            <div class="metric-foot">ACCESO POR ROLES</div>
          </div>

          <div class="metric-card">
            <div class="metric-icon cyan-bg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
            </div>
            <div class="metric-title">Reportes y Analítica</div>
            <div class="metric-desc">Consulta la valoración financiera de tu inventario, ingresos por período, distribución por categoría y productos críticos.</div>
            <div class="metric-foot">FILTROS POR FECHA EN VIVO</div>
          </div>
        </div>
      </section>

      <!-- Modular Features Section -->
      <section id="caracteristicas" class="features-section">
        <div class="section-header center">
          <span class="tag-blue">MÓDULOS DEL SISTEMA</span>
          <h2>Diseñado para una operación clara y sin complicaciones</h2>
          <p>Cada módulo trabaja sobre datos reales de tu empresa con actualización instantánea.</p>
        </div>

        <div class="features-row-large">
          <div class="feature-big-card">
            <div class="feature-badge">INVENTARIO Y ALMACÉN</div>
            <h3>Gestión de Productos y Ubicaciones</h3>
            <p>Organiza tus artículos por categoría y ubicación en almacén. Identifica de inmediato qué productos están disponibles, en stock bajo o sin stock.</p>

            <div class="bay-selector-mockup">
              <div class="bay-pill active">
                <span>ESTADO</span>
                <strong>DISPONIBLE</strong>
              </div>
              <div class="bay-pill">
                <span>ALERTA</span>
                <strong>STOCK BAJO</strong>
              </div>
              <div class="bay-pill">
                <span>CRÍTICO</span>
                <strong>SIN STOCK</strong>
              </div>
              <div class="bay-pill">
                <span>VALUACIÓN</span>
                <strong>COSTO Y VENTA</strong>
              </div>
            </div>
          </div>

          <div class="feature-big-card">
            <div class="feature-badge">MOVIMIENTOS Y CLIENTES</div>
            <h3>Seguimiento de Pedidos y Ventas</h3>
            <p>Registra clientes y asocia cada movimiento de inventario a su comprador, método de pago y estado de cobro, permitiendo confirmar ventas con un solo clic.</p>

            <div class="hardware-mockup-box">
              <div class="hw-icon-box">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div class="hw-info">
                <strong>ACTUALIZACIÓN AUTOMÁTICA DE EXISTENCIAS</strong>
                <small>Cada pedido o venta ajusta el stock disponible al instante</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Call To Action Banner Section -->
      <section class="cta-section">
        <div class="cta-box">
          <span class="cta-tag">COMIENZA AHORA</span>
          <h2>Administra el inventario de tu empresa con Firmeza</h2>
          <p>Crea tu cuenta empresarial o inicia sesión para acceder a tu panel de control.</p>

          <div class="cta-buttons">
            <a routerLink="/register" class="btn-primary-large">Crear Cuenta Empresarial</a>
            <a routerLink="/plans" class="btn-secondary-dark">Ver Planes</a>
          </div>
        </div>
      </section>

      <!-- Footer Section -->
      <footer class="footer">
        <div class="footer-top">
          <div class="footer-brand">
            <div class="brand">
              <span class="brand-logo">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </span>
              <div class="brand-text">
                <span class="brand-title">Firmeza</span>
              </div>
            </div>
            <p>
              Plataforma de gestión de inventarios, control de movimientos comerciales y administración de personal.
            </p>
          </div>

          <div class="footer-cols">
            <div class="footer-col">
              <h5>PLATAFORMA</h5>
              <a href="#caracteristicas">Módulos</a>
              <a href="#metricas">Beneficios</a>
              <a routerLink="/plans">Planes y Precios</a>
            </div>

            <div class="footer-col">
              <h5>ACCESO</h5>
              <a routerLink="/login">Iniciar Sesión</a>
              <a routerLink="/register">Registrar Empresa</a>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          <span>© 2026 Firmeza Technologies. Todos los derechos reservados.</span>
          <div class="footer-bottom-right">
            <span>PLATAFORMA ESTABLE</span>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      color: #0f172a;
      background-color: #f8fafc;
    }

    .home-container {
      width: 100%;
      min-height: 100vh;
      box-sizing: border-box;
      animation: fadeIn 0.35s ease-out;
    }

    /* Header */
    .navbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.1rem 3.5rem;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid #e2e8f0;
      position: sticky;
      top: 0;
      z-index: 50;
      transition: all 0.2s ease;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
    }

    .brand-logo {
      display: flex;
      align-items: center;
      justify-content: center;
      color: #1d4ed8;
      background: #eff6ff;
      border: 1px solid #dbeafe;
      padding: 0.35rem 0.55rem;
      border-radius: 8px;
    }

    .brand-text {
      display: flex;
      flex-direction: column;
    }

    .brand-title {
      font-weight: 800;
      font-size: 1.2rem;
      letter-spacing: -0.025em;
      color: #0f172a;
      line-height: 1.1;
    }

    .brand-subtitle {
      font-size: 0.62rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: #64748b;
    }

    .nav-links {
      display: flex;
      gap: 2rem;
    }

    .nav-links a {
      text-decoration: none;
      color: #475569;
      font-size: 0.9rem;
      font-weight: 600;
      transition: all 0.2s ease;
      padding: 0.35rem 0.6rem;
      border-radius: 6px;
    }

    .nav-links a:hover {
      color: #2563eb;
      background: #f1f5f9;
    }

    .nav-right {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }

    .btn-link-nav {
      background: none;
      border: none;
      color: #334155;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      text-decoration: none;
      padding: 0.5rem 0.8rem;
      border-radius: 6px;
      transition: all 0.2s ease;
    }

    .btn-link-nav:hover {
      color: #1d4ed8;
      background: #f8fafc;
    }

    .btn-primary {
      background: #1d4ed8;
      color: #ffffff;
      border: 1px solid #1e40af;
      padding: 0.6rem 1.35rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.88rem;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px -2px rgba(29, 78, 216, 0.3);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .btn-primary:hover {
      background: #1e40af;
      transform: translateY(-1px);
      box-shadow: 0 6px 14px -2px rgba(29, 78, 216, 0.4);
    }

    /* Hero Section */
    .hero-section {
      text-align: center;
      padding: 5rem 1.5rem 4rem;
      max-width: 920px;
      margin: 0 auto;
    }

    .badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 50px;
      padding: 0.3rem 0.95rem;
      font-size: 0.82rem;
      margin-bottom: 1.75rem;
      box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
    }

    .badge-blue {
      background: #eff6ff;
      color: #2563eb;
      font-weight: 700;
      font-size: 0.68rem;
      padding: 0.18rem 0.55rem;
      border-radius: 12px;
      border: 1px solid #bfdbfe;
      text-transform: uppercase;
    }

    .badge-text {
      color: #475569;
      font-weight: 600;
    }

    .hero-title {
      font-size: 3rem;
      font-weight: 800;
      line-height: 1.18;
      letter-spacing: -0.035em;
      color: #0f172a;
      margin-bottom: 1.35rem;
    }

    .hero-title .highlight {
      color: #1d4ed8;
      background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .hero-subtitle {
      font-size: 1.1rem;
      color: #64748b;
      line-height: 1.65;
      margin-bottom: 2.25rem;
      max-width: 760px;
      margin-left: auto;
      margin-right: auto;
    }

    .hero-actions {
      display: flex;
      justify-content: center;
      gap: 1.15rem;
      margin-bottom: 2.5rem;
    }

    .btn-primary-large {
      background: #1d4ed8;
      color: #ffffff;
      border: 1px solid #1e40af;
      padding: 0.85rem 1.85rem;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.95rem;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      box-shadow: 0 8px 16px -4px rgba(29, 78, 216, 0.35);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .btn-primary-large:hover {
      background: #1e40af;
      transform: translateY(-2px);
      box-shadow: 0 12px 20px -4px rgba(29, 78, 216, 0.45);
    }

    .btn-secondary-large {
      background: #ffffff;
      color: #334155;
      border: 1px solid #cbd5e1;
      padding: 0.85rem 1.85rem;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.04);
      transition: all 0.2s ease;
    }

    .btn-secondary-large:hover {
      background: #f8fafc;
      border-color: #94a3b8;
      transform: translateY(-1px);
    }

    .hero-footers {
      display: flex;
      justify-content: center;
      gap: 2rem;
      font-size: 0.82rem;
      color: #64748b;
      font-weight: 500;
      flex-wrap: wrap;
    }

    .hero-footer-item {
      display: flex;
      align-items: center;
      gap: 0.45rem;
    }

    .check-dot {
      color: #2563eb;
      font-size: 0.8rem;
      font-weight: 700;
    }

    /* Metrics Section */
    .metrics-section {
      max-width: 1180px;
      margin: 0 auto 5rem;
      padding: 0 1.5rem;
    }

    .section-header {
      margin-bottom: 2.75rem;
    }

    .section-header.center {
      text-align: center;
    }

    .tag-blue {
      color: #1d4ed8;
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 0.05em;
    }

    .section-header h2 {
      font-size: 2.1rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.025em;
      margin: 0.5rem 0;
    }

    .section-header p {
      color: #64748b;
      font-size: 0.98rem;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .metric-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 1.75rem;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.04);
      transition: transform 0.25s ease, box-shadow 0.25s ease;
    }

    .metric-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 20px -4px rgba(15, 23, 42, 0.08);
      border-color: #cbd5e1;
    }

    .metric-icon {
      width: 38px;
      height: 38px;
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.1rem;
    }
    .blue-bg { background: #eff6ff; color: #1d4ed8; }
    .red-bg { background: #fef2f2; color: #dc2626; }
    .purple-bg { background: #f3e8ff; color: #9333ea; }
    .cyan-bg { background: #ecfeff; color: #0891b2; }

    .metric-title {
      font-weight: 700;
      font-size: 1.05rem;
      color: #1e293b;
      margin-bottom: 0.5rem;
    }

    .metric-desc {
      font-size: 0.84rem;
      color: #64748b;
      line-height: 1.55;
      margin-bottom: 1.5rem;
      flex-grow: 1;
    }

    .metric-foot {
      font-size: 0.68rem;
      font-weight: 800;
      color: #475569;
      background: #f8fafc;
      border: 1px solid #f1f5f9;
      padding: 0.45rem 0.65rem;
      border-radius: 6px;
      letter-spacing: 0.03em;
    }

    /* Features Section */
    .features-section {
      max-width: 1180px;
      margin: 0 auto 5rem;
      padding: 0 1.5rem;
    }

    .features-row-large {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.75rem;
    }

    .feature-big-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 2.25rem;
      box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.04);
      transition: transform 0.25s ease;
    }

    .feature-big-card:hover {
      transform: translateY(-2px);
    }

    .feature-badge {
      display: inline-block;
      font-size: 0.68rem;
      font-weight: 800;
      color: #1d4ed8;
      background: #eff6ff;
      border: 1px solid #dbeafe;
      padding: 0.25rem 0.6rem;
      border-radius: 5px;
      margin-bottom: 1rem;
    }

    .feature-big-card h3 {
      font-size: 1.35rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
      margin-bottom: 0.75rem;
    }

    .feature-big-card p {
      font-size: 0.88rem;
      color: #64748b;
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }

    .bay-selector-mockup {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.85rem;
    }

    .bay-pill {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 0.75rem 0.9rem;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      transition: all 0.2s ease;
    }

    .bay-pill.active {
      border-color: #3b82f6;
      background: #eff6ff;
      box-shadow: 0 2px 6px rgba(37, 99, 235, 0.1);
    }

    .bay-pill span {
      font-size: 0.65rem;
      color: #64748b;
      font-weight: 600;
    }

    .bay-pill strong {
      font-size: 0.8rem;
      color: #1d4ed8;
    }

    .hardware-mockup-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 1.25rem;
      border-radius: 10px;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .hw-icon-box {
      color: #16a34a;
      display: flex;
      align-items: center;
    }

    .hw-info strong {
      display: block;
      font-size: 0.8rem;
      color: #334155;
    }

    .hw-info small {
      font-size: 0.72rem;
      color: #64748b;
    }

    /* CTA Section */
    .cta-section {
      max-width: 1180px;
      margin: 0 auto 5rem;
      padding: 0 1.5rem;
    }

    .cta-box {
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      color: #ffffff;
      border-radius: 20px;
      padding: 4rem 2rem;
      text-align: center;
      box-shadow: 0 20px 30px -10px rgba(15, 23, 42, 0.25);
    }

    .cta-tag {
      color: #60a5fa;
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 0.06em;
    }

    .cta-box h2 {
      font-size: 2.2rem;
      font-weight: 800;
      margin: 1rem 0;
      letter-spacing: -0.03em;
    }

    .cta-box p {
      color: #94a3b8;
      max-width: 620px;
      margin: 0 auto 2rem;
      font-size: 1rem;
      line-height: 1.6;
    }

    .cta-buttons {
      display: flex;
      justify-content: center;
      gap: 1.25rem;
    }

    .btn-secondary-dark {
      background: rgba(255, 255, 255, 0.08);
      color: #f8fafc;
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 0.85rem 1.85rem;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.95rem;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      transition: all 0.2s ease;
    }

    .btn-secondary-dark:hover {
      background: rgba(255, 255, 255, 0.15);
      transform: translateY(-1px);
    }

    /* Footer */
    .footer {
      background: #ffffff;
      border-top: 1px solid #e2e8f0;
      padding: 4rem 3.5rem 2.5rem;
    }

    .footer-top {
      display: grid;
      grid-template-columns: 360px 1fr;
      gap: 3.5rem;
      margin-bottom: 3rem;
    }

    .footer-brand p {
      font-size: 0.85rem;
      color: #64748b;
      margin-top: 1.1rem;
      line-height: 1.6;
    }

    .footer-cols {
      display: grid;
      grid-template-columns: repeat(2, 200px);
      gap: 2rem;
      justify-content: flex-end;
    }

    .footer-col h5 {
      font-size: 0.75rem;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 1.1rem;
      letter-spacing: 0.05em;
    }

    .footer-col a {
      display: block;
      color: #64748b;
      text-decoration: none;
      font-size: 0.82rem;
      margin-bottom: 0.65rem;
      transition: color 0.2s ease;
    }

    .footer-col a:hover {
      color: #1d4ed8;
    }

    .footer-bottom {
      display: flex;
      justify-content: space-between;
      border-top: 1px solid #f1f5f9;
      padding-top: 1.75rem;
      font-size: 0.78rem;
      color: #94a3b8;
    }

    .footer-bottom-right {
      display: flex;
      gap: 1.5rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.72rem;
      font-weight: 600;
    }

    @media (max-width: 900px) {
      .navbar { padding: 1rem 1.5rem; }
      .nav-links { display: none; }
      .features-row-large { grid-template-columns: 1fr; }
      .footer-top { grid-template-columns: 1fr; }
      .footer-cols { justify-content: flex-start; }
      .hero-title { font-size: 2.25rem; }
    }
  `]
})
export class HomeComponent implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly cdr = inject(ChangeDetectorRef);

  apiStatus = 'DISPONIBLE';

  ngOnInit(): void {
    this.apiService.getHomeData().subscribe({
      next: (data: any) => {
        if (data?.status) {
          this.apiStatus = data.status === 'Online' ? 'SISTEMA EN LÍNEA' : data.status;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        // Keep default badge text
      }
    });
  }
}
