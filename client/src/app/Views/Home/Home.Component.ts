import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../Services/Api.Service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="home-container">
      <!-- Top Navigation Header -->
      <header class="navbar">
        <div class="nav-left">
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
              <span class="brand-subtitle">INVENTORY PLATFORM</span>
            </div>
          </div>
        </div>

        <nav class="nav-links">
          <a href="#producto">Producto</a>
          <a href="#caracteristicas">Características</a>
          <a href="#soluciones">Soluciones</a>
          <a href="#metricas">Métricas</a>
          <a href="#precios">Precios</a>
        </nav>

        <div class="nav-right">
          <a href="/login" class="btn-link-nav">Iniciar Sesión</a>
          <a href="/register" class="btn-primary">Comenzar Gratis</a>
        </div>
      </header>

      <!-- Hero Section -->
      <section class="hero-section">
        <div class="badge-pill">
          <span class="badge-blue">DISPONIBLE</span>
          <span class="badge-text">Gestión inteligente de inventario y trazabilidad multialmacén</span>
        </div>

        <h1 class="hero-title">
          Control total de inventario con precisión operativa en <span class="highlight">Firmeza</span>
        </h1>

        <p class="hero-subtitle">
          Centraliza almacenes, automatiza el cálculo de stock crítico y optimiza cada flujo logístico en una plataforma modular y ágil.
        </p>

        <div class="hero-actions">
          <a href="/register" class="btn-primary-large">Comenzar prueba gratis</a>
          <a href="/login" class="btn-secondary-large">Explorar terminal</a>
        </div>

        <div class="hero-footers">
          <div class="hero-footer-item">
            <span class="check-dot">✓</span>
            <span>Sin tarjeta requerida</span>
          </div>
          <div class="hero-footer-item">
            <span class="check-dot">✓</span>
            <span>Despliegue ágil</span>
          </div>
          <div class="hero-footer-item">
            <span class="check-dot">✓</span>
            <span>Integración nativa vía API</span>
          </div>
        </div>
      </section>

      <!-- Interactive Mockup / Dashboard Preview Section -->
      <section class="mockup-section">
        <div class="mockup-card">
          <!-- Mockup Header -->
          <div class="mockup-header">
            <div class="window-dots">
              <span class="dot red"></span>
              <span class="dot yellow"></span>
              <span class="dot green"></span>
              <span class="hub-tag">PANEL CENTRAL // OPERACIÓN EN VIVO</span>
            </div>
            <div class="mockup-header-right">
              <span class="status-badge">TELEMETRÍA ACTIVA</span>
              <span class="info-pill">BAHÍAS 30</span>
              <span class="info-pill">CONCILIACIÓN 24/7</span>
            </div>
          </div>

          <!-- Mockup Grid Content -->
          <div class="mockup-body">
            <!-- Left Cards Column -->
            <div class="mockup-left">
              <!-- Reorden Alert Card -->
              <div class="alert-box red-alert">
                <div class="alert-header">
                  <span class="alert-title">Alerta: Reorden Requerido</span>
                  <span class="alert-tag">CRÍTICO</span>
                </div>
                <p class="alert-desc">
                  SKU-7729-AX (Válvula Reguladora Hidráulica 2") ha caído bajo el stock de seguridad proyectado (14 u. restantes).
                </p>
                <div class="alert-footer">
                  <span>Lead Time: 16 hrs</span>
                  <button class="btn-alert-action">DISPARAR P.O.</button>
                </div>
              </div>

              <!-- Confiabilidad Card -->
              <div class="stat-box">
                <div class="stat-header">
                  <span class="stat-label">CONFIABILIDAD DE LOTE</span>
                  <div class="circular-chart">
                    <span>99.94%</span>
                  </div>
                </div>
                <div class="stat-footer text-green">
                  <span>+0.4% vs mes anterior</span>
                </div>
              </div>

              <!-- Capacidad Bahías Card -->
              <div class="stat-box">
                <div class="stat-row">
                  <span class="stat-label">Capacidad Bahías Nave Central</span>
                  <span class="stat-val-blue">82.4%</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 82.4%"></div>
                </div>
                <div class="stat-sub">
                  <span>12,405 Tarimas ocupadas</span>
                  <span>2,678 disponibles</span>
                </div>
              </div>
            </div>

            <!-- Right Visual Graph & Table Column -->
            <div class="mockup-right">
              <!-- Chart Header -->
              <div class="chart-container">
                <div class="chart-header">
                  <span class="chart-title">Flujo de Entrada y Salida Semanal</span>
                  <div class="chart-legend">
                    <span class="legend-blue">Entradas (+34.2k)</span>
                    <span class="legend-dark">Despachos (-31.8k)</span>
                  </div>
                </div>
                <p class="chart-sub">Despachos vs Recepciones sincronizadas con terminales</p>
                
                <!-- SVG Line Graph Simulation -->
                <div class="chart-svg-wrapper">
                  <svg viewBox="0 0 600 120" class="chart-svg">
                    <path d="M0,90 Q75,30 150,70 T300,50 T450,90 T600,20" fill="none" stroke="#2563eb" stroke-width="2.5"/>
                    <path d="M0,90 Q75,30 150,70 T300,50 T450,90 T600,20 L600,120 L0,120 Z" fill="url(#blue-grad)" opacity="0.12"/>
                    <circle cx="150" cy="70" r="4.5" fill="#2563eb"/>
                    <circle cx="300" cy="50" r="4.5" fill="#2563eb"/>
                    <circle cx="450" cy="90" r="4.5" fill="#2563eb"/>
                    <circle cx="580" cy="25" r="4.5" fill="#2563eb"/>
                    <defs>
                      <linearGradient id="blue-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#2563eb"/>
                        <stop offset="100%" stop-color="#ffffff"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>

              <!-- Table Data -->
              <div class="table-container">
                <div class="table-header">
                  <span>TELEMETRÍA DE LOTES EN TRÁNSITO</span>
                  <span class="sync-tag">ACTUALIZADO</span>
                </div>
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>SKU / LOTE</th>
                      <th>UBICACIÓN BAHÍA</th>
                      <th>EXISTENCIA</th>
                      <th>ROTACIÓN</th>
                      <th>ESTADO</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="code-text">PME-9910-K<br/><small>LOT-2026-X8</small></td>
                      <td>PASILLO-D // RACK-04-B</td>
                      <td>1,240 pzs</td>
                      <td><span class="badge-gray">Clase A (Alta)</span></td>
                      <td><span class="badge-status-blue">CONCILIADO</span></td>
                    </tr>
                    <tr>
                      <td class="code-text">PME-3104-M<br/><small>LOT-2026-N2</small></td>
                      <td>CROSSDOCK // ANDÉN-08</td>
                      <td>480 pzs</td>
                      <td><span class="badge-gray">Clase B (Media)</span></td>
                      <td><span class="badge-status-cyan">EN RECEPCIÓN</span></td>
                    </tr>
                    <tr>
                      <td class="code-text">PME-0882-P<br/><small>LOT-2026-F9</small></td>
                      <td>SÓTANO-FRÍO // RACK-01</td>
                      <td>14 pzs</td>
                      <td><span class="badge-gray-red">Clase A (Crítica)</span></td>
                      <td><span class="badge-status-red">QUIEBRE PRÓX.</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- High Volume Logos Banner -->
      <section class="logos-section">
        <div class="logos-label">
          <span>CONFIANZA EMPRESARIAL</span>
          <small>Diseñado para operaciones logísticas de alto volumen</small>
        </div>
        <div class="logos-grid">
          <span class="logo-item">LogTrans Logistics</span>
          <span class="logo-item">GlobalPack</span>
          <span class="logo-item">Siderúrgica Norte</span>
          <span class="logo-item">RetailLink Global</span>
          <span class="logo-item">Apex Supply</span>
        </div>
      </section>

      <!-- Key Metrics Section -->
      <section id="metricas" class="metrics-section">
        <div class="section-header">
          <span class="tag-blue">IMPACTO DIRECTO EN RESULTADOS</span>
          <h2>Rendimiento comprobado en centros de distribución</h2>
          <p>Métricas de eficiencia calculadas a través de flujos logísticos en tiempo real.</p>
        </div>

        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon blue-bg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div class="metric-value">99.8%</div>
            <div class="metric-title">Precisión en conteos cíclicos</div>
            <div class="metric-desc">Elimina discrepancias entre el inventario contable y las existencias físicas en piso sin parar almacén.</div>
            <div class="metric-foot">CERO MERMAS NO JUSTIFICADAS</div>
          </div>

          <div class="metric-card">
            <div class="metric-icon red-bg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
                <polyline points="17 18 23 18 23 12"></polyline>
              </svg>
            </div>
            <div class="metric-value">-42%</div>
            <div class="metric-title">Quiebres de stock no deseados</div>
            <div class="metric-desc">Cálculo de punto de reorden dinámico con amortiguadores de seguridad basados en lead-time real de lotes.</div>
            <div class="metric-foot">REORDEN INTELIGENTE</div>
          </div>

          <div class="metric-card">
            <div class="metric-icon purple-bg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
            </div>
            <div class="metric-value">3.5x</div>
            <div class="metric-title">Aceleración en despacho</div>
            <div class="metric-desc">Rutas de picking optimizadas por lote y algoritmo de menor recorrido físico entre racks.</div>
            <div class="metric-foot">MENOR TIEMPO MUERTO</div>
          </div>

          <div class="metric-card">
            <div class="metric-icon cyan-bg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                <line x1="6" y1="6" x2="6.01" y2="6"></line>
                <line x1="6" y1="18" x2="6.01" y2="18"></line>
              </svg>
            </div>
            <div class="metric-value">+15M</div>
            <div class="metric-title">Movimientos al mes</div>
            <div class="metric-desc">Infraestructura redundante sin pérdida de transacciones con sincronización instantánea.</div>
            <div class="metric-foot">ALTA DISPONIBILIDAD</div>
          </div>
        </div>
      </section>

      <!-- Modular Features Section -->
      <section id="caracteristicas" class="features-section">
        <div class="section-header center">
          <span class="tag-blue">ARQUITECTURA MODULAR</span>
          <h2>Módulos diseñados para erradicar la fricción logística</h2>
          <p>Velocidad, trazabilidad determinista y control absoluto en cada operación de inventario.</p>
        </div>

        <!-- Big Feature Cards Row -->
        <div class="features-row-large">
          <div class="feature-big-card">
            <div class="feature-badge">ESPACIAL Y LAYOUT</div>
            <h3>Mapeo Digital Multialmacén y Racks</h3>
            <p>Visualiza en tiempo real pasillos, niveles, tarimas y áreas de cross-docking. Gestiona múltiples ubicaciones de forma sincronizada.</p>

            <div class="bay-selector-mockup">
              <div class="bay-pill active">
                <span>NAVE CENTRAL</span>
                <strong>RACK A-05</strong>
              </div>
              <div class="bay-pill">
                <span>SECTOR NORTE</span>
                <strong>RACK B-12</strong>
              </div>
              <div class="bay-pill">
                <span>REFRIGERADOS</span>
                <strong>FRIO-03</strong>
              </div>
              <div class="bay-pill">
                <span>CROSS-DOCK</span>
                <strong>ANDÉN-04</strong>
              </div>
            </div>
          </div>

          <div class="feature-big-card">
            <div class="feature-badge">CONECTIVIDAD</div>
            <h3>Trazabilidad y Escaneo Móvil</h3>
            <p>Compatibilidad directa con terminales de mano, escáneres 2D, códigos QR y etiquetas RFID para lectura ultra-rápida.</p>

            <div class="hardware-mockup-box">
              <div class="hw-icon-box">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                  <line x1="12" y1="18" x2="12.01" y2="18"></line>
                </svg>
              </div>
              <div class="hw-info">
                <strong>TERMINAL MÓVIL SINCRONIZADA</strong>
                <small>Respuesta en tiempo real // Protocolo Seguro</small>
              </div>
            </div>
          </div>
        </div>

        <!-- 3 Small Feature Cards Row -->
        <div class="features-row-small">
          <div class="feature-small-card">
            <div class="small-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
            </div>
            <h4>Auditorías Cíclicas Automatizadas</h4>
            <p>Genera rondas de conteo inteligente priorizadas por valor ABC y caducidad sin interrumpir los envíos del turno en curso.</p>
            <div class="small-foot">Conciliación continua 24/7</div>
          </div>

          <div class="feature-small-card">
            <div class="small-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
            </div>
            <h4>Reorden Dinámico</h4>
            <p>Cálculo automático de lotes económicos tomando en cuenta variaciones estacionales y tiempos de transporte.</p>
            <div class="small-foot">Safety Stock predictivo</div>
          </div>

          <div class="feature-small-card">
            <div class="small-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
            </div>
            <h4>Reportes y Analítica</h4>
            <p>Valuación de existencias, rotación de productos y exportación de balances operacionales al instante.</p>
            <div class="small-foot">Métricas exportables</div>
          </div>
        </div>
      </section>

      <!-- Call To Action Banner Section -->
      <section class="cta-section">
        <div class="cta-box">
          <span class="cta-tag">DESPLIEGUE INMEDIATO</span>
          <h2>Lleva la gestión de tus almacenes al siguiente nivel de precisión</h2>
          <p>Prueba el motor de Firmeza hoy mismo y simplifica tus operaciones de inventario.</p>

          <div class="cta-buttons">
            <a href="/register" class="btn-primary-large">Crear Cuenta Corporativa</a>
            <a href="/login" class="btn-secondary-dark">Iniciar Sesión</a>
          </div>

          <div class="cta-foot">
            <span>Cifrado TLS 1.3</span>
            <span>•</span>
            <span>Seguridad Empresarial</span>
            <span>•</span>
            <span>Alta Disponibilidad</span>
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
              Plataforma de control de inventarios, trazabilidad de SKU y optimización logística con máxima precisión.
            </p>
          </div>

          <div class="footer-cols">
            <div class="footer-col">
              <h5>PRODUCTO</h5>
              <a href="#">Gestión WMS</a>
              <a href="#">Escaneo Móvil</a>
              <a href="#">Telemetría</a>
            </div>

            <div class="footer-col">
              <h5>SOLUCIONES</h5>
              <a href="#">Distribución y 3PL</a>
              <a href="#">Manufactura</a>
              <a href="#">Retail & Comercio</a>
            </div>

            <div class="footer-col">
              <h5>SOPORTE</h5>
              <a href="#">Documentación</a>
              <a href="#">Guías Rápidas</a>
              <a href="#">Centro de Ayuda</a>
            </div>

            <div class="footer-col">
              <h5>EMPRESA</h5>
              <a href="#">Acerca de</a>
              <a href="#">Privacidad</a>
              <a href="#">Términos de Servicio</a>
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
      padding: 5rem 1.5rem 3.5rem;
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

    /* Mockup Section */
    .mockup-section {
      max-width: 1180px;
      margin: 0 auto 5rem;
      padding: 0 1.5rem;
    }

    .mockup-card {
      background: #ffffff;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 20px 30px -10px rgba(15, 23, 42, 0.08);
      overflow: hidden;
      transition: box-shadow 0.3s ease;
    }

    .mockup-card:hover {
      box-shadow: 0 25px 40px -10px rgba(15, 23, 42, 0.12);
    }

    .mockup-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.9rem 1.5rem;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }

    .window-dots {
      display: flex;
      align-items: center;
      gap: 0.45rem;
    }

    .dot {
      width: 11px;
      height: 11px;
      border-radius: 50%;
    }
    .dot.red { background: #f87171; }
    .dot.yellow { background: #fbbf24; }
    .dot.green { background: #4ade80; }

    .hub-tag {
      font-size: 0.72rem;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      color: #64748b;
      margin-left: 0.85rem;
    }

    .mockup-header-right {
      display: flex;
      gap: 0.6rem;
      align-items: center;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      font-size: 0.7rem;
      font-weight: 700;
      color: #1d4ed8;
      background: #eff6ff;
      border: 1px solid #dbeafe;
      padding: 0.25rem 0.65rem;
      border-radius: 6px;
    }

    .info-pill {
      font-size: 0.68rem;
      font-weight: 600;
      color: #475569;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      padding: 0.25rem 0.55rem;
      border-radius: 6px;
    }

    .mockup-body {
      display: grid;
      grid-template-columns: 330px 1fr;
      gap: 1.75rem;
      padding: 1.75rem;
      background: #ffffff;
    }

    .mockup-left {
      display: flex;
      flex-direction: column;
      gap: 1.2rem;
    }

    .alert-box {
      border-radius: 10px;
      padding: 1.1rem;
      border: 1px solid #fecaca;
      background: #fef2f2;
      box-shadow: 0 2px 4px rgba(220, 38, 38, 0.04);
    }

    .alert-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .alert-title {
      font-size: 0.82rem;
      font-weight: 700;
      color: #991b1b;
    }

    .alert-tag {
      font-size: 0.65rem;
      background: #fee2e2;
      color: #991b1b;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
      font-weight: 800;
    }

    .alert-desc {
      font-size: 0.77rem;
      color: #7f1d1d;
      margin-bottom: 0.85rem;
      line-height: 1.45;
    }

    .alert-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.72rem;
      color: #991b1b;
      font-weight: 600;
    }

    .btn-alert-action {
      background: #dc2626;
      color: white;
      border: none;
      padding: 0.4rem 0.75rem;
      border-radius: 6px;
      font-size: 0.68rem;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(220, 38, 38, 0.25);
      transition: background 0.2s ease;
    }

    .btn-alert-action:hover {
      background: #b91c1c;
    }

    .stat-box {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 1.1rem;
      box-shadow: 0 2px 5px rgba(15, 23, 42, 0.03);
    }

    .stat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .stat-label {
      font-size: 0.72rem;
      font-weight: 700;
      color: #64748b;
    }

    .circular-chart span {
      font-size: 1.35rem;
      font-weight: 800;
      color: #0f172a;
    }

    .stat-footer {
      font-size: 0.72rem;
      font-weight: 700;
      margin-top: 0.5rem;
    }
    .text-green { color: #16a34a; }

    .stat-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.6rem;
    }
    .stat-val-blue {
      font-weight: 800;
      color: #1d4ed8;
      font-size: 0.88rem;
    }

    .progress-bar {
      height: 7px;
      background: #f1f5f9;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 0.5rem;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #3b82f6, #1d4ed8);
      border-radius: 4px;
    }

    .stat-sub {
      display: flex;
      justify-content: space-between;
      font-size: 0.68rem;
      color: #64748b;
    }

    .mockup-right {
      display: flex;
      flex-direction: column;
      gap: 1.35rem;
    }

    .chart-container {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 1.25rem;
      box-shadow: 0 2px 5px rgba(15, 23, 42, 0.03);
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .chart-title {
      font-weight: 700;
      font-size: 0.88rem;
      color: #0f172a;
    }

    .chart-legend {
      display: flex;
      gap: 0.85rem;
      font-size: 0.72rem;
      font-weight: 600;
    }
    .legend-blue { color: #2563eb; }
    .legend-dark { color: #475569; }

    .chart-sub {
      font-size: 0.72rem;
      color: #64748b;
      margin-top: 0.2rem;
      margin-bottom: 0.85rem;
    }

    .chart-svg-wrapper {
      width: 100%;
    }

    .chart-svg {
      width: 100%;
      height: 110px;
    }

    /* Table */
    .table-container {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 5px rgba(15, 23, 42, 0.03);
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1.1rem;
      background: #f8fafc;
      font-size: 0.68rem;
      font-weight: 800;
      color: #475569;
      border-bottom: 1px solid #e2e8f0;
    }

    .sync-tag {
      color: #64748b;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.65rem;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.78rem;
    }

    .data-table th {
      text-align: left;
      padding: 0.65rem 1.1rem;
      background: #ffffff;
      color: #64748b;
      font-size: 0.68rem;
      font-weight: 700;
      border-bottom: 1px solid #e2e8f0;
    }

    .data-table td {
      padding: 0.75rem 1.1rem;
      border-bottom: 1px solid #f1f5f9;
      color: #334155;
    }

    .data-table tr:hover td {
      background: #f8fafc;
    }

    .code-text {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 600;
    }
    .code-text small {
      color: #64748b;
    }

    .badge-gray {
      background: #f1f5f9;
      color: #475569;
      padding: 0.2rem 0.5rem;
      border-radius: 5px;
      font-size: 0.68rem;
      font-weight: 600;
    }

    .badge-gray-red {
      background: #fef2f2;
      color: #991b1b;
      padding: 0.2rem 0.5rem;
      border-radius: 5px;
      font-size: 0.68rem;
      font-weight: 700;
    }

    .badge-status-blue {
      background: #eff6ff;
      color: #1d4ed8;
      padding: 0.2rem 0.5rem;
      border-radius: 5px;
      font-weight: 700;
      font-size: 0.68rem;
    }

    .badge-status-cyan {
      background: #ecfeff;
      color: #0891b2;
      padding: 0.2rem 0.5rem;
      border-radius: 5px;
      font-weight: 700;
      font-size: 0.68rem;
    }

    .badge-status-red {
      background: #fef2f2;
      color: #dc2626;
      padding: 0.2rem 0.5rem;
      border-radius: 5px;
      font-weight: 700;
      font-size: 0.68rem;
    }

    /* Logos section */
    .logos-section {
      text-align: center;
      padding: 3rem 1.5rem;
      border-top: 1px solid #e2e8f0;
      border-bottom: 1px solid #e2e8f0;
      background: #ffffff;
      margin-bottom: 4.5rem;
    }

    .logos-label span {
      display: block;
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      color: #64748b;
    }

    .logos-label small {
      font-size: 0.82rem;
      color: #94a3b8;
    }

    .logos-grid {
      display: flex;
      justify-content: center;
      gap: 3.5rem;
      margin-top: 1.75rem;
      flex-wrap: wrap;
    }

    .logo-item {
      font-weight: 700;
      color: #475569;
      font-size: 0.95rem;
      opacity: 0.85;
      transition: opacity 0.2s ease;
    }

    .logo-item:hover {
      opacity: 1;
      color: #1d4ed8;
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

    .metric-value {
      font-size: 2.5rem;
      font-weight: 800;
      color: #0f172a;
      line-height: 1;
      margin-bottom: 0.5rem;
      letter-spacing: -0.03em;
    }

    .metric-title {
      font-weight: 700;
      font-size: 0.95rem;
      color: #1e293b;
      margin-bottom: 0.5rem;
    }

    .metric-desc {
      font-size: 0.82rem;
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
      margin-bottom: 1.75rem;
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
      color: #1d4ed8;
      display: flex;
      align-items: center;
    }

    .hw-info strong {
      display: block;
      font-size: 0.8rem;
      color: #334155;
    }

    .hw-info small {
      font-size: 0.7rem;
      color: #64748b;
    }

    .features-row-small {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }

    .feature-small-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 1.75rem;
      box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.04);
      transition: transform 0.25s ease;
    }

    .feature-small-card:hover {
      transform: translateY(-2px);
    }

    .small-icon {
      color: #1d4ed8;
      margin-bottom: 0.85rem;
      display: flex;
      align-items: center;
    }

    .feature-small-card h4 {
      font-size: 1rem;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 0.5rem;
    }

    .feature-small-card p {
      font-size: 0.82rem;
      color: #64748b;
      line-height: 1.55;
      margin-bottom: 1.1rem;
    }

    .small-foot {
      font-size: 0.72rem;
      font-weight: 700;
      color: #1d4ed8;
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
      padding: 4.5rem 2rem;
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
      font-size: 2.35rem;
      font-weight: 800;
      margin: 1rem 0;
      letter-spacing: -0.03em;
    }

    .cta-box p {
      color: #94a3b8;
      max-width: 620px;
      margin: 0 auto 2.25rem;
      font-size: 1rem;
      line-height: 1.6;
    }

    .cta-buttons {
      display: flex;
      justify-content: center;
      gap: 1.25rem;
      margin-bottom: 2.25rem;
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
      transition: all 0.2s ease;
    }

    .btn-secondary-dark:hover {
      background: rgba(255, 255, 255, 0.15);
      transform: translateY(-1px);
    }

    .cta-foot {
      display: flex;
      justify-content: center;
      gap: 1.2rem;
      font-size: 0.78rem;
      color: #64748b;
    }

    /* Footer */
    .footer {
      background: #ffffff;
      border-top: 1px solid #e2e8f0;
      padding: 4.5rem 3.5rem 2.5rem;
    }

    .footer-top {
      display: grid;
      grid-template-columns: 340px 1fr;
      gap: 3.5rem;
      margin-bottom: 3.5rem;
    }

    .footer-brand p {
      font-size: 0.85rem;
      color: #64748b;
      margin-top: 1.1rem;
      line-height: 1.6;
    }

    .footer-cols {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 2rem;
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
      .mockup-body { grid-template-columns: 1fr; }
      .features-row-large { grid-template-columns: 1fr; }
      .features-row-small { grid-template-columns: 1fr; }
      .footer-top { grid-template-columns: 1fr; }
      .footer-cols { grid-template-columns: repeat(2, 1fr); }
      .hero-title { font-size: 2.25rem; }
    }
  `]
})
export class HomeComponent implements OnInit {
  private readonly apiService = inject(ApiService);

  ngOnInit(): void {
    this.apiService.getHomeData().subscribe({
      next: (data: any) => console.log('Home API Data:', data),
      error: (err: any) => console.error(err)
    });
  }
}
