import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { DashboardService } from '../../Services/dashboard.service';
import { AuthService } from '../../Services/auth.service';
import { ProductsService, ProductItem } from '../../Services/products.service';
import { SaleService, SaleDto } from '../../Services/sale.service';

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

interface ChartDayPoint {
  label: string;
  fullDate: string;
  salesCount: number;
  salesAmount: number;
  ordersCount: number;
  ordersAmount: number;
  salesH: number;
  salesY: number;
  ordersH: number;
  ordersY: number;
  x: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="fz-viewport">
      <!-- 1. Encabezado Estilo Firmeza Unificado -->
      <header class="fz-header">
        <div class="fz-header-left">
          <div class="fz-header-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
          <div class="fz-header-titles">
            <div class="fz-title-row">
              <h1 class="fz-page-title">{{ companyName ? 'Panel General — ' + companyName : 'Panel General de Inventario' }}</h1>
              <span class="fz-live-pill">
                <span class="fz-pulse-dot"></span>
                Sincronizado en tiempo real
              </span>
            </div>
            <div class="fz-subtitle">
              <span>Filtro: <strong>{{ selectedDay ? selectedDay : 'Todos los registros' }}</strong></span>
              <span class="fz-sep">•</span>
              <span>{{ currentDateDisplay }}</span>
              <ng-container *ngIf="totalClients !== null">
                <span class="fz-sep">•</span>
                <span>{{ totalClients }} clientes registrados</span>
              </ng-container>
            </div>
          </div>
        </div>

        <div class="fz-header-actions">
          <!-- Selector de Fecha Específica para Dashboard -->
          <div class="fz-field" title="Filtrar por fecha específica">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <input 
              type="date" 
              [(ngModel)]="selectedDay" 
              (change)="onDateFilterChange()"
              class="date-input-field"
            />
            <button 
              *ngIf="selectedDay" 
              (click)="selectedDay = ''; onDateFilterChange()" 
              class="btn-clear-date" 
              title="Ver todos los días">✕</button>
          </div>

          <!-- Acceso directo a Movimientos y Pedidos -->
          <a routerLink="/app/enterprises" class="fz-btn fz-btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m7 16-4-4 4-4"></path>
              <path d="M3 12h18"></path>
              <path d="m17 8 4 4-4 4"></path>
            </svg>
            <span>Ver Movimientos</span>
          </a>
        </div>
      </header>

      <!-- 2. Tarjetas de Métricas Clave (KPIs Independientes) -->
      <section class="kpis-grid">
        <!-- KPI 1: Valor Total Inventario -->
        <div class="kpi-card">
          <div class="kpi-top-row">
            <span class="kpi-title">VALOR TOTAL INVENTARIO</span>
            <div class="kpi-icon-container blue-tint">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                <line x1="2" y1="10" x2="22" y2="10"></line>
              </svg>
            </div>
          </div>
          <div class="kpi-big-value">\${{ totalInventoryValue | number:'1.0-2' }}</div>
          <div class="kpi-bottom-row">
            <span class="kpi-pill green-pill">{{ totalUnitsInStock | number }} uds</span>
            <span class="kpi-caption">en base de datos</span>
          </div>
        </div>

        <!-- KPI 2: SKUs Activos en Almacén -->
        <div class="kpi-card">
          <div class="kpi-top-row">
            <span class="kpi-title">SKUS ACTIVOS EN ALMACÉN</span>
            <div class="kpi-icon-container teal-tint">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="8.5" y="14" width="7" height="7"></rect>
                <line x1="6.5" y1="10" x2="12" y2="14"></line>
                <line x1="17.5" y1="10" x2="12" y2="14"></line>
              </svg>
            </div>
          </div>
          <div class="kpi-big-value">{{ products.length | number }}</div>
          <div class="kpi-progress-row">
            <div class="progress-bar-track">
              <div class="progress-bar-fill" [style.width.%]="availabilityPercent"></div>
            </div>
            <span class="progress-label">{{ availabilityPercent }}% Disponibles</span>
          </div>
        </div>

        <!-- KPI 3: Alertas de Stock Crítico -->
        <div class="kpi-card">
          <div class="kpi-top-row">
            <span class="kpi-title">ALERTAS DE STOCK CRÍTICO</span>
            <div class="kpi-icon-container red-tint">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
          </div>
          <div class="kpi-big-value">
            <span class="alert-red-number">{{ criticalStockCount }}</span>
            <span class="alert-suffix">items</span>
          </div>
          <div class="kpi-bottom-row">
            <span class="kpi-pill red-pill">{{ criticalStockCount > 0 ? 'ACCIÓN PRIORITARIA' : 'SIN ALERTAS' }}</span>
            <span class="kpi-caption">{{ outOfStockCount }} quiebres inminentes</span>
          </div>
        </div>

        <!-- KPI 4: Movimientos / Órdenes (Lapso de Tiempo Independiente) -->
        <div class="kpi-card">
          <div class="kpi-top-row">
            <span class="kpi-title">MOVIMIENTOS / ÓRDENES</span>
            <div style="display: flex; align-items: center; gap: 0.35rem;">
              <select [(ngModel)]="kpiOrdersLapse" class="kpi-lapse-select" title="Filtrar métrica por lapso">
                <option value="day">Día Arriba</option>
                <option value="today">Hoy</option>
                <option value="7d">7 Días</option>
                <option value="30d">30 Días</option>
                <option value="all">Todo</option>
              </select>
              <div class="kpi-icon-container blue-tint">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="1" y="3" width="15" height="13"></rect>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 8"></polygon>
                  <circle cx="5.5" cy="18.5" r="2.5"></circle>
                  <circle cx="18.5" cy="18.5" r="2.5"></circle>
                </svg>
              </div>
            </div>
          </div>
          <div class="kpi-big-value">
            <span>{{ kpiSalesFiltered.length | number }}</span>
            <span class="order-suffix">órdenes</span>
          </div>
          <div class="kpi-bottom-row space-between">
            <span class="delivery-rate">{{ kpiPaidOrdersPercent }}% ventas cobradas</span>
            <span class="kpi-pill green-pill">{{ kpiPaidSalesCount }} VENDIDAS</span>
          </div>
        </div>
      </section>

      <!-- 3. Sección Media: Gráfica Semanal y Reabastecimiento -->
      <section class="mid-section-grid">
        <!-- Gráfica de Movimientos Semanales (Con filtro de tiempo independiente) -->
        <div class="weekly-chart-card">
          <div class="chart-header">
            <div>
              <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;">
                <h2 class="chart-title">Flujo de Movimientos y Ventas</h2>
                <div class="chart-lapse-group">
                  <button type="button" class="lapse-btn" [class.active]="chartLapse === '7d'" (click)="setChartLapse('7d')">7 Días</button>
                  <button type="button" class="lapse-btn" [class.active]="chartLapse === '30d'" (click)="setChartLapse('30d')">30 Días</button>
                  <button type="button" class="lapse-btn" [class.active]="chartLapse === 'custom'" (click)="setChartLapse('custom')">Lapso Libre</button>
                </div>
                <div *ngIf="chartLapse === 'custom'" style="display: flex; align-items: center; gap: 0.3rem;">
                  <input type="date" [(ngModel)]="chartStartDate" class="date-chip-input" />
                  <span style="font-size: 0.7rem; color: #64748b;">a</span>
                  <input type="date" [(ngModel)]="chartEndDate" class="date-chip-input" />
                </div>
              </div>
              <p class="chart-subtitle">Ventas realizadas (azul) y pedidos pendientes (rojo) calculados desde la base de datos</p>
            </div>
            <div class="chart-legend-group">
              <div class="legend-item">
                <span class="legend-box blue-box"></span>
                <span>Ventas Realizadas</span>
              </div>
              <div class="legend-item">
                <span class="legend-box dark-navy-box"></span>
                <span>Pedidos Pendientes</span>
              </div>
              <span class="sem-tag">{{ chartPoints.length }} DÍAS</span>
            </div>
          </div>

          <!-- Gráfico SVG con barras dinámicas reales -->
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

              <!-- Barras duales dinámicas de la base de datos -->
              <g *ngFor="let pt of chartPoints">
                <!-- Ventas (Azul) -->
                <rect 
                  [attr.x]="pt.x - 11" 
                  [attr.y]="pt.salesY" 
                  width="11" 
                  [attr.height]="pt.salesH" 
                  rx="2" 
                  fill="#3b82f6">
                  <title>{{ pt.fullDate }}: {{ pt.salesCount }} ventas completadas (\${{ pt.salesAmount | number:'1.0-2' }})</title>
                </rect>
                <!-- Pedidos Pendientes (Rojo) -->
                <rect 
                  [attr.x]="pt.x + 2" 
                  [attr.y]="pt.ordersY" 
                  width="11" 
                  [attr.height]="pt.ordersH" 
                  rx="2" 
                  fill="#dc2626">
                  <title>{{ pt.fullDate }}: {{ pt.ordersCount }} pedidos pendientes (\${{ pt.ordersAmount | number:'1.0-2' }})</title>
                </rect>
              </g>

              <!-- Curva de tendencia suave -->
              <path *ngIf="chartPoints.length > 1" [attr.d]="chartAreaPath" fill="url(#areaGradient)"></path>
              <path *ngIf="chartPoints.length > 1" [attr.d]="chartLinePath" fill="none" stroke="#0284c7" stroke-width="2.6" stroke-linecap="round"></path>
            </svg>

            <!-- Etiquetas dinámicas de los días en el eje X -->
            <div class="days-row">
              <span class="day-label" *ngFor="let pt of chartPoints" [title]="pt.fullDate">{{ pt.label }}</span>
            </div>
          </div>

          <!-- Métricas de pie de la gráfica calculadas dinámicamente -->
          <div class="chart-summary-bar">
            <div class="summary-col">
              <span class="summary-label">TOTAL VENTAS EN PERÍODO</span>
              <span class="summary-val text-blue">\${{ chartTotalSalesAmount | number:'1.0-2' }} ({{ chartTotalSalesUnits }} ventas)</span>
            </div>
            <div class="summary-col">
              <span class="summary-label">PEDIDOS PENDIENTES</span>
              <span class="summary-val" style="color: #dc2626;">\${{ chartTotalOrdersAmount | number:'1.0-2' }} ({{ chartTotalOrdersUnits }} órdenes)</span>
            </div>
            <div class="summary-col">
              <span class="summary-label">TOTAL STOCK DISPONIBLE</span>
              <span class="summary-val text-navy">{{ totalUnitsInStock | number }} uds</span>
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
              <span class="critical-count-pill">{{ criticalStockCount }} CRÍTICOS</span>
            </div>
            <p class="restock-subtitle">Artículos con existencias en o por debajo del punto mínimo de stock.</p>
          </div>

          <!-- Lista de Artículos Críticos -->
          <div class="restock-items-list">
            <div *ngIf="restockItems.length === 0" style="padding: 1.5rem; text-align: center; color: #64748b; font-size: 0.85rem;">
              No hay alertas críticas de reabastecimiento pendientes.
            </div>
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
            </div>
          </div>

          <div class="restock-footer">
            <a routerLink="/app/inventory" class="catalog-link">Gestionar stock en Inventario →</a>
          </div>
        </div>
      </section>

      <!-- 4. Catálogo de Productos Registrados (ProductsService) -->
      <section class="table-card" style="margin-bottom: 1.5rem;">
        <div class="table-top-bar">
          <div>
            <div style="display: flex; align-items: center; gap: 0.65rem; flex-wrap: wrap;">
              <h2 class="table-card-title">Catálogo y Control de Productos</h2>
              <span class="fz-live-pill">
                <span class="fz-pulse-dot"></span>
                BD: {{ products.length }} ARTÍCULOS
              </span>
            </div>
            <p class="table-card-subtitle">Productos activos del almacén sincronizados en tiempo real</p>
          </div>

          <div class="table-controls">
            <!-- Buscador de productos -->
            <div class="table-search-box">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input 
                type="text" 
                [(ngModel)]="productsSearchFilter" 
                placeholder="Buscar por SKU, nombre..." 
                class="table-search-input"
              />
            </div>

            <!-- Botón Ir a Inventario -->
            <a routerLink="/app/inventory" class="fz-btn fz-btn-outline" style="padding: 0.45rem 0.85rem; font-size: 0.76rem;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              </svg>
              <span>Gestionar en Inventario</span>
            </a>
          </div>
        </div>

        <!-- Tabla de Productos -->
        <div class="table-wrapper">
          <table class="inventory-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Stock Disponible</th>
                <th>Precio Costo</th>
                <th>Precio Venta</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let prod of filteredProductsList; trackBy: trackBySku">
                <td>
                  <span class="location-badge">{{ prod.sku }}</span>
                </td>
                <td>
                  <div class="product-cell">
                    <span class="product-title">{{ prod.name }}</span>
                    <span class="product-sku-detail">{{ prod.location || 'Almacén Central' }}</span>
                  </div>
                </td>
                <td>{{ prod.category }}</td>
                <td>
                  <strong [class.qty-negative]="isUnderFive(prod)" [class.qty-positive]="!isUnderFive(prod)">
                    {{ prod.stockAvailable || '0' }} uds
                  </strong>
                </td>
                <td>\${{ prod.costPrice || '0.00' }}</td>
                <td>\${{ prod.salePrice || '0.00' }}</td>
                <td>
                  <span [class]="'status-pill ' + (isUnderFive(prod) ? 'verification' : 'completed')">
                    {{ isUnderFive(prod) ? 'Stock Bajo' : 'Normal' }}
                  </span>
                </td>
              </tr>
              <tr *ngIf="filteredProductsList.length === 0">
                <td colspan="7" style="text-align: center; padding: 2rem; color: #64748b;">
                  No hay productos registrados en la base de datos.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- 5. Tabla de Registro de Movimientos y Pedidos -->
      <section class="table-card">
        <div class="table-top-bar">
          <div>
            <h2 class="table-card-title">Registro de Movimientos y Pedidos</h2>
            <p class="table-card-subtitle">
              Historial de pedidos y ventas registrado en base de datos.
              <span *ngIf="selectedDay" style="color: #2563eb; font-weight: 600;"> (Filtrado por: {{ selectedDay }})</span>
            </p>
          </div>

          <div class="table-controls">
            <!-- Pestañas de Filtrado -->
            <div class="filter-tabs-container">
              <button 
                *ngFor="let tab of ['Todos', 'Ventas', 'Pedidos']" 
                class="filter-tab-btn" 
                [class.active]="activeTab === tab"
                (click)="activeTab = tab">
                {{ tab }}
              </button>
            </div>

            <!-- Buscador -->
            <div class="table-search-box">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input 
                type="text" 
                [(ngModel)]="searchFilter" 
                placeholder="Filtrar por SKU, cliente o estado..." 
                class="table-search-input"
              />
            </div>

            <!-- Botón Refrescar -->
            <button class="btn-table-refresh" (click)="refreshTransactions()" title="Refrescar datos">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 4v6h-6"></path>
                <path d="M1 20v-6h6"></path>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
            </button>
          </div>
        </div>

        <div class="table-wrapper">
          <table class="inventory-table">
            <thead>
              <tr>
                <th>Detalle Transacción</th>
                <th>Tipo</th>
                <th>Cantidad</th>
                <th>Ubicación</th>
                <th>Responsable</th>
                <th>Fecha y Hora</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let row of filteredTransactions">
                <td>
                  <div class="product-cell">
                    <span class="product-title">{{ row.product }}</span>
                    <span class="product-sku-detail">{{ row.detail }}</span>
                  </div>
                </td>
                <td>
                  <span [class]="'pill-type ' + (row.isPositive ? 'entrada' : 'salida')">
                    <span class="type-dot"></span>
                    {{ row.isPositive ? 'VENTA' : 'PEDIDO' }}
                  </span>
                </td>
                <td>
                  <span [class]="row.isPositive ? 'qty-positive' : 'qty-negative'">
                    {{ row.quantity }}
                  </span>
                </td>
                <td>
                  <span class="location-badge">{{ row.location }}</span>
                </td>
                <td>
                  <div class="operator-cell">
                    <div class="operator-avatar" [style.backgroundColor]="row.operatorBg" [style.color]="row.operatorColor">
                      {{ row.operatorInitials }}
                    </div>
                    <span class="operator-name">{{ row.operator }}</span>
                  </div>
                </td>
                <td>
                  <span class="datetime-cell">{{ row.dateTime }}</span>
                </td>
                <td>
                  <span [class]="'status-pill ' + (row.isPositive ? 'completed' : 'verification')">
                    <svg *ngIf="row.isPositive" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <svg *ngIf="!row.isPositive" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    {{ row.status }}
                  </span>
                </td>
              </tr>
              <tr *ngIf="filteredTransactions.length === 0">
                <td colspan="7" style="text-align: center; padding: 2rem; color: #64748b;">
                  No hay transacciones que coincidan con la fecha o filtros seleccionados (0 resultados).
                </td>
              </tr>
            </tbody>
          </table>
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

    /* Selector de fecha de cabecera alineado con fz-field */
    .date-input-field {
      border: none;
      background: transparent;
      font-size: 0.78rem;
      font-weight: 600;
      color: #1e293b;
      outline: none;
      cursor: pointer;
      font-family: inherit;
    }

    .btn-clear-date {
      border: none;
      background: transparent;
      color: #94a3b8;
      font-size: 0.75rem;
      cursor: pointer;
      padding: 0 0.2rem;
      font-weight: 700;
    }

    .btn-clear-date:hover {
      color: #ef4444;
    }

    /* KPIs Grid */
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
      box-shadow: 0 8px 24px -4px rgba(15, 23, 42, 0.08);
      border-color: rgba(203, 213, 225, 0.9);
    }

    .kpi-top-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .kpi-title {
      font-size: 0.74rem;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 0.04em;
    }

    .kpi-lapse-select {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      background: #f8fafc;
      font-size: 0.68rem;
      font-weight: 600;
      color: #334155;
      padding: 0.2rem 0.45rem;
      outline: none;
      cursor: pointer;
      font-family: inherit;
    }

    .kpi-icon-container {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .blue-tint { background: #eff6ff; border: 1px solid #dbeafe; }
    .teal-tint { background: #f0fdf4; border: 1px solid #dcfce7; }
    .red-tint { background: #fee2e2; border: 1px solid #fecaca; }
    .orange-tint { background: #fff7ed; border: 1px solid #ffedd5; }

    .kpi-big-value {
      font-size: 1.7rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.04em;
      line-height: 1.15;
    }

    .alert-red-number {
      color: #dc2626;
    }

    .alert-suffix, .order-suffix {
      font-size: 0.8rem;
      font-weight: 600;
      color: #64748b;
      margin-left: 0.35rem;
      font-family: 'JetBrains Mono', monospace;
    }

    .kpi-bottom-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.72rem;
      color: #64748b;
      margin-top: 0.15rem;
    }

    .kpi-bottom-row.space-between {
      justify-content: space-between;
    }

    .kpi-pill {
      font-size: 0.66rem;
      font-weight: 700;
      padding: 0.18rem 0.5rem;
      border-radius: 20px;
      letter-spacing: 0.03em;
    }

    .green-pill {
      background: #dcfce7;
      color: #16a34a;
    }

    .red-pill {
      background: #fee2e2;
      color: #dc2626;
    }

    .delivery-rate {
      font-weight: 600;
      color: #2563eb;
    }

    .progress-bar-track {
      flex: 1;
      height: 6px;
      background: #e2e8f0;
      border-radius: 3px;
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      background: #0284c7;
      border-radius: 3px;
    }

    .progress-label {
      font-size: 0.72rem;
      font-weight: 600;
      color: #1e293b;
    }

    .kpi-progress-row {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin-top: 0.15rem;
    }

    /* Mid Section: Weekly Chart + Restock */
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
      box-shadow: 0 1px 4px 0 rgba(15, 23, 42, 0.04), 0 8px 24px -4px rgba(15, 23, 42, 0.04);
    }

    .chart-header {
      padding: 1.25rem 1.4rem 0.5rem;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 0.8rem;
    }

    .chart-title {
      font-size: 0.95rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
      letter-spacing: -0.02em;
    }

    .chart-subtitle {
      font-size: 0.74rem;
      color: #64748b;
      margin: 0.2rem 0 0;
    }

    .chart-lapse-group {
      display: inline-flex;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      overflow: hidden;
      background: #f8fafc;
    }

    .lapse-btn {
      border: none;
      background: transparent;
      padding: 0.28rem 0.65rem;
      font-size: 0.7rem;
      font-weight: 600;
      color: #64748b;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.15s ease;
    }

    .lapse-btn.active {
      background: #0f172a;
      color: #ffffff;
    }

    .date-chip-input {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 0.22rem 0.45rem;
      font-size: 0.7rem;
      outline: none;
      font-family: inherit;
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
      font-size: 0.72rem;
      color: #64748b;
      font-weight: 500;
    }

    .legend-box {
      width: 10px;
      height: 10px;
      border-radius: 2px;
    }

    .blue-box { background: #3b82f6; }
    .dark-navy-box { background: #dc2626; }

    .sem-tag {
      font-size: 0.68rem;
      font-weight: 700;
      color: #475569;
      background: #f1f5f9;
      padding: 0.2rem 0.55rem;
      border-radius: 20px;
    }

    .chart-canvas-container {
      padding: 0.5rem 1.4rem 0.8rem;
      display: flex;
      flex-direction: column;
    }

    .chart-svg {
      width: 100%;
      height: 180px;
      overflow: visible;
    }

    .days-row {
      display: flex;
      justify-content: space-between;
      margin-top: 0.5rem;
      padding: 0 0.5rem;
    }

    .day-label {
      font-size: 0.68rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      font-family: 'JetBrains Mono', monospace;
    }

    .chart-summary-bar {
      display: flex;
      justify-content: space-around;
      padding: 0.95rem 1.4rem;
      border-top: 1px solid #f1f5f9;
      background: #fafafc;
      border-radius: 0 0 12px 12px;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .summary-col {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .summary-label {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      color: #64748b;
    }

    .summary-val {
      font-size: 0.85rem;
      font-weight: 700;
    }

    .text-blue { color: #2563eb; }
    .text-navy { color: #0f172a; }

    /* Restock Card */
    .restock-card {
      background: #ffffff;
      border: 1px solid rgba(226, 232, 240, 0.85);
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 1px 4px 0 rgba(15, 23, 42, 0.04), 0 8px 24px -4px rgba(15, 23, 42, 0.04);
    }

    .restock-header {
      padding: 1.25rem 1.25rem 0.75rem;
      border-bottom: 1px solid #f1f5f9;
    }

    .restock-title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.25rem;
    }

    .restock-title-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .restock-title {
      font-size: 0.95rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
      letter-spacing: -0.02em;
    }

    .critical-count-pill {
      font-size: 0.64rem;
      font-weight: 700;
      color: #dc2626;
      background: #fee2e2;
      border: 1px solid #fecaca;
      padding: 0.18rem 0.5rem;
      border-radius: 20px;
    }

    .restock-subtitle {
      font-size: 0.72rem;
      color: #64748b;
      margin: 0;
    }

    .restock-items-list {
      flex: 1;
      padding: 0.75rem 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      overflow-y: auto;
      max-height: 280px;
    }

    .restock-item {
      padding: 0.75rem 0.85rem;
      border: 1px solid #f1f5f9;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      background: #fafafc;
      transition: all 0.18s ease;
    }

    .restock-item:hover {
      background: #ffffff;
      border-color: #e2e8f0;
      box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
    }

    .item-title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .item-name {
      font-size: 0.78rem;
      font-weight: 700;
      color: #0f172a;
    }

    .badge-critical {
      font-size: 0.62rem;
      font-weight: 700;
      background: #fee2e2;
      color: #dc2626;
      padding: 0.14rem 0.45rem;
      border-radius: 4px;
    }

    .badge-low {
      font-size: 0.62rem;
      font-weight: 700;
      background: #fef3c7;
      color: #d97706;
      padding: 0.14rem 0.45rem;
      border-radius: 4px;
    }

    .item-sku {
      font-size: 0.68rem;
      color: #64748b;
      font-family: 'JetBrains Mono', monospace;
    }

    .item-stats-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.72rem;
      color: #475569;
    }

    .restock-footer {
      padding: 0.85rem 1.25rem;
      border-top: 1px solid #f1f5f9;
      text-align: center;
    }

    .catalog-link {
      font-size: 0.76rem;
      font-weight: 700;
      color: #2563eb;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
    }

    .catalog-link:hover {
      text-decoration: underline;
    }

    /* Table Cards */
    .table-card {
      background: #ffffff;
      border: 1px solid rgba(226, 232, 240, 0.85);
      border-radius: 12px;
      padding: 0;
      overflow: hidden;
      box-shadow: 0 1px 4px 0 rgba(15, 23, 42, 0.04), 0 8px 24px -4px rgba(15, 23, 42, 0.04);
      display: flex;
      flex-direction: column;
    }

    .table-top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.85rem;
      padding: 1.15rem 1.25rem;
      border-bottom: 1px solid #f1f5f9;
    }

    .table-card-title {
      font-size: 0.98rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
      letter-spacing: -0.02em;
    }

    .table-card-subtitle {
      font-size: 0.74rem;
      color: #64748b;
      margin: 0.2rem 0 0;
    }

    .table-controls {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      flex-wrap: wrap;
    }

    .filter-tabs-container {
      display: flex;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      overflow: hidden;
      background: #f8fafc;
    }

    .filter-tab-btn {
      border: none;
      background: transparent;
      padding: 0.42rem 0.85rem;
      font-size: 0.74rem;
      font-weight: 600;
      color: #64748b;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.15s ease;
    }

    .filter-tab-btn.active {
      background: #0f172a;
      color: #ffffff;
    }

    .table-search-box {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 0.42rem 0.75rem;
      transition: all 0.2s ease;
    }

    .table-search-box:focus-within {
      background: #ffffff;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
    }

    .table-search-input {
      border: none;
      background: transparent;
      outline: none;
      font-size: 0.76rem;
      font-family: inherit;
      width: 180px;
      color: #0f172a;
    }

    .btn-table-refresh {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 0.42rem 0.65rem;
      color: #64748b;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.18s ease;
    }

    .btn-table-refresh:hover {
      background: #f8fafc;
      color: #0f172a;
      border-color: #94a3b8;
    }

    .table-wrapper {
      overflow-x: auto;
    }

    .inventory-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.77rem;
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
      background: #f8fafc;
      font-family: 'JetBrains Mono', monospace;
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
      gap: 0.1rem;
    }

    .product-title {
      font-weight: 700;
      color: #0f172a;
      font-size: 0.79rem;
    }

    .product-sku-detail {
      font-size: 0.69rem;
      color: #64748b;
      font-family: 'JetBrains Mono', monospace;
    }

    .pill-type {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.22rem 0.6rem;
      border-radius: 20px;
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.02em;
    }

    .pill-type.entrada {
      background: #dcfce7;
      color: #16a34a;
      border: 1px solid #bbf7d0;
    }

    .pill-type.salida {
      background: #fee2e2;
      color: #dc2626;
      border: 1px solid #fecaca;
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
      font-family: 'JetBrains Mono', monospace;
    }

    .qty-negative {
      font-weight: 700;
      color: #dc2626;
      font-family: 'JetBrains Mono', monospace;
    }

    .location-badge {
      display: inline-block;
      padding: 0.2rem 0.55rem;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.7rem;
      font-weight: 600;
      color: #334155;
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
    }

    .operator-name {
      color: #334155;
      font-weight: 600;
      font-size: 0.76rem;
    }

    .datetime-cell {
      color: #64748b;
      font-size: 0.74rem;
      font-family: 'JetBrains Mono', monospace;
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.22rem 0.6rem;
      border-radius: 20px;
      font-size: 0.69rem;
      font-weight: 700;
    }

    .status-pill.completed {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      color: #059669;
    }

    .status-pill.verification {
      background: #fee2e2;
      border: 1px solid #fecaca;
      color: #dc2626;
    }

    @media (max-width: 1024px) {
      .kpis-grid { grid-template-columns: repeat(2, 1fr); }
      .mid-section-grid { grid-template-columns: 1fr; }
    }

    @media (max-width: 640px) {
      .kpis-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly dashboardService = inject(DashboardService);
  private readonly authService = inject(AuthService);
  private readonly productsService = inject(ProductsService);
  private readonly saleService = inject(SaleService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly ngZone = inject(NgZone);

  private productsSub?: Subscription;
  private salesSub?: Subscription;

  companyName = '';
  totalClients: number | null = null;
  searchFilter = '';
  productsSearchFilter = '';
  activeTab = 'Todos';

  // 1. Filtro de Fecha Específica en la Cabecera
  selectedDay: string = '';

  // 2. Filtro de Lapso Independiente para el KPI 4
  kpiOrdersLapse: 'day' | 'today' | '7d' | '30d' | 'all' = 'day';

  // 3. Filtro de Lapso Independiente para la Gráfica Semanal
  chartLapse: '7d' | '30d' | 'custom' = '7d';
  chartStartDate: string = '';
  chartEndDate: string = '';

  products: ProductItem[] = [];
  sales: SaleDto[] = [];

  get currentDateDisplay(): string {
    const now = new Date();
    return now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  private getStockNum(p: ProductItem): number {
    const raw = String(p.stockAvailable || p.stockTotal || '0').replace(/[^0-9-]/g, '');
    const n = parseInt(raw, 10);
    return isNaN(n) ? 0 : n;
  }

  get totalUnitsInStock(): number {
    return this.products.reduce((acc, p) => acc + this.getStockNum(p), 0);
  }

  get totalInventoryValue(): number {
    return this.products.reduce((acc, p) => {
      const qty = this.getStockNum(p);
      const rawPrice = String(p.costPrice || p.salePrice || '0').replace(/[^0-9.]/g, '');
      const price = parseFloat(rawPrice) || 0;
      return acc + qty * price;
    }, 0);
  }

  get availabilityPercent(): number {
    if (this.products.length === 0) return 0;
    const avail = this.products.filter(p => this.getStockNum(p) > 0).length;
    return Math.round((avail / this.products.length) * 100);
  }

  get criticalStockCount(): number {
    return this.products.filter(p => this.isUnderFive(p)).length;
  }

  get outOfStockCount(): number {
    return this.products.filter(p => this.getStockNum(p) <= 0).length;
  }

  // --- FILTRO INDEPENDIENTE PARA KPI 4 ---
  get kpiSalesFiltered(): SaleDto[] {
    if (this.kpiOrdersLapse === 'all') {
      return this.sales;
    }
    const todayStr = new Date().toISOString().substring(0, 10);

    if (this.kpiOrdersLapse === 'day') {
      const target = this.selectedDay || todayStr;
      return this.sales.filter(s => s.createdAt && s.createdAt.substring(0, 10) === target);
    }
    if (this.kpiOrdersLapse === 'today') {
      return this.sales.filter(s => s.createdAt && s.createdAt.substring(0, 10) === todayStr);
    }

    const days = this.kpiOrdersLapse === '7d' ? 7 : 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().substring(0, 10);

    return this.sales.filter(s => s.createdAt && s.createdAt.substring(0, 10) >= cutoffStr);
  }

  get kpiPaidSalesCount(): number {
    return this.kpiSalesFiltered.filter(s => s.isPaid).length;
  }

  get kpiPaidOrdersPercent(): number {
    if (this.kpiSalesFiltered.length === 0) return 0;
    return Math.round((this.kpiPaidSalesCount / this.kpiSalesFiltered.length) * 100);
  }

  // --- GRÁFICA DE MOVIMIENTOS Y VENTAS CON LAPSOS INDEPENDIENTES ---
  setChartLapse(lapse: '7d' | '30d' | 'custom'): void {
    this.chartLapse = lapse;
    if (lapse === 'custom' && !this.chartStartDate) {
      const d = new Date();
      this.chartEndDate = d.toISOString().substring(0, 10);
      d.setDate(d.getDate() - 14);
      this.chartStartDate = d.toISOString().substring(0, 10);
    }
    this.cdr.detectChanges();
  }

  get chartPoints(): ChartDayPoint[] {
    const points: ChartDayPoint[] = [];
    let numDays = 7;
    let startDate = new Date();

    if (this.chartLapse === '7d') {
      numDays = 7;
      startDate.setDate(startDate.getDate() - (numDays - 1));
    } else if (this.chartLapse === '30d') {
      numDays = 30;
      startDate.setDate(startDate.getDate() - (numDays - 1));
    } else {
      const s = this.chartStartDate ? new Date(this.chartStartDate) : new Date();
      const e = this.chartEndDate ? new Date(this.chartEndDate) : new Date();
      const diff = Math.max(1, Math.round((e.getTime() - s.getTime()) / (1000 * 3600 * 24)) + 1);
      numDays = Math.min(60, diff);
      startDate = new Date(s);
    }

    const daySalesMap = new Map<string, { salesCount: number; salesAmount: number; ordersCount: number; ordersAmount: number }>();

    for (const s of this.sales) {
      if (!s.createdAt) continue;
      const dKey = s.createdAt.substring(0, 10);
      const entry = daySalesMap.get(dKey) || { salesCount: 0, salesAmount: 0, ordersCount: 0, ordersAmount: 0 };
      if (s.isPaid) {
        entry.salesCount += 1;
        entry.salesAmount += (s.totalAmount || 0);
      } else {
        entry.ordersCount += 1;
        entry.ordersAmount += (s.totalAmount || 0);
      }
      daySalesMap.set(dKey, entry);
    }

    const stepX = 580 / Math.max(1, numDays - 1);
    let maxVal = 1;

    for (let i = 0; i < numDays; i++) {
      const cur = new Date(startDate);
      cur.setDate(cur.getDate() + i);
      const iso = cur.toISOString().substring(0, 10);
      const stat = daySalesMap.get(iso) || { salesCount: 0, salesAmount: 0, ordersCount: 0, ordersAmount: 0 };
      maxVal = Math.max(maxVal, stat.salesCount, stat.ordersCount);
    }

    for (let i = 0; i < numDays; i++) {
      const cur = new Date(startDate);
      cur.setDate(cur.getDate() + i);
      const iso = cur.toISOString().substring(0, 10);
      const stat = daySalesMap.get(iso) || { salesCount: 0, salesAmount: 0, ordersCount: 0, ordersAmount: 0 };

      const salesH = stat.salesCount > 0 ? Math.max(8, Math.round((stat.salesCount / maxVal) * 110)) : 0;
      const ordersH = stat.ordersCount > 0 ? Math.max(8, Math.round((stat.ordersCount / maxVal) * 110)) : 0;
      const salesY = 170 - salesH;
      const ordersY = 170 - ordersH;
      const x = 35 + (i * stepX);

      const label = numDays <= 14 
        ? cur.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '').toUpperCase() 
        : `${cur.getDate()}/${cur.getMonth() + 1}`;

      points.push({
        label,
        fullDate: iso,
        salesCount: stat.salesCount,
        salesAmount: stat.salesAmount,
        ordersCount: stat.ordersCount,
        ordersAmount: stat.ordersAmount,
        salesH,
        salesY,
        ordersH,
        ordersY,
        x
      });
    }

    return points;
  }

  get chartAreaPath(): string {
    if (this.chartPoints.length < 2) return '';
    let d = `M ${this.chartPoints[0].x} ${this.chartPoints[0].salesY}`;
    for (let i = 1; i < this.chartPoints.length; i++) {
      const prev = this.chartPoints[i - 1];
      const cur = this.chartPoints[i];
      const cx = (prev.x + cur.x) / 2;
      d += ` C ${cx} ${prev.salesY}, ${cx} ${cur.salesY}, ${cur.x} ${cur.salesY}`;
    }
    const last = this.chartPoints[this.chartPoints.length - 1];
    d += ` L ${last.x} 170 L ${this.chartPoints[0].x} 170 Z`;
    return d;
  }

  get chartLinePath(): string {
    if (this.chartPoints.length < 2) return '';
    let d = `M ${this.chartPoints[0].x} ${this.chartPoints[0].salesY}`;
    for (let i = 1; i < this.chartPoints.length; i++) {
      const prev = this.chartPoints[i - 1];
      const cur = this.chartPoints[i];
      const cx = (prev.x + cur.x) / 2;
      d += ` C ${cx} ${prev.salesY}, ${cx} ${cur.salesY}, ${cur.x} ${cur.salesY}`;
    }
    return d;
  }

  get chartTotalSalesAmount(): number {
    return this.chartPoints.reduce((acc, p) => acc + p.salesAmount, 0);
  }

  get chartTotalSalesUnits(): number {
    return this.chartPoints.reduce((acc, p) => acc + p.salesCount, 0);
  }

  get chartTotalOrdersAmount(): number {
    return this.chartPoints.reduce((acc, p) => acc + p.ordersAmount, 0);
  }

  get chartTotalOrdersUnits(): number {
    return this.chartPoints.reduce((acc, p) => acc + p.ordersCount, 0);
  }

  // --- REABASTECIMIENTO CRÍTICO ---
  get restockItems(): RestockItem[] {
    return this.products
      .filter(p => this.isUnderFive(p))
      .map(p => ({
        name: p.name,
        badge: this.getStockNum(p) <= 0 ? 'CRÍTICO' : 'BAJO',
        badgeType: this.getStockNum(p) <= 0 ? 'critical' : 'low',
        sku: p.sku,
        stockActual: p.stockAvailable || '0',
        stockMin: p.minStock ?? 5,
        aisle: p.location || 'Almacén Central'
      }));
  }

  // --- TRANSACCIONES CON FILTRO DE FECHA SUPERIOR ---
  get transactions(): Transaction[] {
    const list: Transaction[] = [];
    const filteredSales = this.selectedDay
      ? this.sales.filter(s => s.createdAt && s.createdAt.substring(0, 10) === this.selectedDay)
      : this.sales;

    for (const s of filteredSales) {
      const initials = (s.scheduledBy || 'OP')
        .split(' ')
        .filter(Boolean)
        .map(w => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'OP';

      if (s.details && s.details.length > 0) {
        for (const d of s.details) {
          list.push({
            sku: d.productSku,
            product: d.productName,
            detail: `${d.productSku} | ${s.isPaid ? 'Venta #' + s.id : 'Pedido #' + s.id} (${s.clientName})`,
            type: s.isPaid ? 'ENTRADA' : 'SALIDA',
            quantity: `${d.quantity} uds`,
            isPositive: s.isPaid,
            location: 'Almacén Central',
            operator: s.scheduledBy || 'Administrador',
            operatorInitials: initials,
            operatorBg: s.isPaid ? '#dcfce7' : '#fee2e2',
            operatorColor: s.isPaid ? '#15803d' : '#dc2626',
            dateTime: new Date(s.createdAt).toLocaleString(),
            status: s.isPaid ? 'Completado' : 'En Verificación'
          });
        }
      } else {
        list.push({
          sku: `ORD-${s.id}`,
          product: `Orden #${s.id} - ${s.clientName}`,
          detail: `Cliente: ${s.clientName}`,
          type: s.isPaid ? 'ENTRADA' : 'SALIDA',
          quantity: `${s.quantity} uds`,
          isPositive: s.isPaid,
          location: 'Almacén Central',
          operator: s.scheduledBy || 'Administrador',
          operatorInitials: initials,
          operatorBg: s.isPaid ? '#dcfce7' : '#fee2e2',
          operatorColor: s.isPaid ? '#15803d' : '#dc2626',
          dateTime: new Date(s.createdAt).toLocaleString(),
          status: s.isPaid ? 'Completado' : 'En Verificación'
        });
      }
    }
    return list;
  }

  get filteredTransactions(): Transaction[] {
    return this.transactions.filter(item => {
      const matchesTab = 
        this.activeTab === 'Todos' ||
        (this.activeTab === 'Ventas' && item.isPositive) ||
        (this.activeTab === 'Pedidos' && !item.isPositive);

      const matchesSearch = 
        !this.searchFilter.trim() ||
        item.product.toLowerCase().includes(this.searchFilter.toLowerCase()) ||
        item.detail.toLowerCase().includes(this.searchFilter.toLowerCase()) ||
        item.sku.toLowerCase().includes(this.searchFilter.toLowerCase());

      return matchesTab && matchesSearch;
    });
  }

  ngOnInit(): void {
    const today = new Date();
    this.selectedDay = today.toISOString().substring(0, 10);

    this.dashboardService.getDashboardData().subscribe({
      next: (res: any) => {
        this.ngZone.run(() => {
          if (res?.company?.businessName) {
            this.companyName = res.company.businessName;
          } else if (res?.user?.fullName) {
            this.companyName = res.user.fullName;
          }
          if (typeof res?.company?.totalClients === 'number') {
            this.totalClients = res.company.totalClients;
          }
          this.cdr.detectChanges();
        });
      },
      error: () => {}
    });

    this.loadProducts();
    this.loadSales();
  }

  ngOnDestroy(): void {
    this.productsSub?.unsubscribe();
    this.salesSub?.unsubscribe();
  }

  trackBySku(_: number, prod: ProductItem): string {
    return prod.id || prod.sku;
  }

  onDateFilterChange(): void {
    this.cdr.detectChanges();
  }

  loadSales(): void {
    this.salesSub = this.saleService.sales$.subscribe((items) => {
      this.ngZone.run(() => {
        this.sales = [...(items || [])];
        this.cdr.detectChanges();
      });
    });

    this.saleService.getSales().subscribe();
  }

  loadProducts(): void {
    this.productsSub = this.productsService.products$.subscribe((items) => {
      this.ngZone.run(() => {
        this.products = [...(items || [])];
        this.cdr.detectChanges();
      });
    });

    this.productsService.getProducts().subscribe({
      next: (items) => {
        this.ngZone.run(() => {
          this.products = [...(items || [])];
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.cdr.detectChanges();
      }
    });
  }

  isUnderFive(prod: ProductItem): boolean {
    const qty = this.getStockNum(prod);
    return qty < (prod.minStock ?? 5) || prod.stockStatusClass === 'critical' || prod.stockStatus === 'STOCK CRÍTICO';
  }

  get filteredProductsList(): ProductItem[] {
    if (!this.productsSearchFilter.trim()) {
      return this.products;
    }
    const term = this.productsSearchFilter.toLowerCase();
    return this.products.filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.sku.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term) ||
      p.location.toLowerCase().includes(term)
    );
  }

  refreshTransactions(): void {
    this.saleService.getSales().subscribe();
    this.productsService.getProducts().subscribe();
  }
}
