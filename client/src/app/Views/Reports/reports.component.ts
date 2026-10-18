import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ProductsService, ProductItem } from '../../Services/products.service';
import { SaleService, SaleDto } from '../../Services/sale.service';

interface ScheduledReport {
  id: string;
  name: string;
  code: string;
  format: 'XLSX' | 'PDF' | 'CSV';
  formatColor: string;
  emission: string;
  size: string;
  status: 'VIGENTE' | 'HISTÓRICO';
  statusClass: 'active-status' | 'historical-status';
}

interface CategoryValue {
  name: string;
  percentage: number;
  amount: string;
  barColor: string;
}

interface DynamicsBarPoint {
  label: string;
  subLabel: string;
  inboundCount: number;
  outboundCount: number;
  inboundH: number;
  inboundY: number;
  outboundH: number;
  outboundY: number;
  x: number;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fz-viewport">
      <!-- 1. Encabezado de Navegación y Acciones -->
      <header class="fz-header">
        <div class="header-titles">
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <span class="crumb">PANEL PRINCIPAL</span>
            <span class="separator">></span>
            <span class="crumb">INTELIGENCIA OPERATIVA</span>
            <span class="separator">></span>
            <span class="crumb current">REPORTES Y ANALÍTICAS</span>
          </nav>
          <h1 class="page-title">Analíticas Operativas y Reportes de Rendimiento</h1>
          <p class="page-subtitle">
            Telemetría de flujos logísticos, eficiencia de despacho y rotación de stock consolidada.
          </p>
        </div>

        <div class="header-actions">
          <!-- Selector interactivo de rango y lapsos de fecha -->
          <div class="date-selector-btn" style="gap: 0.6rem;">
            <svg class="action-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <select [(ngModel)]="selectedLapse" (change)="onLapseChange()" class="reports-lapse-select">
              <option value="today">Hoy</option>
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Últimos 30 días</option>
              <option value="all">Todo el Historial</option>
              <option value="custom">Rango Personalizado</option>
            </select>
            <div *ngIf="selectedLapse === 'custom'" style="display: flex; align-items: center; gap: 0.35rem;">
              <input type="date" [(ngModel)]="startDate" (change)="onDateRangeChange()" class="reports-date-input" />
              <span style="font-size: 0.72rem; color: #64748b;">al</span>
              <input type="date" [(ngModel)]="endDate" (change)="onDateRangeChange()" class="reports-date-input" />
            </div>
            <span *ngIf="selectedLapse !== 'custom'" class="date-range-text">{{ lapseLabel }}</span>
          </div>

          <!-- Botón de Exportar Informe Ejecutivo -->
          <button class="btn-export-executive" (click)="exportExecutiveReport()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Exportar Informe Ejecutivo</span>
            <svg class="btn-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </div>
      </header>

      <!-- 2. Tarjetas KPI de Rendimiento Operativo (0 cuando no hay datos en BD) -->
      <section class="kpi-grid">
        <!-- KPI 1: Inversión en Inventario (Costo de Compra) -->
        <div class="kpi-card" style="border-left: 4px solid #2563eb;">
          <div class="kpi-header">
            <span class="kpi-title" style="color: #2563eb;">DINERO EN INVENTARIO (COSTO)</span>
            <div class="kpi-icon-pill" style="background: #eff6ff; color: #2563eb;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                <line x1="2" y1="10" x2="22" y2="10"></line>
              </svg>
            </div>
          </div>
          <div class="kpi-value-row">
            <span class="kpi-number">\${{ totalInventoryCost | number:'1.2-2' }}</span>
          </div>
          <div class="kpi-footer">
            <span class="kpi-badge badge-blue">
              {{ totalStockUnits | number }} uds en stock
            </span>
            <span class="kpi-meta">Capital invertido</span>
          </div>
        </div>

        <!-- KPI 2: Ganancia Estimada Potencial (Margen Bruto) -->
        <div class="kpi-card" style="border-left: 4px solid #16a34a;">
          <div class="kpi-header">
            <span class="kpi-title" style="color: #16a34a;">GANANCIA POTENCIAL (BENEFICIO)</span>
            <div class="kpi-icon-pill" style="background: #dcfce7; color: #16a34a;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
          </div>
          <div class="kpi-value-row">
            <span class="kpi-number" style="color: #15803d;">\${{ totalPotentialProfit | number:'1.2-2' }}</span>
          </div>
          <div class="kpi-footer">
            <span class="kpi-badge" style="background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0;">
              +{{ profitMarginPercent }}% margen estimado
            </span>
            <span class="kpi-meta">Venta menos Costo</span>
          </div>
        </div>

        <!-- KPI 3: Valor Total de Venta del Inventario -->
        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-title">VALOR TOTAL DE VENTA (PVP)</span>
            <div class="kpi-icon-pill">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2.2">
                <path d="M3 3v18h18"></path>
                <path d="M18 17V9"></path>
                <path d="M13 17V5"></path>
                <path d="M8 17v-3"></path>
              </svg>
            </div>
          </div>
          <div class="kpi-value-row">
            <span class="kpi-number">\${{ totalInventorySaleValue | number:'1.2-2' }}</span>
          </div>
          <div class="kpi-footer">
            <span class="kpi-badge badge-neutral">
              {{ products.length }} SKUs activos
            </span>
            <span class="kpi-meta">Si se vende todo</span>
          </div>
        </div>

        <!-- KPI 4: Ventas Realizadas (Cobradas en Verde) -->
        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-title">INGRESOS COBRADOS (VERDE)</span>
            <div class="kpi-icon-pill" style="background: #dcfce7; color: #16a34a;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </div>
          <div class="kpi-value-row">
            <span class="kpi-number" style="color: #15803d;">\${{ totalSalesRevenue | number:'1.2-2' }}</span>
          </div>
          <div class="kpi-footer">
            <span class="kpi-badge badge-blue">
              {{ paidSalesCount }} ventas realizadas
            </span>
            <span class="kpi-meta">Cobrado en BD</span>
          </div>
        </div>

        <!-- KPI 5: Pedidos Pendientes (Por Cobrar en Rojo) -->
        <div class="kpi-card" style="border-left: 4px solid #dc2626;">
          <div class="kpi-header">
            <span class="kpi-title" style="color: #dc2626;">PEDIDOS PENDIENTES (ROJO)</span>
            <div class="kpi-icon-pill" style="background: #fee2e2; color: #dc2626;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
          </div>
          <div class="kpi-value-row">
            <span class="kpi-number" style="color: #dc2626;">\${{ pendingOrdersAmount | number:'1.2-2' }}</span>
          </div>
          <div class="kpi-footer">
            <span class="kpi-badge" style="background: #fee2e2; color: #dc2626; border: 1px solid #fecaca;">
              {{ pendingOrdersCount }} pedidos por cobrar
            </span>
            <span class="kpi-meta">Pendiente</span>
          </div>
        </div>
      </section>

      <!-- 3. Dinámica de Almacén + Composición Patrimonial -->
      <section class="charts-row">
        <!-- Gráfica de Entradas vs Salidas -->
        <div class="chart-box warehouse-dynamics-card">
          <div class="chart-header">
            <div>
              <span class="chart-category">DINÁMICA DE ALMACÉN</span>
              <h2 class="chart-title">Movimientos de Entrada vs Salida</h2>
            </div>
            <div class="chart-legend">
              <div class="legend-item">
                <span class="legend-dot dot-inbound"></span>
                <span class="legend-label">Entradas (Inbound)</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot dot-outbound"></span>
                <span class="legend-label">Salidas (Outbound)</span>
              </div>
            </div>
          </div>

          <!-- Gráfica visual SVG con datos reales de la base de datos según el lapso de fechas -->
          <div class="chart-canvas-container">
            <svg class="dynamics-svg" viewBox="0 0 680 230" preserveAspectRatio="none">
              <defs>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.14" />
                  <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.0" />
                </linearGradient>
                <linearGradient id="barInboundGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#2563eb" />
                  <stop offset="100%" stop-color="#1d4ed8" />
                </linearGradient>
                <linearGradient id="barOutboundGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#93c5fd" />
                  <stop offset="100%" stop-color="#bfdbfe" />
                </linearGradient>
              </defs>

              <!-- Curva de tendencia dinámica calculada -->
              <path *ngIf="dynamicsChartAreaPath" [attr.d]="dynamicsChartAreaPath" fill="url(#areaGradient)" />
              <path *ngIf="dynamicsChartLinePath" [attr.d]="dynamicsChartLinePath" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-dasharray="4 4" />

              <!-- LÍNEA BASE HORIZONTAL -->
              <line x1="30" y1="195" x2="650" y2="195" stroke="#f1f5f9" stroke-width="1.5" />

              <!-- Barras duales dinámicas de la BD -->
              <g *ngFor="let pt of dynamicsPoints">
                <!-- Entradas / Inbound -->
                <rect 
                  [attr.x]="pt.x - 12" 
                  [attr.y]="pt.inboundY" 
                  width="14" 
                  [attr.height]="pt.inboundH" 
                  rx="3" 
                  fill="url(#barInboundGrad)" 
                  class="chart-bar">
                  <title>{{ pt.label }} ({{ pt.subLabel }}): {{ pt.inboundCount }} entradas registradas</title>
                </rect>
                <!-- Salidas / Outbound -->
                <rect 
                  [attr.x]="pt.x + 4" 
                  [attr.y]="pt.outboundY" 
                  width="14" 
                  [attr.height]="pt.outboundH" 
                  rx="3" 
                  fill="url(#barOutboundGrad)" 
                  class="chart-bar">
                  <title>{{ pt.label }} ({{ pt.subLabel }}): {{ pt.outboundCount }} salidas / ventas</title>
                </rect>
              </g>
            </svg>

            <!-- Etiquetas dinámicas del eje X -->
            <div class="chart-x-labels">
              <div class="x-label-item" *ngFor="let pt of dynamicsPoints">
                <span class="x-week">{{ pt.label }}</span>
                <span class="x-dates">({{ pt.subLabel }})</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Distribución de Valor por Categoría -->
        <div class="chart-box category-distribution-card">
          <div class="chart-header">
            <div>
              <span class="chart-category">COMPOSICIÓN PATRIMONIAL</span>
              <h2 class="chart-title">Distribución de Valor por Categoría</h2>
            </div>
          </div>

          <!-- Lista de Categorías con Barras -->
          <div class="categories-list">
            <div class="cat-row" *ngFor="let cat of categories">
              <div class="cat-info">
                <span class="cat-name">{{ cat.name }}</span>
                <span class="cat-stats">
                  <strong class="cat-pct">{{ cat.percentage }}%</strong>
                  <span class="cat-amt">({{ cat.amount }})</span>
                </span>
              </div>
              <div class="cat-track">
                <div 
                  class="cat-fill" 
                  [style.width.%]="cat.percentage" 
                  [style.background]="cat.barColor">
                </div>
              </div>
            </div>
          </div>

          <!-- Tarjeta Destacada Valor Total Custodiado -->
          <div class="total-custody-card">
            <div class="custody-thumb">
              <img src="/images/warehouse-thumb.jpg" alt="Almacén Firmeza Hub" class="custody-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
              <div class="custody-img-fallback" style="display: none;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2">
                  <path d="M3 21h18M3 7v14M21 7v14M6 11h4M6 15h4M14 11h4M14 15h4M3 7l9-4 9 4"></path>
                </svg>
              </div>
            </div>
            <div class="custody-content">
              <span class="custody-label">VALOR TOTAL CUSTODIADO</span>
              <div class="custody-value">\${{ totalInventoryValue | number:'1.2-2' }}</div>
              <a href="javascript:void(0)" class="custody-status-link">
                {{ products.length }} SKUs en Base de Datos
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- 4. Estratificación de Demanda (Matriz ABC) -->
      <section class="abc-matrix-card">
        <div class="abc-card-header">
          <div class="abc-title-group">
            <div class="abc-icon-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </div>
            <div>
              <span class="abc-category">ESTRATIFICACIÓN DE DEMANDA</span>
              <h2 class="abc-title">Matriz de Clasificación ABC de Inventario</h2>
            </div>
          </div>
          <span class="abc-rebalance-text">Total SKUs: {{ products.length }}</span>
        </div>

        <!-- Barra Continua Segmentada 80% / 15% / 5% -->
        <div class="abc-segmented-bar">
          <div class="segment segment-a" style="width: 80%;" title="Clase A: 80% Valor"></div>
          <div class="segment segment-b" style="width: 15%;" title="Clase B: 15% Valor"></div>
          <div class="segment segment-c" style="width: 5%;" title="Clase C: 5% Valor"></div>
        </div>

        <!-- 3 Columnas de Clasificación ABC -->
        <div class="abc-columns-grid">
          <!-- Columna A -->
          <div class="abc-col-card">
            <div class="abc-col-top">
              <span class="class-badge badge-clase-a">CLASE A</span>
              <span class="class-value-bold">80% Valor Total</span>
            </div>
            <h3 class="class-headline">SKUs Totales: {{ products.length }} artículos</h3>
            <p class="class-desc">
              Alta criticidad. Artículos motrices de facturación y proyectos clave de infraestructura.
            </p>
            <div class="recommendation-box">
              <span class="rec-title">RECOMENDACIÓN OPERATIVA</span>
              <p class="rec-text">
                Conteo cíclico diario, reabastecimiento Just-in-Time y monitoreo de stock de seguridad sin holguras.
              </p>
            </div>
          </div>

          <!-- Columna B -->
          <div class="abc-col-card">
            <div class="abc-col-top">
              <span class="class-badge badge-clase-b">CLASE B</span>
              <span class="class-value-bold">15% Valor Total</span>
            </div>
            <h3 class="class-headline">Pedidos Pendientes: {{ pendingOrdersCount }} órdenes</h3>
            <p class="class-desc">
              Impacto intermedio. Consumo regular predecible en operaciones de taller y mantenimiento.
            </p>
            <div class="recommendation-box">
              <span class="rec-title">RECOMENDACIÓN OPERATIVA</span>
              <p class="rec-text">
                Revisión quincenal de punto de reorden y pedidos por lotes económicos (EOQ) precalculados.
              </p>
            </div>
          </div>

          <!-- Columna C -->
          <div class="abc-col-card">
            <div class="abc-col-top">
              <span class="class-badge badge-clase-c">CLASE C</span>
              <span class="class-value-bold">5% Valor Total</span>
            </div>
            <h3 class="class-headline">Ventas Completadas: {{ paidSalesCount }} ventas</h3>
            <p class="class-desc">
              Baja rotación y costo marginal unitario. Elementos fungibles y consumibles auxiliares.
            </p>
            <div class="recommendation-box">
              <span class="rec-title">RECOMENDACIÓN OPERATIVA</span>
              <p class="rec-text">
                Conteo bimensual simplificado; mantener amortiguadores de inventario amplios para evitar micro-compras.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- 5. Reportes Automatizados y Programados -->
      <section class="scheduled-reports-card">
        <div class="reports-header-row">
          <div class="reports-title-left">
            <div class="reports-header-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <div>
              <h2 class="reports-main-title">Reportes Automatizados y Programados</h2>
              <p class="reports-main-subtitle">
                Informes batch emitidos por el motor de auditoría central listos para descarga directa.
              </p>
            </div>
          </div>
          <button class="btn-config-routines" (click)="configureRoutines()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            <span>Configurar Rutinas</span>
          </button>
        </div>

        <!-- Tabla de Reportes -->
        <div class="reports-table-wrapper">
          <table class="reports-table">
            <thead>
              <tr>
                <th class="col-name">NOMBRE DEL REPORTE / ENTREGABLE</th>
                <th class="col-emission">EMISIÓN</th>
                <th class="col-format">FORMATO</th>
                <th class="col-size">TAMAÑO</th>
                <th class="col-status">ESTADO</th>
                <th class="col-action">ACCIÓN</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let report of scheduledReports" class="report-row">
                <!-- Nombre e ID -->
                <td class="col-name">
                  <div class="report-identity">
                    <!-- Icono según formato -->
                    <div class="file-format-icon" [ngClass]="'icon-' + report.format.toLowerCase()">
                      <svg *ngIf="report.format === 'XLSX'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                        <path d="M9 3v18"></path>
                        <path d="M15 3v18"></path>
                        <path d="M3 9h18"></path>
                        <path d="M3 15h18"></path>
                      </svg>
                      <svg *ngIf="report.format === 'PDF'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="9" y1="13" x2="15" y2="13"></line>
                      </svg>
                      <svg *ngIf="report.format === 'CSV'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <circle cx="12" cy="14" r="3"></circle>
                      </svg>
                    </div>
                    <div class="report-texts">
                      <span class="report-name">{{ report.name }}</span>
                      <span class="report-code">ID: {{ report.code }}</span>
                    </div>
                  </div>
                </td>

                <!-- Emisión -->
                <td class="col-emission">
                  <span class="emission-text">{{ report.emission }}</span>
                </td>

                <!-- Formato Badge -->
                <td class="col-format">
                  <span class="format-badge" [ngClass]="'fmt-' + report.format.toLowerCase()">
                    {{ report.format }}
                  </span>
                </td>

                <!-- Tamaño -->
                <td class="col-size">
                  <span class="size-text">{{ report.size }}</span>
                </td>

                <!-- Estado -->
                <td class="col-status">
                  <span class="status-pill" [ngClass]="report.statusClass">
                    <span class="status-dot"></span>
                    {{ report.status }}
                  </span>
                </td>

                <!-- Acción Bajar -->
                <td class="col-action">
                  <button class="btn-download-action" (click)="downloadReport(report)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    <span>Bajar</span>
                  </button>
                </td>
              </tr>
              <tr *ngIf="scheduledReports.length === 0">
                <td colspan="6" style="text-align: center; padding: 2.5rem; color: #64748b;">
                  No hay reportes automatizados o programados generados en este momento.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer del Bloque de Reportes -->
        <div class="reports-footer-bar">
          <span class="footer-note">
            Almacén Central Firmeza Hub WH-01 - Retención programada: 90 días
          </span>
          <a href="javascript:void(0)" class="s3-repo-link" (click)="viewS3Repository()">
            Ver repositorio completo en S3
          </a>
        </div>
      </section>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #0f172a;
    }

    .header-titles {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #94a3b8;
      text-transform: uppercase;
    }

    .breadcrumb .crumb.current {
      color: #2563eb;
    }

    .breadcrumb .separator {
      color: #cbd5e1;
    }

    .page-title {
      font-size: 1.6rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.03em;
      margin: 0;
      line-height: 1.2;
    }

    .page-subtitle {
      font-size: 0.85rem;
      color: #64748b;
      margin: 0;
      letter-spacing: -0.01em;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .date-selector-btn {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 0.55rem 0.95rem;
      font-size: 0.8rem;
      font-weight: 600;
      color: #334155;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .date-selector-btn:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
      box-shadow: 0 2px 6px rgba(15, 23, 42, 0.06);
    }

    .reports-lapse-select {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 0.25rem 0.5rem;
      font-size: 0.76rem;
      font-weight: 600;
      color: #1e293b;
      background: #f8fafc;
      outline: none;
      cursor: pointer;
      font-family: inherit;
    }

    .reports-date-input {
      border: 1px solid #cbd5e1;
      border-radius: 5px;
      padding: 0.2rem 0.4rem;
      font-size: 0.72rem;
      font-weight: 500;
      color: #334155;
      outline: none;
      font-family: inherit;
    }

    .action-icon {
      color: #2563eb;
    }

    .chevron-icon {
      color: #94a3b8;
    }

    .btn-export-executive {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      background: #2563eb;
      color: #ffffff;
      border: 1px solid #1d4ed8;
      border-radius: 8px;
      padding: 0.55rem 1.15rem;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 2px 8px -1px rgba(37, 99, 235, 0.35);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .btn-export-executive:hover {
      background: #1d4ed8;
      box-shadow: 0 4px 12px -2px rgba(37, 99, 235, 0.45);
      transform: translateY(-1px);
    }

    .btn-chevron {
      opacity: 0.8;
    }

    /* 2. KPI Cards Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 1.15rem;
    }

    @media (max-width: 1400px) {
      .kpi-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    @media (max-width: 900px) {
      .kpi-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 600px) {
      .kpi-grid {
        grid-template-columns: 1fr;
      }
    }



    .kpi-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.25rem;
      box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.03), 0 4px 16px -4px rgba(15, 23, 42, 0.04);
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .kpi-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px -4px rgba(15, 23, 42, 0.08);
    }

    .kpi-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .kpi-title {
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: #64748b;
      text-transform: uppercase;
    }

    .kpi-icon-btn {
      background: #eff6ff;
      border: 1px solid #dbeafe;
      border-radius: 6px;
      padding: 0.3rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .kpi-icon-btn:hover {
      background: #dbeafe;
      transform: rotate(45deg);
    }

    .kpi-icon-pill {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 0.3rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .kpi-value-row {
      display: flex;
      align-items: baseline;
    }

    .kpi-number {
      font-size: 2rem;
      font-weight: 800;
      letter-spacing: -0.04em;
      color: #0f172a;
      line-height: 1;
    }

    .kpi-unit {
      font-size: 0.95rem;
      font-weight: 600;
      color: #64748b;
      margin-left: 0.25rem;
    }

    .kpi-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      padding-top: 0.5rem;
      border-top: 1px solid #f8fafc;
    }

    .kpi-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      font-size: 0.68rem;
      font-weight: 700;
      padding: 0.25rem 0.55rem;
      border-radius: 6px;
    }

    .badge-blue {
      background: #eff6ff;
      color: #2563eb;
      border: 1px solid #dbeafe;
    }

    .badge-neutral {
      background: #f1f5f9;
      color: #0f172a;
      border: 1px solid #e2e8f0;
    }

    .badge-neutral-dark {
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #e2e8f0;
    }

    .kpi-meta {
      font-size: 0.68rem;
      font-weight: 500;
      color: #64748b;
    }

    /* 3. Charts Row */
    .charts-row {
      display: grid;
      grid-template-columns: 1.8fr 1.2fr;
      gap: 1.25rem;
    }

    @media (max-width: 1024px) {
      .charts-row {
        grid-template-columns: 1fr;
      }
    }

    .chart-box {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.03), 0 4px 16px -4px rgba(15, 23, 42, 0.04);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.25rem;
    }

    .chart-category {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #64748b;
      text-transform: uppercase;
      display: block;
      margin-bottom: 0.2rem;
    }

    .chart-title {
      font-size: 1.08rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
      margin: 0;
    }

    .chart-legend {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.72rem;
      font-weight: 600;
      color: #475569;
    }

    .legend-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .dot-inbound {
      background: #2563eb;
    }

    .dot-outbound {
      background: #93c5fd;
    }

    /* Canvas visual de dinamica de almacen */
    .chart-canvas-container {
      display: flex;
      flex-direction: column;
      width: 100%;
    }

    .dynamics-svg {
      width: 100%;
      height: 190px;
      overflow: visible;
    }

    .chart-bar {
      transition: opacity 0.2s ease, transform 0.2s ease;
      cursor: pointer;
    }

    .chart-bar:hover {
      opacity: 0.85;
      filter: drop-shadow(0 4px 6px rgba(37, 99, 235, 0.2));
    }

    .chart-x-labels {
      display: flex;
      justify-content: space-around;
      padding-top: 0.5rem;
      border-top: 1px solid #f1f5f9;
      margin-top: 0.25rem;
    }

    .x-label-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.1rem;
    }

    .x-week {
      font-size: 0.72rem;
      font-weight: 700;
      color: #1e293b;
    }

    .x-dates {
      font-size: 0.65rem;
      color: #94a3b8;
    }

    /* Composición Patrimonial */
    .categories-list {
      display: flex;
      flex-direction: column;
      gap: 0.9rem;
      margin-bottom: 1.25rem;
    }

    .cat-row {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .cat-info {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-size: 0.8rem;
    }

    .cat-name {
      font-weight: 600;
      color: #1e293b;
    }

    .cat-stats {
      display: flex;
      align-items: baseline;
      gap: 0.35rem;
    }

    .cat-pct {
      font-weight: 700;
      color: #2563eb;
      font-size: 0.85rem;
    }

    .cat-amt {
      color: #64748b;
      font-size: 0.75rem;
    }

    .cat-track {
      width: 100%;
      height: 7px;
      background: #f1f5f9;
      border-radius: 999px;
      overflow: hidden;
    }

    .cat-fill {
      height: 100%;
      border-radius: 999px;
      transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    }

    /* Tarjeta Valor Total Custodiado */
    .total-custody-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 0.85rem 1rem;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03);
    }

    .custody-thumb {
      width: 58px;
      height: 58px;
      border-radius: 8px;
      overflow: hidden;
      flex-shrink: 0;
      border: 1px solid #cbd5e1;
      background: #0f172a;
    }

    .custody-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .custody-img-fallback {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #eff6ff;
    }

    .custody-content {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .custody-label {
      font-size: 0.62rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #64748b;
      text-transform: uppercase;
    }

    .custody-value {
      font-size: 1.15rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
    }

    .custody-status-link {
      font-size: 0.7rem;
      font-weight: 600;
      color: #2563eb;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }

    .custody-status-link:hover {
      text-decoration: underline;
    }

    /* 4. Estratificación de Demanda (Matriz ABC) */
    .abc-matrix-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.03), 0 4px 16px -4px rgba(15, 23, 42, 0.04);
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .abc-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .abc-title-group {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .abc-icon-box {
      background: #eff6ff;
      border: 1px solid #dbeafe;
      border-radius: 8px;
      padding: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .abc-category {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #2563eb;
      text-transform: uppercase;
      display: block;
    }

    .abc-title {
      font-size: 1.12rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
      margin: 0;
    }

    .abc-rebalance-text {
      font-size: 0.72rem;
      font-family: 'JetBrains Mono', monospace;
      color: #64748b;
    }

    /* Barra Segmentada ABC */
    .abc-segmented-bar {
      display: flex;
      height: 10px;
      border-radius: 999px;
      overflow: hidden;
      background: #f1f5f9;
      gap: 2px;
    }

    .segment-a {
      background: #1d4ed8;
      border-radius: 999px 0 0 999px;
    }

    .segment-b {
      background: #0284c7;
    }

    .segment-c {
      background: #c7d2fe;
      border-radius: 0 999px 999px 0;
    }

    /* Columnas ABC */
    .abc-columns-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.25rem;
    }

    @media (max-width: 900px) {
      .abc-columns-grid {
        grid-template-columns: 1fr;
      }
    }

    .abc-col-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.02);
    }

    .abc-col-top {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .class-badge {
      font-size: 0.65rem;
      font-weight: 800;
      padding: 0.2rem 0.55rem;
      border-radius: 4px;
      letter-spacing: 0.04em;
    }

    .badge-clase-a {
      background: #1d4ed8;
      color: #ffffff;
    }

    .badge-clase-b {
      background: #0284c7;
      color: #ffffff;
    }

    .badge-clase-c {
      background: #64748b;
      color: #ffffff;
    }

    .class-value-bold {
      font-size: 0.75rem;
      font-weight: 700;
      color: #1e293b;
    }

    .class-headline {
      font-size: 0.88rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
      letter-spacing: -0.01em;
    }

    .class-desc {
      font-size: 0.74rem;
      color: #64748b;
      line-height: 1.45;
      margin: 0;
    }

    .recommendation-box {
      margin-top: 0.5rem;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 0.75rem;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.02);
    }

    .rec-title {
      font-size: 0.6rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #475569;
      text-transform: uppercase;
      display: block;
      margin-bottom: 0.35rem;
    }

    .rec-text {
      font-size: 0.72rem;
      color: #334155;
      line-height: 1.4;
      margin: 0;
    }

    /* 5. Scheduled Reports Card & Table */
    .scheduled-reports-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.03), 0 4px 16px -4px rgba(15, 23, 42, 0.04);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .reports-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #f1f5f9;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .reports-title-left {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .reports-header-icon {
      background: #eff6ff;
      border: 1px solid #dbeafe;
      border-radius: 8px;
      padding: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .reports-main-title {
      font-size: 1.05rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
      margin: 0;
    }

    .reports-main-subtitle {
      font-size: 0.76rem;
      color: #64748b;
      margin: 0.15rem 0 0 0;
    }

    .btn-config-routines {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 0.5rem 0.95rem;
      font-size: 0.78rem;
      font-weight: 600;
      color: #334155;
      cursor: pointer;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
      transition: all 0.2s ease;
    }

    .btn-config-routines:hover {
      background: #ffffff;
      border-color: #94a3b8;
      box-shadow: 0 2px 6px rgba(15, 23, 42, 0.08);
    }

    /* Tabla */
    .reports-table-wrapper {
      width: 100%;
      overflow-x: auto;
    }

    .reports-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    .reports-table thead th {
      background: #f8fafc;
      color: #64748b;
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      padding: 0.85rem 1.5rem;
      border-bottom: 1px solid #e2e8f0;
      white-space: nowrap;
    }

    .report-row {
      border-bottom: 1px solid #f1f5f9;
      transition: background-color 0.15s ease;
    }

    .report-row:hover {
      background-color: #f8fafc;
    }

    .report-row td {
      padding: 0.95rem 1.5rem;
      font-size: 0.8rem;
      vertical-align: middle;
    }

    .report-identity {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .file-format-icon {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .icon-xlsx {
      background: #eff6ff;
      color: #2563eb;
      border: 1px solid #dbeafe;
    }

    .icon-pdf {
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fee2e2;
    }

    .icon-csv {
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #e2e8f0;
    }

    .report-texts {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .report-name {
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.01em;
    }

    .report-code {
      font-size: 0.68rem;
      font-family: 'JetBrains Mono', monospace;
      color: #64748b;
    }

    .emission-text {
      color: #334155;
      font-weight: 500;
    }

    .format-badge {
      font-size: 0.68rem;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      display: inline-block;
    }

    .fmt-xlsx {
      background: #eff6ff;
      color: #1d4ed8;
      border: 1px solid #dbeafe;
    }

    .fmt-pdf {
      background: #fef2f2;
      color: #b91c1c;
      border: 1px solid #fecaca;
    }

    .fmt-csv {
      background: #f1f5f9;
      color: #334155;
      border: 1px solid #e2e8f0;
    }

    .size-text {
      font-family: 'JetBrains Mono', monospace;
      color: #475569;
      font-size: 0.75rem;
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.66rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      padding: 0.25rem 0.65rem;
      border-radius: 999px;
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }

    .active-status {
      background: #eff6ff;
      color: #2563eb;
      border: 1px solid #dbeafe;
    }

    .active-status .status-dot {
      background: #2563eb;
      box-shadow: 0 0 6px rgba(37, 99, 235, 0.6);
    }

    .historical-status {
      background: #f1f5f9;
      color: #64748b;
      border: 1px solid #e2e8f0;
    }

    .historical-status .status-dot {
      background: #94a3b8;
    }

    .btn-download-action {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 0.35rem 0.75rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: #2563eb;
      cursor: pointer;
      transition: all 0.15s ease;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
    }

    .btn-download-action:hover {
      background: #eff6ff;
      border-color: #93c5fd;
      color: #1d4ed8;
      box-shadow: 0 2px 4px rgba(37, 99, 235, 0.15);
    }

    /* Footer del Bloque */
    .reports-footer-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.85rem 1.5rem;
      background: #f8fafc;
      border-top: 1px solid #f1f5f9;
      font-size: 0.72rem;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .footer-note {
      color: #64748b;
    }

    .s3-repo-link {
      color: #2563eb;
      font-weight: 600;
      text-decoration: none;
    }

    .s3-repo-link:hover {
      text-decoration: underline;
    }
  `]
})
export class ReportsComponent implements OnInit, OnDestroy {
  private readonly productsService = inject(ProductsService);
  private readonly saleService = inject(SaleService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly ngZone = inject(NgZone);

  private productsSub?: Subscription;
  private salesSub?: Subscription;

  products: ProductItem[] = [];
  sales: SaleDto[] = [];
  scheduledReports: ScheduledReport[] = [];

  // Filtro de lapso de fechas
  selectedLapse: 'today' | '7d' | '30d' | 'all' | 'custom' = '30d';
  startDate: string = '';
  endDate: string = '';

  get lapseLabel(): string {
    switch (this.selectedLapse) {
      case 'today': return 'Ventas y movimientos de Hoy';
      case '7d': return 'Últimos 7 días';
      case '30d': return 'Últimos 30 días';
      case 'all': return 'Todo el historial en BD';
      default: return `${this.startDate || ''} - ${this.endDate || ''}`;
    }
  }

  onLapseChange(): void {
    if (this.selectedLapse === 'custom' && !this.startDate) {
      const d = new Date();
      this.endDate = d.toISOString().substring(0, 10);
      d.setDate(d.getDate() - 30);
      this.startDate = d.toISOString().substring(0, 10);
    }
    this.cdr.detectChanges();
  }

  onDateRangeChange(): void {
    this.cdr.detectChanges();
  }

  // Filtrado de ventas por el lapso de tiempo seleccionado
  get filteredSalesByDate(): SaleDto[] {
    if (this.selectedLapse === 'all') {
      return this.sales;
    }
    const todayStr = new Date().toISOString().substring(0, 10);
    if (this.selectedLapse === 'today') {
      return this.sales.filter(s => s.createdAt && s.createdAt.substring(0, 10) === todayStr);
    }
    if (this.selectedLapse === '7d' || this.selectedLapse === '30d') {
      const days = this.selectedLapse === '7d' ? 7 : 30;
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      const cutoffStr = cutoff.toISOString().substring(0, 10);
      return this.sales.filter(s => s.createdAt && s.createdAt.substring(0, 10) >= cutoffStr);
    }
    if (this.selectedLapse === 'custom') {
      return this.sales.filter(s => {
        if (!s.createdAt) return false;
        const d = s.createdAt.substring(0, 10);
        const matchStart = !this.startDate || d >= this.startDate;
        const matchEnd = !this.endDate || d <= this.endDate;
        return matchStart && matchEnd;
      });
    }
    return this.sales;
  }

  // Puntos dinámicos para la gráfica de Movimientos de Entrada vs Salida
  get dynamicsPoints(): DynamicsBarPoint[] {
    const points: DynamicsBarPoint[] = [];
    const salesList = this.filteredSalesByDate;

    // Agrupar en 5 intervalos para renderizar la gráfica de 5 semanas / tramos
    const intervalsCount = 5;
    const stepX = 530 / Math.max(1, intervalsCount - 1);

    // Calcular totales por bloque
    let numDays = this.selectedLapse === '7d' ? 7 : (this.selectedLapse === '30d' ? 30 : 30);
    if (this.selectedLapse === 'today') numDays = 1;

    // Mapear por fecha
    const dayMap = new Map<string, { inbound: number; outbound: number }>();
    for (const s of salesList) {
      if (!s.createdAt) continue;
      const key = s.createdAt.substring(0, 10);
      const cur = dayMap.get(key) || { inbound: 0, outbound: 0 };
      if (s.isPaid) {
        cur.outbound += (s.quantity || 1);
      } else {
        cur.inbound += (s.quantity || 1);
      }
      dayMap.set(key, cur);
    }

    let maxVal = 1;
    for (const v of dayMap.values()) {
      maxVal = Math.max(maxVal, v.inbound, v.outbound);
    }

    // Si no hay ventas, mostramos los 5 bloques con valores en 0
    const now = new Date();
    for (let i = 0; i < intervalsCount; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - ((intervalsCount - 1 - i) * 6));
      const iso = d.toISOString().substring(0, 10);
      const data = dayMap.get(iso) || { inbound: 0, outbound: 0 };

      // Alturas escaladas hasta 140px máximo
      const inboundH = data.inbound > 0 ? Math.max(10, Math.round((data.inbound / maxVal) * 120)) : 0;
      const outboundH = data.outbound > 0 ? Math.max(10, Math.round((data.outbound / maxVal) * 120)) : 0;
      const inboundY = 195 - inboundH;
      const outboundY = 195 - outboundH;
      const x = 68 + (i * stepX);

      points.push({
        label: `Intervalo ${i + 1}`,
        subLabel: `${d.getDate()}/${d.getMonth() + 1}`,
        inboundCount: data.inbound,
        outboundCount: data.outbound,
        inboundH,
        inboundY,
        outboundH,
        outboundY,
        x
      });
    }

    return points;
  }

  get dynamicsChartAreaPath(): string {
    if (this.dynamicsPoints.length < 2) return '';
    let d = `M ${this.dynamicsPoints[0].x} ${this.dynamicsPoints[0].outboundY}`;
    for (let i = 1; i < this.dynamicsPoints.length; i++) {
      const prev = this.dynamicsPoints[i - 1];
      const cur = this.dynamicsPoints[i];
      const cx = (prev.x + cur.x) / 2;
      d += ` C ${cx} ${prev.outboundY}, ${cx} ${cur.outboundY}, ${cur.x} ${cur.outboundY}`;
    }
    const last = this.dynamicsPoints[this.dynamicsPoints.length - 1];
    d += ` L ${last.x} 195 L ${this.dynamicsPoints[0].x} 195 Z`;
    return d;
  }

  get dynamicsChartLinePath(): string {
    if (this.dynamicsPoints.length < 2) return '';
    let d = `M ${this.dynamicsPoints[0].x} ${this.dynamicsPoints[0].outboundY}`;
    for (let i = 1; i < this.dynamicsPoints.length; i++) {
      const prev = this.dynamicsPoints[i - 1];
      const cur = this.dynamicsPoints[i];
      const cx = (prev.x + cur.x) / 2;
      d += ` C ${cx} ${prev.outboundY}, ${cx} ${cur.outboundY}, ${cur.x} ${cur.outboundY}`;
    }
    return d;
  }

  private getStockNum(p: ProductItem): number {
    const raw = String(p.stockAvailable || p.stockTotal || '0').replace(/[^0-9-]/g, '');
    const n = parseInt(raw, 10);
    return isNaN(n) ? 0 : n;
  }

  private parsePrice(val: any): number {
    if (val === undefined || val === null || val === '') return 0;
    const str = String(val).replace(/[^0-9.]/g, '');
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
  }

  get totalStockUnits(): number {
    return this.products.reduce((acc, p) => acc + this.getStockNum(p), 0);
  }

  // Dinero invertido en inventario (a precio de costo de adquisición)
  get totalInventoryCost(): number {
    return this.products.reduce((acc, p) => {
      const qty = this.getStockNum(p);
      const cost = this.parsePrice(p.costPrice);
      return acc + (qty * cost);
    }, 0);
  }

  // Valor total de venta si se vende todo el inventario (a precio de venta al público PVP)
  get totalInventorySaleValue(): number {
    return this.products.reduce((acc, p) => {
      const qty = this.getStockNum(p);
      const sale = this.parsePrice(p.salePrice);
      return acc + (qty * sale);
    }, 0);
  }

  // Ganancia potencial total (Valor Venta Total - Costo Total Invertido)
  get totalPotentialProfit(): number {
    return Math.max(0, this.totalInventorySaleValue - this.totalInventoryCost);
  }

  // Porcentaje de margen de ganancia estimado
  get profitMarginPercent(): number {
    if (this.totalInventoryCost <= 0) {
      return this.totalInventorySaleValue > 0 ? 100 : 0;
    }
    return Math.round((this.totalPotentialProfit / this.totalInventoryCost) * 100);
  }

  get totalInventoryValue(): number {
    return this.totalInventorySaleValue;
  }

  get criticalCount(): number {
    return this.products.filter(p => this.getStockNum(p) < 5).length;
  }

  // Métricas que responden al filtro de fechas
  get paidSalesCount(): number {
    return this.filteredSalesByDate.filter(s => s.isPaid).length;
  }

  get totalSalesRevenue(): number {
    return this.filteredSalesByDate.filter(s => s.isPaid).reduce((acc, s) => acc + (s.totalAmount || 0), 0);
  }

  get pendingOrdersCount(): number {
    return this.filteredSalesByDate.filter(s => !s.isPaid).length;
  }

  get pendingOrdersAmount(): number {
    return this.filteredSalesByDate.filter(s => !s.isPaid).reduce((acc, s) => acc + (s.totalAmount || 0), 0);
  }

  get categories(): CategoryValue[] {
    if (this.products.length === 0) return [];
    const totalVal = this.totalInventoryValue || 1;
    const mapCat = new Map<string, number>();
    for (const p of this.products) {
      const qty = this.getStockNum(p);
      const price = parseFloat(String(p.costPrice || p.salePrice || '0').replace(/[^0-9.]/g, '')) || 0;
      const val = qty * price;
      mapCat.set(p.category, (mapCat.get(p.category) || 0) + val);
    }
    const colors = ['#2563eb', '#0284c7', '#16a34a', '#d97706', '#9333ea'];
    let idx = 0;
    const res: CategoryValue[] = [];
    for (const [name, val] of mapCat.entries()) {
      res.push({
        name,
        percentage: Math.round((val / totalVal) * 100),
        amount: `$${val.toFixed(2)}`,
        barColor: colors[idx % colors.length]
      });
      idx++;
    }
    return res;
  }

  ngOnInit(): void {
    this.productsSub = this.productsService.products$.subscribe(list => {
      this.ngZone.run(() => {
        this.products = [...(list || [])];
        this.cdr.detectChanges();
      });
    });

    this.salesSub = this.saleService.sales$.subscribe(list => {
      this.ngZone.run(() => {
        this.sales = [...(list || [])];
        this.cdr.detectChanges();
      });
    });

    this.productsService.getProducts().subscribe();
    this.saleService.getSales().subscribe();
  }

  ngOnDestroy(): void {
    this.productsSub?.unsubscribe();
    this.salesSub?.unsubscribe();
  }

  exportExecutiveReport(): void {}

  configureRoutines(): void {}

  downloadReport(report: ScheduledReport): void {}

  viewS3Repository(): void {}
}
