import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../Services/auth.service';
import { ProductsService, ProductItem } from '../../Services/products.service';
import { SaleService, SaleDto } from '../../Services/sale.service';

interface AssignedTask {
  code: string;
  type: string;
  typeClass: string;
  providerDest: string;
  providerDestSub: string;
  qtyItems: string;
  qtyItemsSub: string;
  status: string;
  statusClass: string;
  actionText: string;
  actionClass: string;
}

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="employee-content-area">
      <!-- Banner de Bienvenida y Título -->
      <div class="title-banner">
        <div class="title-left">
          <div class="title-row">
            <h1 class="page-title">Panel Operativo de Empleado</h1>
          </div>
          <p class="page-subtitle">
            Bienvenido, {{ employeeName }}. Gestión y consulta de inventario, pedidos y ventas asignadas.
          </p>
        </div>

        <div class="title-actions">
          <a routerLink="/app/enterprises" class="btn-action-outline" style="text-decoration: none;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="m7 16-4-4 4-4"></path>
              <path d="M3 12h18"></path>
              <path d="m17 8 4 4-4 4"></path>
            </svg>
            <span>Movimientos y Pedidos</span>
          </a>

          <a routerLink="/app/inventory" class="btn-action-primary" style="text-decoration: none;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            </svg>
            <span>Ver Inventario</span>
          </a>
        </div>
      </div>

      <!-- Métricas Clave Operativas (2 KPIs Grid) -->
      <section class="kpis-grid kpis-grid-2">
        <!-- KPI 1: Productos en Catálogo -->
        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-title">Productos en Catálogo</span>
            <div class="kpi-icon-pill">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              </svg>
            </div>
          </div>
          <div class="kpi-metric-row">
            <span class="kpi-big-num">{{ products.length | number }}</span>
            <span class="kpi-unit">SKUs</span>
          </div>
          <div class="kpi-subtext">Productos registrados en catálogo</div>
          <div class="kpi-footer-row mt-auto">
            <span class="kpi-foot-flex">
              <span class="dot-blue-sm"></span>
              Catálogo general activo
            </span>
          </div>
        </div>

        <!-- KPI 2: Movimientos -->
        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-title">Movimientos Registrados</span>
            <div class="kpi-icon-pill">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
                <path d="m7 16-4-4 4-4"></path>
                <path d="M3 12h18"></path>
                <path d="m17 8 4 4-4 4"></path>
              </svg>
            </div>
          </div>
          <div class="kpi-metric-row">
            <span class="kpi-big-num">{{ totalMovements | number }}</span>
            <span class="kpi-unit">Órdenes</span>
          </div>
          <div class="mini-stats-grid">
            <div class="mini-stat-badge">{{ productsIngresados | number }} SKUs en inventario</div>
            <div class="mini-stat-badge">{{ productsDespachados | number }} unidades en órdenes</div>
          </div>
        </div>
      </section>

      <!-- Cuadrícula Principal de Trabajo -->
      <div class="operational-grid">
        <!-- COLUMNA IZQUIERDA -->
        <div class="col-left">
          <!-- Bloque 1: Órdenes y Movimientos -->
          <div class="panel-card">
            <div class="panel-header-row">
              <div>
                <h2 class="panel-title">Órdenes y Movimientos Registrados</h2>
                <p class="panel-subtitle">Listado de pedidos pendientes y ventas completadas en la base de datos</p>
              </div>

              <!-- Filtros segmentados -->
              <div class="segment-tabs">
                <button 
                  class="segment-btn" 
                  [class.active]="activeTab === 'all'" 
                  (click)="setTab('all')"
                >
                  Todos ({{ tasksList.length }})
                </button>
                <button 
                  class="segment-btn" 
                  [class.active]="activeTab === 'picking'" 
                  (click)="setTab('picking')"
                >
                  Pedidos ({{ pendingOrdersCount }})
                </button>
                <button 
                  class="segment-btn" 
                  [class.active]="activeTab === 'recepciones'" 
                  (click)="setTab('recepciones')"
                >
                  Ventas ({{ paidSalesCount }})
                </button>
              </div>
            </div>

            <!-- Tabla Operativa de Asignaciones -->
            <div class="table-responsive">
              <table class="op-table">
                <thead>
                  <tr>
                    <th>CÓDIGO</th>
                    <th>TIPO</th>
                    <th>CLIENTE / DETALLE</th>
                    <th>CANT. / MONTO</th>
                    <th>ESTADO</th>
                    <th class="text-right">ACCIÓN</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of filteredTasks">
                    <td>
                      <span class="code-tag">{{ item.code }}</span>
                    </td>
                    <td>
                      <div class="type-pill" [ngClass]="item.typeClass">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                        </svg>
                        <span>{{ item.type }}</span>
                      </div>
                    </td>
                    <td>
                      <div class="dest-main">{{ item.providerDest }}</div>
                      <div class="dest-sub">{{ item.providerDestSub }}</div>
                    </td>
                    <td>
                      <div class="qty-main">{{ item.qtyItems }}</div>
                      <div class="qty-sub">{{ item.qtyItemsSub }}</div>
                    </td>
                    <td>
                      <span class="status-pill" [ngClass]="item.statusClass">
                        <span class="status-dot"></span>
                        {{ item.status }}
                      </span>
                    </td>
                    <td class="text-right">
                      <a routerLink="/app/enterprises" class="btn-op-action" [ngClass]="item.actionClass" style="text-decoration: none; display: inline-flex; align-items: center;">
                        {{ item.actionText }}
                      </a>
                    </td>
                  </tr>
                  <tr *ngIf="filteredTasks.length === 0">
                    <td colspan="6" style="text-align: center; padding: 1.5rem; color: #64748b;">
                      No hay órdenes ni movimientos registrados en la base de datos.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="panel-footer-row">
              <span class="footer-count">Mostrando {{ filteredTasks.length }} de {{ tasksList.length }} órdenes en base de datos</span>
              <a routerLink="/app/enterprises" class="footer-link">
                Ver todos en Movimientos y Pedidos
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </a>
            </div>
          </div>

          <!-- Bloque 2: Gestión Rápida de Inventario y Productos -->
          <div class="panel-card" style="margin-top: 1.25rem;">
            <div class="panel-header-row">
              <div>
                <h2 class="panel-title">Consulta Rápida de Inventario y Existencias</h2>
                <p class="panel-subtitle">Búsqueda rápida de productos y alertas de stock bajo</p>
              </div>
            </div>

            <div class="bay-tools-grid">
              <!-- Herramienta 1: Catálogo y Consulta Stock -->
              <div class="tool-subcard">
                <div class="tool-header">
                  <div class="tool-icon blue">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  </div>
                  <span class="tool-title">Catálogo y Consulta Stock</span>
                </div>
                <p class="tool-desc">Busca existencias por SKU, código de barras o nombre.</p>
                
                <div class="tool-search-input">
                  <input type="text" placeholder="Buscar por SKU o nombre..." [(ngModel)]="stockSearchInput" />
                </div>

                <!-- Mini lista de resultados interactivos -->
                <div *ngIf="products.length > 0" style="margin-top: 0.65rem; display: flex; flex-direction: column; gap: 0.35rem; max-height: 120px; overflow-y: auto;">
                  <div *ngFor="let p of filteredCatalogProducts.slice(0, 3); trackBy: trackBySku" style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 0.3rem 0.5rem; font-size: 0.72rem;">
                    <div style="display: flex; align-items: center; gap: 0.4rem; overflow: hidden;">
                      <span>{{ p.imageIcon }}</span>
                      <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px;">
                        <strong style="color: #0f172a; font-family: 'JetBrains Mono', monospace; font-size: 0.68rem;">{{ p.sku }}</strong>
                        <div style="font-size: 0.64rem; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ p.name }}</div>
                      </div>
                    </div>
                    <div style="text-align: right; white-space: nowrap;">
                      <span [style.color]="isUnderFive(p) ? '#dc2626' : '#0284c7'" style="font-weight: 700; font-size: 0.7rem;">{{ p.stockAvailable }}</span>
                      <div *ngIf="isUnderFive(p)" style="font-size: 0.6rem; color: #dc2626; font-weight: 700;">⚠️ &lt; 5</div>
                      <div style="font-size: 0.62rem; color: #64748b;">{{ p.location }}</div>
                    </div>
                  </div>
                </div>

                <div class="tool-footer" style="margin-top: 0.65rem;">
                  <span class="tool-count">{{ products.length | number }} SKUs en catálogo</span>
                  <span class="tool-tag-ok">DISPONIBLE</span>
                </div>
              </div>

              <!-- Herramienta 2: Alertas de Stock Bajo -->
              <div class="tool-subcard">
                <div class="tool-header">
                  <div class="tool-icon orange">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                      <line x1="12" y1="9" x2="12" y2="13"></line>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                  </div>
                  <span class="tool-title">Alertas de Stock Bajo</span>
                  <span class="badge-critical" style="margin-left: auto;">{{ criticalProducts.length }} CRÍTICOS</span>
                </div>
                <p class="tool-desc">Existencias por debajo del umbral mínimo de seguridad:</p>

                <div class="critical-items-list">
                  <div *ngIf="criticalProducts.length === 0" style="font-size: 0.74rem; color: #64748b; padding: 0.5rem 0;">
                    0 productos en estado crítico.
                  </div>
                  <div *ngFor="let cp of criticalProducts.slice(0, 4)" class="critical-item">
                    <span>{{ cp.name }}</span>
                    <span class="crit-qty"><strong class="text-danger">{{ cp.stockAvailable }} uds</strong> / min {{ cp.minStock || 5 }}</span>
                  </div>
                </div>

                <div class="tool-footer">
                  <a routerLink="/app/inventory" class="report-link">
                    Gestionar en Inventario
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            <!-- Tabla Rápida de Productos para Operador -->
            <div class="panel-card" style="margin-top: 1.25rem;">
              <div class="panel-header-row" style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <h2 class="panel-title">Catálogo de Productos</h2>
                  <p class="panel-subtitle">Consulta de existencias y ubicación en almacén</p>
                </div>
                <a routerLink="/app/inventory" class="btn-tool-outline" style="text-decoration: none; font-size: 0.72rem; padding: 0.35rem 0.65rem; width: auto;">
                  <span>Ver Inventario Completo →</span>
                </a>
              </div>

              <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.74rem;">
                  <thead>
                    <tr style="border-bottom: 1px solid #e2e8f0; text-align: left; color: #64748b; font-size: 0.68rem; text-transform: uppercase;">
                      <th style="padding: 0.5rem 0.65rem;">PRODUCTO / SKU</th>
                      <th style="padding: 0.5rem 0.65rem;">UBICACIÓN</th>
                      <th style="padding: 0.5rem 0.65rem;">STOCK TOTAL / DISP.</th>
                      <th style="padding: 0.5rem 0.65rem;">ESTADO</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let p of filteredCatalogProducts" style="border-bottom: 1px solid #f1f5f9;">
                      <td style="padding: 0.55rem 0.65rem;">
                        <div style="display: flex; align-items: center; gap: 0.45rem;">
                          <span style="font-size: 1.15rem;">{{ p.imageIcon }}</span>
                          <div>
                            <strong style="color: #0f172a; display: block; font-size: 0.75rem;">{{ p.name }}</strong>
                            <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.68rem; color: #64748b;">{{ p.sku }} • {{ p.category }}</span>
                          </div>
                        </div>
                      </td>
                      <td style="padding: 0.55rem 0.65rem;">
                        <span style="background: #f1f5f9; border: 1px solid #e2e8f0; padding: 0.15rem 0.45rem; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 0.68rem; font-weight: 600; color: #334155;">
                          {{ p.location }}
                        </span>
                      </td>
                      <td style="padding: 0.55rem 0.65rem;">
                        <strong [style.color]="isUnderFive(p) ? '#dc2626' : '#0284c7'" style="font-family: 'JetBrains Mono', monospace;">{{ p.stockAvailable }}</strong>
                        <span *ngIf="isUnderFive(p)" style="font-size: 0.62rem; color: #dc2626; font-weight: 700; margin-left: 3px;">⚠️ &lt; 5 CRÍTICO</span>
                        <span style="color: #64748b; font-size: 0.68rem;"> (Tot: {{ p.stockTotal }})</span>
                      </td>
                      <td style="padding: 0.55rem 0.65rem;">
                        <span [style.background]="isUnderFive(p) ? '#fee2e2' : '#e0f2fe'" [style.color]="isUnderFive(p) ? '#dc2626' : '#0284c7'" style="padding: 0.18rem 0.45rem; border-radius: 12px; font-size: 0.65rem; font-weight: 700;">
                          {{ isUnderFive(p) ? 'STOCK CRÍTICO' : p.stockStatus }}
                        </span>
                      </td>
                    </tr>
                    <tr *ngIf="filteredCatalogProducts.length === 0">
                      <td colspan="4" style="text-align: center; padding: 1.5rem; color: #64748b;">
                        No hay productos que coincidan con la búsqueda.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- COLUMNA DERECHA -->
        <div class="col-right">
          <!-- Bloque Resumen de Pedidos y Ventas -->
          <div class="panel-card">
            <div class="panel-header-row">
              <div>
                <h2 class="panel-title">Resumen de Pedidos y Ventas</h2>
                <p class="panel-subtitle">Balance y estado operativo general</p>
              </div>
              <span class="badge-diag-ok">ACTIVO</span>
            </div>

            <div class="devices-list">
              <div class="device-item">
                <div class="device-details">
                  <div class="device-name" style="color: #dc2626;">Pedidos Pendientes</div>
                  <div class="device-sub">Órdenes por despachar / cobrar</div>
                </div>
                <div class="device-battery" style="color: #dc2626; font-weight: 800; font-size: 1rem;">
                  <span>{{ pendingOrdersCount }}</span>
                </div>
              </div>

              <div class="device-item">
                <div class="device-details">
                  <div class="device-name" style="color: #16a34a;">Ventas Completadas</div>
                  <div class="device-sub">Productos marcados como vendidos</div>
                </div>
                <div class="device-battery" style="color: #16a34a; font-weight: 800; font-size: 1rem;">
                  <span>{{ paidSalesCount }}</span>
                </div>
              </div>

              <div class="device-item">
                <div class="device-details">
                  <div class="device-name" style="color: #0f172a;">Alertas de Stock Crítico</div>
                  <div class="device-sub">Productos por debajo del mínimo</div>
                </div>
                <div class="device-battery" [style.color]="criticalProducts.length > 0 ? '#dc2626' : '#2563eb'" style="font-weight: 800; font-size: 1rem;">
                  <span>{{ criticalProducts.length }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Barra Inferior de Estado (Status Bar) -->
      <footer class="employee-statusbar">
        <div class="status-left">
          <span class="status-action-dot"></span>
          <span class="status-action-label">Estado de base de datos:</span>
          <span class="status-action-sku">{{ products.length }} SKUs • {{ sales.length }} movimientos registrados</span>
        </div>

        <div class="status-right">
          <span class="status-session">Operador: {{ employeeName }}</span>
          <span class="status-brand">FIRMEZA Enterprise</span>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background-color: #f8fafc;
      font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #0f172a;
    }

    .employee-content-area {
      flex: 1;
      padding: 1.5rem 1.75rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .title-banner {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .title-row {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      flex-wrap: wrap;
    }

    .page-title {
      font-size: 1.45rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
      margin: 0;
    }

    .page-subtitle {
      font-size: 0.82rem;
      color: #64748b;
      margin-top: 0.35rem;
      max-width: 700px;
      line-height: 1.4;
    }

    .title-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .btn-action-outline {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      color: #334155;
      font-size: 0.84rem;
      font-weight: 600;
      padding: 0.55rem 0.95rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-action-outline:hover {
      background: #f8fafc;
      border-color: #94a3b8;
    }

    .btn-action-primary {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: #2563eb;
      border: 1px solid #2563eb;
      color: #ffffff;
      font-size: 0.84rem;
      font-weight: 600;
      padding: 0.55rem 1rem;
      border-radius: 8px;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.28);
      transition: all 0.15s ease;
    }

    .btn-action-primary:hover {
      background: #1d4ed8;
      border-color: #1d4ed8;
    }

    .kpis-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .kpi-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1rem 1.15rem;
      display: flex;
      flex-direction: column;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
      min-height: 145px;
    }

    .kpi-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .kpi-title {
      font-size: 0.78rem;
      font-weight: 600;
      color: #64748b;
      line-height: 1.3;
    }

    .kpi-icon-pill {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      background: #eff6ff;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .kpi-metric-row {
      display: flex;
      align-items: baseline;
      gap: 0.45rem;
      margin-bottom: 0.35rem;
    }

    .kpi-big-num {
      font-size: 1.9rem;
      font-weight: 800;
      color: #0f172a;
      line-height: 1;
      letter-spacing: -0.03em;
    }

    .kpi-unit {
      font-size: 0.95rem;
      font-weight: 700;
      color: #334155;
    }

    .kpi-footer-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: auto;
      font-size: 0.75rem;
    }

    .kpi-foot-flex {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      color: #334155;
      font-weight: 600;
      font-size: 0.75rem;
    }

    .dot-blue-sm {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #2563eb;
      flex-shrink: 0;
    }

    .kpi-subtext {
      font-size: 0.76rem;
      color: #64748b;
      margin-bottom: 0.4rem;
    }

    .mini-stats-grid {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      margin: 0.3rem 0 0.5rem;
      flex-wrap: wrap;
    }

    .mini-stat-badge {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 0.2rem 0.45rem;
      font-size: 0.72rem;
      font-weight: 600;
      color: #475569;
    }

    .operational-grid {
      display: grid;
      grid-template-columns: 1.85fr 1.15fr;
      gap: 1.25rem;
      align-items: start;
    }

    .panel-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.25rem;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
    }

    .panel-header-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.75rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    .panel-title {
      font-size: 1.05rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.015em;
      margin: 0;
    }

    .panel-subtitle {
      font-size: 0.78rem;
      color: #64748b;
      margin-top: 0.2rem;
    }

    .segment-tabs {
      display: flex;
      align-items: center;
      background: #f1f5f9;
      border-radius: 8px;
      padding: 0.2rem;
      gap: 0.15rem;
    }

    .segment-btn {
      background: transparent;
      border: none;
      font-size: 0.75rem;
      font-weight: 600;
      color: #64748b;
      padding: 0.35rem 0.65rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .segment-btn.active {
      background: #ffffff;
      color: #0f172a;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
    }

    .table-responsive {
      overflow-x: auto;
    }

    .op-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.82rem;
    }

    .op-table th {
      text-align: left;
      font-size: 0.68rem;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 0.04em;
      padding: 0.6rem 0.75rem;
      border-bottom: 1px solid #e2e8f0;
      background: #f8fafc;
    }

    .op-table td {
      padding: 0.75rem 0.75rem;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: middle;
    }

    .op-table tr:hover td {
      background-color: #fafbfc;
    }

    .code-tag {
      font-weight: 700;
      color: #2563eb;
      font-family: monospace;
      font-size: 0.85rem;
    }

    .type-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.73rem;
      font-weight: 600;
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
    }

    .type-pill.picking,
    .type-pill.reception {
      background: #eff6ff;
      color: #1d4ed8;
    }

    .dest-main {
      font-weight: 700;
      color: #0f172a;
      line-height: 1.2;
    }

    .dest-sub {
      font-size: 0.72rem;
      color: #64748b;
      margin-top: 0.15rem;
    }

    .qty-main {
      font-weight: 700;
      color: #0f172a;
      line-height: 1.2;
    }

    .qty-sub {
      font-size: 0.72rem;
      color: #64748b;
      margin-top: 0.15rem;
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.68rem;
      font-weight: 800;
      padding: 0.2rem 0.55rem;
      border-radius: 20px;
      letter-spacing: 0.02em;
    }

    .status-pill.blue {
      background: #fee2e2;
      border: 1px solid #fecaca;
      color: #dc2626;
    }

    .status-pill.green {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #15803d;
    }

    .status-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: currentColor;
    }

    .btn-op-action {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      font-size: 0.74rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s ease;
      border: 1px solid transparent;
    }

    .btn-op-action.primary {
      background: #2563eb;
      color: #ffffff;
    }

    .btn-op-action.primary:hover {
      background: #1d4ed8;
    }

    .btn-op-action.outline {
      background: #ffffff;
      border-color: #cbd5e1;
      color: #334155;
    }

    .btn-op-action.outline:hover {
      background: #f8fafc;
      border-color: #94a3b8;
    }

    .panel-footer-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 1rem;
      font-size: 0.78rem;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .footer-count {
      color: #64748b;
    }

    .footer-link {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      color: #2563eb;
      font-weight: 700;
      text-decoration: none;
    }

    .footer-link:hover {
      text-decoration: underline;
    }

    .bay-tools-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.85rem;
      margin-top: 0.5rem;
    }

    .tool-subcard {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 0.85rem;
      display: flex;
      flex-direction: column;
    }

    .tool-header {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      margin-bottom: 0.35rem;
    }

    .tool-icon {
      width: 26px;
      height: 26px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .tool-icon.blue {
      background: #eff6ff;
      color: #2563eb;
    }

    .tool-icon.orange {
      background: #fff7ed;
      color: #ea580c;
    }

    .tool-title {
      font-size: 0.78rem;
      font-weight: 700;
      color: #0f172a;
    }

    .badge-critical {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #dc2626;
      font-size: 0.65rem;
      font-weight: 800;
      padding: 0.1rem 0.4rem;
      border-radius: 4px;
    }

    .tool-desc {
      font-size: 0.72rem;
      color: #64748b;
      margin-bottom: 0.6rem;
      line-height: 1.35;
    }

    .tool-search-input {
      display: flex;
      align-items: center;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 0.35rem 0.6rem;
      margin-bottom: 0.6rem;
    }

    .tool-search-input input {
      border: none;
      outline: none;
      font-size: 0.73rem;
      width: 100%;
      background: transparent;
      color: #0f172a;
    }

    .critical-items-list {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      margin-bottom: 0.6rem;
      font-size: 0.73rem;
    }

    .critical-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: #334155;
    }

    .text-danger {
      color: #ef4444;
      font-weight: 700;
    }

    .tool-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: auto;
      font-size: 0.72rem;
    }

    .tool-count {
      color: #64748b;
    }

    .tool-tag-ok {
      font-weight: 700;
      color: #2563eb;
      background: #eff6ff;
      padding: 0.1rem 0.35rem;
      border-radius: 4px;
      font-family: monospace;
    }

    .report-link {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      color: #2563eb;
      font-weight: 700;
      text-decoration: none;
    }

    .btn-tool-outline {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.35rem;
      width: 100%;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      padding: 0.35rem 0.5rem;
      border-radius: 6px;
      font-size: 0.72rem;
      font-weight: 700;
      color: #334155;
      cursor: pointer;
    }

    .btn-tool-outline:hover {
      background: #f1f5f9;
    }

    .badge-diag-ok {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1d4ed8;
      font-size: 0.68rem;
      font-weight: 800;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
      letter-spacing: 0.03em;
    }

    .devices-list {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }

    .device-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 0.75rem;
    }

    .device-details {
      flex: 1;
      min-width: 0;
    }

    .device-name {
      font-size: 0.8rem;
      font-weight: 700;
      color: #0f172a;
    }

    .device-sub {
      font-size: 0.7rem;
      color: #64748b;
      margin-top: 0.1rem;
    }

    .device-battery {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      font-size: 0.72rem;
      font-weight: 700;
      color: #2563eb;
    }

    .employee-statusbar {
      background: #ffffff;
      border-top: 1px solid #e2e8f0;
      padding: 0.65rem 1.75rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.75rem;
      color: #64748b;
      border-radius: 8px;
    }

    .status-left {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      flex-wrap: wrap;
    }

    .status-action-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #2563eb;
    }

    .status-action-label {
      font-weight: 700;
      color: #334155;
    }

    .status-action-sku {
      font-family: monospace;
      color: #0f172a;
      font-weight: 600;
    }

    .status-right {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }

    .status-session {
      font-family: monospace;
      color: #475569;
    }

    .status-brand {
      color: #2563eb;
      font-weight: 700;
    }

    .text-right {
      text-align: right;
    }

    @media (max-width: 1180px) {
      .operational-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .kpis-grid {
        grid-template-columns: 1fr;
      }
      .bay-tools-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class EmployeeDashboardComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly productsService = inject(ProductsService);
  private readonly saleService = inject(SaleService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly ngZone = inject(NgZone);

  private productsSub?: Subscription;
  private salesSub?: Subscription;

  employeeName = 'Operador';
  employeeRole = 'Operador Logístico';
  stockSearchInput = '';
  activeTab: 'all' | 'picking' | 'recepciones' = 'all';

  products: ProductItem[] = [];
  sales: SaleDto[] = [];

  get productsIngresados(): number {
    return this.products.length;
  }

  get productsDespachados(): number {
    return this.sales.reduce((acc, s) => acc + (s.quantity || 0), 0);
  }

  get totalMovements(): number {
    return this.sales.length;
  }

  get pendingOrdersCount(): number {
    return this.sales.filter(s => !s.isPaid).length;
  }

  get paidSalesCount(): number {
    return this.sales.filter(s => s.isPaid).length;
  }

  get criticalProducts(): ProductItem[] {
    return this.products.filter(p => this.isUnderFive(p));
  }

  get tasksList(): AssignedTask[] {
    return this.sales.map(s => {
      const firstDetail = s.details && s.details.length > 0 ? s.details[0] : null;
      return {
        code: s.isPaid ? `VTA-${s.id}` : `PED-${s.id}`,
        type: s.isPaid ? 'Venta Completada' : 'Pedido Cliente',
        typeClass: s.isPaid ? 'reception' : 'picking',
        providerDest: s.clientName,
        providerDestSub: firstDetail ? `${firstDetail.productName} (${firstDetail.productSku})` : `Pago: ${s.paymentMethod}`,
        qtyItems: `${s.quantity} uds`,
        qtyItemsSub: `$${s.totalAmount.toFixed(2)}`,
        status: s.isPaid ? 'VENDIDO' : 'PEDIDO PENDIENTE',
        statusClass: s.isPaid ? 'green' : 'blue',
        actionText: s.isPaid ? 'Ver Venta' : 'Gestionar',
        actionClass: s.isPaid ? 'outline' : 'primary'
      };
    });
  }

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user?.fullName) {
      this.employeeName = user.fullName;
    } else if (user?.email) {
      this.employeeName = user.email;
    }
    if (user?.role && user.role !== 'User') {
      this.employeeRole = user.role === 'Employee' ? 'Operador Logístico' : user.role;
    }
    this.loadProducts();
    this.loadSales();
  }

  ngOnDestroy(): void {
    this.productsSub?.unsubscribe();
    this.salesSub?.unsubscribe();
  }

  trackBySku(_: number, p: ProductItem): string {
    return p.id || p.sku;
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

  isUnderFive(p: ProductItem): boolean {
    const qty = parseInt(p.stockAvailable || p.stockTotal || '0', 10);
    return isNaN(qty) ? false : (qty < (p.minStock ?? 5) || p.stockStatusClass === 'critical' || p.stockStatus === 'STOCK CRÍTICO');
  }

  get filteredCatalogProducts(): ProductItem[] {
    if (!this.stockSearchInput.trim()) {
      return this.products;
    }
    const term = this.stockSearchInput.toLowerCase();
    return this.products.filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.sku.toLowerCase().includes(term) ||
      p.barcode.includes(term) ||
      p.location.toLowerCase().includes(term)
    );
  }

  get filteredTasks(): AssignedTask[] {
    if (this.activeTab === 'picking') {
      return this.tasksList.filter(t => t.code.startsWith('PED-'));
    }
    if (this.activeTab === 'recepciones') {
      return this.tasksList.filter(t => t.code.startsWith('VTA-'));
    }
    return this.tasksList;
  }

  setTab(tab: 'all' | 'picking' | 'recepciones'): void {
    this.activeTab = tab;
  }
}
