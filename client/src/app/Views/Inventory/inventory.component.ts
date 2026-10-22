import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, NgZone, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { AuthService } from '../../Services/auth.service';
import { ProductsService, ProductItem, BulkImportConflictMode, BulkImportResult } from '../../Services/products.service';
import { InventoryImportService, ImportFileError, ParsedImportFile } from '../../Services/inventory-import.service';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fz-viewport">
      <!-- 1. Encabezado -->
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
                Sincronizado con BD
              </span>
            </div>
            <div class="fz-subtitle">
              <span>Gestión de productos, ubicaciones, precios y niveles de stock</span>
            </div>
          </div>
        </div>

        <div class="fz-header-actions">
          <button class="fz-btn fz-btn-outline" (click)="loadProducts()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M23 4v6h-6"></path>
              <path d="M1 20v-6h6"></path>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            <span>Actualizar</span>
          </button>

          <button class="fz-btn fz-btn-outline" (click)="downloadImportTemplate()" title="Descargar la plantilla oficial de inventario (.xlsx)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Descargar Plantilla</span>
          </button>

          <button class="fz-btn fz-btn-outline" (click)="triggerImportFile()" [disabled]="isImporting" title="Importar productos desde la plantilla oficial (.xlsx, .xls, .csv)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <span>{{ isImporting ? 'Importando...' : 'Importar Excel / CSV' }}</span>
          </button>
          <input
            #importFileInput
            type="file"
            accept=".xlsx,.xls,.csv"
            hidden
            (change)="onImportFileSelected($event)"
          />

          <button class="fz-btn fz-btn-primary" (click)="openNewProductModal()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Nuevo Producto</span>
          </button>
        </div>
      </header>

      <!-- 2. Tarjetas de Métricas (KPIs) -->
      <section class="kpi-grid" [class.employee-kpi-grid]="isEmployee">
        <!-- KPI 1: Total SKUs Activos -->
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
            <span class="kpi-big-val">{{ totalActiveSkus | number }}</span>
            <span class="kpi-val-unit">SKUs</span>
          </div>
          <div class="kpi-footer-row">
            <span class="trend-blue">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                <polyline points="17 6 23 6 23 12"></polyline>
              </svg>
              {{ availableSkusCount }} con stock disponible
            </span>
            <span class="stat-highlight">{{ availabilityPercent }}% Disponibilidad</span>
          </div>
        </div>

        <!-- KPI 2: Valor Total en Bodega (Solo Administrador / Empresa) -->
        <div class="kpi-card" *ngIf="!isEmployee">
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
            <span class="kpi-big-val">\${{ totalInventoryValue | number:'1.0-2' }}</span>
          </div>
          <div class="kpi-footer-row">
            <span class="rot-text">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
              </svg>
              {{ totalUnitsInStock | number }} unidades totales
            </span>
            <span class="trend-blue">Valor inventario</span>
          </div>
        </div>

        <!-- KPI 3: Alertas de Stock Bajo -->
        <div class="kpi-card red-kpi" (click)="filterByLowStock()" style="cursor: pointer;" title="Filtrar productos con stock crítico/bajo">
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
            <span class="kpi-big-val red-num">{{ lowStockCount | number }}</span>
            <span class="kpi-val-unit red-unit">Críticos</span>
          </div>
          <div class="kpi-footer-row">
            <span class="alert-urgent" *ngIf="lowStockCount > 0">
              <strong>!</strong> {{ selectedStockLevel === 'STOCK CRÍTICO' ? 'Mostrando sólo críticos' : 'Clic para filtrar en tabla' }}
            </span>
            <span class="rot-text" *ngIf="lowStockCount === 0">
              Stock en niveles óptimos
            </span>
            <span class="quiebre-text">{{ stockoutCount }} agotados</span>
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
            placeholder="Buscar por SKU, código de barras o nombre..." 
            class="search-input" 
          />
        </div>

        <div class="dropdowns-group">
          <div class="filter-dropdown-wrapper">
            <select [(ngModel)]="selectedCategory" class="filter-dropdown">
              <option value="all">Categoría: Todas</option>
              <option *ngFor="let cat of availableCategories" [value]="cat">{{ cat }}</option>
            </select>
          </div>

          <div class="filter-dropdown-wrapper">
            <select [(ngModel)]="selectedLocation" class="filter-dropdown">
              <option value="all">Ubicación: Todas</option>
              <option *ngFor="let loc of availableLocations" [value]="loc">{{ loc }}</option>
            </select>
          </div>

          <div class="filter-dropdown-wrapper">
            <select [(ngModel)]="selectedStockLevel" class="filter-dropdown">
              <option value="all">Estado: Todos los niveles</option>
              <option value="STOCK CRÍTICO">Crítico / Stock Bajo</option>
              <option value="AGOTADO">Agotado (0 unidades)</option>
              <option value="ESTABLE">Estable</option>
              <option value="ÓPTIMO">Óptimo</option>
            </select>
          </div>
        </div>
      </section>

      <!-- 4. Tabla de Catálogo de Productos y Control de Stock -->
      <section class="table-card">
        <div class="table-wrapper">
          <table class="inventory-table">
            <thead>
              <tr>
                <th>SKU / CÓD. BARRAS</th>
                <th>PRODUCTO Y CATEGORÍA</th>
                <th>UBICACIÓN BODEGA</th>
                <th>STOCK / RESERVADO</th>
                <th>NIVEL DE STOCK</th>
                <th>COSTO / VENTA</th>
                <th>REGISTRADO POR</th>
                <th style="text-align: center; width: 110px;">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of filteredProducts; trackBy: trackBySku">
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
                    <div style="display: flex; align-items: center; gap: 0.35rem;">
                      <span class="stock-main" [class.text-critical]="isUnderFive(item)">{{ item.stockTotal }}</span>
                      <span *ngIf="isUnderFive(item)" class="badge-critical-tag">⚠️ &lt; {{ item.minStock || 5 }} CRÍTICO</span>
                    </div>
                    <span class="stock-sub" [class.text-critical]="isUnderFive(item)">
                      {{ item.stockReserved }} resv. ({{ item.stockAvailable }} disp.)
                    </span>
                  </div>
                </td>
                <td>
                  <div class="level-cell">
                    <div class="level-meta">
                      <span class="level-status-text" [ngClass]="isUnderFive(item) ? 'critical' : item.stockStatusClass">
                        {{ isUnderFive(item) ? 'STOCK CRÍTICO' : item.stockStatus }}
                      </span>
                      <span class="level-percent" [class.text-critical]="isUnderFive(item)">{{ item.stockLevelPercent }}%</span>
                    </div>
                    <div class="level-bar-track">
                      <div 
                        class="level-bar-fill" 
                        [ngClass]="isUnderFive(item) ? 'critical' : item.stockStatusClass"
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
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; background: #eff6ff; color: #2563eb; flex-shrink: 0;">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </span>
                    <span class="movement-cell" style="font-weight: 600; color: #1e293b;">{{ item.registeredByName || 'Administrador' }}</span>
                  </div>
                </td>
                <td style="text-align: center;">
                  <div class="action-buttons-group">
                    <button class="btn-action-icon edit-btn" (click)="openEditProductModal(item)" title="Editar producto">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                      </svg>
                    </button>
                    <button class="btn-action-icon delete-btn" (click)="confirmDeleteProduct(item)" title="Eliminar producto">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="filteredProducts.length === 0">
                <td colspan="8" style="text-align: center; padding: 2.5rem; color: #64748b;">
                  No hay productos que coincidan con la búsqueda o filtros seleccionados. Utilice "Nuevo Producto" para registrar artículos.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="table-footer">
          <div class="footer-left">
            <span class="showing-text">Mostrando <strong>{{ filteredProducts.length }}</strong> de <strong>{{ products.length | number }}</strong> productos registrados en base de datos</span>
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

    /* 2. KPIs Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.15rem;
    }

    .kpi-grid.employee-kpi-grid {
      grid-template-columns: repeat(2, 1fr);
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
      width: 320px;
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

    .inventory-table td {
      padding: 0.85rem 0.95rem;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: middle;
      transition: background-color 0.15s ease;
    }

    .inventory-table tbody tr:hover td {
      background-color: #f8fafc;
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

    .badge-critical-tag {
      background: #fee2e2;
      color: #dc2626;
      border: 1px solid #fecaca;
      border-radius: 4px;
      font-size: 0.62rem;
      font-weight: 700;
      padding: 0.1rem 0.35rem;
      letter-spacing: 0.02em;
      white-space: nowrap;
    }

    .action-buttons-group {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      justify-content: center;
    }

    .btn-action-icon {
      width: 32px;
      height: 32px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.18s ease;
    }

    .btn-action-icon.edit-btn:hover {
      background: #eff6ff;
      border-color: #93c5fd;
      transform: translateY(-1px);
    }

    .btn-action-icon.delete-btn:hover {
      background: #fef2f2;
      border-color: #fca5a5;
      transform: translateY(-1px);
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

    @media (max-width: 1200px) {
      .kpi-grid {
        grid-template-columns: repeat(2, 1fr);
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
export class InventoryComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly productsService = inject(ProductsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly ngZone = inject(NgZone);
  private readonly importService = inject(InventoryImportService);

  @ViewChild('importFileInput') private importFileInput?: ElementRef<HTMLInputElement>;

  /** Bloquea el botón de importación mientras se procesa un archivo. */
  isImporting = false;

  private productsSub?: Subscription;

  searchQuery = '';
  selectedCategory = 'all';
  selectedLocation = 'all';
  selectedStockLevel = 'all';

  products: ProductItem[] = [];

  get isEmployee(): boolean {
    return this.authService.isEmployee();
  }

  get totalActiveSkus(): number {
    return this.products.length;
  }

  private getStockQuantity(item: ProductItem): number {
    const raw = String(item.stockAvailable || item.stockTotal || '0').replace(/[^0-9-]/g, '');
    const qty = parseInt(raw, 10);
    return isNaN(qty) ? 0 : qty;
  }

  get lowStockCount(): number {
    return this.products.filter(item => this.isUnderFive(item)).length;
  }

  get stockoutCount(): number {
    return this.products.filter(item => this.getStockQuantity(item) <= 0).length;
  }

  get availableSkusCount(): number {
    return this.products.filter(item => this.getStockQuantity(item) > 0).length;
  }

  get totalUnitsInStock(): number {
    return this.products.reduce((acc, p) => acc + this.getStockQuantity(p), 0);
  }

  get totalInventoryValue(): number {
    return this.products.reduce((acc, p) => {
      const qty = this.getStockQuantity(p);
      const rawPrice = String(p.costPrice || p.salePrice || '0').replace(/[^0-9.]/g, '');
      const price = parseFloat(rawPrice) || 0;
      return acc + (qty * price);
    }, 0);
  }

  get availabilityPercent(): string {
    if (this.products.length === 0) {
      return '0';
    }
    return ((this.availableSkusCount / this.products.length) * 100).toFixed(1).replace(/\.0$/, '');
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  ngOnDestroy(): void {
    this.productsSub?.unsubscribe();
  }

  trackBySku(_: number, item: ProductItem): string {
    return item.id || item.sku;
  }

  get availableCategories(): string[] {
    const set = new Set<string>();
    for (const p of this.products) {
      if (p.category && p.category.trim()) {
        set.add(p.category.trim());
      }
    }
    return Array.from(set).sort();
  }

  get availableLocations(): string[] {
    const map = new Map<string, string>();
    for (const p of this.products) {
      if (p.location && p.location.trim()) {
        const clean = p.location.trim();
        const lower = clean.toLowerCase();
        if (!map.has(lower)) {
          map.set(lower, clean);
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  }

  filterByLowStock(): void {
    if (this.selectedStockLevel === 'STOCK CRÍTICO') {
      this.selectedStockLevel = 'all';
    } else {
      this.selectedStockLevel = 'STOCK CRÍTICO';
    }
    this.cdr.detectChanges();
  }

  loadProducts(): void {
    this.productsSub?.unsubscribe();
    this.productsSub = this.productsService.products$.subscribe((items) => {
      this.ngZone.run(() => {
        this.products = [...(items || [])];
        this.cdr.detectChanges();
      });
    });

    this.productsService.getProducts().subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.products = [...(data || [])];
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        console.warn('[Inventario] Error cargando productos:', err);
        this.cdr.detectChanges();
      }
    });
  }

  isUnderFive(item: ProductItem): boolean {
    const qty = this.getStockQuantity(item);
    const min = item.minStock ?? 5;
    return qty <= min || qty < 5 || item.stockStatusClass === 'critical' || item.stockStatus === 'STOCK CRÍTICO' || item.stockStatus === 'AGOTADO';
  }

  get filteredProducts(): ProductItem[] {
    return this.products.filter(item => {
      const q = this.searchQuery.trim().toLowerCase();
      const matchesSearch = !q || 
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        (item.barcode && item.barcode.toLowerCase().includes(q));

      const matchesCategory = this.selectedCategory === 'all' || 
        item.category.toLowerCase() === this.selectedCategory.toLowerCase();

      const matchesLocation = this.selectedLocation === 'all' || 
        item.location.toLowerCase() === this.selectedLocation.toLowerCase();

      let matchesStockLevel = true;
      if (this.selectedStockLevel === 'STOCK CRÍTICO') {
        matchesStockLevel = this.isUnderFive(item);
      } else if (this.selectedStockLevel === 'AGOTADO') {
        matchesStockLevel = this.getStockQuantity(item) <= 0;
      } else if (this.selectedStockLevel !== 'all') {
        matchesStockLevel = item.stockStatus === this.selectedStockLevel;
      }

      return matchesSearch && matchesCategory && matchesLocation && matchesStockLevel;
    });
  }

  async openNewProductModal(): Promise<void> {
    const { value: formValues } = await Swal.fire({
      title: 'Registrar Nuevo Producto',
      width: 640,
      html: `
        <div style="display:flex; flex-direction:column; gap:10px; text-align:left; font-family:inherit; max-height:70vh; overflow-y:auto; padding:4px 6px;">
          <!-- SKU y Código de Barras -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div>
              <label style="font-size:0.78rem; font-weight:600; color:#475569; margin-bottom:3px; display:block;">Código SKU * (máx 30)</label>
              <input id="swal-sku" class="swal2-input" maxlength="30" placeholder="Ej. SKU-7720-IPE" style="margin:0; width:100%; box-sizing:border-box; font-size:0.85rem;">
            </div>
            <div>
              <label style="font-size:0.78rem; font-weight:600; color:#475569; margin-bottom:3px; display:block;">Código de Barras (máx 30)</label>
              <input id="swal-barcode" class="swal2-input" maxlength="30" placeholder="Ej. 780992341201" style="margin:0; width:100%; box-sizing:border-box; font-size:0.85rem;">
            </div>
          </div>

          <!-- Nombre -->
          <div>
            <label style="font-size:0.78rem; font-weight:600; color:#475569; margin-bottom:3px; display:block;">Nombre del Producto * (máx 80)</label>
            <input id="swal-name" class="swal2-input" maxlength="80" placeholder="Ej. Viga de Acero IPN 200" style="margin:0; width:100%; box-sizing:border-box; font-size:0.85rem;">
          </div>

          <!-- Descripción (Opcional, máx 500) -->
          <div>
            <label style="font-size:0.78rem; font-weight:600; color:#475569; margin-bottom:3px; display:block;">Descripción (máx 500) - <span style="font-weight:400; color:#94a3b8;">Opcional</span></label>
            <textarea id="swal-desc" class="swal2-textarea" maxlength="500" placeholder="Detalle técnico, dimensiones o especificaciones..." style="margin:0; width:100%; box-sizing:border-box; height:65px; font-size:0.82rem; font-family:inherit; resize:vertical;"></textarea>
          </div>

          <!-- Categoría y Detalle -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div>
              <label style="font-size:0.78rem; font-weight:600; color:#475569; margin-bottom:3px; display:block;">Categoría * (máx 40)</label>
              <input id="swal-category" class="swal2-input" maxlength="40" placeholder="Ej. Construcción" style="margin:0; width:100%; box-sizing:border-box; font-size:0.85rem;">
            </div>
            <div>
              <label style="font-size:0.78rem; font-weight:600; color:#475569; margin-bottom:3px; display:block;">Detalle Categoría (máx 50)</label>
              <input id="swal-catdetail" class="swal2-input" maxlength="50" placeholder="Ej. Acero Estructural A36" style="margin:0; width:100%; box-sizing:border-box; font-size:0.85rem;">
            </div>
          </div>

          <!-- Ubicación Bodega -->
          <div>
            <label style="font-size:0.78rem; font-weight:600; color:#475569; margin-bottom:3px; display:block;">Ubicación en Bodega * (máx 30)</label>
            <input id="swal-location" list="swal-locations-datalist" class="swal2-input" maxlength="30" placeholder="Selecciona o escribe: Ej. Nave A-P03-R2" style="margin:0; width:100%; box-sizing:border-box; font-size:0.85rem;" autocomplete="off">
            <datalist id="swal-locations-datalist">
              ${this.availableLocations.map(loc => `<option value="${loc}"></option>`).join('')}
            </datalist>
            <span style="font-size:0.7rem; color:#64748b; margin-top:2px; display:block;">Puedes seleccionar una ubicación existente o escribir una nueva.</span>
          </div>

          <!-- Precios: Costo y Venta -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div>
              <label style="font-size:0.78rem; font-weight:600; color:#475569; margin-bottom:3px; display:block;">Precio Costo *</label>
              <input id="swal-cost" type="number" step="0.01" min="0" class="swal2-input" placeholder="50.00" style="margin:0; width:100%; box-sizing:border-box; font-size:0.85rem;">
            </div>
            <div>
              <label style="font-size:0.78rem; font-weight:600; color:#475569; margin-bottom:3px; display:block;">Precio Venta *</label>
              <input id="swal-price" type="number" step="0.01" min="0" class="swal2-input" placeholder="75.00" style="margin:0; width:100%; box-sizing:border-box; font-size:0.85rem;">
            </div>
          </div>

          <!-- Stock Inicial y Stock Mínimo -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div>
              <label style="font-size:0.78rem; font-weight:600; color:#475569; margin-bottom:3px; display:block;">Stock Inicial *</label>
              <input id="swal-stock" type="number" min="0" class="swal2-input" placeholder="100" style="margin:0; width:100%; box-sizing:border-box; font-size:0.85rem;">
            </div>
            <div>
              <label style="font-size:0.78rem; font-weight:600; color:#475569; margin-bottom:3px; display:block;">Stock Mínimo (Alerta)</label>
              <input id="swal-minstock" type="number" min="0" class="swal2-input" value="5" placeholder="5" style="margin:0; width:100%; box-sizing:border-box; font-size:0.85rem;">
            </div>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Registrar Producto',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#94a3b8',
      preConfirm: () => {
        const sku = (document.getElementById('swal-sku') as HTMLInputElement)?.value?.trim();
        const barcode = (document.getElementById('swal-barcode') as HTMLInputElement)?.value?.trim();
        const name = (document.getElementById('swal-name') as HTMLInputElement)?.value?.trim();
        const desc = (document.getElementById('swal-desc') as HTMLTextAreaElement)?.value?.trim();
        const category = (document.getElementById('swal-category') as HTMLInputElement)?.value?.trim();
        const catDetail = (document.getElementById('swal-catdetail') as HTMLInputElement)?.value?.trim();
        const location = (document.getElementById('swal-location') as HTMLInputElement)?.value?.trim();
        const costStr = (document.getElementById('swal-cost') as HTMLInputElement)?.value?.trim();
        const priceStr = (document.getElementById('swal-price') as HTMLInputElement)?.value?.trim();
        const stockStr = (document.getElementById('swal-stock') as HTMLInputElement)?.value?.trim();
        const minStockStr = (document.getElementById('swal-minstock') as HTMLInputElement)?.value?.trim();

        if (!sku) {
          Swal.showValidationMessage('El código SKU es obligatorio (máx 30 caracteres).');
          return false;
        }
        if (sku.length > 30) {
          Swal.showValidationMessage('El código SKU no puede superar 30 caracteres.');
          return false;
        }
        if (barcode && barcode.length > 30) {
          Swal.showValidationMessage('El código de barras no puede superar 30 caracteres.');
          return false;
        }
        if (!name) {
          Swal.showValidationMessage('El nombre del producto es obligatorio (máx 80 caracteres).');
          return false;
        }
        if (name.length > 80) {
          Swal.showValidationMessage('El nombre no puede superar 80 caracteres.');
          return false;
        }
        if (desc && desc.length > 500) {
          Swal.showValidationMessage('La descripción no puede superar 500 caracteres.');
          return false;
        }
        if (!category) {
          Swal.showValidationMessage('La categoría es obligatoria (máx 40 caracteres).');
          return false;
        }
        if (category.length > 40) {
          Swal.showValidationMessage('La categoría no puede superar 40 caracteres.');
          return false;
        }
        if (catDetail && catDetail.length > 50) {
          Swal.showValidationMessage('El detalle de categoría no puede superar 50 caracteres.');
          return false;
        }
        if (!location) {
          Swal.showValidationMessage('La ubicación en bodega es obligatoria (máx 30 caracteres).');
          return false;
        }
        if (location.length > 30) {
          Swal.showValidationMessage('La ubicación no puede superar 30 caracteres.');
          return false;
        }

        const matchedLoc = this.availableLocations.find(l => l.toLowerCase() === location.toLowerCase());
        const finalLocation = matchedLoc || location;

        const costNum = parseFloat(costStr || '0');
        if (isNaN(costNum) || costNum < 0) {
          Swal.showValidationMessage('El precio de costo no puede ser negativo.');
          return false;
        }

        const priceNum = parseFloat(priceStr || '0');
        if (isNaN(priceNum) || priceNum < 0) {
          Swal.showValidationMessage('El precio de venta no puede ser negativo.');
          return false;
        }

        const stockNum = parseInt(stockStr || '0', 10);
        if (isNaN(stockNum) || stockNum < 0) {
          Swal.showValidationMessage('El stock inicial no puede ser negativo.');
          return false;
        }

        const minStockNum = parseInt(minStockStr || '5', 10);
        if (isNaN(minStockNum) || minStockNum < 0) {
          Swal.showValidationMessage('El stock mínimo no puede ser negativo.');
          return false;
        }

        return {
          sku,
          barcode: barcode || undefined,
          name,
          description: desc || undefined,
          category,
          categoryDetail: catDetail || 'General',
          location: finalLocation,
          costPrice: costNum,
          salePrice: priceNum,
          price: priceNum,
          stock: stockNum,
          minStock: minStockNum
        };
      }
    });

    if (formValues) {
      this.productsService.createProduct({
        sku: formValues.sku,
        barcode: formValues.barcode,
        name: formValues.name,
        description: formValues.description,
        category: formValues.category,
        categoryDetail: formValues.categoryDetail,
        stock: formValues.stock,
        minStock: formValues.minStock,
        location: formValues.location,
        costPrice: formValues.costPrice,
        salePrice: formValues.salePrice,
        price: formValues.price
      }).subscribe({
        next: (created) => {
          this.ngZone.run(() => {
            this.products = [created, ...this.products.filter(p => p.sku !== created.sku && p.id !== created.id)];
            this.cdr.detectChanges();
          });
          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Producto registrado exitosamente',
            showConfirmButton: false,
            timer: 1500
          });
        },
        error: (err) => {
          this.cdr.detectChanges();
          if (!err?.error?.handledByProductInterceptor) {
            Swal.fire({
              icon: 'warning',
              title: 'Atención en Producto',
              text: err?.error?.message || 'No se pudo completar el registro del producto',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#2563eb'
            });
          }
        }
      });
    }
  }

  async openEditProductModal(item: ProductItem): Promise<void> {
    const currentStock = parseInt(item.stockAvailable || item.stockTotal || '0', 10) || 0;
    const currentCost = parseFloat(String(item.costPrice || '0').replace(/[^0-9.]/g, '')) || 0;
    const currentSale = parseFloat(String(item.salePrice || '0').replace(/[^0-9.]/g, '')) || 0;
    const currentMinStock = item.minStock ?? 5;

    const { value: formValues } = await Swal.fire({
      title: `Editar Producto (${item.sku})`,
      width: 640,
      html: `
        <div style="display:flex; flex-direction:column; gap:10px; text-align:left; font-family:inherit; max-height:70vh; overflow-y:auto; padding:4px 6px;">
          <!-- Nombre -->
          <div>
            <label style="font-size:0.78rem; font-weight:600; color:#475569; margin-bottom:3px; display:block;">Nombre del Producto * (máx 80)</label>
            <input id="swal-edit-name" class="swal2-input" maxlength="80" value="${item.name}" style="margin:0; width:100%; box-sizing:border-box; font-size:0.85rem;">
          </div>

          <!-- Descripción (Opcional, máx 500) -->
          <div>
            <label style="font-size:0.78rem; font-weight:600; color:#475569; margin-bottom:3px; display:block;">Descripción (máx 500) - <span style="font-weight:400; color:#94a3b8;">Opcional</span></label>
            <textarea id="swal-edit-desc" class="swal2-textarea" maxlength="500" placeholder="Detalle técnico..." style="margin:0; width:100%; box-sizing:border-box; height:65px; font-size:0.82rem; font-family:inherit; resize:vertical;">${item.description || ''}</textarea>
          </div>

          <!-- Categoría y Detalle -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div>
              <label style="font-size:0.78rem; font-weight:600; color:#475569; margin-bottom:3px; display:block;">Categoría * (máx 40)</label>
              <input id="swal-edit-category" class="swal2-input" maxlength="40" value="${item.category}" style="margin:0; width:100%; box-sizing:border-box; font-size:0.85rem;">
            </div>
            <div>
              <label style="font-size:0.78rem; font-weight:600; color:#475569; margin-bottom:3px; display:block;">Detalle Categoría (máx 50)</label>
              <input id="swal-edit-catdetail" class="swal2-input" maxlength="50" value="${item.categoryDetail || ''}" style="margin:0; width:100%; box-sizing:border-box; font-size:0.85rem;">
            </div>
          </div>

          <!-- Ubicación Bodega -->
          <div>
            <label style="font-size:0.78rem; font-weight:600; color:#475569; margin-bottom:3px; display:block;">Ubicación Bodega * (máx 30)</label>
            <input id="swal-edit-location" list="swal-edit-locations-datalist" class="swal2-input" maxlength="30" value="${item.location}" placeholder="Selecciona o escribe: Ej. Nave A-P03-R2" style="margin:0; width:100%; box-sizing:border-box; font-size:0.85rem;" autocomplete="off">
            <datalist id="swal-edit-locations-datalist">
              ${this.availableLocations.map(loc => `<option value="${loc}"></option>`).join('')}
            </datalist>
            <span style="font-size:0.7rem; color:#64748b; margin-top:2px; display:block;">Puedes seleccionar una ubicación existente o escribir una nueva.</span>
          </div>

          <!-- Precios: Costo y Venta -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div>
              <label style="font-size:0.78rem; font-weight:600; color:#475569; margin-bottom:3px; display:block;">Precio Costo *</label>
              <input id="swal-edit-cost" type="number" step="0.01" min="0" class="swal2-input" value="${currentCost}" style="margin:0; width:100%; box-sizing:border-box; font-size:0.85rem;">
            </div>
            <div>
              <label style="font-size:0.78rem; font-weight:600; color:#475569; margin-bottom:3px; display:block;">Precio Venta *</label>
              <input id="swal-edit-price" type="number" step="0.01" min="0" class="swal2-input" value="${currentSale}" style="margin:0; width:100%; box-sizing:border-box; font-size:0.85rem;">
            </div>
          </div>

          <!-- Stock Actual y Stock Mínimo -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div>
              <label style="font-size:0.78rem; font-weight:600; color:#475569; margin-bottom:3px; display:block;">Stock Actual *</label>
              <input id="swal-edit-stock" type="number" min="0" class="swal2-input" value="${currentStock}" style="margin:0; width:100%; box-sizing:border-box; font-size:0.85rem;">
            </div>
            <div>
              <label style="font-size:0.78rem; font-weight:600; color:#475569; margin-bottom:3px; display:block;">Stock Mínimo (Alerta)</label>
              <input id="swal-edit-minstock" type="number" min="0" class="swal2-input" value="${currentMinStock}" style="margin:0; width:100%; box-sizing:border-box; font-size:0.85rem;">
            </div>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar Cambios',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#94a3b8',
      preConfirm: () => {
        const name = (document.getElementById('swal-edit-name') as HTMLInputElement)?.value?.trim();
        const desc = (document.getElementById('swal-edit-desc') as HTMLTextAreaElement)?.value?.trim();
        const category = (document.getElementById('swal-edit-category') as HTMLInputElement)?.value?.trim();
        const catDetail = (document.getElementById('swal-edit-catdetail') as HTMLInputElement)?.value?.trim();
        const location = (document.getElementById('swal-edit-location') as HTMLInputElement)?.value?.trim();
        const costStr = (document.getElementById('swal-edit-cost') as HTMLInputElement)?.value?.trim();
        const priceStr = (document.getElementById('swal-edit-price') as HTMLInputElement)?.value?.trim();
        const stockStr = (document.getElementById('swal-edit-stock') as HTMLInputElement)?.value?.trim();
        const minStockStr = (document.getElementById('swal-edit-minstock') as HTMLInputElement)?.value?.trim();

        if (!name) {
          Swal.showValidationMessage('El nombre del producto es obligatorio (máx 80 caracteres).');
          return false;
        }
        if (name.length > 80) {
          Swal.showValidationMessage('El nombre no puede superar 80 caracteres.');
          return false;
        }
        if (desc && desc.length > 500) {
          Swal.showValidationMessage('La descripción no puede superar 500 caracteres.');
          return false;
        }
        if (!category) {
          Swal.showValidationMessage('La categoría es obligatoria (máx 40 caracteres).');
          return false;
        }
        if (category.length > 40) {
          Swal.showValidationMessage('La categoría no puede superar 40 caracteres.');
          return false;
        }
        if (catDetail && catDetail.length > 50) {
          Swal.showValidationMessage('El detalle de categoría no puede superar 50 caracteres.');
          return false;
        }
        if (!location) {
          Swal.showValidationMessage('La ubicación en bodega es obligatoria (máx 30 caracteres).');
          return false;
        }
        if (location.length > 30) {
          Swal.showValidationMessage('La ubicación no puede superar 30 caracteres.');
          return false;
        }

        const matchedLoc = this.availableLocations.find(l => l.toLowerCase() === location.toLowerCase());
        const finalLocation = matchedLoc || location;

        const costNum = parseFloat(costStr || '0');
        if (isNaN(costNum) || costNum < 0) {
          Swal.showValidationMessage('El precio de costo no puede ser negativo.');
          return false;
        }

        const priceNum = parseFloat(priceStr || '0');
        if (isNaN(priceNum) || priceNum < 0) {
          Swal.showValidationMessage('El precio de venta no puede ser negativo.');
          return false;
        }

        const stockNum = parseInt(stockStr || '0', 10);
        if (isNaN(stockNum) || stockNum < 0) {
          Swal.showValidationMessage('El stock no puede ser negativo.');
          return false;
        }

        const minStockNum = parseInt(minStockStr || '5', 10);
        if (isNaN(minStockNum) || minStockNum < 0) {
          Swal.showValidationMessage('El stock mínimo no puede ser negativo.');
          return false;
        }

        return {
          name,
          description: desc || undefined,
          category,
          categoryDetail: catDetail || item.categoryDetail,
          location: finalLocation,
          costPrice: costNum,
          salePrice: priceNum,
          price: priceNum,
          stock: stockNum,
          minStock: minStockNum
        };
      }
    });

    if (formValues) {
      this.productsService.updateProduct(item.id || item.sku, {
        name: formValues.name,
        description: formValues.description,
        category: formValues.category,
        categoryDetail: formValues.categoryDetail,
        stock: formValues.stock,
        minStock: formValues.minStock,
        location: formValues.location,
        costPrice: formValues.costPrice,
        salePrice: formValues.salePrice,
        price: formValues.price
      }).subscribe({
        next: (updated) => {
          this.ngZone.run(() => {
            this.products = this.products.map(p => (p.id === item.id || p.sku === item.sku) ? updated : p);
            this.cdr.detectChanges();
          });
          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Producto actualizado exitosamente',
            showConfirmButton: false,
            timer: 1500
          });
        },
        error: (err) => {
          this.cdr.detectChanges();
          if (!err?.error?.handledByProductInterceptor) {
            Swal.fire({
              icon: 'warning',
              title: 'Atención en Producto',
              text: err?.error?.message || 'No se pudo actualizar el producto',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#2563eb'
            });
          }
        }
      });
    }
  }

  async confirmDeleteProduct(item: ProductItem): Promise<void> {
    const result = await Swal.fire({
      title: '¿Eliminar producto?',
      text: `¿Estás seguro de que deseas eliminar '${item.name}' (${item.sku})?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      this.productsService.deleteProduct(item.id || item.sku).subscribe({
        next: () => {
          this.ngZone.run(() => {
            this.products = this.products.filter(p => p.id !== item.id && p.sku !== item.sku);
            this.cdr.detectChanges();
          });
          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Producto eliminado exitosamente',
            showConfirmButton: false,
            timer: 1500
          });
        },
        error: (err) => {
          this.cdr.detectChanges();
          Swal.fire({
            position: 'top-end',
            icon: 'warning',
            title: err?.error?.message || 'No se pudo eliminar el producto',
            showConfirmButton: false,
            timer: 2000
          });
        }
      });
    }
  }

  async downloadImportTemplate(): Promise<void> {
    try {
      await this.importService.downloadTemplate();
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Error al generar plantilla',
        text: 'No fue posible descargar la plantilla oficial. Inténtalo nuevamente.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#2563eb'
      });
    }
  }

  triggerImportFile(): void {
    if (this.isImporting) return;
    const input = this.importFileInput?.nativeElement;
    if (input) {
      input.value = '';
      input.click();
    }
  }

  async onImportFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) return;

    try {
      const parsed = await this.importService.parseFile(file);
      await this.handleParsedImportFile(parsed);
    } catch (err) {
      if (err instanceof ImportFileError) {
        const detailHtml = err.details.length > 0
          ? `<ul style="text-align:left; margin:10px 0 0 0; padding-left:18px; font-size:0.86rem; color:#475569;">${err.details.map(d => `<li style="margin-bottom:4px;">${this.escapeHtml(d)}</li>`).join('')}</ul>`
          : '';
        await Swal.fire({
          icon: 'warning',
          title: 'Archivo inválido',
          html: `<div style="text-align:left; font-size:0.9rem; color:#1e293b;"><p style="margin:0; font-weight:600;">${this.escapeHtml(err.message)}</p>${detailHtml}</div>`,
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#2563eb'
        });
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Error al leer el archivo',
          text: 'Ocurrió un problema inesperado al procesar el archivo seleccionado.',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#2563eb'
        });
      }
    } finally {
      if (input) input.value = '';
    }
  }

  private async handleParsedImportFile(parsed: ParsedImportFile): Promise<void> {
    if (parsed.validItems.length === 0) {
      const sampleErrors = parsed.rowErrors.slice(0, 8)
        .map(r => `<li style="margin-bottom:4px;"><strong>Fila ${r.row}:</strong> ${this.escapeHtml(r.messages.join(' '))}</li>`)
        .join('');
      const extraCount = parsed.rowErrors.length - 8;
      const extraNote = extraCount > 0 ? `<p style="margin:8px 0 0 0; font-size:0.8rem; color:#64748b;">...y ${extraCount} fila(s) más con errores.</p>` : '';

      await Swal.fire({
        icon: 'warning',
        title: 'Ninguna fila válida para importar',
        html: `
          <div style="text-align:left; font-size:0.88rem; color:#334155;">
            <p style="margin:0 0 8px 0;">Se analizaron <strong>${parsed.totalRows}</strong> fila(s) en <strong>${this.escapeHtml(parsed.fileName)}</strong> y todas presentaron errores:</p>
            <ul style="margin:0; padding-left:18px; color:#dc2626;">${sampleErrors}</ul>
            ${extraNote}
          </div>
        `,
        confirmButtonText: 'Revisar archivo',
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    const previewRows = parsed.validItems.slice(0, 4)
      .map(item => `
        <tr>
          <td style="padding:5px 8px; border-bottom:1px solid #e2e8f0; font-family:monospace; font-size:0.78rem;">${this.escapeHtml(item.sku)}</td>
          <td style="padding:5px 8px; border-bottom:1px solid #e2e8f0; font-size:0.8rem;">${this.escapeHtml(item.name)}</td>
          <td style="padding:5px 8px; border-bottom:1px solid #e2e8f0; text-align:right; font-size:0.8rem;">${item.stock}</td>
          <td style="padding:5px 8px; border-bottom:1px solid #e2e8f0; text-align:right; font-size:0.8rem;">$${item.salePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
      `)
      .join('');

    const errorWarningHtml = parsed.rowErrors.length > 0
      ? `
        <div style="margin-top:10px; padding:8px 10px; background:#fef2f2; border:1px solid #fecaca; border-radius:6px; font-size:0.8rem; color:#991b1b;">
          <strong>Atención:</strong> ${parsed.rowErrors.length} fila(s) tienen errores y serán omitidas:
          <ul style="margin:4px 0 0 0; padding-left:16px;">
            ${parsed.rowErrors.slice(0, 4).map(r => `<li>Fila ${r.row}: ${this.escapeHtml(r.messages.join(' '))}</li>`).join('')}
          </ul>
        </div>
      `
      : '';

    let selectedMode: BulkImportConflictMode = 'SumStock';

    const confirmation = await Swal.fire({
      title: 'Confirmar importación de inventario',
      width: 600,
      html: `
        <div style="text-align:left; font-size:0.88rem; color:#334155;">
          <p style="margin:0 0 10px 0;">
            Archivo: <strong>${this.escapeHtml(parsed.fileName)}</strong><br/>
            Productos válidos listos para importar: <strong>${parsed.validItems.length}</strong> de ${parsed.totalRows}
          </p>
          <table style="width:100%; border-collapse:collapse; margin-bottom:12px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; overflow:hidden;">
            <thead>
              <tr style="background:#f1f5f9; font-size:0.75rem; text-transform:uppercase; color:#475569;">
                <th style="padding:6px 8px; text-align:left;">SKU</th>
                <th style="padding:6px 8px; text-align:left;">Nombre</th>
                <th style="padding:6px 8px; text-align:right;">Cant.</th>
                <th style="padding:6px 8px; text-align:right;">P. Venta</th>
              </tr>
            </thead>
            <tbody>${previewRows}</tbody>
          </table>
          <label style="display:block; font-weight:600; margin-bottom:6px; color:#0f172a;">
            Si un SKU del archivo ya existe en el inventario:
          </label>
          <select id="fz-import-conflict-mode" style="width:100%; padding:8px 10px; border:1px solid #cbd5e1; border-radius:6px; font-size:0.86rem; color:#0f172a; background:#ffffff;">
            <option value="SumStock" selected>Sumar la cantidad al stock actual (conservar precios y datos actuales)</option>
            <option value="Overwrite">Sobrescribir stock, precios y datos con los del archivo</option>
          </select>
          ${errorWarningHtml}
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: `Importar ${parsed.validItems.length} producto(s)`,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#94a3b8',
      preConfirm: () => {
        const selectEl = document.getElementById('fz-import-conflict-mode') as HTMLSelectElement | null;
        if (selectEl && (selectEl.value === 'SumStock' || selectEl.value === 'Overwrite')) {
          selectedMode = selectEl.value;
        }
        return selectedMode;
      }
    });

    if (!confirmation.isConfirmed) return;

    this.isImporting = true;
    this.cdr.detectChanges();

    this.productsService.bulkImport({
      products: parsed.validItems,
      conflictMode: selectedMode
    }).subscribe({
      next: (result: BulkImportResult) => {
        this.ngZone.run(() => {
          this.isImporting = false;
          this.cdr.detectChanges();
        });

        const warningsHtml = result.warnings && result.warnings.length > 0
          ? `<div style="margin-top:10px; padding:8px 10px; background:#fffbeb; border:1px solid #fde68a; border-radius:6px; font-size:0.8rem; color:#92400e; text-align:left;">
              <strong>Avisos durante el proceso:</strong>
              <ul style="margin:4px 0 0 0; padding-left:16px;">
                ${result.warnings.slice(0, 5).map(w => `<li>${this.escapeHtml(w)}</li>`).join('')}
              </ul>
            </div>`
          : '';

        Swal.fire({
          icon: 'success',
          title: 'Importación completada',
          html: `
            <div style="text-align:left; font-size:0.9rem; color:#334155;">
              <p style="margin:0 0 6px 0;">Resumen del lote procesado:</p>
              <ul style="margin:0; padding-left:18px;">
                <li>Productos nuevos creados: <strong>${result.totalCreated}</strong></li>
                <li>Productos existentes actualizados: <strong>${result.totalUpdated}</strong></li>
                <li>Total procesados: <strong>${result.totalProcessed}</strong></li>
              </ul>
              ${warningsHtml}
            </div>
          `,
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#2563eb'
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.isImporting = false;
          this.cdr.detectChanges();
        });
        if (!err?.error?.handledByProductInterceptor) {
          Swal.fire({
            icon: 'error',
            title: 'Error en la importación',
            text: err?.error?.message || 'No fue posible completar la importación masiva.',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#2563eb'
          });
        }
      }
    });
  }

  private escapeHtml(text: string): string {
    return String(text ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
