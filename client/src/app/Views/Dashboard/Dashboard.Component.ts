import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../Services/dashboard.service';
import { AuthService } from '../../Services/auth.service';

interface Transaction {
  sku: string;
  product: string;
  detail: string;
  type: 'ENTRADA' | 'SALIDA' | 'TRASPASO';
  quantity: string;
  isPositive: boolean;
  isNeutral?: boolean;
  location: string;
  toLocation?: string;
  locationHighlight?: boolean;
  operator: string;
  operatorInitials: string;
  operatorBg: string;
  operatorColor: string;
  dateTime: string;
  status: 'Completado' | 'En Tránsito' | 'En Verificación';
}

interface RestockItem {
  name: string;
  badge: 'CRÍTICO' | 'BAJO';
  badgeType: 'critical' | 'low';
  sku: string;
  stockActual: string;
  stockMin: number;
  aisle: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="fz-viewport">
      <!-- 1. Encabezado de Control Operativo -->
      <header class="header-banner">
        <div class="header-left">
          <div class="header-icon-badge">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
          <div class="header-titles">
            <div class="title-with-pill">
              <h1 class="page-title">Panel General de Inventario</h1>
              <span class="live-status-pill">
                <span class="pulse-dot"></span>
                SINCRONIZADO EN TIEMPO REAL
              </span>
            </div>
            <div class="status-subtitle">
              <span>Actualizado hace 2 minutos</span>
              <span class="sep-dot">•</span>
              <span>Viernes, 25 de septiembre de 2026</span>
            </div>
          </div>
        </div>

        <div class="header-actions">
          <!-- Dropdown Selección de Almacén -->
          <div class="select-container">
            <svg class="pin-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2.2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <select [(ngModel)]="selectedWarehouse" class="warehouse-dropdown">
              <option value="central-a">Almacén Central - Nave A</option>
              <option value="norte-b">Bodega Norte - Nave B</option>
              <option value="occidente-c">Centro Occidente - Nave C</option>
            </select>
            <svg class="chevron-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2.5">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>

          <!-- Botón Exportar Balance -->
          <button class="btn-action-outline" (click)="onExportBalance()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Exportar Balance</span>
          </button>

          <!-- Acceso directo a Movimientos y Pedidos -->
          <a routerLink="/app/enterprises" class="btn-action-blue" style="text-decoration: none;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m7 16-4-4 4-4"></path>
              <path d="M3 12h18"></path>
              <path d="m17 8 4 4-4 4"></path>
            </svg>
            <span>Ver Movimientos</span>
          </a>
        </div>
      </header>

      <!-- 2. Tarjetas de Métricas Clave (KPIs) -->
      <section class="kpis-grid">
        <!-- KPI 1: Valor Total Inventario -->
        <div class="kpi-card">
          <div class="kpi-top-row">
            <span class="kpi-title">Valor Total Inventario</span>
            <div class="kpi-icon-container blue-tint">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                <line x1="2" y1="10" x2="22" y2="10"></line>
              </svg>
            </div>
          </div>
          <div class="kpi-big-value">$1,482,930</div>
          <div class="kpi-bottom-row">
            <span class="kpi-pill green-pill">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="18 15 12 9 6 15"></polyline>
              </svg>
              +3.4%
            </span>
            <span class="kpi-caption">vs. mes anterior</span>
          </div>
        </div>

        <!-- KPI 2: SKUs Activos en Almacén -->
        <div class="kpi-card">
          <div class="kpi-top-row">
            <span class="kpi-title">SKUs Activos en Almacén</span>
            <div class="kpi-icon-container teal-tint">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="8.5" y="14" width="7" height="7"></rect>
                <line x1="6.5" y1="10" x2="12" y2="14"></line>
                <line x1="17.5" y1="10" x2="12" y2="14"></line>
              </svg>
            </div>
          </div>
          <div class="kpi-big-value">8,420</div>
          <div class="kpi-progress-row">
            <div class="progress-bar-track">
              <div class="progress-bar-fill" style="width: 94%;"></div>
            </div>
            <span class="progress-label">94% Disponibles</span>
          </div>
        </div>

        <!-- KPI 3: Alertas de Stock Crítico -->
        <div class="kpi-card">
          <div class="kpi-top-row">
            <span class="kpi-title">Alertas de Stock Crítico</span>
            <div class="kpi-icon-container red-tint">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
          </div>
          <div class="kpi-big-value">
            <span class="alert-red-number">14</span>
            <span class="alert-suffix">items</span>
          </div>
          <div class="kpi-bottom-row">
            <span class="kpi-pill red-pill">ACCIÓN PRIORITARIA</span>
            <span class="kpi-caption">6 quiebres inminentes</span>
          </div>
        </div>

        <!-- KPI 4: Movimientos del Día -->
        <div class="kpi-card">
          <div class="kpi-top-row">
            <span class="kpi-title">Movimientos del Día</span>
            <div class="kpi-icon-container blue-tint">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
            </div>
          </div>
          <div class="kpi-big-value">
            <span>158</span>
            <span class="order-suffix">órdenes</span>
          </div>
          <div class="kpi-bottom-row space-between">
            <span class="delivery-rate">92% de cumplimiento diario</span>
            <span class="kpi-pill green-pill">A TIEMPO</span>
          </div>
        </div>
      </section>

      <!-- 3. Accesos Rápidos / Acciones de Operación -->
      <section class="shortcuts-grid">
        <div class="shortcut-card" (click)="onShortcutClick('scanner')">
          <div class="shortcut-icon blue-tint">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 7V5a2 2 0 0 1 2-2h2"></path>
              <path d="M17 3h2a2 2 0 0 1 2 2v2"></path>
              <path d="M21 17v2a2 2 0 0 1-2 2h-2"></path>
              <path d="M7 21H5a2 2 0 0 1-2-2v-2"></path>
              <line x1="7" y1="12" x2="17" y2="12"></line>
            </svg>
          </div>
          <div class="shortcut-info">
            <h2 class="shortcut-title">Escáner Móvil / Terminal</h2>
            <p class="shortcut-desc">Verificación rápida de bultos y palets</p>
          </div>
          <svg class="shortcut-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>

        <div class="shortcut-card" (click)="onShortcutClick('audit')">
          <div class="shortcut-icon blue-tint">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 11l3 3L22 4"></path>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
          </div>
          <div class="shortcut-info">
            <h2 class="shortcut-title">Auditoría Cíclica de Pasillo</h2>
            <p class="shortcut-desc">Conteo aleatorio programado (Pasillos A01-A08)</p>
          </div>
          <svg class="shortcut-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>

        <div class="shortcut-card" (click)="onShortcutClick('losses')">
          <div class="shortcut-icon orange-tint">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <div class="shortcut-info">
            <h2 class="shortcut-title">Registro de Mermas / Daños</h2>
            <p class="shortcut-desc">Ajuste inmediato por rotura o vencimiento</p>
          </div>
          <svg class="shortcut-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
      </section>

      <!-- 4. Sección Media: Gráfica Semanal y Reabastecimiento -->
      <section class="mid-section-grid">
        <!-- Gráfica de Movimientos Semanales -->
        <div class="weekly-chart-card">
          <div class="chart-header">
            <div>
              <h2 class="chart-title">Flujo de Movimientos Semanales</h2>
              <p class="chart-subtitle">Balance dinámico de entradas vs. despachos en Almacén Central</p>
            </div>
            <div class="chart-legend-group">
              <div class="legend-item">
                <span class="legend-box blue-box"></span>
                <span>Entradas</span>
              </div>
              <div class="legend-item">
                <span class="legend-box dark-navy-box"></span>
                <span>Salidas / Envíos</span>
              </div>
              <span class="sem-tag">SEM 43</span>
            </div>
          </div>

          <!-- Gráfico SVG con barras duales y curva suavizada -->
          <div class="chart-canvas-container">
            <svg viewBox="0 0 650 200" preserveAspectRatio="none" class="chart-svg">
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.28"/>
                  <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.0"/>
                </linearGradient>
              </defs>

              <!-- Líneas guía punteadas horizontales -->
              <line x1="20" y1="35" x2="630" y2="35" stroke="#e2e8f0" stroke-dasharray="3,3" stroke-width="1"></line>
              <line x1="20" y1="80" x2="630" y2="80" stroke="#e2e8f0" stroke-dasharray="3,3" stroke-width="1"></line>
              <line x1="20" y1="125" x2="630" y2="125" stroke="#e2e8f0" stroke-dasharray="3,3" stroke-width="1"></line>
              <line x1="20" y1="170" x2="630" y2="170" stroke="#f1f5f9" stroke-width="1"></line>

              <!-- Barras duales: Blue (#3b82f6) & Dark Navy (#1e293b) -->
              <!-- LUN (x=50) -->
              <rect x="42" y="75" width="13" height="95" rx="2" fill="#3b82f6"></rect>
              <rect x="58" y="85" width="13" height="85" rx="2" fill="#1e293b"></rect>

              <!-- MAR (x=135) -->
              <rect x="127" y="62" width="13" height="108" rx="2" fill="#3b82f6"></rect>
              <rect x="143" y="65" width="13" height="105" rx="2" fill="#1e293b"></rect>

              <!-- MIÉ (x=220) -->
              <rect x="212" y="45" width="13" height="125" rx="2" fill="#3b82f6"></rect>
              <rect x="228" y="55" width="13" height="115" rx="2" fill="#1e293b"></rect>

              <!-- JUE (x=305) -->
              <rect x="297" y="58" width="13" height="112" rx="2" fill="#3b82f6"></rect>
              <rect x="313" y="62" width="13" height="108" rx="2" fill="#1e293b"></rect>

              <!-- VIE (x=390) -->
              <rect x="382" y="40" width="13" height="130" rx="2" fill="#3b82f6"></rect>
              <rect x="398" y="37" width="13" height="133" rx="2" fill="#1e293b"></rect>

              <!-- SÁB (x=475) -->
              <rect x="467" y="98" width="13" height="72" rx="2" fill="#3b82f6"></rect>
              <rect x="483" y="105" width="13" height="65" rx="2" fill="#1e293b"></rect>

              <!-- DOM (x=560) -->
              <rect x="552" y="125" width="13" height="45" rx="2" fill="#3b82f6"></rect>
              <rect x="568" y="128" width="13" height="42" rx="2" fill="#1e293b"></rect>

              <!-- Área bajo la curva de tendencia suave -->
              <path d="M 50 80 C 100 68, 170 50, 220 50 C 265 50, 345 52, 390 40 C 435 28, 450 85, 480 102 C 520 120, 540 126, 565 127 L 565 170 L 50 170 Z" fill="url(#areaGradient)"></path>

              <!-- Curva de tendencia suavizada celeste/azul brillante -->
              <path d="M 50 80 C 100 68, 170 50, 220 50 C 265 50, 345 52, 390 40 C 435 28, 450 85, 480 102 C 520 120, 540 126, 565 127" fill="none" stroke="#0284c7" stroke-width="2.6" stroke-linecap="round"></path>
            </svg>

            <!-- Etiquetas de los días -->
            <div class="days-row">
              <span class="day-label">LUN</span>
              <span class="day-label">MAR</span>
              <span class="day-label">MIÉ</span>
              <span class="day-label">JUE</span>
              <span class="day-label">VIE</span>
              <span class="day-label">SÁB</span>
              <span class="day-label">DOM</span>
            </div>
          </div>

          <!-- Métricas de pie de la gráfica -->
          <div class="chart-summary-bar">
            <div class="summary-col">
              <span class="summary-label">TOTAL INGRESOS</span>
              <span class="summary-val text-blue">1,248 uds</span>
            </div>
            <div class="summary-col">
              <span class="summary-label">TOTAL DESPACHOS</span>
              <span class="summary-val text-navy">1,312 uds</span>
            </div>
            <div class="summary-col">
              <span class="summary-label">ROTACIÓN PROMEDIO</span>
              <span class="summary-val text-green">4.8 días</span>
            </div>
          </div>
        </div>

        <!-- Columna de Reabastecimiento -->
        <div class="restock-card">
          <div class="restock-header">
            <div class="restock-title-row">
              <div class="restock-title-group">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                <h2 class="restock-title">Reabastecimiento</h2>
              </div>
              <span class="critical-count-pill">3 CRÍTICOS</span>
            </div>
            <p class="restock-subtitle">Artículos que han sobrepasado su punto mínimo de reorden calculado por volumen.</p>
          </div>

          <!-- Lista de 3 Artículos Críticos -->
          <div class="restock-items-list">
            <div *ngFor="let item of restockItems" class="restock-item">
              <div class="item-title-row">
                <span class="item-name">{{ item.name }}</span>
                <span [class]="'badge-' + item.badgeType">{{ item.badge }}</span>
              </div>
              <div class="item-sku">SKU: {{ item.sku }}</div>
              <div class="item-stats-row">
                <span class="stock-info">
                  Stock actual: <strong [class]="item.badgeType === 'critical' ? 'text-red' : 'text-amber'">{{ item.stockActual }}</strong> / Mín: {{ item.stockMin }}
                </span>
                <span class="aisle-info">{{ item.aisle }}</span>
              </div>
              <button class="btn-solicitar" (click)="onRequestRestock(item)">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <span>Solicitar Pedido</span>
              </button>
            </div>
          </div>

          <div class="restock-footer">
            <a routerLink="/app/dashboard" class="catalog-link">Ver catálogo completo de reorden →</a>
          </div>
        </div>
      </section>

      <!-- 5. Tabla de Movimientos y Transacciones Recientes -->
      <section class="transactions-card">
        <div class="table-top-bar">
          <div>
            <h2 class="table-card-title">Movimientos y Transacciones Recientes</h2>
            <p class="table-card-subtitle">Registro cronológico de ingresos, despachos y transferencias entre ubicaciones</p>
          </div>

          <div class="table-controls">
            <!-- Buscador interno -->
            <div class="table-search-box">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input 
                type="text" 
                [(ngModel)]="searchFilter" 
                placeholder="Filtrar por SKU o lote..." 
                class="table-search-input"
              />
            </div>

            <!-- Tabs de Filtro de Tipo -->
            <div class="filter-tabs">
              <button 
                *ngFor="let tab of ['Todos', 'Entradas', 'Salidas', 'Traspasos']"
                (click)="activeTab = tab"
                [class.active]="activeTab === tab"
                class="filter-tab-btn">
                {{ tab }}
              </button>
            </div>

            <!-- Botón Refrescar -->
            <button class="btn-table-refresh" (click)="refreshTransactions()" title="Recargar transacciones">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Tabla de Datos -->
        <div class="table-wrapper">
          <table class="inventory-table">
            <thead>
              <tr>
                <th>SKU / PRODUCTO</th>
                <th>TIPO MOVIMIENTO</th>
                <th>CANTIDAD</th>
                <th>UBICACIÓN / BAHÍA</th>
                <th>OPERADOR / RESP.</th>
                <th>FECHA Y HORA</th>
                <th>ESTADO</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let row of filteredTransactions">
                <!-- Columna Producto y SKU -->
                <td>
                  <div class="product-cell">
                    <span class="product-title">{{ row.product }}</span>
                    <span class="product-sku-detail">{{ row.detail }}</span>
                  </div>
                </td>

                <!-- Columna Tipo Movimiento -->
                <td>
                  <span [class]="'pill-type ' + row.type.toLowerCase()">
                    <span class="type-dot"></span>
                    {{ row.type }}
                  </span>
                </td>

                <!-- Columna Cantidad -->
                <td>
                  <span [class]="row.isPositive ? 'qty-positive' : (row.isNeutral ? 'qty-neutral' : 'qty-negative')">
                    {{ row.quantity }}
                  </span>
                </td>

                <!-- Columna Ubicación -->
                <td>
                  <div class="location-cell">
                    <span [class]="'location-badge ' + (row.locationHighlight ? 'location-highlight' : '')">
                      {{ row.location }}
                    </span>
                    <ng-container *ngIf="row.toLocation">
                      <span class="arrow-sep">→</span>
                      <span class="location-badge">{{ row.toLocation }}</span>
                    </ng-container>
                  </div>
                </td>

                <!-- Columna Operador -->
                <td>
                  <div class="operator-cell">
                    <div class="operator-avatar" [style.backgroundColor]="row.operatorBg" [style.color]="row.operatorColor">
                      {{ row.operatorInitials }}
                    </div>
                    <span class="operator-name">{{ row.operator }}</span>
                  </div>
                </td>

                <!-- Columna Fecha y Hora -->
                <td>
                  <span class="datetime-cell">{{ row.dateTime }}</span>
                </td>

                <!-- Columna Estado -->
                <td>
                  <span [class]="'status-pill ' + getStatusClass(row.status)">
                    <svg *ngIf="row.status === 'Completado'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <svg *ngIf="row.status === 'En Tránsito'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M5 22h14"></path>
                      <path d="M5 2h14"></path>
                      <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"></path>
                      <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"></path>
                    </svg>
                    <svg *ngIf="row.status === 'En Verificación'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="3"></circle>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                    {{ row.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Paginación y Contador de Registros -->
        <div class="table-pagination-footer">
          <span class="pagination-count">Mostrando 1 - 5 de 158 transacciones hoy</span>
          <div class="pagination-controls">
            <button class="btn-pag-nav" disabled>&lt; Anterior</button>
            <button class="btn-pag-num active">1</button>
            <button class="btn-pag-num">2</button>
            <button class="btn-pag-num">3</button>
            <button class="btn-pag-nav">Siguiente &gt;</button>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      background-color: #f8fafc;
      min-height: 100%;
      color: #0f172a;
      font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      letter-spacing: -0.012em;
    }

    /* El contenedor de la vista usa .fz-viewport (styles.css) */

    /* 1. Header */
    .header-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1.25rem;
      padding-bottom: 0.25rem;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .header-icon-badge {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      background: #eff6ff;
      border: 1px solid #dbeafe;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.12);
    }

    .header-titles {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .title-with-pill {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      flex-wrap: wrap;
    }

    .page-title {
      font-size: 1.35rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.03em;
      margin: 0;
      line-height: 1.2;
    }

    .live-status-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      padding: 0.25rem 0.7rem;
      font-size: 0.64rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: #475569;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
    }

    .pulse-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 8px rgba(16, 185, 129, 0.8);
      animation: statusPulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1);
    }

    @keyframes statusPulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.9); }
    }

    .status-subtitle {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.74rem;
      color: #64748b;
    }

    .sep-dot {
      color: #cbd5e1;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .select-container {
      position: relative;
      display: flex;
      align-items: center;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 0.5rem 0.8rem;
      gap: 0.5rem;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
      transition: all 0.2s ease;
    }

    .select-container:focus-within {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
    }

    .warehouse-dropdown {
      border: none;
      background: transparent;
      outline: none;
      font-size: 0.78rem;
      font-weight: 600;
      color: #1e293b;
      cursor: pointer;
      appearance: none;
      padding-right: 1.1rem;
      font-family: inherit;
    }

    .btn-action-outline {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      color: #334155;
      font-size: 0.78rem;
      font-weight: 600;
      padding: 0.5rem 0.95rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
      font-family: inherit;
    }

    .btn-action-outline:hover {
      background: #f8fafc;
      border-color: #94a3b8;
      box-shadow: 0 2px 6px rgba(15, 23, 42, 0.08);
      transform: translateY(-1px);
    }

    .btn-action-dark {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: #0f172a;
      border: 1px solid #0f172a;
      color: #ffffff;
      font-size: 0.78rem;
      font-weight: 600;
      padding: 0.5rem 0.95rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 2px 6px rgba(15, 23, 42, 0.18);
      font-family: inherit;
    }

    .btn-action-dark:hover {
      background: #1e293b;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.28);
      transform: translateY(-1px);
    }

    .btn-action-blue {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      border: 1px solid #1d4ed8;
      color: #ffffff;
      font-size: 0.78rem;
      font-weight: 600;
      padding: 0.5rem 1.05rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
      font-family: inherit;
    }

    .btn-action-blue:hover {
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.42);
      transform: translateY(-1px);
    }

    /* 2. KPIs Grid con elevación de tarjetas y sombras multicapa */
    .kpis-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.15rem;
    }

    .kpi-card {
      background: #ffffff;
      border: 1px solid rgba(226, 232, 240, 0.85);
      border-radius: 12px;
      padding: 1.15rem 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
      box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 4px 12px -2px rgba(15, 23, 42, 0.04);
      transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .kpi-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px -4px rgba(15, 23, 42, 0.08), 0 2px 6px -2px rgba(15, 23, 42, 0.04);
      border-color: rgba(203, 213, 225, 0.9);
    }

    .kpi-top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .kpi-title {
      font-size: 0.78rem;
      font-weight: 600;
      color: #64748b;
      letter-spacing: -0.01em;
    }

    .kpi-icon-container {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
    }

    .blue-tint {
      background: #eff6ff;
      border: 1px solid #dbeafe;
    }

    .teal-tint {
      background: #e0f2fe;
      border: 1px solid #bae6fd;
    }

    .red-tint {
      background: #fee2e2;
      border: 1px solid #fecaca;
    }

    .orange-tint {
      background: #ffedd5;
      border: 1px solid #fed7aa;
    }

    .kpi-big-value {
      font-size: 1.65rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.04em;
      line-height: 1.15;
      display: flex;
      align-items: baseline;
      gap: 0.35rem;
    }

    .alert-red-number {
      color: #dc2626;
    }

    .alert-suffix, .order-suffix {
      font-size: 0.82rem;
      font-weight: 500;
      color: #475569;
      letter-spacing: 0;
    }

    .kpi-bottom-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.73rem;
    }

    .space-between {
      justify-content: space-between;
    }

    .kpi-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.18rem 0.5rem;
      border-radius: 5px;
      font-size: 0.68rem;
      font-weight: 700;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.02);
    }

    .green-pill {
      background: #dcfce7;
      color: #16a34a;
    }

    .red-pill {
      background: #fee2e2;
      color: #dc2626;
      letter-spacing: 0.03em;
    }

    .kpi-caption {
      color: #64748b;
    }

    .kpi-progress-row {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      margin-top: 0.15rem;
    }

    .progress-bar-track {
      flex: 1;
      height: 6px;
      background: #e2e8f0;
      border-radius: 6px;
      overflow: hidden;
      box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #3b82f6, #2563eb);
      border-radius: 6px;
    }

    .progress-label {
      font-size: 0.72rem;
      font-weight: 600;
      color: #334155;
      white-space: nowrap;
    }

    .delivery-rate {
      font-size: 0.74rem;
      font-weight: 700;
      color: #2563eb;
    }

    /* 3. Accesos Rápidos con Sombras Interactivas */
    .shortcuts-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.15rem;
    }

    .shortcut-card {
      background: #ffffff;
      border: 1px solid rgba(226, 232, 240, 0.85);
      border-radius: 10px;
      padding: 0.95rem 1.2rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 2px 6px -1px rgba(15, 23, 42, 0.03);
    }

    .shortcut-card:hover {
      border-color: #cbd5e1;
      background: #ffffff;
      transform: translateY(-2px);
      box-shadow: 0 6px 18px -2px rgba(15, 23, 42, 0.08);
    }

    .shortcut-icon {
      width: 38px;
      height: 38px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 2px 4px rgba(15, 23, 42, 0.04);
    }

    .shortcut-info {
      flex: 1;
    }

    .shortcut-title {
      font-size: 0.84rem;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.015em;
      margin: 0;
    }

    .shortcut-desc {
      font-size: 0.71rem;
      color: #64748b;
      margin: 0.12rem 0 0;
    }

    .shortcut-chevron {
      color: #94a3b8;
      transition: transform 0.2s ease, color 0.2s ease;
    }

    .shortcut-card:hover .shortcut-chevron {
      color: #2563eb;
      transform: translateX(3px);
    }

    /* 4. Sección Media (Gráfico + Reabastecimiento) */
    .mid-section-grid {
      display: grid;
      grid-template-columns: 2.1fr 1fr;
      gap: 1.15rem;
    }

    .weekly-chart-card {
      background: #ffffff;
      border: 1px solid rgba(226, 232, 240, 0.85);
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 6px 16px -2px rgba(15, 23, 42, 0.04);
    }

    .chart-header {
      padding: 1.25rem 1.4rem 0.5rem;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .chart-title {
      font-size: 0.95rem;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.02em;
      margin: 0;
    }

    .chart-subtitle {
      font-size: 0.73rem;
      color: #64748b;
      margin: 0.2rem 0 0;
    }

    .chart-legend-group {
      display: flex;
      align-items: center;
      gap: 0.9rem;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.73rem;
      font-weight: 600;
      color: #334155;
    }

    .legend-box {
      width: 10px;
      height: 10px;
      border-radius: 3px;
    }

    .blue-box {
      background: #3b82f6;
    }

    .dark-navy-box {
      background: #1e293b;
    }

    .sem-tag {
      background: #f1f5f9;
      color: #64748b;
      font-size: 0.66rem;
      font-weight: 700;
      padding: 0.18rem 0.5rem;
      border-radius: 5px;
      border: 1px solid #e2e8f0;
    }

    .chart-canvas-container {
      padding: 0.75rem 1.4rem 0.85rem;
      position: relative;
    }

    .chart-svg {
      width: 100%;
      height: 175px;
      overflow: visible;
    }

    .days-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 2rem 0;
    }

    .day-label {
      font-size: 0.69rem;
      font-weight: 700;
      color: #64748b;
    }

    .chart-summary-bar {
      display: flex;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      border-radius: 0 0 12px 12px;
      padding: 0.85rem 1.4rem;
    }

    .summary-col {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.18rem;
    }

    .summary-col:not(:last-child) {
      border-right: 1px solid #e2e8f0;
    }

    .summary-label {
      font-size: 0.64rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: #64748b;
      text-transform: uppercase;
    }

    .summary-val {
      font-size: 0.92rem;
      font-weight: 800;
      letter-spacing: -0.02em;
    }

    .text-blue {
      color: #2563eb;
    }

    .text-navy {
      color: #1e293b;
    }

    .text-green {
      color: #16a34a;
    }

    /* Reabastecimiento Card */
    .restock-card {
      background: #ffffff;
      border: 1px solid rgba(226, 232, 240, 0.85);
      border-radius: 12px;
      padding: 1.25rem 1.3rem;
      display: flex;
      flex-direction: column;
      box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 6px 16px -2px rgba(15, 23, 42, 0.04);
    }

    .restock-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .restock-title-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .restock-title {
      font-size: 0.95rem;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.02em;
      margin: 0;
    }

    .critical-count-pill {
      background: #fee2e2;
      color: #dc2626;
      font-size: 0.66rem;
      font-weight: 700;
      padding: 0.18rem 0.5rem;
      border-radius: 5px;
      border: 1px solid #fecaca;
    }

    .restock-subtitle {
      font-size: 0.7rem;
      color: #64748b;
      margin: 0.4rem 0 0.85rem;
      line-height: 1.35;
    }

    .restock-items-list {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .restock-item {
      padding: 0.6rem 0;
      border-top: 1px solid #f1f5f9;
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }

    .item-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .item-name {
      font-size: 0.8rem;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.01em;
    }

    .badge-critical {
      background: #fee2e2;
      color: #dc2626;
      font-size: 0.63rem;
      font-weight: 700;
      padding: 0.12rem 0.45rem;
      border-radius: 4px;
      border: 1px solid #fecaca;
    }

    .badge-low {
      background: #fef3c7;
      color: #b45309;
      font-size: 0.63rem;
      font-weight: 700;
      padding: 0.12rem 0.45rem;
      border-radius: 4px;
      border: 1px solid #fde68a;
    }

    .item-sku {
      font-size: 0.69rem;
      color: #64748b;
      font-family: 'JetBrains Mono', monospace;
    }

    .item-stats-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.73rem;
      color: #475569;
    }

    .text-red {
      color: #dc2626;
      font-weight: 700;
    }

    .text-amber {
      color: #b45309;
      font-weight: 700;
    }

    .aisle-info {
      font-size: 0.71rem;
      color: #64748b;
    }

    .btn-solicitar {
      margin-top: 0.4rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      color: #2563eb;
      font-size: 0.74rem;
      font-weight: 600;
      padding: 0.45rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
      font-family: inherit;
    }

    .btn-solicitar:hover {
      background: #eff6ff;
      border-color: #93c5fd;
      box-shadow: 0 2px 6px rgba(37, 99, 235, 0.15);
      transform: translateY(-1px);
    }

    .restock-footer {
      margin-top: auto;
      padding-top: 1rem;
      text-align: center;
    }

    .catalog-link {
      font-size: 0.77rem;
      font-weight: 600;
      color: #2563eb;
      text-decoration: none;
      transition: color 0.15s ease;
    }

    .catalog-link:hover {
      color: #1d4ed8;
      text-decoration: underline;
    }

    /* 5. Tabla de Transacciones Recientes */
    .transactions-card {
      background: #ffffff;
      border: 1px solid rgba(226, 232, 240, 0.85);
      border-radius: 12px;
      padding: 1.25rem 1.4rem 1rem;
      display: flex;
      flex-direction: column;
      box-shadow: 0 1px 4px 0 rgba(15, 23, 42, 0.04), 0 8px 24px -4px rgba(15, 23, 42, 0.04);
    }

    .table-top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.85rem;
      margin-bottom: 1rem;
    }

    .table-card-title {
      font-size: 1rem;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.02em;
      margin: 0;
    }

    .table-card-subtitle {
      font-size: 0.73rem;
      color: #64748b;
      margin: 0.2rem 0 0;
    }

    .table-controls {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      flex-wrap: wrap;
    }

    .table-search-box {
      display: flex;
      align-items: center;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 0.4rem 0.75rem;
      gap: 0.45rem;
      width: 220px;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
      transition: all 0.2s ease;
    }

    .table-search-box:focus-within {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
    }

    .table-search-input {
      border: none;
      background: transparent;
      outline: none;
      font-size: 0.76rem;
      color: #0f172a;
      width: 100%;
      font-family: inherit;
    }

    .table-search-input::placeholder {
      color: #94a3b8;
    }

    .filter-tabs {
      display: flex;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      overflow: hidden;
      background: #ffffff;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
    }

    .filter-tab-btn {
      border: none;
      background: transparent;
      padding: 0.42rem 0.85rem;
      font-size: 0.74rem;
      font-weight: 500;
      color: #64748b;
      cursor: pointer;
      transition: all 0.15s ease;
      font-family: inherit;
    }

    .filter-tab-btn:not(:last-child) {
      border-right: 1px solid #e2e8f0;
    }

    .filter-tab-btn.active {
      background: #0f172a;
      color: #ffffff;
      font-weight: 600;
    }

    .btn-table-refresh {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 0.42rem 0.55rem;
      color: #64748b;
      cursor: pointer;
      display: flex;
      align-items: center;
      transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
    }

    .btn-table-refresh:hover {
      background: #f8fafc;
      color: #0f172a;
      border-color: #94a3b8;
      box-shadow: 0 2px 6px rgba(15, 23, 42, 0.08);
      transform: translateY(-1px);
    }

    .table-wrapper {
      overflow-x: auto;
    }

    .inventory-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.78rem;
    }

    .inventory-table th {
      text-align: left;
      padding: 0.75rem 0.95rem;
      font-size: 0.67rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: #64748b;
      border-bottom: 1px solid #e2e8f0;
      text-transform: uppercase;
      background: #ffffff;
    }

    .inventory-table td {
      padding: 0.85rem 0.95rem;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: middle;
      transition: background-color 0.15s ease;
    }

    .inventory-table tbody tr:hover td {
      background-color: #f8fafc;
    }

    .product-cell {
      display: flex;
      flex-direction: column;
    }

    .product-title {
      font-weight: 700;
      color: #0f172a;
      font-size: 0.8rem;
      letter-spacing: -0.01em;
    }

    .product-sku-detail {
      font-size: 0.69rem;
      color: #64748b;
      margin-top: 0.1rem;
      font-family: 'JetBrains Mono', monospace;
    }

    .pill-type {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.22rem 0.6rem;
      border-radius: 5px;
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.03em;
    }

    .pill-type.entrada {
      background: #dcfce7;
      color: #16a34a;
      border: 1px solid #bbf7d0;
    }

    .pill-type.salida {
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #e2e8f0;
    }

    .pill-type.traspaso {
      background: #eff6ff;
      color: #2563eb;
      border: 1px solid #dbeafe;
    }

    .type-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: currentColor;
    }

    .qty-positive {
      font-weight: 700;
      color: #16a34a;
    }

    .qty-negative {
      font-weight: 700;
      color: #dc2626;
    }

    .qty-neutral {
      font-weight: 700;
      color: #0f172a;
    }

    .location-cell {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .location-badge {
      display: inline-block;
      padding: 0.18rem 0.5rem;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 5px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.69rem;
      font-weight: 600;
      color: #334155;
    }

    .location-highlight {
      background: #fef9c3;
      border-color: #fef08a;
      color: #a16207;
    }

    .arrow-sep {
      color: #94a3b8;
      font-size: 0.75rem;
    }

    .operator-cell {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .operator-avatar {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.64rem;
      font-weight: 700;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
    }

    .operator-name {
      color: #334155;
      font-weight: 500;
      font-size: 0.76rem;
    }

    .datetime-cell {
      color: #475569;
      font-size: 0.74rem;
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.22rem 0.6rem;
      border-radius: 14px;
      font-size: 0.69rem;
      font-weight: 600;
    }

    .status-pill.completed {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      color: #059669;
    }

    .status-pill.transit {
      background: #fffbeb;
      border: 1px solid #fde68a;
      color: #d97706;
    }

    .status-pill.verification {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      color: #475569;
    }

    .table-pagination-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1rem;
      border-top: 1px solid #f1f5f9;
      flex-wrap: wrap;
      gap: 0.85rem;
    }

    .pagination-count {
      font-size: 0.74rem;
      color: #64748b;
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    .btn-pag-nav {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 0.32rem 0.7rem;
      font-size: 0.74rem;
      color: #64748b;
      cursor: pointer;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
      transition: all 0.15s ease;
      font-family: inherit;
    }

    .btn-pag-nav:hover:not(:disabled) {
      background: #f8fafc;
      color: #0f172a;
      border-color: #94a3b8;
    }

    .btn-pag-nav:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-pag-num {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #cbd5e1;
      background: #ffffff;
      border-radius: 6px;
      font-size: 0.74rem;
      color: #64748b;
      cursor: pointer;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
      transition: all 0.15s ease;
      font-family: inherit;
    }

    .btn-pag-num:hover:not(.active) {
      background: #f8fafc;
      color: #0f172a;
      border-color: #94a3b8;
    }

    .btn-pag-num.active {
      background: #2563eb;
      border-color: #2563eb;
      color: #ffffff;
      font-weight: 700;
      box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .kpis-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .mid-section-grid {
        grid-template-columns: 1fr;
      }
      .shortcuts-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly authService = inject(AuthService);

  selectedWarehouse = 'central-a';
  searchFilter = '';
  activeTab = 'Todos';

  restockItems: RestockItem[] = [
    {
      name: 'Microcontrolador ARM-32',
      badge: 'CRÍTICO',
      badgeType: 'critical',
      sku: 'MCU-328P-T',
      stockActual: '12 uds',
      stockMin: 150,
      aisle: 'Pasillo B-04'
    },
    {
      name: 'Rodamiento Industrial 6204',
      badge: 'BAJO',
      badgeType: 'low',
      sku: 'ROD-6204-2RS',
      stockActual: '28 uds',
      stockMin: 100,
      aisle: 'Pasillo C-12'
    },
    {
      name: 'Cable Fibra Óptica OM4',
      badge: 'BAJO',
      badgeType: 'low',
      sku: 'CAB-OM4-50M',
      stockActual: '4 bobinas',
      stockMin: 20,
      aisle: 'Pasillo E-01'
    }
  ];

  transactions: Transaction[] = [
    {
      sku: 'SEN-IR-5001',
      product: 'Sensor Infrarrojo Proximidad',
      detail: 'SEN-IR-5001 | Lote #9822',
      type: 'ENTRADA',
      quantity: '+450 uds',
      isPositive: true,
      location: 'A-02-N1',
      operator: 'Marcos Rivas',
      operatorInitials: 'MR',
      operatorBg: '#dbeafe',
      operatorColor: '#1d4ed8',
      dateTime: 'Hoy, 10:42 AM',
      status: 'Completado'
    },
    {
      sku: 'PWR-24V-10A',
      product: 'Fuente de Alimentación 24V 10A',
      detail: 'PWR-24V-10A | Despacho #4410',
      type: 'SALIDA',
      quantity: '-35 uds',
      isPositive: false,
      location: 'D-09-N3',
      operator: 'Lucía Castro',
      operatorInitials: 'LC',
      operatorBg: '#ede9fe',
      operatorColor: '#6d28d9',
      dateTime: 'Hoy, 09:58 AM',
      status: 'Completado'
    },
    {
      sku: 'MOD-BLE-05',
      product: 'Módulo Bluetooth 5.0 Low Energy',
      detail: 'MOD-BLE-05 | Lote #3109',
      type: 'TRASPASO',
      quantity: '120 uds',
      isPositive: false,
      isNeutral: true,
      location: 'B-01',
      toLocation: 'C-04',
      operator: 'Esteban Gil',
      operatorInitials: 'EG',
      operatorBg: '#cffafe',
      operatorColor: '#0e7490',
      dateTime: 'Hoy, 09:15 AM',
      status: 'En Tránsito'
    },
    {
      sku: 'ALU-4040-2M',
      product: 'Perfil Aluminio Estructural 40x40',
      detail: 'ALU-4040-2M | Despacho #4409',
      type: 'SALIDA',
      quantity: '-80 barras',
      isPositive: false,
      location: 'F-01-N0',
      operator: 'Lucía Castro',
      operatorInitials: 'LC',
      operatorBg: '#ede9fe',
      operatorColor: '#6d28d9',
      dateTime: 'Hoy, 08:30 AM',
      status: 'Completado'
    },
    {
      sku: 'CON-M12-5P',
      product: 'Conector Industrial M12 5-Pines',
      detail: 'CON-M12-5P | Control de Calidad',
      type: 'ENTRADA',
      quantity: '+600 uds',
      isPositive: true,
      location: 'Z-CUAR-01',
      locationHighlight: true,
      operator: 'Marcos Rivas',
      operatorInitials: 'MR',
      operatorBg: '#dbeafe',
      operatorColor: '#1d4ed8',
      dateTime: 'Ayer, 18:20 PM',
      status: 'En Verificación'
    }
  ];

  get filteredTransactions(): Transaction[] {
    return this.transactions.filter(item => {
      const matchesTab = 
        this.activeTab === 'Todos' ||
        (this.activeTab === 'Entradas' && item.type === 'ENTRADA') ||
        (this.activeTab === 'Salidas' && item.type === 'SALIDA') ||
        (this.activeTab === 'Traspasos' && item.type === 'TRASPASO');

      const matchesSearch = 
        !this.searchFilter.trim() ||
        item.product.toLowerCase().includes(this.searchFilter.toLowerCase()) ||
        item.detail.toLowerCase().includes(this.searchFilter.toLowerCase()) ||
        item.sku.toLowerCase().includes(this.searchFilter.toLowerCase());

      return matchesTab && matchesSearch;
    });
  }

  ngOnInit(): void {
    // Sincronización transparente con el backend si existe
    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        // Datos adicionales pueden actualizar métricas si el backend está activo
      },
      error: () => {
        // Mantiene la vista perfectamente operativa de modo standalone
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Completado': return 'completed';
      case 'En Tránsito': return 'transit';
      case 'En Verificación': return 'verification';
      default: return '';
    }
  }

  onExportBalance(): void {
    // Feedback visual o exportación
  }

  onNewExit(): void {
    // Apertura de modal o formulario
  }

  onRegisterEntry(): void {
    // Apertura de modal o formulario
  }

  onShortcutClick(type: string): void {
    // Acceso a terminales o auditorías
  }

  onRequestRestock(item: RestockItem): void {
    // Solicitud rápida de pedido
  }

  refreshTransactions(): void {
    // Refresco de datos
  }
}
