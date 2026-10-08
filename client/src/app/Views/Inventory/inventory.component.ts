import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ProductItem {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  category: string;
  categoryDetail: string;
  hasRedDot?: boolean;
  imageIcon: string;
  location: string;
  locationIcon?: 'pallet' | 'freeze' | 'lock' | 'standard';
  stockTotal: string;
  stockReserved: string;
  stockAvailable: string;
  isCriticalStock?: boolean;
  stockLevelPercent: number;
  stockStatus: 'ÓPTIMO' | 'STOCK CRÍTICO' | 'ESTABLE';
  stockStatusClass: 'optimal' | 'critical' | 'stable';
  costPrice: string;
  salePrice: string;
  lastMovement: string;
  selected?: boolean;
}

interface ReplenishmentItem {
  percent: number;
  percentClass: 'pink' | 'red' | 'blue';
  name: string;
  sku: string;
  statusNote: string;
  isTotalStockout?: boolean;
  min: number;
  order: number;
  buttonText: 'Emitir PO' | 'Urgente';
  buttonClass: 'blue-po' | 'red-urgent';
}

interface BatchExpiryItem {
  iconType: 'flask' | 'paint' | 'chemistry';
  name: string;
  daysRemaining: number;
  daysClass: 'red-days' | 'normal-days';
  batchCode: string;
  quantity: string;
}

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fz-viewport">
      <!-- 1. Encabezado (formato Dashboard / Inicio) -->
      <header class="fz-header">
        <div class="fz-header-left">
          <div class="fz-header-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>
          <div class="fz-header-titles">
            <div class="fz-title-row">
              <h1 class="fz-page-title">Catálogo de Inventario y Control de Stock</h1>
              <span class="fz-live-pill">
                <span class="fz-pulse-dot"></span>
                Escaneo RFID activo
              </span>
            </div>
            <div class="fz-subtitle">
              <span>Almacén Central (WH-01)</span>
              <span class="fz-sep">•</span>
              <span>Sincronización en tiempo real</span>
            </div>
          </div>
        </div>

        <div class="fz-header-actions">
          <button class="fz-btn fz-btn-outline">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Descargar CSV / PDF</span>
          </button>

          <button class="fz-btn fz-btn-dark">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="4" y1="21" x2="4" y2="14"></line>
              <line x1="4" y1="10" x2="4" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12" y2="3"></line>
              <line x1="20" y1="21" x2="20" y2="16"></line>
              <line x1="20" y1="12" x2="20" y2="3"></line>
              <line x1="1" y1="14" x2="7" y2="14"></line>
              <line x1="9" y1="8" x2="15" y2="8"></line>
              <line x1="17" y1="16" x2="23" y2="16"></line>
            </svg>
            <span>Ajuste Rápido</span>
          </button>

          <button class="fz-btn fz-btn-primary" (click)="openNewProductModal()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Nuevo Producto</span>
          </button>
        </div>
      </header>

      <!-- 2. Tarjetas de Métricas (4 KPIs) -->
      <section class="kpi-grid">
        <!-- KPI 1 -->
        <div class="kpi-card">
          <div class="kpi-top-row">
            <span class="kpi-label">TOTAL SKUS ACTIVOS</span>
            <div class="kpi-icon-box blue-tint">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
          </div>
          <div class="kpi-val-row">
            <span class="kpi-big-val">24,850</span>
            <span class="kpi-val-unit">SKUs</span>
          </div>
          <div class="kpi-footer-row">
            <span class="trend-blue">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                <polyline points="17 6 23 6 23 12"></polyline>
              </svg>
              +320 este mes
            </span>
            <span class="stat-highlight">98.4% Disponibilidad</span>
          </div>
        </div>

        <!-- KPI 2 -->
        <div class="kpi-card">
          <div class="kpi-top-row">
            <span class="kpi-label">VALOR TOTAL EN BODEGA</span>
            <div class="kpi-icon-box blue-tint">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
                <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                <line x1="2" y1="10" x2="22" y2="10"></line>
              </svg>
            </div>
          </div>
          <div class="kpi-val-row">
            <span class="kpi-big-val">$1,482,900</span>
            <span class="kpi-val-unit">USD</span>
          </div>
          <div class="kpi-footer-row">
            <span class="rot-text">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
              </svg>
              Rotación: 14 días
            </span>
            <span class="trend-blue">+4.2% val. trim</span>
          </div>
        </div>

        <!-- KPI 3 -->
        <div class="kpi-card red-kpi">
          <div class="kpi-top-row">
            <span class="kpi-label red-lbl">ALERTAS DE STOCK BAJO</span>
            <div class="kpi-icon-box red-tint">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
          </div>
          <div class="kpi-val-row">
            <span class="kpi-big-val red-num">18</span>
            <span class="kpi-val-unit red-unit">Críticos</span>
          </div>
          <div class="kpi-footer-row">
            <span class="alert-urgent">
              <strong>!</strong> Requiere O/C urgente
            </span>
            <span class="quiebre-text">4 en quiebre</span>
          </div>
        </div>

        <!-- KPI 4 -->
        <div class="kpi-card">
          <div class="kpi-top-row">
            <span class="kpi-label">OCUPACIÓN DE BAHÍAS</span>
            <div class="kpi-icon-box teal-tint">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0891b2" stroke-width="2">
                <path d="M3 21h18M3 7v14M21 7v14M6 7V3h12v4"></path>
              </svg>
            </div>
          </div>
          <div class="kpi-val-row">
            <span class="kpi-big-val">87.2%</span>
            <span class="kpi-val-unit">Cap.</span>
          </div>
          <div class="kpi-footer-row">
            <span class="naves-text">Naves A, B y C...</span>
            <span class="racks-badge">2,140 / 2,450 Racks</span>
          </div>
        </div>
      </section>

      <!-- 3. Barra de Búsqueda y Filtros de Inventario -->
      <section class="filters-bar-card">
        <div class="search-box">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            placeholder="Buscar por SKU, nombre, lote..." 
            class="search-input" 
          />
          <div class="barcode-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 5v14M8 5v14M12 5v14M17 5v14M21 5v14"/>
            </svg>
          </div>
        </div>

        <div class="dropdowns-group">
          <div class="filter-dropdown-wrapper">
            <select [(ngModel)]="selectedCategory" class="filter-dropdown">
              <option value="all">Categoría: Todas</option>
              <option value="Construcción">Construcción</option>
              <option value="Fijaciones">Fijaciones</option>
              <option value="Químicos">Químicos y Selladores</option>
              <option value="Herramientas">Herramientas</option>
            </select>
          </div>

          <div class="filter-dropdown-wrapper">
            <select [(ngModel)]="selectedLocation" class="filter-dropdown">
              <option value="all">Ubicación: Todas las Naves</option>
              <option value="Nave A">Nave A</option>
              <option value="Nave B">Nave B</option>
              <option value="Nave C">Nave C</option>
              <option value="Bahía Fría">Bahía Fría</option>
            </select>
          </div>

          <div class="filter-dropdown-wrapper">
            <select [(ngModel)]="selectedStockLevel" class="filter-dropdown">
              <option value="all">Estado: Todos los niveles</option>
              <option value="ÓPTIMO">Óptimo</option>
              <option value="STOCK CRÍTICO">Crítico</option>
              <option value="ESTABLE">Estable</option>
            </select>
          </div>
        </div>

        <div class="view-toggles-group">
          <button class="btn-toggle active" title="Vista Tabla">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
          </button>
          <button class="btn-toggle" title="Vista Cuadrícula">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
          </button>
          <button class="btn-toggle" title="Filtros Avanzados">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
          </button>
        </div>
      </section>

      <!-- 4. Tabla de Catálogo de Productos y Control de Stock -->
      <section class="table-card">
        <div class="table-wrapper">
          <table class="inventory-table">
            <thead>
              <tr>
                <th class="th-checkbox">
                  <input type="checkbox" [(ngModel)]="selectAll" (change)="toggleSelectAll()" class="custom-checkbox" />
                </th>
                <th>SKU / CÓD. BARRAS</th>
                <th>PRODUCTO Y CATEGORÍA</th>
                <th>UBICACIÓN BODEGA</th>
                <th>STOCK / RESERVADO</th>
                <th>NIVEL DE STOCK</th>
                <th>COSTO / VENTA (USD)</th>
                <th>ÚLTIMO MOV.</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of filteredProducts" [class.selected-row]="item.selected">
                <td class="td-checkbox">
                  <input type="checkbox" [(ngModel)]="item.selected" class="custom-checkbox" />
                </td>
                <td>
                  <div class="sku-cell">
                    <span class="sku-code">{{ item.sku }}</span>
                    <span class="barcode-code">{{ item.barcode }}</span>
                  </div>
                </td>
                <td>
                  <div class="product-cell">
                    <div class="product-thumb-box">
                      <span class="thumb-icon">{{ item.imageIcon }}</span>
                    </div>
                    <div class="product-details">
                      <div class="name-with-dot">
                        <span class="product-title">{{ item.name }}</span>
                        <span *ngIf="item.hasRedDot" class="red-alert-dot"></span>
                      </div>
                      <span class="product-category-sub">{{ item.category }} • {{ item.categoryDetail }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="location-badge-box">
                    <span *ngIf="item.locationIcon === 'pallet'" class="loc-icon">▦</span>
                    <span *ngIf="item.locationIcon === 'freeze'" class="loc-icon freeze-color">❄</span>
                    <span *ngIf="item.locationIcon === 'lock'" class="loc-icon lock-color">🔒</span>
                    <span *ngIf="!item.locationIcon || item.locationIcon === 'standard'" class="loc-icon">▦</span>
                    <span class="loc-name">{{ item.location }}</span>
                  </div>
                </td>
                <td>
                  <div class="stock-cell">
                    <span class="stock-main" [class.text-critical]="item.isCriticalStock">{{ item.stockTotal }}</span>
                    <span class="stock-sub" [class.text-critical]="item.isCriticalStock">
                      {{ item.stockReserved }} resv. ({{ item.stockAvailable }} disp.)
                    </span>
                  </div>
                </td>
                <td>
                  <div class="level-cell">
                    <div class="level-meta">
                      <span class="level-status-text" [ngClass]="item.stockStatusClass">{{ item.stockStatus }}</span>
                      <span class="level-percent">{{ item.stockLevelPercent }}%</span>
                    </div>
                    <div class="level-bar-track">
                      <div 
                        class="level-bar-fill" 
                        [ngClass]="item.stockStatusClass"
                        [style.width.%]="item.stockLevelPercent">
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="pricing-cell">
                    <span class="cost-price">{{ item.costPrice }}</span>
                    <span class="sale-price">{{ item.salePrice }} PVP</span>
                  </div>
                </td>
                <td>
                  <span class="movement-cell">{{ item.lastMovement }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="table-footer">
          <div class="footer-left">
            <span class="showing-text">Mostrando <strong>1 - {{ filteredProducts.length }}</strong> de <strong>24,850</strong> SKUs activos</span>
            <span class="sep-dot">•</span>
            <div class="rows-per-page">
              <span>Filas por pág:</span>
              <select class="rows-select">
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>

          <div class="pagination-controls">
            <button class="btn-pag-edge" title="Primera página">&lt;&lt;</button>
            <button class="btn-pag-edge" title="Página anterior">&lt;</button>
            <button class="btn-pag-num active">1</button>
            <button class="btn-pag-num">2</button>
            <button class="btn-pag-num">3</button>
            <span class="pag-ellipsis">...</span>
            <button class="btn-pag-num">497</button>
            <button class="btn-pag-edge" title="Página siguiente">&gt;</button>
            <button class="btn-pag-edge" title="Última página">&gt;&gt;</button>
          </div>
        </div>
      </section>

      <!-- 5. Sección Inferior: Reposición Prioritaria & Lotes por Vencer -->
      <section class="bottom-split-grid">
        <!-- Tarjeta Izquierda: Cola de Reposición Prioritaria Inmediata -->
        <div class="reposition-card">
          <div class="reposition-header">
            <div class="reposition-titles">
              <div class="reposition-title-group">
                <div class="icon-warning-box">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                </div>
                <h3 class="reposition-title">Cola de Reposición Prioritaria Inmediata</h3>
              </div>
              <p class="reposition-subtitle">Materiales bajo punto de seguridad que afectan órdenes comprometidas</p>
            </div>
            <a href="#" class="link-global-po" (click)="$event.preventDefault()">
              <span>Generar O/C Global</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </a>
          </div>

          <div class="reposition-items-list">
            <div *ngFor="let rep of replenishmentQueue" class="reposition-item">
              <div class="percent-badge" [ngClass]="rep.percentClass">
                {{ rep.percent }}%
              </div>
              <div class="rep-info">
                <span class="rep-name">{{ rep.name }}</span>
                <span class="rep-sub" [class.text-danger]="rep.isTotalStockout">{{ rep.statusNote }}</span>
              </div>
              <div class="rep-target">
                <span class="target-text">Min: {{ rep.min }} | <strong>Pedir: {{ rep.order }}</strong></span>
              </div>
              <div class="rep-action">
                <button class="btn-po" [ngClass]="rep.buttonClass" (click)="onActionPo(rep)">
                  {{ rep.buttonText }}
                </button>
              </div>
            </div>
          </div>

          <div class="reposition-footer">
            <span class="mrp-note">Próxima corrida automática de compras MRP programada para las <strong>18:00 hrs</strong></span>
            <a href="#" class="mrp-config-link" (click)="$event.preventDefault()">Configurar Reglas Min/Max</a>
          </div>
        </div>

        <!-- Tarjeta Derecha: Lotes Próximos a Vencer -->
        <div class="expiry-card">
          <div class="expiry-header">
            <div class="expiry-title-group">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <h3 class="expiry-title">Lotes Próximos a Vencer</h3>
            </div>
            <span class="bahia-pill">Bahía Química</span>
          </div>

          <div class="expiry-items-list">
            <div *ngFor="let batch of expiryBatches" class="expiry-item">
              <div class="expiry-icon-col">
                <svg *ngIf="batch.iconType === 'flask'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2">
                  <path d="M10 2v7.31L4.69 19.5A2 2 0 0 0 6.44 22h11.12a2 2 0 0 0 1.75-2.5L14 9.31V2"></path>
                </svg>
                <svg *ngIf="batch.iconType === 'paint'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2">
                  <path d="M19 11V4a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v7"></path>
                  <path d="M12 2v9"></path>
                  <path d="M5 11h14v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-8z"></path>
                </svg>
                <svg *ngIf="batch.iconType === 'chemistry'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2">
                  <path d="M6 2v6h12V2"></path>
                  <path d="M4 8l3 13h10l3-13"></path>
                </svg>
              </div>

              <div class="expiry-main-info">
                <div class="expiry-name-row">
                  <span class="expiry-product-name">{{ batch.name }}</span>
                  <span class="expiry-days-badge" [ngClass]="batch.daysClass">{{ batch.daysRemaining }} días</span>
                </div>
                <div class="expiry-batch-meta">
                  <span>Lote <strong>{{ batch.batchCode }}</strong> • {{ batch.quantity }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="expiry-footer">
            <button class="btn-fifo-inspect" (click)="onInspectFifo()">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Inspeccionar Protocolo FIFO/FEFO</span>
            </button>
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

    /* El contenedor y el encabezado usan .fz-viewport / .fz-header (styles.css) */

    /* 2. KPIs Grid */
    .kpi-grid {
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
      align-items: center;
      justify-content: space-between;
    }

    .kpi-label {
      font-size: 0.74rem;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 0.04em;
    }

    .red-lbl {
      color: #dc2626;
    }

    .kpi-icon-box {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .blue-tint {
      background: #eff6ff;
      border: 1px solid #dbeafe;
    }

    .red-tint {
      background: #fee2e2;
      border: 1px solid #fecaca;
    }

    .teal-tint {
      background: #e0f2fe;
      border: 1px solid #bae6fd;
    }

    .kpi-val-row {
      display: flex;
      align-items: baseline;
      gap: 0.4rem;
    }

    .kpi-big-val {
      font-size: 1.7rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.04em;
      line-height: 1.15;
    }

    .red-num {
      color: #dc2626;
    }

    .kpi-val-unit {
      font-size: 0.8rem;
      font-weight: 600;
      color: #64748b;
      font-family: 'JetBrains Mono', monospace;
    }

    .red-unit {
      color: #dc2626;
    }

    .kpi-footer-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.72rem;
      color: #64748b;
      margin-top: 0.15rem;
    }

    .trend-blue {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      color: #2563eb;
      font-weight: 700;
    }

    .stat-highlight {
      font-weight: 600;
      color: #1e293b;
    }

    .rot-text {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      color: #475569;
    }

    .alert-urgent {
      color: #dc2626;
      font-weight: 600;
    }

    .quiebre-text {
      color: #64748b;
    }

    .naves-text {
      color: #64748b;
    }

    .racks-badge {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      color: #1e293b;
    }

    /* 3. Filters Bar Card */
    .filters-bar-card {
      background: #ffffff;
      border: 1px solid rgba(226, 232, 240, 0.85);
      border-radius: 12px;
      padding: 0.75rem 1.1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
      flex-wrap: wrap;
    }

    .search-box {
      display: flex;
      align-items: center;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 0.4rem 0.75rem;
      gap: 0.5rem;
      width: 290px;
      transition: all 0.2s ease;
    }

    .search-box:focus-within {
      background: #ffffff;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
    }

    .search-input {
      border: none;
      background: transparent;
      outline: none;
      font-size: 0.78rem;
      color: #0f172a;
      width: 100%;
      font-family: inherit;
    }

    .barcode-badge {
      display: flex;
      align-items: center;
      color: #94a3b8;
    }

    .dropdowns-group {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .filter-dropdown-wrapper {
      position: relative;
    }

    .filter-dropdown {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 0.45rem 1.6rem 0.45rem 0.75rem;
      font-size: 0.78rem;
      font-weight: 600;
      color: #334155;
      cursor: pointer;
      appearance: none;
      outline: none;
      font-family: inherit;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.02);
      background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%2364748B' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.65rem center;
    }

    .filter-dropdown:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
    }

    .view-toggles-group {
      display: flex;
      align-items: center;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      overflow: hidden;
      background: #ffffff;
    }

    .btn-toggle {
      border: none;
      background: transparent;
      padding: 0.45rem 0.65rem;
      color: #64748b;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
    }

    .btn-toggle:not(:last-child) {
      border-right: 1px solid #e2e8f0;
    }

    .btn-toggle.active {
      background: #eff6ff;
      color: #2563eb;
    }

    /* 4. Table Card */
    .table-card {
      background: #ffffff;
      border: 1px solid rgba(226, 232, 240, 0.85);
      border-radius: 12px;
      padding: 0;
      overflow: hidden;
      box-shadow: 0 1px 4px 0 rgba(15, 23, 42, 0.04), 0 8px 24px -4px rgba(15, 23, 42, 0.04);
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

    .th-checkbox, .td-checkbox {
      width: 36px;
      text-align: center !important;
      padding-left: 1rem !important;
    }

    .custom-checkbox {
      width: 15px;
      height: 15px;
      accent-color: #2563eb;
      cursor: pointer;
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

    .selected-row td {
      background-color: #f0f7ff !important;
    }

    .sku-cell {
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
    }

    .sku-code {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      color: #2563eb;
      font-size: 0.74rem;
    }

    .barcode-code {
      font-family: 'JetBrains Mono', monospace;
      color: #64748b;
      font-size: 0.68rem;
    }

    .product-cell {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .product-thumb-box {
      width: 36px;
      height: 36px;
      border-radius: 6px;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      flex-shrink: 0;
    }

    .product-details {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .name-with-dot {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .product-title {
      font-weight: 700;
      color: #0f172a;
      font-size: 0.8rem;
      letter-spacing: -0.01em;
    }

    .red-alert-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #dc2626;
      box-shadow: 0 0 6px rgba(220, 38, 38, 0.6);
    }

    .product-category-sub {
      font-size: 0.69rem;
      color: #64748b;
    }

    .location-badge-box {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 0.25rem 0.55rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.7rem;
      font-weight: 600;
      color: #334155;
    }

    .freeze-color {
      color: #0284c7;
    }

    .lock-color {
      color: #059669;
    }

    .stock-cell {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .stock-main {
      font-weight: 700;
      color: #0f172a;
      font-size: 0.78rem;
    }

    .stock-sub {
      font-size: 0.68rem;
      color: #64748b;
    }

    .text-critical {
      color: #dc2626 !important;
      font-weight: 700;
    }

    .level-cell {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      min-width: 120px;
    }

    .level-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .level-status-text {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.05em;
    }

    .level-status-text.optimal {
      color: #2563eb;
    }

    .level-status-text.critical {
      color: #dc2626;
    }

    .level-status-text.stable {
      color: #0284c7;
    }

    .level-percent {
      font-size: 0.68rem;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 600;
      color: #64748b;
    }

    .level-bar-track {
      height: 5px;
      background: #e2e8f0;
      border-radius: 4px;
      overflow: hidden;
    }

    .level-bar-fill {
      height: 100%;
      border-radius: 4px;
    }

    .level-bar-fill.optimal {
      background: #2563eb;
    }

    .level-bar-fill.critical {
      background: #dc2626;
    }

    .level-bar-fill.stable {
      background: #0284c7;
    }

    .pricing-cell {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .cost-price {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.76rem;
      font-weight: 700;
      color: #0f172a;
    }

    .sale-price {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.68rem;
      color: #64748b;
    }

    .movement-cell {
      font-size: 0.72rem;
      color: #64748b;
      font-family: 'JetBrains Mono', monospace;
    }

    .table-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.85rem 1.25rem;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      flex-wrap: wrap;
      gap: 0.85rem;
    }

    .footer-left {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      font-size: 0.74rem;
      color: #64748b;
    }

    .sep-dot {
      color: #cbd5e1;
    }

    .rows-per-page {
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    .rows-select {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      padding: 0.15rem 0.4rem;
      font-size: 0.74rem;
      color: #0f172a;
      outline: none;
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }

    .btn-pag-edge, .btn-pag-num {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 0.74rem;
      color: #475569;
      cursor: pointer;
      transition: all 0.15s ease;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 600;
    }

    .btn-pag-edge:hover, .btn-pag-num:hover:not(.active) {
      background: #f1f5f9;
      color: #0f172a;
      border-color: #94a3b8;
    }

    .btn-pag-num.active {
      background: #2563eb;
      border-color: #2563eb;
      color: #ffffff;
      font-weight: 700;
    }

    .pag-ellipsis {
      padding: 0 0.25rem;
      color: #94a3b8;
    }

    /* 5. Bottom Split Grid */
    .bottom-split-grid {
      display: grid;
      grid-template-columns: 1.55fr 1fr;
      gap: 1.15rem;
    }

    .reposition-card, .expiry-card {
      background: #ffffff;
      border: 1px solid rgba(226, 232, 240, 0.85);
      border-radius: 12px;
      padding: 1.25rem 1.4rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 4px 12px -2px rgba(15, 23, 42, 0.04);
    }

    .reposition-header, .expiry-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .reposition-title-group, .expiry-title-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .icon-warning-box {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      background: #fee2e2;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .reposition-title, .expiry-title {
      font-size: 0.95rem;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.02em;
      margin: 0;
    }

    .reposition-subtitle {
      font-size: 0.71rem;
      color: #64748b;
      margin: 0.2rem 0 0;
    }

    .link-global-po {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      color: #2563eb;
      font-size: 0.74rem;
      font-weight: 700;
      text-decoration: none;
      white-space: nowrap;
    }

    .link-global-po:hover {
      text-decoration: underline;
    }

    .bahia-pill {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 0.2rem 0.55rem;
      font-size: 0.65rem;
      font-family: 'JetBrains Mono', monospace;
      color: #475569;
      font-weight: 700;
    }

    .reposition-items-list {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }

    .reposition-item {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      background: #f8fafc;
      border: 1px solid #f1f5f9;
      border-radius: 8px;
      padding: 0.65rem 0.85rem;
      transition: all 0.15s ease;
    }

    .reposition-item:hover {
      background: #ffffff;
      border-color: #e2e8f0;
      box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
    }

    .percent-badge {
      width: 42px;
      height: 34px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.76rem;
      font-weight: 800;
      font-family: 'JetBrains Mono', monospace;
      flex-shrink: 0;
    }

    .percent-badge.pink {
      background: #fee2e2;
      color: #dc2626;
      border: 1px solid #fecaca;
    }

    .percent-badge.red {
      background: #fee2e2;
      color: #dc2626;
      border: 1px solid #fecaca;
    }

    .percent-badge.blue {
      background: #eff6ff;
      color: #2563eb;
      border: 1px solid #dbeafe;
    }

    .rep-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .rep-name {
      font-size: 0.78rem;
      font-weight: 700;
      color: #0f172a;
    }

    .rep-sub {
      font-size: 0.69rem;
      color: #64748b;
    }

    .text-danger {
      color: #dc2626 !important;
      font-weight: 600;
    }

    .rep-target {
      font-size: 0.72rem;
      font-family: 'JetBrains Mono', monospace;
      color: #475569;
      white-space: nowrap;
    }

    .btn-po {
      border: none;
      border-radius: 6px;
      padding: 0.4rem 0.85rem;
      font-size: 0.74rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s ease;
      white-space: nowrap;
      font-family: inherit;
    }

    .blue-po {
      background: #2563eb;
      color: #ffffff;
      box-shadow: 0 1px 3px rgba(37, 99, 235, 0.25);
    }

    .blue-po:hover {
      background: #1d4ed8;
      box-shadow: 0 2px 6px rgba(37, 99, 235, 0.35);
    }

    .red-urgent {
      background: #dc2626;
      color: #ffffff;
      box-shadow: 0 1px 3px rgba(220, 38, 38, 0.25);
    }

    .red-urgent:hover {
      background: #b91c1c;
    }

    .reposition-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 0.6rem;
      border-top: 1px solid #f1f5f9;
      font-size: 0.71rem;
      color: #64748b;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .mrp-config-link {
      color: #2563eb;
      font-weight: 600;
      text-decoration: underline;
    }

    /* Expiry Card */
    .expiry-items-list {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }

    .expiry-item {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 0.6rem 0.75rem;
      background: #f8fafc;
      border: 1px solid #f1f5f9;
      border-radius: 8px;
    }

    .expiry-icon-col {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .expiry-main-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .expiry-name-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .expiry-product-name {
      font-size: 0.78rem;
      font-weight: 700;
      color: #0f172a;
    }

    .expiry-days-badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.7rem;
      font-weight: 700;
    }

    .red-days {
      color: #dc2626;
    }

    .normal-days {
      color: #0284c7;
    }

    .expiry-batch-meta {
      font-size: 0.68rem;
      color: #64748b;
      font-family: 'JetBrains Mono', monospace;
    }

    .expiry-footer {
      margin-top: auto;
      padding-top: 0.6rem;
    }

    .btn-fifo-inspect {
      width: 100%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 0.55rem;
      font-size: 0.76rem;
      font-weight: 700;
      color: #334155;
      cursor: pointer;
      transition: all 0.18s ease;
      font-family: inherit;
    }

    .btn-fifo-inspect:hover {
      background: #f8fafc;
      border-color: #94a3b8;
    }

    /* Responsive */
    @media (max-width: 1200px) {
      .kpi-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .bottom-split-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .kpi-grid {
        grid-template-columns: 1fr;
      }
      .filters-bar-card {
        flex-direction: column;
        align-items: stretch;
      }
      .search-box {
        width: 100%;
      }
    }
  `]
})
export class InventoryComponent {
  searchQuery = '';
  selectedCategory = 'all';
  selectedLocation = 'all';
  selectedStockLevel = 'all';
  selectAll = false;

  products: ProductItem[] = [
    {
      id: '1',
      sku: 'SKU-7720-IPE',
      barcode: '780992341201',
      name: 'Viga de Acero Estructural IPE 200 (6m)',
      category: 'Construcción y Perfiles',
      categoryDetail: 'Acero A36',
      imageIcon: '🏗️',
      location: 'Nave A-P03-R2',
      locationIcon: 'standard',
      stockTotal: '420 Unid.',
      stockReserved: '45',
      stockAvailable: '375',
      stockLevelPercent: 84,
      stockStatus: 'ÓPTIMO',
      stockStatusClass: 'optimal',
      costPrice: '$142.50',
      salePrice: '$189.00',
      lastMovement: 'Hoy 08:30'
    },
    {
      id: '2',
      sku: 'SKU-3104-BOLT',
      barcode: '780992348824',
      name: 'Pernos de Anclaje Expansivo 3/4" x 7"',
      category: 'Fijaciones',
      categoryDetail: 'Grado 8 Galvanizado',
      hasRedDot: true,
      imageIcon: '🔩',
      location: 'Nave C-P12-N4',
      locationIcon: 'standard',
      stockTotal: '24 Cajas',
      stockReserved: '18',
      stockAvailable: '6',
      isCriticalStock: true,
      stockLevelPercent: 12,
      stockStatus: 'STOCK CRÍTICO',
      stockStatusClass: 'critical',
      costPrice: '$38.20',
      salePrice: '$54.90',
      lastMovement: 'Ayer 16:45'
    },
    {
      id: '3',
      sku: 'SKU-9901-CEM',
      barcode: '780992319403',
      name: 'Cemento Portland Especial Tipo IP (Saco 42.5kg)',
      category: 'Construcción',
      categoryDetail: 'Alta Resistencia Inicial',
      imageIcon: '🧱',
      location: 'Nave B-P01-Pallet',
      locationIcon: 'pallet',
      stockTotal: '1,850 Sacos',
      stockReserved: '600',
      stockAvailable: '1,250',
      stockLevelPercent: 62,
      stockStatus: 'ESTABLE',
      stockStatusClass: 'stable',
      costPrice: '$8.40',
      salePrice: '$11.20',
      lastMovement: 'Hoy 11:20'
    },
    {
      id: '4',
      sku: 'SKU-5542-POL',
      barcode: '780992367710',
      name: 'Sellador Poliuretano Industrial PU-50 Gris (600ml)',
      category: 'Químicos y Selladores',
      categoryDetail: 'Control Térmico',
      imageIcon: '🧪',
      location: 'Bahía Fría-BF02',
      locationIcon: 'freeze',
      stockTotal: '310 Cartuchos',
      stockReserved: '40',
      stockAvailable: '270',
      stockLevelPercent: 78,
      stockStatus: 'ÓPTIMO',
      stockStatusClass: 'optimal',
      costPrice: '$6.15',
      salePrice: '$9.80',
      lastMovement: '12 Sep 14:10'
    },
    {
      id: '5',
      sku: 'SKU-1890-DRL',
      barcode: '780992350012',
      name: 'Rotomartillo SDS-Plus Inalámbrico 20V Max',
      category: 'Herramientas',
      categoryDetail: 'Bahía Alta Seguridad',
      imageIcon: '🛠️',
      location: 'Nave C-Sec01-R1',
      locationIcon: 'lock',
      stockTotal: '54 Kits',
      stockReserved: '12',
      stockAvailable: '42',
      stockLevelPercent: 54,
      stockStatus: 'ÓPTIMO',
      stockStatusClass: 'optimal',
      costPrice: '$210.00',
      salePrice: '$295.00',
      lastMovement: '11 Sep 09:30'
    }
  ];

  replenishmentQueue: ReplenishmentItem[] = [
    {
      percent: 12,
      percentClass: 'pink',
      name: 'Pernos de Anclaje Expansivo 3/4" x 7" (SKU-3104-BOLT)',
      sku: 'SKU-3104-BOLT',
      statusNote: 'Stock disponible: 6 Cajas • Proveedor: FastenerTech Latam',
      min: 50,
      order: 100,
      buttonText: 'Emitir PO',
      buttonClass: 'blue-po'
    },
    {
      percent: 0,
      percentClass: 'red',
      name: 'Disco de Corte Diamantado 9" Turbo Pro (SKU-8820-DC)',
      sku: 'SKU-8820-DC',
      statusNote: 'Agotado totalmente • 3 Pedidos de clientes retenidos',
      isTotalStockout: true,
      min: 25,
      order: 80,
      buttonText: 'Urgente',
      buttonClass: 'red-urgent'
    },
    {
      percent: 18,
      percentClass: 'blue',
      name: 'Guantes de Cuero Reforzado Descarne (SKU-4410-GLV)',
      sku: 'SKU-4410-GLV',
      statusNote: 'Stock disponible: 14 Pares • Proveedor: Seguridad Industrial Pro',
      min: 60,
      order: 150,
      buttonText: 'Emitir PO',
      buttonClass: 'blue-po'
    }
  ];

  expiryBatches: BatchExpiryItem[] = [
    {
      iconType: 'flask',
      name: 'Resina Epóxica de Anclaje',
      daysRemaining: 14,
      daysClass: 'red-days',
      batchCode: '#EPX-882',
      quantity: '45 Unid.'
    },
    {
      iconType: 'paint',
      name: 'Pintura Epóxica Alto Tráfico...',
      daysRemaining: 28,
      daysClass: 'normal-days',
      batchCode: '#PNT-901',
      quantity: '80 Galones'
    },
    {
      iconType: 'chemistry',
      name: 'Acelerante de Fraguado Sika...',
      daysRemaining: 45,
      daysClass: 'normal-days',
      batchCode: '#SIK-104',
      quantity: '120 Bidones'
    }
  ];

  get filteredProducts(): ProductItem[] {
    return this.products.filter(item => {
      const matchesSearch = !this.searchQuery.trim() || 
        item.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        item.barcode.includes(this.searchQuery);

      const matchesCategory = this.selectedCategory === 'all' || item.category.includes(this.selectedCategory);
      const matchesLocation = this.selectedLocation === 'all' || item.location.includes(this.selectedLocation);
      const matchesStockLevel = this.selectedStockLevel === 'all' || item.stockStatus === this.selectedStockLevel;

      return matchesSearch && matchesCategory && matchesLocation && matchesStockLevel;
    });
  }

  toggleSelectAll(): void {
    this.products.forEach(p => p.selected = this.selectAll);
  }

  openNewProductModal(): void {
    const sku = prompt('Ingrese SKU del nuevo producto (ej. SKU-5000-NEW):');
    if (sku) {
      const name = prompt('Nombre del producto:');
      if (name) {
        this.products.unshift({
          id: `${Date.now()}`,
          sku,
          barcode: `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
          name,
          category: 'General',
          categoryDetail: 'Nuevo Ingreso',
          imageIcon: '📦',
          location: 'Nave A-P01-R1',
          stockTotal: '100 Unid.',
          stockReserved: '0',
          stockAvailable: '100',
          stockLevelPercent: 100,
          stockStatus: 'ÓPTIMO',
          stockStatusClass: 'optimal',
          costPrice: '$50.00',
          salePrice: '$75.00',
          lastMovement: 'Hoy recién'
        });
        alert(`Producto ${name} agregado al catálogo.`);
      }
    }
  }

  onActionPo(item: ReplenishmentItem): void {
    alert(`Orden de Compra emitida para ${item.name} por ${item.order} unidades.`);
  }

  onInspectFifo(): void {
    alert('Protocolo FIFO/FEFO: Verificando trazabilidad y rotación de lotes con fecha próxima de vencimiento.');
  }
}
