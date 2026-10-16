import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../Services/auth.service';
import { ProductsService, ProductItem } from '../../Services/products.service';

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
  hasPrintIcon?: boolean;
}

interface ScheduledProvider {
  name: string;
  status: string;
  statusClass: string;
  arrival: string;
  ramp: string;
  notes?: string;
  progress?: number;
  cargo: string;
  actionText: string;
  actionType: 'link' | 'button' | 'badge';
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
                <span class="pill-active-shift">
                  <span class="shift-dot"></span>
                  TURNO ACTIVO: 06:00 - 15:30
                </span>
              </div>
              <p class="page-subtitle">
                Bienvenido, {{ employeeName }} (Turno Diurno - Bahía Nave A). Supervisión de tareas de picking y recepción asignadas.
              </p>
            </div>

            <div class="title-actions">
              <button class="btn-action-outline">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <polyline points="16 3 21 3 21 8"></polyline>
                  <line x1="4" y1="20" x2="21" y2="3"></line>
                  <polyline points="21 16 21 21 16 21"></polyline>
                  <line x1="15" y1="15" x2="21" y2="21"></line>
                  <line x1="4" y1="4" x2="9" y2="9"></line>
                </svg>
                <span>Nuevo Movimiento Rápido</span>
              </button>

              <button class="btn-action-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M3 7V5a2 2 0 0 1 2-2h2"></path>
                  <path d="M17 3h2a2 2 0 0 1 2 2v2"></path>
                  <path d="M21 17v2a2 2 0 0 1-2 2h-2"></path>
                  <path d="M7 21H5a2 2 0 0 1-2-2v-2"></path>
                  <rect x="7" y="7" width="10" height="10" rx="1"></rect>
                </svg>
                <span>Escanear Código / SKU</span>
              </button>
            </div>
          </div>

          <!-- 3. Métricas Clave Operativas (4 KPIs Grid) -->
          <section class="kpis-grid">
            <!-- KPI 1: Tareas de Picking -->
            <div class="kpi-card">
              <div class="kpi-header">
                <span class="kpi-title">Tareas de Picking / Despacho Hoy</span>
                <div class="kpi-icon-pill">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                  </svg>
                </div>
              </div>
              <div class="kpi-metric-row">
                <span class="kpi-big-num">24</span>
                <span class="kpi-fraction">/ 32</span>
                <span class="kpi-pill-percent">75%</span>
              </div>
              <div class="progress-bar-track">
                <div class="progress-bar-fill" style="width: 75%;"></div>
              </div>
              <div class="kpi-footer-row">
                <span class="kpi-foot-blue">+8 pendientes en cola</span>
                <span class="kpi-foot-gray">Nave A-PB1</span>
              </div>
            </div>

            <!-- KPI 2: Productos Consultados -->
            <div class="kpi-card">
              <div class="kpi-header">
                <span class="kpi-title">Productos Consultados / Actualizados</span>
                <div class="kpi-icon-pill">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
                    <path d="M3 7V5a2 2 0 0 1 2-2h2"></path>
                    <path d="M17 3h2a2 2 0 0 1 2 2v2"></path>
                    <path d="M21 17v2a2 2 0 0 1-2 2h-2"></path>
                    <path d="M7 21H5a2 2 0 0 1-2-2v-2"></path>
                    <line x1="7" y1="12" x2="17" y2="12"></line>
                  </svg>
                </div>
              </div>
              <div class="kpi-metric-row">
                <span class="kpi-big-num">142</span>
                <span class="kpi-unit">SKUs</span>
              </div>
              <div class="kpi-subtext">Hoy en WH-01 (Auditoría Bahía A)</div>
              <div class="kpi-footer-row mt-auto">
                <span class="kpi-foot-flex">
                  <span class="dot-blue-sm"></span>
                  Ritmo: ~18 lecturas / hora
                </span>
              </div>
            </div>

            <!-- KPI 3: Movimientos en Tránsito -->
            <div class="kpi-card">
              <div class="kpi-header">
                <span class="kpi-title">Movimientos y Pedidos en Tránsito</span>
                <div class="kpi-icon-pill">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
                    <path d="m7 16-4-4 4-4"></path>
                    <path d="M3 12h18"></path>
                    <path d="m17 8 4 4-4 4"></path>
                  </svg>
                </div>
              </div>
              <div class="kpi-metric-row">
                <span class="kpi-big-num">18</span>
                <span class="kpi-unit">Pedidos</span>
              </div>
              <div class="mini-stats-grid">
                <div class="mini-stat-badge">6 recepciones</div>
                <div class="mini-stat-badge">12 despachos listos</div>
              </div>
              <div class="kpi-footer-row">
                <span class="kpi-foot-gray">Tiempo prom: 14 min</span>
                <span class="kpi-foot-blue">Flujo Normal</span>
              </div>
            </div>

            <!-- KPI 4: Proveedores Hoy -->
            <div class="kpi-card">
              <div class="kpi-header">
                <span class="kpi-title">Proveedores con Entregas Hoy</span>
                <div class="kpi-icon-pill">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
                    <rect x="1" y="3" width="15" height="13"></rect>
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                    <circle cx="5.5" cy="18.5" r="2.5"></circle>
                    <circle cx="18.5" cy="18.5" r="2.5"></circle>
                  </svg>
                </div>
              </div>
              <div class="kpi-metric-row">
                <span class="kpi-big-num">4</span>
                <span class="kpi-unit">Proveedores</span>
              </div>
              <div class="kpi-provider-pills">
                <span class="kpi-foot-flex">
                  <span class="dot-blue-sm"></span>
                  2 en rampa descarga
                </span>
                <span class="kpi-foot-gray">2 programados</span>
              </div>
              <div class="kpi-footer-row">
                <span class="kpi-foot-gray">Próximo arribo: 13:00 PM</span>
                <span class="kpi-foot-blue fw-bold">Rampa 04</span>
              </div>
            </div>
          </section>

          <!-- 4. Cuadrícula Principal de Trabajo (2 Columnas: Izquierda Asignaciones, Derecha Proveedores & Dispositivos) -->
          <div class="operational-grid">
            <!-- COLUMNA IZQUIERDA -->
            <div class="col-left">
              <!-- Bloque 1: Órdenes y Movimientos Asignados -->
              <div class="panel-card">
                <div class="panel-header-row">
                  <div>
                    <h2 class="panel-title">Órdenes y Movimientos Asignados para Hoy</h2>
                    <p class="panel-subtitle">Flujo de trabajo asignado al terminal activo TER-04</p>
                  </div>

                  <!-- Filtros segmentados -->
                  <div class="segment-tabs">
                    <button 
                      class="segment-btn" 
                      [class.active]="activeTab === 'all'" 
                      (click)="setTab('all')"
                    >
                      Todos (5)
                    </button>
                    <button 
                      class="segment-btn" 
                      [class.active]="activeTab === 'picking'" 
                      (click)="setTab('picking')"
                    >
                      Picking (2)
                    </button>
                    <button 
                      class="segment-btn" 
                      [class.active]="activeTab === 'recepciones'" 
                      (click)="setTab('recepciones')"
                    >
                      Recepciones (2)
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
                        <th>PROVEEDOR / DESTINO</th>
                        <th>CANT. SKUS</th>
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
                          <button class="btn-op-action" [ngClass]="item.actionClass">
                            <svg *ngIf="item.hasPrintIcon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-1">
                              <polyline points="6 9 6 2 18 2 18 9"></polyline>
                              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                              <rect x="6" y="14" width="12" height="8"></rect>
                            </svg>
                            {{ item.actionText }}
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div class="panel-footer-row">
                  <span class="footer-count">Mostrando 4 de 5 asignaciones directas</span>
                  <a routerLink="/app/enterprises" class="footer-link">
                    Ver todos en Movimientos y Pedidos
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </a>
                </div>
              </div>

              <!-- Bloque 2: Gestión Rápida de Inventario y Productos en Bahía -->
              <div class="panel-card mt-4">
                <div class="panel-header-row">
                  <div>
                    <h2 class="panel-title">Gestión Rápida de Inventario y Productos en Bahía</h2>
                    <p class="panel-subtitle">Acceso directo a herramientas de conteo y existencias en Bahía Nave A</p>
                  </div>
                  <span class="location-badge">UBICACIÓN A-01 A A-14</span>
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
                    <p class="tool-desc">Busca existencias en tiempo real por SKU, lote o descripción.</p>
                    
                    <div class="tool-search-input">
                      <input type="text" placeholder="Ej. PER-IPE-200 o es..." [(ngModel)]="stockSearchInput" />
                      <button class="qr-btn" title="Escanear con lector">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <rect x="3" y="3" width="7" height="7"></rect>
                          <rect x="14" y="3" width="7" height="7"></rect>
                          <rect x="14" y="14" width="7" height="7"></rect>
                          <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                      </button>
                    </div>

                    <!-- Mini lista de resultados interactivos en tiempo real -->
                    <div *ngIf="products.length > 0" style="margin-top: 0.65rem; display: flex; flex-direction: column; gap: 0.35rem; max-height: 120px; overflow-y: auto;">
                      <div *ngFor="let p of filteredCatalogProducts.slice(0, 3)" style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 0.3rem 0.5rem; font-size: 0.72rem;">
                        <div style="display: flex; align-items: center; gap: 0.4rem; overflow: hidden;">
                          <span>{{ p.imageIcon }}</span>
                          <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 130px;">
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

                    <div class="tool-footer">
                      <span class="tool-count">{{ products.length > 0 ? (products.length | number) : '5' }} SKUs en catálogo</span>
                      <span class="tool-tag-ok">API OK</span>
                    </div>
                  </div>

                  <!-- Herramienta 2: Alertas Bahía Nave A -->
                  <div class="tool-subcard">
                    <div class="tool-header">
                      <div class="tool-icon orange">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                          <line x1="12" y1="9" x2="12" y2="13"></line>
                          <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                      </div>
                      <span class="tool-title">Alertas Bahía Nave A</span>
                      <span class="badge-critical ms-auto">3 CRÍTICOS</span>
                    </div>
                    <p class="tool-desc">Existencias por debajo del umbral mínimo de seguridad:</p>

                    <div class="critical-items-list">
                      <div class="critical-item">
                        <span>Viga IPE...</span>
                        <span class="crit-qty"><strong class="text-danger">4 uds</strong> / min 20</span>
                      </div>
                      <div class="critical-item">
                        <span>Perno...</span>
                        <span class="crit-qty"><strong class="text-danger">120 uds</strong> / min 500</span>
                      </div>
                    </div>

                    <div class="tool-footer">
                      <a routerLink="/app/inventory" class="report-link">
                        Reportar Reabastecimiento
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                          <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                      </a>
                    </div>
                  </div>

                  <!-- Herramienta 3: Conteo Cíclico Diario -->
                  <div class="tool-subcard">
                    <div class="tool-header">
                      <div class="tool-icon blue">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M9 11l3 3L22 4"></path>
                          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                        </svg>
                      </div>
                      <span class="tool-title">Conteo Cíclico Diario</span>
                    </div>
                    <p class="tool-desc">Auditoría física programada para verificar exactitud de estantería.</p>

                    <div class="cyclic-progress-box">
                      <div class="cyclic-row">
                        <span class="cyclic-label">Avance Bahía A-P03:</span>
                        <span class="cyclic-val">12 / 15 SKUs</span>
                      </div>
                      <div class="cyclic-discrepancies">Discrepancias registradas: 0 items</div>
                    </div>

                    <div class="tool-footer">
                      <button class="btn-tool-outline">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        <span>Registrar Conteo de Bin</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Tabla Rápida de Productos para Operador -->
                <div class="panel-card" style="margin-top: 1.25rem;">
                  <div class="panel-header-row mb-3" style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                        <h2 class="panel-title">Catálogo de Productos en Bahía</h2>
                        <span class="live-status-pill" style="font-size: 0.65rem;">
                          <span class="pulse-dot"></span>
                          CONECTADO A /api/products
                        </span>
                      </div>
                      <p class="panel-subtitle">Consulta de existencias y ubicación de productos asignados</p>
                    </div>
                    <a routerLink="/app/inventory" class="btn-tool-outline" style="text-decoration: none; font-size: 0.72rem; padding: 0.35rem 0.65rem;">
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
              <!-- Bloque Proveedores Programados -->
              <div class="panel-card">
                <div class="panel-header-row mb-3">
                  <div>
                    <h2 class="panel-title">Proveedores Programados</h2>
                    <p class="panel-subtitle">Recepción y descarga de carga hoy</p>
                  </div>
                  <div class="tool-icon-sm">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
                      <rect x="1" y="3" width="15" height="13"></rect>
                      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                      <circle cx="5.5" cy="18.5" r="2.5"></circle>
                      <circle cx="18.5" cy="18.5" r="2.5"></circle>
                    </svg>
                  </div>
                </div>

                <div class="providers-list">
                  <!-- Proveedor 1: Siderúrgica del Norte -->
                  <div class="provider-item-card">
                    <div class="prov-top-row">
                      <span class="prov-title">Siderúrgica del Norte S.A.</span>
                      <span class="pill-blue-downloading">
                        <span class="dot-pulse"></span>
                        Descargando
                      </span>
                    </div>
                    <div class="prov-time-row">
                      <span>Llegada: 10:30 AM</span>
                      <span class="sep">•</span>
                      <span>Rampa: 02</span>
                    </div>
                    <div class="prov-progress-wrap">
                      <div class="progress-bar-track">
                        <div class="progress-bar-fill" style="width: 75%;"></div>
                      </div>
                      <span class="prov-percent">75%</span>
                    </div>
                    <div class="prov-bottom-row">
                      <span class="prov-cargo">Carga: 32 pallets perfiles</span>
                      <a href="javascript:void(0)" class="prov-link">Ver Albarán</a>
                    </div>
                  </div>

                  <!-- Proveedor 2: FastenerTech Latam -->
                  <div class="provider-item-card">
                    <div class="prov-top-row">
                      <span class="prov-title">FastenerTech Latam</span>
                      <span class="pill-gray-waiting">En Espera</span>
                    </div>
                    <div class="prov-time-row">
                      <span>Llegada: 13:00 PM</span>
                      <span class="sep">•</span>
                      <span>Rampa: 04</span>
                    </div>
                    <p class="prov-note">Camión en patio de maniobras esperando liberación de muelle.</p>
                    <div class="prov-bottom-row">
                      <span class="prov-cargo">Carga: Bulones y Anclajes</span>
                      <button class="btn-dock-assign">Asignar Muelle</button>
                    </div>
                  </div>

                  <!-- Proveedor 3: Cementos del Valle -->
                  <div class="provider-item-card">
                    <div class="prov-top-row">
                      <span class="prov-title">Cementos del Valle</span>
                      <span class="pill-gray-waiting">Programado</span>
                    </div>
                    <div class="prov-time-row">
                      <span>Llegada: 15:15 PM</span>
                      <span class="sep">•</span>
                      <span>Rampa: 01</span>
                    </div>
                    <p class="prov-note">Despacho confirmado en origen. Tránsito estimado en curso.</p>
                    <div class="prov-bottom-row">
                      <span class="prov-cargo">Volumen: 18 TN Silos</span>
                      <span class="pill-green-time">En Horario</span>
                    </div>
                  </div>
                </div>

                
              </div>

              <!-- Bloque Terminal y Dispositivos -->
              <div class="panel-card mt-4">
                <div class="panel-header-row mb-3">
                  <div>
                    <h2 class="panel-title">Terminal y Dispositivos</h2>
                    <p class="panel-subtitle">Hardware vinculado a la sesión activa</p>
                  </div>
                  <span class="badge-diag-ok">DIAG-OK</span>
                </div>

                <div class="devices-list">
                  <!-- Dispositivo 1: Zebra TC26 -->
                  <div class="device-item">
                    <div class="device-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
                        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                        <line x1="12" y1="18" x2="12.01" y2="18"></line>
                      </svg>
                    </div>
                    <div class="device-details">
                      <div class="device-name">Zebra TC26 (Laser)</div>
                      <div class="device-sub">Mesh: AP-NAVE-A02 (5GHz)</div>
                    </div>
                    <div class="device-battery">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
                        <rect x="1" y="6" width="18" height="12" rx="2"></rect>
                        <line x1="23" y1="11" x2="23" y2="13"></line>
                      </svg>
                      <span>88%</span>
                    </div>
                  </div>

                  <!-- Dispositivo 2: Impresora ZPL -->
                  <div class="device-item">
                    <div class="device-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
                        <polyline points="6 9 6 2 18 2 18 9"></polyline>
                        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                        <rect x="6" y="14" width="12" height="8"></rect>
                      </svg>
                    </div>
                    <div class="device-details">
                      <div class="device-name">Impresora ZPL Bahía A-04</div>
                      <div class="device-sub">Papel térmico: 4"x6" (92% rollo)</div>
                    </div>
                    <span class="pill-blue-online">
                      <span class="dot-pulse"></span>
                      ONLINE
                    </span>
                  </div>
                </div>

                <button class="btn-laser-test">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M2 12h2"></path>
                    <path d="M20 12h2"></path>
                    <path d="M12 2v2"></path>
                    <path d="M12 20v2"></path>
                    <circle cx="12" cy="12" r="4"></circle>
                  </svg>
                  <span>Realizar Prueba de Disparo Láser</span>
                </button>
              </div>
            </div>
          </div>

        <!-- 5. Barra Inferior de Estado (Status Bar) -->
        <footer class="employee-statusbar">
          <div class="status-left">
            <span class="status-action-dot"></span>
            <span class="status-action-label">Última acción registrada:</span>
            <span class="status-action-sku">SKU-7720-IPE ubicado en Bahía A-P03-R2</span>
            <span class="status-action-time">(Confirmado a las 11:42 AM)</span>
          </div>

          <div class="status-right">
            <span class="status-session">Sesión: OP-MENDOZA-C</span>
            <span class="status-brand">FIRMEZA v4.12 Enterprise</span>
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

    .employee-layout {
      display: flex;
      min-height: 100vh;
      width: 100%;
      background-color: #f8fafc;
    }

    /* 1. SIDEBAR */
    .employee-sidebar {
      width: 250px;
      min-width: 250px;
      background: #ffffff;
      border-right: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      padding: 1.25rem 1rem;
      position: sticky;
      top: 0;
      height: 100vh;
      overflow-y: auto;
      z-index: 20;
    }

    .sidebar-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.25rem 0.5rem 1.25rem;
      border-bottom: 1px solid #f1f5f9;
      margin-bottom: 1.25rem;
    }

    .brand-icon {
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

    .brand-text {
      display: flex;
      flex-direction: column;
    }

    .brand-name {
      font-size: 1rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
      line-height: 1.1;
    }

    .brand-sub {
      font-size: 0.65rem;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 0.04em;
    }

    .nav-section-title {
      font-size: 0.7rem;
      font-weight: 800;
      color: #94a3b8;
      letter-spacing: 0.06em;
      padding: 0 0.5rem;
      margin-bottom: 0.6rem;
    }

    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      flex: 1;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.65rem 0.85rem;
      border-radius: 8px;
      color: #475569;
      font-size: 0.86rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.15s ease;
    }

    .nav-item:hover {
      background-color: #f1f5f9;
      color: #0f172a;
    }

    .nav-item.active {
      background-color: #2563eb;
      color: #ffffff;
      box-shadow: 0 2px 6px rgba(37, 99, 235, 0.25);
    }

    .nav-icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .sidebar-footer {
      padding-top: 1rem;
      border-top: 1px solid #f1f5f9;
    }

    .station-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 0.75rem;
    }

    .station-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.4rem;
    }

    .station-label {
      font-size: 0.68rem;
      font-weight: 800;
      color: #64748b;
      letter-spacing: 0.02em;
    }

    .terminal-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1d4ed8;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
      font-family: monospace;
    }

    .scanner-status-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.75rem;
      color: #475569;
    }

    .scanner-text {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .scanner-badge-ok {
      font-weight: 700;
      color: #0284c7;
      background: #e0f2fe;
      padding: 0.1rem 0.35rem;
      border-radius: 4px;
      font-size: 0.68rem;
      font-family: monospace;
    }

    /* 2. MAIN & TOPBAR */
    .employee-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      height: 100vh;
      overflow-y: auto;
    }

    .employee-topbar {
      height: 60px;
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.75rem;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .topbar-left {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .badge-warehouse {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 600;
      color: #334155;
    }

    .wh-tag {
      color: #64748b;
      font-weight: 500;
    }

    .badge-laser-online {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      background: #eff6ff;
      border: 1px solid #dbeafe;
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      font-size: 0.74rem;
      font-weight: 800;
      color: #2563eb;
      letter-spacing: 0.03em;
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .topbar-icon-btn {
      background: transparent;
      border: 1px solid transparent;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
      cursor: pointer;
      position: relative;
      transition: all 0.15s ease;
    }

    .topbar-icon-btn:hover {
      background: #f1f5f9;
      color: #1e293b;
    }

    .red-dot {
      position: absolute;
      top: 7px;
      right: 7px;
      width: 7px;
      height: 7px;
      background: #ef4444;
      border-radius: 50%;
      border: 1px solid #ffffff;
    }

    .employee-profile-widget {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      cursor: pointer;
    }

    .profile-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      text-align: right;
    }

    .profile-name {
      font-size: 0.85rem;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.1;
    }

    .profile-role {
      font-size: 0.72rem;
      color: #64748b;
      font-weight: 500;
    }

    .profile-avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: #0f172a;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-logout {
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.4rem;
      border-radius: 6px;
      transition: color 0.15s;
    }

    .btn-logout:hover {
      color: #ef4444;
      background: #fef2f2;
    }

    /* 3. CONTENT AREA */
    .employee-content-area {
      flex: 1;
      padding: 1.5rem 1.75rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    /* TITLE BANNER */
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

    .pill-active-shift {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1d4ed8;
      font-size: 0.73rem;
      font-weight: 700;
      padding: 0.25rem 0.6rem;
      border-radius: 20px;
      letter-spacing: 0.02em;
    }

    .shift-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #2563eb;
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

    /* KPIS GRID */
    .kpis-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
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

    .kpi-fraction {
      font-size: 1.1rem;
      font-weight: 600;
      color: #64748b;
    }

    .kpi-unit {
      font-size: 0.95rem;
      font-weight: 700;
      color: #334155;
    }

    .kpi-pill-percent {
      font-size: 0.72rem;
      font-weight: 700;
      color: #2563eb;
      margin-left: 0.2rem;
    }

    .progress-bar-track {
      width: 100%;
      height: 5px;
      background: #f1f5f9;
      border-radius: 4px;
      overflow: hidden;
      margin: 0.4rem 0 0.6rem;
    }

    .progress-bar-fill {
      height: 100%;
      background: #2563eb;
      border-radius: 4px;
    }

    .kpi-footer-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: auto;
      font-size: 0.75rem;
    }

    .kpi-foot-blue {
      color: #2563eb;
      font-weight: 600;
    }

    .kpi-foot-gray {
      color: #64748b;
      font-weight: 500;
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

    .kpi-provider-pills {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      margin-bottom: 0.4rem;
    }

    /* OPERATIONAL 2-COLUMNS GRID */
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

    /* TABLE */
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

    .type-pill.picking {
      background: #eff6ff;
      color: #1d4ed8;
    }

    .type-pill.reception {
      background: #eff6ff;
      color: #1d4ed8;
    }

    .type-pill.transfer {
      background: #f1f5f9;
      color: #475569;
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
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1d4ed8;
    }

    .status-pill.cyan {
      background: #e0f2fe;
      border: 1px solid #bae6fd;
      color: #0369a1;
    }

    .status-pill.gray {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      color: #475569;
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

    /* BLOQUE GESTIÓN RÁPIDA (BAY TOOLS) */
    .location-badge {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      padding: 0.25rem 0.55rem;
      border-radius: 6px;
      font-size: 0.72rem;
      font-weight: 700;
      color: #475569;
      letter-spacing: 0.03em;
    }

    .bay-tools-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
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
      padding: 0.25rem 0.5rem;
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

    .qr-btn {
      background: transparent;
      border: none;
      color: #64748b;
      cursor: pointer;
      display: flex;
      align-items: center;
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

    .cyclic-progress-box {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 0.5rem 0.6rem;
      margin-bottom: 0.6rem;
    }

    .cyclic-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.73rem;
    }

    .cyclic-label {
      color: #475569;
      font-weight: 500;
    }

    .cyclic-val {
      color: #2563eb;
      font-weight: 800;
    }

    .cyclic-discrepancies {
      font-size: 0.68rem;
      color: #64748b;
      margin-top: 0.2rem;
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

    /* RIGHT COLUMN: PROVIDERS & HARDWARE */
    .tool-icon-sm {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      background: #eff6ff;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .providers-list {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      margin-bottom: 1rem;
    }

    .provider-item-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 0.85rem;
    }

    .prov-top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.25rem;
    }

    .prov-title {
      font-size: 0.82rem;
      font-weight: 700;
      color: #0f172a;
    }

    .pill-blue-downloading {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1d4ed8;
      font-size: 0.68rem;
      font-weight: 700;
      padding: 0.15rem 0.45rem;
      border-radius: 20px;
    }

    .pill-gray-waiting {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      color: #475569;
      font-size: 0.68rem;
      font-weight: 700;
      padding: 0.15rem 0.45rem;
      border-radius: 20px;
    }

    .pill-green-time {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #15803d;
      font-size: 0.68rem;
      font-weight: 700;
      padding: 0.15rem 0.45rem;
      border-radius: 20px;
    }

    .prov-time-row {
      font-size: 0.73rem;
      color: #64748b;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      margin-bottom: 0.45rem;
    }

    .prov-progress-wrap {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.45rem;
    }

    .prov-percent {
      font-size: 0.72rem;
      font-weight: 700;
      color: #2563eb;
    }

    .prov-note {
      font-size: 0.72rem;
      color: #64748b;
      margin: 0.3rem 0 0.5rem;
      line-height: 1.35;
    }

    .prov-bottom-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.73rem;
    }

    .prov-cargo {
      color: #475569;
      font-weight: 500;
    }

    .prov-link {
      color: #2563eb;
      font-weight: 700;
      text-decoration: none;
    }

    .prov-link:hover {
      text-decoration: underline;
    }

    .btn-dock-assign {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
      font-size: 0.72rem;
      font-weight: 700;
      color: #334155;
      cursor: pointer;
    }

    .btn-view-directory {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      width: 100%;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 0.55rem 0.85rem;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 700;
      color: #334155;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-view-directory:hover {
      background: #f1f5f9;
      color: #0f172a;
    }

    /* HARDWARE BLOCK */
    .badge-diag-ok {
      background: #e0f2fe;
      border: 1px solid #bae6fd;
      color: #0284c7;
      font-size: 0.68rem;
      font-weight: 800;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
      font-family: monospace;
    }

    .devices-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 1rem;
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

    .device-icon {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      background: #eff6ff;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
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

    .pill-blue-online {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1d4ed8;
      font-size: 0.68rem;
      font-weight: 800;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
      font-family: monospace;
    }

    .btn-laser-test {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      width: 100%;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 0.55rem 0.85rem;
      border-radius: 8px;
      font-size: 0.78rem;
      font-weight: 700;
      color: #334155;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-laser-test:hover {
      background: #f1f5f9;
      color: #0f172a;
    }

    /* 5. STATUS BAR */
    .employee-statusbar {
      background: #ffffff;
      border-top: 1px solid #e2e8f0;
      padding: 0.65rem 1.75rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.75rem;
      color: #64748b;
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

    .status-action-time {
      color: #64748b;
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

    /* PULSING DOT */
    .dot-pulse {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #2563eb;
      box-shadow: 0 0 0 rgba(37, 99, 235, 0.4);
      animation: pulseAnimation 2s infinite;
    }

    .dot-online {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #16a34a;
    }

    @keyframes pulseAnimation {
      0% {
        box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.6);
      }
      70% {
        box-shadow: 0 0 0 6px rgba(37, 99, 235, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(37, 99, 235, 0);
      }
    }

    /* RESPONSIVE */
    @media (max-width: 1180px) {
      .kpis-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .operational-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .employee-sidebar {
        display: none;
      }
      .kpis-grid {
        grid-template-columns: 1fr;
      }
      .bay-tools-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class EmployeeDashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly productsService = inject(ProductsService);

  employeeName = 'Carlos Mendoza';
  employeeRole = 'Operador Logístico';
  stockSearchInput = '';
  activeTab: 'all' | 'picking' | 'recepciones' = 'all';

  products: ProductItem[] = [];

  // Datos visuales basados exactamente en el diseño de la imagen
  tasksList: AssignedTask[] = [
    {
      code: 'ORD-8921',
      type: 'Picking Cliente',
      typeClass: 'picking',
      providerDest: 'Ferretería Central S.A.',
      providerDestSub: 'Ruta Express D-03',
      qtyItems: '18 items',
      qtyItemsSub: '4 bultos',
      status: 'EN PICKING',
      statusClass: 'blue',
      actionText: 'Continuar',
      actionClass: 'primary'
    },
    {
      code: 'REC-4310',
      type: 'Recepción Proveedor',
      typeClass: 'reception',
      providerDest: 'Siderúrgica del Norte',
      providerDestSub: 'Rampa 02 • Guía #88410',
      qtyItems: '32 pallets',
      qtyItemsSub: 'Perfiles H',
      status: 'RAMPA DESCARGA',
      statusClass: 'cyan',
      actionText: 'Verificar',
      actionClass: 'outline'
    },
    {
      code: 'MOV-2290',
      type: 'Transferencia Interna',
      typeClass: 'transfer',
      providerDest: 'Bahía A -> Zona Patios B',
      providerDestSub: 'Rebalanceo de Stock',
      qtyItems: '8 pallets',
      qtyItemsSub: 'Calamina Galvanizada',
      status: 'EN COLA',
      statusClass: 'gray',
      actionText: 'Iniciar',
      actionClass: 'outline'
    },
    {
      code: 'ORD-8919',
      type: 'Picking Cliente',
      typeClass: 'picking',
      providerDest: 'Constructora Bolívar',
      providerDestSub: 'Andén 01 • Staged',
      qtyItems: '65 items',
      qtyItemsSub: 'Tornillería Estructural',
      status: 'LISTO DESPACHO',
      statusClass: 'green',
      actionText: 'Rótulo',
      actionClass: 'outline',
      hasPrintIcon: true
    }
  ];

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user?.fullName) {
      this.employeeName = user.fullName;
    }
    if (user?.role && user.role !== 'User') {
      this.employeeRole = user.role === 'Employee' ? 'Operador Logístico' : user.role;
    }
    this.loadProducts();
  }

  loadProducts(): void {
    console.log('[EmployeeDashboard] Consultando productos a través de ProductsService...');
    this.productsService.getProducts().subscribe({
      next: (items) => {
        this.products = items || [];
      },
      error: (err) => console.warn('[EmployeeDashboard] Error cargando productos:', err)
    });

    this.productsService.products$.subscribe((items) => {
      this.products = items || [];
    });
  }

  isUnderFive(p: ProductItem): boolean {
    const qty = parseInt(p.stockAvailable || p.stockTotal || '0', 10);
    return isNaN(qty) ? false : (qty < 5 || p.stockStatusClass === 'critical' || p.stockStatus === 'STOCK CRÍTICO');
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
      return this.tasksList.filter(t => t.type.toLowerCase().includes('picking'));
    }
    if (this.activeTab === 'recepciones') {
      return this.tasksList.filter(t => t.type.toLowerCase().includes('recepción'));
    }
    return this.tasksList;
  }

  setTab(tab: 'all' | 'picking' | 'recepciones'): void {
    this.activeTab = tab;
  }

  toggleUserMenu(): void {
    // Menú visual interactivo
  }

  onLogout(): void {
    this.authService.logout();
  }
}
