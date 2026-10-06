import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../Services/dashboard.service';
import { AuthService } from '../../Services/auth.service';

interface MetricItem {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  caption: string;
  badge: string;
  sparkline: number[];
}

interface ActivityItem {
  id: string;
  sku: string;
  product: string;
  warehouse: string;
  type: 'Entrada' | 'Despacho' | 'Ajuste';
  quantity: string;
  value: string;
  status: 'Completado' | 'En Tránsito' | 'En Verificación';
  time: string;
}

interface WarehouseCapacity {
  name: string;
  location: string;
  percentage: number;
  skus: number;
  status: 'Normal' | 'Alto' | 'Óptimo';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="enterprise-dashboard">
      <!-- Encabezado Operativo Minimalista -->
      <header class="dashboard-header">
        <div class="header-titles">
          <div class="tag-row">
            <span class="telemetry-badge">
              <span class="ping-dot"></span>
              TELEMETRÍA EN TIEMPO REAL
            </span>
            <span class="env-pill">PRODUCCIÓN // NODO CENTRAL</span>
          </div>
          <h1 class="main-title">Consola de Control de Inventario</h1>
          <p class="subtitle">Monitoreo continuo de almacenes, trazabilidad de stock y conciliación operativa.</p>
        </div>

        <div class="header-controls">
          <!-- Filtro de Temporalidad Minimalista -->
          <div class="range-selector">
            <button 
              *ngFor="let range of ['7D', '30D', '3M', '1A']" 
              (click)="selectedRange = range"
              [class.active]="selectedRange === range"
              class="range-btn">
              {{ range }}
            </button>
          </div>

          <button (click)="refreshData()" class="btn-action btn-secondary" title="Recargar métricas">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            <span>Sincronizar</span>
          </button>

          <a routerLink="/plans" class="btn-action btn-primary">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            <span>Mejorar Plan</span>
          </a>
        </div>
      </header>

      <!-- Cuadrícula de Métricas Clave (KPIs) -->
      <section class="kpi-grid">
        <div *ngFor="let kpi of kpiMetrics" class="kpi-card">
          <div class="kpi-top">
            <span class="kpi-label">{{ kpi.title }}</span>
            <span class="kpi-tag" [class.trend-up]="kpi.isPositive" [class.trend-neutral]="!kpi.isPositive">
              {{ kpi.badge }}
            </span>
          </div>

          <div class="kpi-main">
            <div class="kpi-value">{{ kpi.value }}</div>
            <div class="kpi-trend" [class.positive]="kpi.isPositive" [class.negative]="!kpi.isPositive">
              <svg *ngIf="kpi.isPositive" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="18 15 12 9 6 15"></polyline>
              </svg>
              <svg *ngIf="!kpi.isPositive" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
              <span>{{ kpi.change }}</span>
            </div>
          </div>

          <div class="kpi-footer">
            <span class="kpi-caption">{{ kpi.caption }}</span>
            <!-- Mini Sparkline SVG -->
            <div class="sparkline-wrapper">
              <svg width="68" height="22" viewBox="0 0 68 22" fill="none">
                <path [attr.d]="getSparklinePath(kpi.sparkline)" 
                      [attr.stroke]="kpi.isPositive ? '#10b981' : '#6366f1'" 
                      stroke-width="2" 
                      stroke-linecap="round" 
                      stroke-linejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      <!-- Sección Principal de Gráficas Empresariales -->
      <section class="charts-row">
        <!-- Gráfica 1: Área y Flujo de Inventario (Curva SVG Interactiva) -->
        <div class="chart-card primary-chart">
          <div class="card-header">
            <div>
              <div class="card-pretitle">DINÁMICA LOGÍSTICA</div>
              <h2 class="card-title">Flujo de Stock y Rotación Mensual</h2>
            </div>
            <div class="chart-legend">
              <span class="legend-item"><span class="legend-dot in"></span>Entradas de Stock</span>
              <span class="legend-item"><span class="legend-dot out"></span>Despachos a Clientes</span>
            </div>
          </div>

          <!-- Lienzo Gráfico SVG Responsive -->
          <div class="chart-svg-container">
            <svg viewBox="0 0 740 240" class="responsive-svg" preserveAspectRatio="none">
              <defs>
                <linearGradient id="areaGradientIn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#2563eb" stop-opacity="0.28" />
                  <stop offset="100%" stop-color="#2563eb" stop-opacity="0.00" />
                </linearGradient>
                <linearGradient id="areaGradientOut" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#6366f1" stop-opacity="0.20" />
                  <stop offset="100%" stop-color="#6366f1" stop-opacity="0.00" />
                </linearGradient>
              </defs>

              <!-- Líneas Guía Horizontales -->
              <line x1="30" y1="40" x2="720" y2="40" stroke="#f1f5f9" stroke-dasharray="4 4" stroke-width="1"/>
              <line x1="30" y1="95" x2="720" y2="95" stroke="#f1f5f9" stroke-dasharray="4 4" stroke-width="1"/>
              <line x1="30" y1="150" x2="720" y2="150" stroke="#f1f5f9" stroke-dasharray="4 4" stroke-width="1"/>
              <line x1="30" y1="205" x2="720" y2="205" stroke="#e2e8f0" stroke-width="1"/>

              <!-- Etiquetas Eje Y -->
              <text x="20" y="44" fill="#94a3b8" font-size="11" text-anchor="end">100k</text>
              <text x="20" y="99" fill="#94a3b8" font-size="11" text-anchor="end">75k</text>
              <text x="20" y="154" fill="#94a3b8" font-size="11" text-anchor="end">50k</text>
              <text x="20" y="209" fill="#94a3b8" font-size="11" text-anchor="end">0</text>

              <!-- Áreas de Degradado -->
              <polygon points="50,175 160,135 270,110 380,140 490,80 600,65 710,48 710,205 50,205" fill="url(#areaGradientIn)" />
              <polygon points="50,190 160,165 270,145 380,160 490,120 600,105 710,90 710,205 50,205" fill="url(#areaGradientOut)" />

              <!-- Línea Despachos (Índigo) -->
              <polyline points="50,190 160,165 270,145 380,160 490,120 600,105 710,90" 
                        fill="none" stroke="#818cf8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />

              <!-- Línea Entradas (Azul Principal) -->
              <polyline points="50,175 160,135 270,110 380,140 490,80 600,65 710,48" 
                        fill="none" stroke="#2563eb" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />

              <!-- Puntos Interactivos con Hover -->
              <g *ngFor="let pt of chartPoints">
                <circle [attr.cx]="pt.x" [attr.cy]="pt.y" r="4.5" fill="#ffffff" stroke="#2563eb" stroke-width="2.5" class="chart-point" />
                <text [attr.x]="pt.x" y="225" fill="#64748b" font-size="11" font-weight="600" text-anchor="middle">{{ pt.month }}</text>
              </g>
            </svg>
          </div>
        </div>

        <!-- Gráfica 2: Distribución por Categorías (Donut SVG Minimalista) -->
        <div class="chart-card secondary-chart">
          <div class="card-header">
            <div>
              <div class="card-pretitle">CATEGORIZACIÓN</div>
              <h2 class="card-title">Composición de Stock</h2>
            </div>
          </div>

          <div class="donut-wrapper">
            <div class="donut-svg-box">
              <svg viewBox="0 0 160 160" width="150" height="150">
                <!-- Círculo Base Fondo -->
                <circle cx="80" cy="80" r="58" fill="none" stroke="#f1f5f9" stroke-width="18" />

                <!-- Segmentos Donut SVG con dasharray -->
                <!-- Segmento 1: Materia Prima (42%) -->
                <circle cx="80" cy="80" r="58" fill="none" stroke="#2563eb" stroke-width="18"
                        stroke-dasharray="153 364" stroke-dashoffset="0" stroke-linecap="round" />
                
                <!-- Segmento 2: Terminado (32%) -->
                <circle cx="80" cy="80" r="58" fill="none" stroke="#6366f1" stroke-width="18"
                        stroke-dasharray="116 364" stroke-dashoffset="-158" stroke-linecap="round" />

                <!-- Segmento 3: Empaques (16%) -->
                <circle cx="80" cy="80" r="58" fill="none" stroke="#10b981" stroke-width="18"
                        stroke-dasharray="58 364" stroke-dashoffset="-278" stroke-linecap="round" />

                <!-- Segmento 4: Tránsito (10%) -->
                <circle cx="80" cy="80" r="58" fill="none" stroke="#f59e0b" stroke-width="18"
                        stroke-dasharray="36 364" stroke-dashoffset="-340" stroke-linecap="round" />
              </svg>
              <div class="donut-center-info">
                <span class="donut-num">34.8k</span>
                <span class="donut-sub">SKUs Totales</span>
              </div>
            </div>

            <div class="donut-breakdown">
              <div class="breakdown-item">
                <span class="color-pip pip-blue"></span>
                <span class="breakdown-name">Materia Prima</span>
                <span class="breakdown-val">42%</span>
              </div>
              <div class="breakdown-item">
                <span class="color-pip pip-indigo"></span>
                <span class="breakdown-name">Prod. Terminado</span>
                <span class="breakdown-val">32%</span>
              </div>
              <div class="breakdown-item">
                <span class="color-pip pip-green"></span>
                <span class="breakdown-name">Suministros</span>
                <span class="breakdown-val">16%</span>
              </div>
              <div class="breakdown-item">
                <span class="color-pip pip-amber"></span>
                <span class="breakdown-name">En Tránsito</span>
                <span class="breakdown-val">10%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Fila Inferior: Capacidad por Almacén y Movimientos Recientes -->
      <section class="bottom-split-row">
        <!-- Tarjeta: Capacidad y Ocupación por Bodega -->
        <div class="split-card warehouse-card">
          <div class="card-header">
            <div>
              <div class="card-pretitle">INFRAESTRUCTURA</div>
              <h2 class="card-title">Ocupación por Centro Logístico</h2>
            </div>
            <span class="live-status">4 Bodegas Sincronizadas</span>
          </div>

          <div class="warehouses-list">
            <div *ngFor="let wh of warehouses" class="warehouse-row">
              <div class="wh-meta">
                <div class="wh-name-box">
                  <span class="wh-name">{{ wh.name }}</span>
                  <span class="wh-loc">{{ wh.location }}</span>
                </div>
                <div class="wh-stat">
                  <span class="wh-percent">{{ wh.percentage }}%</span>
                  <span class="wh-skus">{{ wh.skus | number }} artículos</span>
                </div>
              </div>

              <div class="progress-track">
                <div class="progress-bar" 
                     [style.width.%]="wh.percentage"
                     [class.bar-high]="wh.percentage > 85"
                     [class.bar-optimal]="wh.percentage <= 85">
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tarjeta: Registro de Transacciones Recientes -->
        <div class="split-card transactions-card">
          <div class="card-header">
            <div>
              <div class="card-pretitle">ACTIVIDAD RECIENTE</div>
              <h2 class="card-title">Últimos Movimientos de Stock</h2>
            </div>
            <span class="count-badge">5 eventos</span>
          </div>

          <div class="table-responsive">
            <table class="minimal-table">
              <thead>
                <tr>
                  <th>SKU / Producto</th>
                  <th>Almacén</th>
                  <th>Operación</th>
                  <th>Valor</th>
                  <th>Estado</th>
                  <th>Tiempo</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let act of recentActivity">
                  <td class="cell-product">
                    <span class="product-sku">{{ act.sku }}</span>
                    <span class="product-title">{{ act.product }}</span>
                  </td>
                  <td class="cell-wh">{{ act.warehouse }}</td>
                  <td>
                    <span class="op-tag" [class.in]="act.type === 'Entrada'" [class.out]="act.type === 'Despacho'">
                      {{ act.quantity }}
                    </span>
                  </td>
                  <td class="cell-val">{{ act.value }}</td>
                  <td>
                    <span class="status-pill" [class.success]="act.status === 'Completado'" [class.pending]="act.status === 'En Tránsito'" [class.review]="act.status === 'En Verificación'">
                      {{ act.status }}
                    </span>
                  </td>
                  <td class="cell-time">{{ act.time }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      color: #0f172a;
      background-color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }

    .enterprise-dashboard {
      padding: 2.25rem 2.5rem;
      max-width: 1440px;
      margin: 0 auto;
      animation: fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }

    /* Header */
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 2rem;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .tag-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.5rem;
    }

    .telemetry-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #0284c7;
      background: #f0f9ff;
      border: 1px solid #e0f2fe;
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
    }

    .ping-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: #0284c7;
      animation: pulsePing 1.8s infinite;
    }

    @keyframes pulsePing {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }

    .env-pill {
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #64748b;
      background: #f1f5f9;
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
    }

    .main-title {
      font-size: 1.85rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      color: #0f172a;
      margin: 0 0 0.35rem 0;
      line-height: 1.15;
    }

    .subtitle {
      font-size: 0.92rem;
      color: #64748b;
      margin: 0;
    }

    .header-controls {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .range-selector {
      display: flex;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      padding: 0.25rem;
      border-radius: 8px;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
    }

    .range-btn {
      background: none;
      border: none;
      padding: 0.35rem 0.75rem;
      font-size: 0.8rem;
      font-weight: 600;
      color: #64748b;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .range-btn.active {
      background: #0f172a;
      color: #ffffff;
      box-shadow: 0 2px 6px rgba(15, 23, 42, 0.15);
    }

    .btn-action {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.55rem 1rem;
      border-radius: 8px;
      font-size: 0.84rem;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .btn-secondary {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      color: #334155;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
    }

    .btn-secondary:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
    }

    .btn-primary {
      background: linear-gradient(135deg, #1d4ed8, #2563eb);
      color: #ffffff;
      border: 1px solid #1d4ed8;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
    }

    .btn-primary:hover {
      background: #1e40af;
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(37, 99, 235, 0.32);
    }

    /* KPI Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1.25rem;
      margin-bottom: 1.75rem;
    }

    .kpi-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.35rem 1.45rem;
      display: flex;
      flex-direction: column;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03), 0 4px 12px -2px rgba(15, 23, 42, 0.05);
      transition: all 0.25s ease;
    }

    .kpi-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px -4px rgba(15, 23, 42, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.04);
      border-color: #cbd5e1;
    }

    .kpi-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.65rem;
    }

    .kpi-label {
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: #64748b;
      text-transform: uppercase;
    }

    .kpi-tag {
      font-size: 0.68rem;
      font-weight: 700;
      padding: 0.15rem 0.5rem;
      border-radius: 6px;
    }

    .trend-up {
      background: #ecfdf5;
      color: #059669;
    }

    .trend-neutral {
      background: #f1f5f9;
      color: #475569;
    }

    .kpi-main {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      margin-bottom: 0.75rem;
    }

    .kpi-value {
      font-size: 1.75rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      color: #0f172a;
    }

    .kpi-trend {
      display: inline-flex;
      align-items: center;
      gap: 0.2rem;
      font-size: 0.78rem;
      font-weight: 700;
    }

    .kpi-trend.positive { color: #10b981; }
    .kpi-trend.negative { color: #6366f1; }

    .kpi-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 0.75rem;
      border-top: 1px solid #f8fafc;
    }

    .kpi-caption {
      font-size: 0.78rem;
      color: #94a3b8;
    }

    /* Charts Row */
    .charts-row {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.5rem;
      margin-bottom: 1.75rem;
    }

    .chart-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 1.5rem 1.65rem;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03), 0 6px 18px -3px rgba(15, 23, 42, 0.05);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.35rem;
    }

    .card-pretitle {
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #94a3b8;
    }

    .card-title {
      font-size: 1.15rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #0f172a;
      margin: 0.15rem 0 0 0;
    }

    .chart-legend {
      display: flex;
      gap: 1.1rem;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.76rem;
      font-weight: 600;
      color: #64748b;
    }

    .legend-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .legend-dot.in { background: #2563eb; }
    .legend-dot.out { background: #818cf8; }

    .chart-svg-container {
      width: 100%;
      height: 240px;
    }

    .responsive-svg {
      width: 100%;
      height: 100%;
      overflow: visible;
    }

    .chart-point {
      transition: r 0.2s ease, stroke-width 0.2s ease;
      cursor: pointer;
    }

    .chart-point:hover {
      r: 6.5;
      stroke-width: 3.5;
    }

    /* Donut Chart */
    .donut-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.25rem;
    }

    .donut-svg-box {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0.5rem 0;
    }

    .donut-center-info {
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }

    .donut-num {
      font-size: 1.45rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      color: #0f172a;
      line-height: 1.1;
    }

    .donut-sub {
      font-size: 0.68rem;
      font-weight: 600;
      color: #94a3b8;
    }

    .donut-breakdown {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 0.55rem;
      padding-top: 0.5rem;
      border-top: 1px solid #f1f5f9;
    }

    .breakdown-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.8rem;
    }

    .color-pip {
      width: 8px;
      height: 8px;
      border-radius: 2px;
      margin-right: 0.5rem;
    }

    .pip-blue { background: #2563eb; }
    .pip-indigo { background: #6366f1; }
    .pip-green { background: #10b981; }
    .pip-amber { background: #f59e0b; }

    .breakdown-name {
      color: #475569;
      font-weight: 500;
      flex: 1;
    }

    .breakdown-val {
      font-weight: 700;
      color: #0f172a;
    }

    /* Bottom Split Row */
    .bottom-split-row {
      display: grid;
      grid-template-columns: 1fr 1.6fr;
      gap: 1.5rem;
    }

    .split-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 1.5rem 1.65rem;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03), 0 6px 18px -3px rgba(15, 23, 42, 0.05);
    }

    .live-status {
      font-size: 0.72rem;
      font-weight: 700;
      color: #10b981;
      background: #ecfdf5;
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
    }

    .count-badge {
      font-size: 0.72rem;
      font-weight: 700;
      color: #475569;
      background: #f1f5f9;
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
    }

    /* Warehouses */
    .warehouses-list {
      display: flex;
      flex-direction: column;
      gap: 1.15rem;
    }

    .wh-meta {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 0.45rem;
    }

    .wh-name {
      display: block;
      font-size: 0.88rem;
      font-weight: 700;
      color: #0f172a;
    }

    .wh-loc {
      display: block;
      font-size: 0.74rem;
      color: #94a3b8;
    }

    .wh-stat {
      text-align: right;
    }

    .wh-percent {
      display: block;
      font-size: 0.95rem;
      font-weight: 800;
      color: #0f172a;
    }

    .wh-skus {
      display: block;
      font-size: 0.72rem;
      color: #64748b;
    }

    .progress-track {
      width: 100%;
      height: 7px;
      background: #f1f5f9;
      border-radius: 9999px;
      overflow: hidden;
    }

    .progress-bar {
      height: 100%;
      border-radius: 9999px;
      transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .bar-optimal {
      background: linear-gradient(90deg, #3b82f6, #2563eb);
    }

    .bar-high {
      background: linear-gradient(90deg, #f59e0b, #ea580c);
    }

    /* Minimal Table */
    .table-responsive {
      overflow-x: auto;
    }

    .minimal-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.85rem;
    }

    .minimal-table th {
      padding: 0.75rem 0.85rem;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #64748b;
      border-bottom: 1px solid #e2e8f0;
      background-color: #f8fafc;
    }

    .minimal-table td {
      padding: 0.9rem 0.85rem;
      border-bottom: 1px solid #f8fafc;
      color: #334155;
    }

    .minimal-table tbody tr {
      transition: background-color 0.15s ease;
    }

    .minimal-table tbody tr:hover {
      background-color: #f8fafc;
    }

    .cell-product {
      display: flex;
      flex-direction: column;
    }

    .product-sku {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.72rem;
      font-weight: 700;
      color: #2563eb;
    }

    .product-title {
      font-weight: 600;
      color: #0f172a;
    }

    .cell-wh {
      color: #64748b;
      font-size: 0.8rem;
    }

    .op-tag {
      display: inline-block;
      font-size: 0.76rem;
      font-weight: 700;
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
    }

    .op-tag.in {
      background: #eff6ff;
      color: #1d4ed8;
    }

    .op-tag.out {
      background: #fdf2f8;
      color: #db2777;
    }

    .cell-val {
      font-weight: 700;
      color: #0f172a;
    }

    .status-pill {
      display: inline-block;
      padding: 0.2rem 0.55rem;
      border-radius: 9999px;
      font-size: 0.72rem;
      font-weight: 600;
    }

    .status-pill.success {
      background: #ecfdf5;
      color: #059669;
    }

    .status-pill.pending {
      background: #eff6ff;
      color: #2563eb;
    }

    .status-pill.review {
      background: #fffbeb;
      color: #d97706;
    }

    .cell-time {
      color: #94a3b8;
      font-size: 0.76rem;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 1100px) {
      .charts-row, .bottom-split-row {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .enterprise-dashboard {
        padding: 1.25rem 1rem;
      }
      .dashboard-header {
        flex-direction: column;
        align-items: flex-start;
      }
      .header-controls {
        width: 100%;
        flex-wrap: wrap;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly authService = inject(AuthService);

  selectedRange = '30D';
  isLoading = false;

  // KPIs con Sparklines integrados
  kpiMetrics: MetricItem[] = [
    {
      title: 'Valor Total del Stock',
      value: '$842,520',
      change: '+8.4%',
      isPositive: true,
      caption: 'vs. periodo anterior',
      badge: 'VALORACIÓN',
      sparkline: [20, 24, 22, 28, 35, 33, 40]
    },
    {
      title: 'Artículos en Existencia',
      value: '34,890',
      change: '+1,240',
      isPositive: true,
      caption: '98.4% disponibilidad',
      badge: 'DISPONIBLE',
      sparkline: [15, 18, 25, 23, 29, 34, 38]
    },
    {
      title: 'Ocupación de Almacenes',
      value: '76.8%',
      change: 'Normal',
      isPositive: true,
      caption: '4 centros activos',
      badge: 'CAPACIDAD',
      sparkline: [30, 28, 29, 31, 30, 29, 31]
    },
    {
      title: 'Órdenes en Despacho',
      value: '142',
      change: '-3.1%',
      isPositive: false,
      caption: 'Tiempo prom. 18h',
      badge: 'DESPACHOS',
      sparkline: [40, 36, 32, 28, 25, 22, 18]
    }
  ];

  // Puntos interactivos de la gráfica SVG
  chartPoints = [
    { month: 'Ene', x: 50, y: 175 },
    { month: 'Feb', x: 160, y: 135 },
    { month: 'Mar', x: 270, y: 110 },
    { month: 'Abr', x: 380, y: 140 },
    { month: 'May', x: 490, y: 80 },
    { month: 'Jun', x: 600, y: 65 },
    { month: 'Jul', x: 710, y: 48 }
  ];

  // Datos de Almacenes y Capacidad
  warehouses: WarehouseCapacity[] = [
    { name: 'Hub Central Firmeza', location: 'Bogotá D.C. — Zona Franca', percentage: 88, skus: 14200, status: 'Alto' },
    { name: 'Bodega Norte Logística', location: 'Medellín — Itagüí', percentage: 74, skus: 9840, status: 'Normal' },
    { name: 'Centro de Distribución Occidente', location: 'Cali — Yumbo', percentage: 62, skus: 6360, status: 'Óptimo' },
    { name: 'Nodo Portuario Caribe', location: 'Barranquilla — Malambo', percentage: 45, skus: 4490, status: 'Óptimo' }
  ];

  // Actividad Reciente de Stock (Datos de demostración empresarial)
  recentActivity: ActivityItem[] = [
    {
      id: 'TRX-1092',
      sku: 'SKU-8921-A',
      product: 'Válvula de Presión Industrial 2"',
      warehouse: 'Hub Central Bogotá',
      type: 'Entrada',
      quantity: '+500 uds',
      value: '$12,500',
      status: 'Completado',
      time: 'Hace 8 min'
    },
    {
      id: 'TRX-1091',
      sku: 'SKU-3402-B',
      product: 'Sensor Óptico de Proximidad v4',
      warehouse: 'Bodega Norte Medellín',
      type: 'Despacho',
      quantity: '-120 uds',
      value: '$4,800',
      status: 'En Tránsito',
      time: 'Hace 32 min'
    },
    {
      id: 'TRX-1090',
      sku: 'SKU-1194-C',
      product: 'Cojinete de Acero Reforzado 45mm',
      warehouse: 'Hub Central Bogotá',
      type: 'Ajuste',
      quantity: '80 uds',
      value: '$2,100',
      status: 'Completado',
      time: 'Hace 1 hora'
    },
    {
      id: 'TRX-1089',
      sku: 'SKU-9901-D',
      product: 'Batería de Respaldo Litio 48V',
      warehouse: 'Centro Distribución Cali',
      type: 'Despacho',
      quantity: '-45 uds',
      value: '$6,750',
      status: 'En Tránsito',
      time: 'Hace 3 horas'
    },
    {
      id: 'TRX-1088',
      sku: 'SKU-4412-E',
      product: 'Módulo de Control PLC-80',
      warehouse: 'Nodo Portuario Caribe',
      type: 'Entrada',
      quantity: '+250 uds',
      value: '$18,900',
      status: 'En Verificación',
      time: 'Hace 5 horas'
    }
  ];

  ngOnInit(): void {
    // Intentar sincronizar datos reales si existen en el backend sin bloquear la vista
    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        if (data?.metrics) {
          if (data.metrics.totalClients) {
            this.kpiMetrics[1].value = data.metrics.totalClients.toString();
          }
          if (data.metrics.systemStatus) {
            this.kpiMetrics[2].value = data.metrics.systemStatus;
          }
        }
      },
      error: () => {
        // En ausencia de API, los datos de demostración mantienen la interfaz 100% interactiva
      }
    });
  }

  refreshData(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
    }, 600);
  }

  getSparklinePath(points: number[]): string {
    const step = 68 / (points.length - 1);
    const max = Math.max(...points, 40);
    const min = Math.min(...points, 10);
    const range = max - min || 1;

    return points.reduce((path, val, idx) => {
      const x = idx * step;
      const y = 20 - ((val - min) / range) * 16;
      return `${path} ${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`;
    }, '');
  }
}
