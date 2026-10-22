import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProductsService, ProductItem } from '../../Services/products.service';
import { SaleService, SaleDto } from '../../Services/sale.service';

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
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="fz-viewport">
      <!-- 1. Encabezado de Navegación y Acciones -->
      <header class="fz-header">
        <div class="header-titles">
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <span class="crumb">PANEL PRINCIPAL</span>
            <span class="separator">&gt;</span>
            <span class="crumb current">REPORTES Y ANALÍTICAS</span>
          </nav>
          <h1 class="page-title">Analíticas Financieras y Reportes de Inventario</h1>
          <p class="page-subtitle">
            Balance de costos, margen de beneficio potencial, valor de inventario e ingresos por ventas.
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

          <button class="fz-btn fz-btn-outline" (click)="refreshData()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M23 4v6h-6"></path>
              <path d="M1 20v-6h6"></path>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            <span>Actualizar</span>
          </button>
        </div>
      </header>

      <!-- 2. Tarjetas KPI de Rendimiento Operativo -->
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
            <span class="kpi-title">INGRESOS COBRADOS</span>
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
            <span class="kpi-title" style="color: #dc2626;">PEDIDOS PENDIENTES</span>
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
        <!-- Gráfica de Pedidos vs Ventas -->
        <div class="chart-box warehouse-dynamics-card">
          <div class="chart-header">
            <div>
              <span class="chart-category">DINÁMICA DE MOVIMIENTOS</span>
              <h2 class="chart-title">Pedidos Pendientes vs Ventas Completadas</h2>
            </div>
            <div class="chart-legend">
              <div class="legend-item">
                <span class="legend-dot dot-inbound"></span>
                <span class="legend-label">Pedidos (Unidades)</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot dot-outbound"></span>
                <span class="legend-label">Ventas (Unidades)</span>
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
                <rect 
                  [attr.x]="pt.x - 12" 
                  [attr.y]="pt.inboundY" 
                  width="14" 
                  [attr.height]="pt.inboundH" 
                  rx="3" 
                  fill="url(#barInboundGrad)" 
                  class="chart-bar">
                  <title>{{ pt.label }} ({{ pt.subLabel }}): {{ pt.inboundCount }} uds en pedidos</title>
                </rect>
                <rect 
                  [attr.x]="pt.x + 4" 
                  [attr.y]="pt.outboundY" 
                  width="14" 
                  [attr.height]="pt.outboundH" 
                  rx="3" 
                  fill="url(#barOutboundGrad)" 
                  class="chart-bar">
                  <title>{{ pt.label }} ({{ pt.subLabel }}): {{ pt.outboundCount }} uds vendidas</title>
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
            <div *ngIf="categories.length === 0" style="padding: 1.5rem 0; text-align: center; color: #64748b; font-size: 0.82rem;">
              No hay productos registrados para calcular distribución por categoría.
            </div>
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
              <div class="custody-img-fallback">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                </svg>
              </div>
            </div>
            <div class="custody-content">
              <span class="custody-label">VALOR TOTAL DE VENTA EN INVENTARIO</span>
              <div class="custody-value">\${{ totalInventoryValue | number:'1.2-2' }}</div>
              <a routerLink="/app/inventory" class="custody-status-link">
                {{ products.length }} SKUs en Base de Datos →
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- 4. Detalle de Transacciones en el Período Seleccionado -->
      <section class="scheduled-reports-card">
        <div class="reports-header-row">
          <div class="reports-title-left">
            <div class="reports-header-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
            </div>
            <div>
              <h2 class="reports-main-title">Detalle de Ventas y Pedidos del Período ({{ lapseLabel }})</h2>
              <p class="reports-main-subtitle">
                Operaciones registradas en la base de datos dentro del rango seleccionado.
              </p>
            </div>
          </div>
          <a routerLink="/app/enterprises" class="fz-btn fz-btn-outline" style="text-decoration: none;">
            <span>Gestionar en Movimientos y Pedidos →</span>
          </a>
        </div>

        <div class="reports-table-wrapper">
          <table class="reports-table">
            <thead>
              <tr>
                <th>ORDEN</th>
                <th>CLIENTE</th>
                <th>UNIDADES</th>
                <th>MÉTODO PAGO</th>
                <th>FECHA</th>
                <th>ESTADO</th>
                <th>MONTO TOTAL</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let sale of filteredSalesByDate" class="report-row">
                <td>
                  <strong style="font-family: 'JetBrains Mono', monospace; color: #2563eb;">
                    {{ sale.isPaid ? 'VTA-' + sale.id : 'PED-' + sale.id }}
                  </strong>
                </td>
                <td>
                  <span class="report-name">{{ sale.clientName }}</span>
                </td>
                <td>
                  <span class="size-text">{{ sale.quantity }} uds</span>
                </td>
                <td>
                  <span class="emission-text">{{ sale.paymentMethod }}</span>
                </td>
                <td>
                  <span class="emission-text">{{ sale.createdAt | date:'short' }}</span>
                </td>
                <td>
                  <span class="status-pill" [ngClass]="sale.isPaid ? 'active-status' : 'pending-status'">
                    <span class="status-dot"></span>
                    {{ sale.isPaid ? 'VENTA COBRADA' : 'PEDIDO PENDIENTE' }}
                  </span>
                </td>
                <td>
                  <strong [style.color]="sale.isPaid ? '#15803d' : '#dc2626'">
                    \${{ sale.totalAmount | number:'1.2-2' }}
                  </strong>
                </td>
              </tr>
              <tr *ngIf="filteredSalesByDate.length === 0">
                <td colspan="7" style="text-align: center; padding: 2.5rem; color: #64748b;">
                  No hay ventas ni pedidos registrados en el período seleccionado.
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
      flex-wrap: wrap;
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
      transition: all 0.2s ease;
      flex-wrap: wrap;
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
      flex-wrap: wrap;
      gap: 0.75rem;
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
      width: 52px;
      height: 52px;
      border-radius: 8px;
      overflow: hidden;
      flex-shrink: 0;
      border: 1px solid #dbeafe;
      background: #eff6ff;
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

    /* 4. Detalle de Transacciones Card & Table */
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

    .report-name {
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.01em;
    }

    .emission-text {
      color: #334155;
      font-weight: 500;
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
      background: #dcfce7;
      color: #15803d;
      border: 1px solid #bbf7d0;
    }

    .active-status .status-dot {
      background: #16a34a;
    }

    .pending-status {
      background: #fee2e2;
      color: #dc2626;
      border: 1px solid #fecaca;
    }

    .pending-status .status-dot {
      background: #dc2626;
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

  // Filtro de lapso de fechas
  selectedLapse: 'today' | '7d' | '30d' | 'all' | 'custom' = '30d';
  startDate: string = '';
  endDate: string = '';

  get lapseLabel(): string {
    switch (this.selectedLapse) {
      case 'today': return 'Hoy';
      case '7d': return 'Últimos 7 días';
      case '30d': return 'Últimos 30 días';
      case 'all': return 'Todo el historial';
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

  refreshData(): void {
    this.productsService.getProducts().subscribe();
    this.saleService.getSales().subscribe();
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

  // Puntos dinámicos para la gráfica de Movimientos
  get dynamicsPoints(): DynamicsBarPoint[] {
    const points: DynamicsBarPoint[] = [];
    const salesList = this.filteredSalesByDate;

    const intervalsCount = 5;
    const stepX = 530 / Math.max(1, intervalsCount - 1);

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

    const now = new Date();
    for (let i = 0; i < intervalsCount; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - ((intervalsCount - 1 - i) * 6));
      const iso = d.toISOString().substring(0, 10);
      const data = dayMap.get(iso) || { inbound: 0, outbound: 0 };

      const inboundH = data.inbound > 0 ? Math.max(10, Math.round((data.inbound / maxVal) * 120)) : 0;
      const outboundH = data.outbound > 0 ? Math.max(10, Math.round((data.outbound / maxVal) * 120)) : 0;
      const inboundY = 195 - inboundH;
      const outboundY = 195 - outboundH;
      const x = 68 + (i * stepX);

      points.push({
        label: `Día ${i + 1}`,
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

  get totalInventoryCost(): number {
    return this.products.reduce((acc, p) => {
      const qty = this.getStockNum(p);
      const cost = this.parsePrice(p.costPrice);
      return acc + (qty * cost);
    }, 0);
  }

  get totalInventorySaleValue(): number {
    return this.products.reduce((acc, p) => {
      const qty = this.getStockNum(p);
      const sale = this.parsePrice(p.salePrice || p.costPrice);
      return acc + (qty * sale);
    }, 0);
  }

  get totalPotentialProfit(): number {
    return Math.max(0, this.totalInventorySaleValue - this.totalInventoryCost);
  }

  get profitMarginPercent(): number {
    if (this.totalInventoryCost <= 0) {
      return this.totalInventorySaleValue > 0 ? 100 : 0;
    }
    return Math.round((this.totalPotentialProfit / this.totalInventoryCost) * 100);
  }

  get totalInventoryValue(): number {
    return this.totalInventorySaleValue;
  }

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
      const price = this.parsePrice(p.salePrice || p.costPrice);
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
}
