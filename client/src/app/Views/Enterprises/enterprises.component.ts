import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { SaleService, SaleDto, CreateSaleDto } from '../../Services/sale.service';
import { ProductsService, ProductItem } from '../../Services/products.service';
import { ClientService, ClientDto } from '../../Services/client.service';

export interface MovementRow {
  saleId: number;
  detailId: number;
  productId: string;
  sku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  totalSaleAmount: number;
  location: string;
  clientId: number;
  clientName: string;
  paymentMethod: string;
  referenceDoc: string;
  operator: string;
  createdAt: string;
  isPaid: boolean;
  typeLabel: 'PEDIDO' | 'VENTA';
  statusLabel: 'Pedido' | 'Vendido';
}

@Component({
  selector: 'app-enterprises',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fz-viewport movements-view">
      <!-- 1. Encabezado Principal de Movimientos y Pedidos -->
      <header class="header-section">
        <div class="header-titles">
          <div class="title-with-badge">
            <h1 class="page-title">Movimientos y Pedidos</h1>
            <span class="live-badge">
              <span class="pulse-dot"></span>
              CONECTADO A BASE DE DATOS
            </span>
          </div>
          <p class="page-subtitle">
            Control en tiempo real de pedidos en rojo (pendientes) y ventas en verde (vendidos).
          </p>
        </div>

        <div class="header-actions">
          <!-- Botón Nuevo Cliente Rápido -->
          <button class="btn-action-outline" (click)="openClientModal()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
            <span>Nuevo Cliente</span>
          </button>

          <!-- Botón Nuevo Pedido (Rojo) -->
          <button class="btn-action-red" (click)="openOrderModal(false)">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>Nuevo Pedido (Rojo)</span>
          </button>

          <!-- Botón Registrar Venta Directa (Verde) -->
          <button class="btn-action-green" (click)="openOrderModal(true)">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Registrar Venta (Verde)</span>
          </button>
        </div>
      </header>

      <!-- 2. Alerta de Éxito / Feedback -->
      <div *ngIf="successMessage" class="alert-success">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>{{ successMessage }}</span>
      </div>

      <!-- 3. Tarjetas Resumen (KPIs en 0 cuando no hay datos) -->
      <section class="metrics-grid">
        <!-- Total Ventas (Verde) -->
        <div class="metric-card card-green-border">
          <div class="metric-icon entry-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.4">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <div class="metric-data">
            <span class="metric-label">Ventas Completadas (Verde)</span>
            <span class="metric-value text-green">{{ totalSalesCount }}</span>
            <span class="metric-sub">\${{ totalSalesRevenue | number:'1.2-2' }} recaudado</span>
          </div>
        </div>

        <!-- Total Pedidos (Rojo) -->
        <div class="metric-card card-red-border">
          <div class="metric-icon exit-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2.4">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div class="metric-data">
            <span class="metric-label">Pedidos Pendientes (Rojo)</span>
            <span class="metric-value text-red">{{ totalOrdersCount }}</span>
            <span class="metric-sub">\${{ totalOrdersPendingAmount | number:'1.2-2' }} por cobrar</span>
          </div>
        </div>

        <!-- Total Movimientos / Unidades -->
        <div class="metric-card">
          <div class="metric-icon pending-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            </svg>
          </div>
          <div class="metric-data">
            <span class="metric-label">Total Movimientos</span>
            <span class="metric-value">{{ movementRows.length }}</span>
            <span class="metric-sub">{{ totalUnitsMoved }} unidades movilizadas</span>
          </div>
        </div>
      </section>

      <!-- 4. Filtros y Búsqueda -->
      <section class="filter-bar">
        <div class="tabs-container">
          <button
            *ngFor="let tab of tabs"
            [class.active]="activeTab === tab"
            [class.tab-red]="tab === 'Pedidos (Rojo)' && activeTab === tab"
            [class.tab-green]="tab === 'Ventas (Verde)' && activeTab === tab"
            (click)="activeTab = tab"
            class="tab-btn"
          >
            {{ tab }}
          </button>
        </div>

        <div class="search-box">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Buscar por SKU, producto, cliente o folio..."
            class="search-input"
          />
        </div>
      </section>

      <!-- 5. Tabla de Movimientos, Pedidos (Rojo) y Ventas (Verde) -->
      <div class="table-card">
        <table class="movements-table">
          <thead>
            <tr>
              <th>TIPO</th>
              <th>CÓDIGO / PRODUCTO</th>
              <th>CANTIDAD</th>
              <th>SUBTOTAL</th>
              <th>CLIENTE</th>
              <th>DOCUMENTO / OPERADOR</th>
              <th>FECHA Y HORA</th>
              <th>ESTADO</th>
              <th style="text-align: center;">ACCIÓN</th>
            </tr>
          </thead>
          <tbody>
            <tr
              *ngFor="let row of filteredMovements"
              [class.row-pedido-red]="!row.isPaid"
              [class.row-venta-green]="row.isPaid"
            >
              <!-- Columna TIPO: PEDIDO (ROJO) o VENTA (VERDE) -->
              <td>
                <span class="type-badge" [ngClass]="row.isPaid ? 'venta-green' : 'pedido-red'">
                  <span class="status-dot" [ngClass]="row.isPaid ? 'dot-green' : 'dot-red'"></span>
                  {{ row.typeLabel }}
                </span>
              </td>

              <!-- Columna PRODUCTO / SKU -->
              <td>
                <div class="product-cell">
                  <span class="product-name">{{ row.productName }}</span>
                  <span class="product-sku">SKU: {{ row.sku }} • P.Unit: \${{ row.unitPrice | number:'1.2-2' }}</span>
                </div>
              </td>

              <!-- Columna CANTIDAD -->
              <td>
                <span class="quantity-tag" [ngClass]="row.isPaid ? 'positive-green' : 'negative-red'">
                  {{ row.quantity }} uds
                </span>
              </td>

              <!-- Columna SUBTOTAL -->
              <td>
                <span class="subtotal-amount" [ngClass]="row.isPaid ? 'positive-green' : 'negative-red'">
                  \${{ row.subtotal | number:'1.2-2' }}
                </span>
              </td>

              <!-- Columna CLIENTE -->
              <td>
                <div class="product-cell">
                  <span class="entity-text">{{ row.clientName }}</span>
                  <span class="product-sku">Pago: {{ formatPayMethod(row.paymentMethod) }}</span>
                </div>
              </td>

              <!-- Columna DOCUMENTO / OPERADOR -->
              <td>
                <div class="product-cell">
                  <span class="doc-code">{{ row.referenceDoc }}</span>
                  <span class="product-sku">Por: {{ row.operator }}</span>
                </div>
              </td>

              <!-- Columna FECHA -->
              <td>
                <span class="date-text">{{ row.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
              </td>

              <!-- Columna ESTADO: Pedido (Rojo) vs Vendido (Verde) -->
              <td>
                <span class="status-badge" [ngClass]="row.isPaid ? 'status-vendido-green' : 'status-pedido-red'">
                  {{ row.statusLabel }}
                </span>
              </td>

              <!-- Columna ACCIONES -->
              <td style="text-align: center;">
                <div class="actions-cell">
                  <!-- Si es un Pedido (Rojo), botón para Vender y pasarlo a Verde -->
                  <button
                    *ngIf="!row.isPaid"
                    class="btn-mark-sold"
                    (click)="onToggleSaleStatus(row)"
                    [disabled]="togglingSaleId === row.saleId"
                    title="Confirmar venta y cambiar estado a Vendido (Verde)"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>{{ togglingSaleId === row.saleId ? '...' : 'Vender' }}</span>
                  </button>

                  <!-- Si ya está Vendido (Verde), opción de revertir a Pedido si se requiere -->
                  <button
                    *ngIf="row.isPaid"
                    class="btn-revert-order"
                    (click)="onToggleSaleStatus(row)"
                    [disabled]="togglingSaleId === row.saleId"
                    title="Cambiar nuevamente a Pedido pendiente (Rojo)"
                  >
                    <span>Vendido ✓</span>
                  </button>

                  <!-- Eliminar registro (restaura stock en inventario) -->
                  <button
                    class="btn-delete-row"
                    (click)="onDeleteSale(row)"
                    title="Eliminar registro y devolver stock al inventario"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>

            <tr *ngIf="filteredMovements.length === 0">
              <td colspan="9" class="empty-cell">
                No hay movimientos, pedidos ni ventas registrados en la base de datos (0 registros).
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 6. MODAL: Registrar Pedido (Rojo) o Venta (Verde) -->
      <div *ngIf="showOrderModal" class="modal-overlay" (click)="closeModals()">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <div class="modal-header" [ngClass]="orderForm.isPaid ? 'green-header' : 'red-header'">
            <h2>{{ orderForm.isPaid ? 'Registrar Venta Directa (Verde - Vendido)' : 'Registrar Nuevo Pedido (Rojo - Pendiente)' }}</h2>
            <button class="btn-close" (click)="closeModals()">×</button>
          </div>

          <form (ngSubmit)="saveOrderOrSale()" class="modal-body">
            <!-- Selección de Cliente de la BD -->
            <div class="form-group">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <label>Cliente (Base de Datos) *</label>
                <button type="button" class="btn-inline-link" (click)="openClientModal()">+ Crear cliente</button>
              </div>
              <select [(ngModel)]="orderForm.clientId" name="orderClientId" required class="form-control">
                <option [ngValue]="0" disabled>Seleccione un cliente registrado...</option>
                <option *ngFor="let c of clients" [ngValue]="c.id">
                  {{ c.fullName }} ({{ c.email }})
                </option>
              </select>
              <small *ngIf="clients.length === 0" style="color: #dc2626; font-size: 0.74rem;">
                No hay clientes en la base de datos. Haga clic en "+ Crear cliente" primero.
              </small>
            </div>

            <!-- Selección de Producto de la BD -->
            <div class="form-group">
              <label>Producto del Inventario *</label>
              <select [(ngModel)]="orderForm.productId" name="orderProductId" (change)="onProductSelectChange()" required class="form-control">
                <option value="" disabled>Seleccione un producto del inventario...</option>
                <option *ngFor="let p of products" [value]="p.id">
                  [{{ p.sku }}] {{ p.name }} — Disp: {{ p.stockAvailable }} — {{ p.salePrice }}
                </option>
              </select>
              <small *ngIf="products.length === 0" style="color: #dc2626; font-size: 0.74rem;">
                No hay productos registrados en el inventario (0 SKUs).
              </small>
            </div>

            <!-- Cantidad y Precio Unitario -->
            <div class="form-row">
              <div class="form-group">
                <label>Cantidad *</label>
                <input
                  type="number"
                  [(ngModel)]="orderForm.quantity"
                  name="orderQty"
                  required
                  min="1"
                  class="form-control"
                />
              </div>

              <div class="form-group">
                <label>Método de Pago *</label>
                <select [(ngModel)]="orderForm.paymentMethod" name="orderPayMethod" class="form-control">
                  <option value="Cash">Efectivo (Cash)</option>
                  <option value="BankTransfer">Transferencia Bancaria</option>
                  <option value="CreditCard">Tarjeta de Crédito</option>
                  <option value="DebitCard">Tarjeta de Débito</option>
                  <option value="Other">Otro</option>
                </select>
              </div>
            </div>

            <!-- Selector de Estado Inicial: Pedido (Rojo) vs Vendido (Verde) -->
            <div class="form-group">
              <label>Estado Inicial del Registro *</label>
              <div class="state-selector-grid">
                <button
                  type="button"
                  class="state-option-btn red-option"
                  [class.selected]="!orderForm.isPaid"
                  (click)="orderForm.isPaid = false"
                >
                  <span class="dot-red"></span>
                  <span>PEDIDO (En Rojo)</span>
                </button>
                <button
                  type="button"
                  class="state-option-btn green-option"
                  [class.selected]="orderForm.isPaid"
                  (click)="orderForm.isPaid = true"
                >
                  <span class="dot-green"></span>
                  <span>VENDIDO (En Verde)</span>
                </button>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn-secondary" (click)="closeModals()">Cancelar</button>
              <button
                type="submit"
                [ngClass]="orderForm.isPaid ? 'btn-primary-green' : 'btn-primary-red'"
                [disabled]="isSubmitting"
              >
                {{ isSubmitting ? 'Guardando...' : (orderForm.isPaid ? 'Confirmar Venta (Verde)' : 'Registrar Pedido (Rojo)') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- 7. MODAL: Crear Cliente en Base de Datos -->
      <div *ngIf="showClientModal" class="modal-overlay" (click)="closeClientModal()">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <div class="modal-header blue-header">
            <h2>Registrar Nuevo Cliente en Base de Datos</h2>
            <button class="btn-close" (click)="closeClientModal()">×</button>
          </div>

          <form (ngSubmit)="saveNewClient()" class="modal-body">
            <div class="form-row">
              <div class="form-group">
                <label>Nombre *</label>
                <input type="text" [(ngModel)]="clientForm.firstName" name="clientFirstName" required placeholder="Ej: Roberto" class="form-control" />
              </div>
              <div class="form-group">
                <label>Apellido *</label>
                <input type="text" [(ngModel)]="clientForm.lastName" name="clientLastName" required placeholder="Ej: Gómez" class="form-control" />
              </div>
            </div>

            <div class="form-group">
              <label>Correo Electrónico *</label>
              <input type="email" [(ngModel)]="clientForm.email" name="clientEmail" required placeholder="cliente@empresa.com" class="form-control" />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Teléfono *</label>
                <input type="text" [(ngModel)]="clientForm.phone" name="clientPhone" required placeholder="+57 300 000 0000" class="form-control" />
              </div>
              <div class="form-group">
                <label>Contraseña Acceso *</label>
                <input type="password" [(ngModel)]="clientForm.password" name="clientPassword" required placeholder="Mín. 6 caracteres" class="form-control" />
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn-secondary" (click)="closeClientModal()">Cancelar</button>
              <button type="submit" class="btn-primary-blue" [disabled]="isCreatingClient">
                {{ isCreatingClient ? 'Registrando...' : 'Guardar Cliente' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #0f172a;
    }

    .movements-view {
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;
    }

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .title-with-badge {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .page-title {
      font-size: 1.6rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.025em;
      margin: 0;
    }

    .live-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: #eff6ff;
      border: 1px solid #dbeafe;
      color: #2563eb;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 0.25rem 0.6rem;
      border-radius: 9999px;
      letter-spacing: 0.05em;
    }

    .pulse-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #2563eb;
      box-shadow: 0 0 6px rgba(37, 99, 235, 0.8);
    }

    .page-subtitle {
      color: #64748b;
      font-size: 0.88rem;
      margin: 0.35rem 0 0 0;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .btn-action-outline {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      background: #ffffff;
      color: #334155;
      border: 1px solid #cbd5e1;
      padding: 0.55rem 1rem;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.18s ease;
    }

    .btn-action-outline:hover {
      background: #f8fafc;
      border-color: #94a3b8;
    }

    .btn-action-red {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      background: linear-gradient(135deg, #dc2626, #b91c1c);
      color: #ffffff;
      border: none;
      padding: 0.55rem 1.05rem;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 3px 10px rgba(220, 38, 38, 0.3);
      transition: all 0.18s ease;
    }

    .btn-action-red:hover {
      box-shadow: 0 4px 14px rgba(220, 38, 38, 0.45);
      transform: translateY(-1px);
    }

    .btn-action-green {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      background: linear-gradient(135deg, #16a34a, #15803d);
      color: #ffffff;
      border: none;
      padding: 0.55rem 1.05rem;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 3px 10px rgba(22, 163, 74, 0.3);
      transition: all 0.18s ease;
    }

    .btn-action-green:hover {
      box-shadow: 0 4px 14px rgba(22, 163, 74, 0.45);
      transform: translateY(-1px);
    }

    .alert-success {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      color: #047857;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.25rem;
      margin-bottom: 1.5rem;
    }

    .metric-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.15rem 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
    }

    .card-green-border {
      border-left: 4px solid #16a34a;
    }

    .card-red-border {
      border-left: 4px solid #dc2626;
    }

    .metric-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .entry-icon { background: #dcfce7; }
    .exit-icon { background: #fee2e2; }
    .pending-icon { background: #eff6ff; }

    .metric-data {
      display: flex;
      flex-direction: column;
    }

    .metric-label {
      font-size: 0.74rem;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .metric-value {
      font-size: 1.5rem;
      font-weight: 800;
      color: #0f172a;
    }

    .metric-value.text-green { color: #16a34a; }
    .metric-value.text-red { color: #dc2626; }

    .metric-sub {
      font-size: 0.74rem;
      color: #64748b;
      font-weight: 600;
    }

    .filter-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .tabs-container {
      display: flex;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      padding: 0.25rem;
      border-radius: 8px;
      gap: 0.25rem;
    }

    .tab-btn {
      background: transparent;
      border: none;
      padding: 0.45rem 0.95rem;
      font-size: 0.78rem;
      font-weight: 700;
      color: #64748b;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .tab-btn.active {
      background: #2563eb;
      color: #ffffff;
    }

    .tab-btn.tab-red {
      background: #dc2626 !important;
      color: #ffffff !important;
    }

    .tab-btn.tab-green {
      background: #16a34a !important;
      color: #ffffff !important;
    }

    .search-box {
      display: flex;
      align-items: center;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 0.45rem 0.75rem;
      width: 340px;
      gap: 0.5rem;
    }

    .search-icon { color: #94a3b8; }

    .search-input {
      border: none;
      outline: none;
      font-size: 0.8rem;
      color: #0f172a;
      width: 100%;
    }

    .table-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow-x: auto;
      box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
    }

    .movements-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    .movements-table th {
      background: #f8fafc;
      padding: 0.85rem 1rem;
      font-size: 0.68rem;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 0.05em;
      border-bottom: 1px solid #e2e8f0;
    }

    .movements-table td {
      padding: 0.9rem 1rem;
      border-bottom: 1px solid #f1f5f9;
      font-size: 0.82rem;
    }

    /* Filas en ROJO para Pedidos y en VERDE para Ventas */
    .row-pedido-red {
      background-color: rgba(254, 242, 242, 0.55);
      border-left: 4px solid #dc2626;
    }
    .row-pedido-red:hover {
      background-color: rgba(254, 226, 226, 0.65);
    }

    .row-venta-green {
      background-color: rgba(240, 253, 244, 0.55);
      border-left: 4px solid #16a34a;
    }
    .row-venta-green:hover {
      background-color: rgba(220, 252, 231, 0.65);
    }

    .type-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.7rem;
      font-weight: 800;
      padding: 0.25rem 0.65rem;
      border-radius: 6px;
      letter-spacing: 0.04em;
    }

    .type-badge.pedido-red {
      background: #fee2e2;
      color: #dc2626;
      border: 1px solid #fca5a5;
    }

    .type-badge.venta-green {
      background: #dcfce7;
      color: #15803d;
      border: 1px solid #86efac;
    }

    .status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
    }

    .dot-red {
      background: #dc2626;
      box-shadow: 0 0 6px rgba(220, 38, 38, 0.6);
      display: inline-block;
      width: 7px;
      height: 7px;
      border-radius: 50%;
    }

    .dot-green {
      background: #16a34a;
      box-shadow: 0 0 6px rgba(22, 163, 74, 0.6);
      display: inline-block;
      width: 7px;
      height: 7px;
      border-radius: 50%;
    }

    .product-cell {
      display: flex;
      flex-direction: column;
    }

    .product-name {
      font-weight: 700;
      color: #0f172a;
    }

    .product-sku {
      font-size: 0.72rem;
      color: #64748b;
      font-family: monospace;
    }

    .quantity-tag, .subtotal-amount {
      font-weight: 800;
      font-family: monospace;
      font-size: 0.85rem;
    }

    .positive-green { color: #15803d; }
    .negative-red { color: #dc2626; }

    .entity-text { font-weight: 700; color: #1e293b; }
    .doc-code { font-family: monospace; font-size: 0.78rem; font-weight: 700; color: #334155; }
    .date-text { color: #475569; font-size: 0.76rem; font-weight: 500; }

    .status-badge {
      display: inline-flex;
      align-items: center;
      font-size: 0.72rem;
      font-weight: 800;
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .status-pedido-red {
      background: #dc2626;
      color: #ffffff;
      box-shadow: 0 2px 6px rgba(220, 38, 38, 0.25);
    }

    .status-vendido-green {
      background: #16a34a;
      color: #ffffff;
      box-shadow: 0 2px 6px rgba(22, 163, 74, 0.25);
    }

    .actions-cell {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
    }

    .btn-mark-sold {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      background: #16a34a;
      color: #ffffff;
      border: none;
      padding: 0.35rem 0.7rem;
      border-radius: 6px;
      font-size: 0.74rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-mark-sold:hover {
      background: #15803d;
      transform: translateY(-1px);
    }

    .btn-revert-order {
      background: #dcfce7;
      color: #15803d;
      border: 1px solid #86efac;
      padding: 0.3rem 0.6rem;
      border-radius: 6px;
      font-size: 0.72rem;
      font-weight: 700;
      cursor: pointer;
    }

    .btn-revert-order:hover {
      background: #fee2e2;
      color: #dc2626;
      border-color: #fca5a5;
    }

    .btn-delete-row {
      background: #ffffff;
      color: #dc2626;
      border: 1px solid #fecaca;
      padding: 0.32rem 0.45rem;
      border-radius: 6px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .btn-delete-row:hover {
      background: #fef2f2;
    }

    .empty-cell {
      text-align: center;
      padding: 3rem;
      color: #94a3b8;
      font-weight: 600;
    }

    /* Modal Styling */
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(15, 23, 42, 0.55);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999;
      padding: 1rem;
    }

    .modal-card {
      background: #ffffff;
      border-radius: 14px;
      width: 100%;
      max-width: 520px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
      overflow: hidden;
    }

    .modal-header {
      padding: 1.25rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #ffffff;
    }

    .red-header { background: linear-gradient(135deg, #dc2626, #991b1b); }
    .green-header { background: linear-gradient(135deg, #16a34a, #15803d); }
    .blue-header { background: linear-gradient(135deg, #2563eb, #1d4ed8); }

    .modal-header h2 {
      font-size: 1.05rem;
      font-weight: 700;
      margin: 0;
    }

    .btn-close {
      background: transparent;
      border: none;
      color: #ffffff;
      font-size: 1.5rem;
      cursor: pointer;
      line-height: 1;
    }

    .modal-body {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-group label {
      font-size: 0.76rem;
      font-weight: 700;
      color: #475569;
    }

    .btn-inline-link {
      background: none;
      border: none;
      color: #2563eb;
      font-size: 0.74rem;
      font-weight: 700;
      cursor: pointer;
      padding: 0;
    }

    .form-control {
      padding: 0.55rem 0.75rem;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 0.82rem;
      outline: none;
      font-family: inherit;
    }

    .form-control:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
    }

    .state-selector-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }

    .state-option-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      padding: 0.6rem;
      border-radius: 8px;
      font-size: 0.78rem;
      font-weight: 700;
      cursor: pointer;
      background: #f8fafc;
      border: 2px solid #e2e8f0;
      color: #475569;
      transition: all 0.15s ease;
    }

    .state-option-btn.red-option.selected {
      background: #fef2f2;
      border-color: #dc2626;
      color: #dc2626;
    }

    .state-option-btn.green-option.selected {
      background: #f0fdf4;
      border-color: #16a34a;
      color: #15803d;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 0.75rem;
    }

    .btn-secondary {
      background: #f1f5f9;
      color: #475569;
      border: none;
      padding: 0.55rem 1.1rem;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
    }

    .btn-primary-red {
      background: #dc2626;
      color: #ffffff;
      border: none;
      padding: 0.55rem 1.1rem;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
    }

    .btn-primary-green {
      background: #16a34a;
      color: #ffffff;
      border: none;
      padding: 0.55rem 1.1rem;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
    }

    .btn-primary-blue {
      background: #2563eb;
      color: #ffffff;
      border: none;
      padding: 0.55rem 1.1rem;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
    }
  `]
})
export class EnterprisesComponent implements OnInit, OnDestroy {
  private readonly saleService = inject(SaleService);
  private readonly productsService = inject(ProductsService);
  private readonly clientService = inject(ClientService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly ngZone = inject(NgZone);

  private salesSub?: Subscription;
  private productsSub?: Subscription;
  private clientsSub?: Subscription;

  tabs = ['Todos', 'Pedidos (Rojo)', 'Ventas (Verde)'];
  activeTab = 'Todos';
  searchQuery = '';
  successMessage = '';

  sales: SaleDto[] = [];
  products: ProductItem[] = [];
  clients: ClientDto[] = [];

  showOrderModal = false;
  showClientModal = false;
  isSubmitting = false;
  isCreatingClient = false;
  togglingSaleId: number | null = null;

  orderForm = {
    clientId: 0,
    productId: '',
    quantity: 1,
    paymentMethod: 'Cash',
    isPaid: false
  };

  clientForm = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: ''
  };

  ngOnInit(): void {
    this.loadRealData();
  }

  ngOnDestroy(): void {
    this.salesSub?.unsubscribe();
    this.productsSub?.unsubscribe();
    this.clientsSub?.unsubscribe();
  }

  loadRealData(): void {
    this.salesSub = this.saleService.sales$.subscribe((list) => {
      this.ngZone.run(() => {
        this.sales = [...(list || [])];
        this.cdr.detectChanges();
      });
    });

    this.productsSub = this.productsService.products$.subscribe((list) => {
      this.ngZone.run(() => {
        this.products = [...(list || [])];
        this.cdr.detectChanges();
      });
    });

    this.clientsSub = this.clientService.clients$.subscribe((list) => {
      this.ngZone.run(() => {
        this.clients = [...(list || [])];
        if (this.clients.length > 0 && !this.orderForm.clientId) {
          this.orderForm.clientId = this.clients[0].id;
        }
        this.cdr.detectChanges();
      });
    });

    this.saleService.getSales().subscribe();
    this.productsService.getProducts().subscribe();
    this.clientService.getClients().subscribe();
  }

  /**
   * Transforma las ventas/pedidos de la base de datos en filas de movimientos.
   * Si una orden tiene varios productos (Details), muestra cada producto con su estado:
   * - isPaid === false -> PEDIDO (En Rojo)
   * - isPaid === true  -> VENTA / Vendido (En Verde)
   */
  get movementRows(): MovementRow[] {
    const rows: MovementRow[] = [];
    for (const sale of this.sales) {
      if (sale.details && sale.details.length > 0) {
        for (const det of sale.details) {
          const prod = this.products.find(p => p.id === det.productId || p.sku === det.productSku);
          rows.push({
            saleId: sale.id,
            detailId: det.id,
            productId: det.productId,
            sku: det.productSku || prod?.sku || 'S/N',
            productName: det.productName || prod?.name || 'Producto',
            quantity: det.quantity,
            unitPrice: det.unitPrice,
            subtotal: det.subtotal,
            totalSaleAmount: sale.totalAmount,
            location: prod?.location || 'Almacén Central',
            clientId: sale.clientId,
            clientName: sale.clientName,
            paymentMethod: sale.paymentMethod,
            referenceDoc: sale.isPaid ? `VTA-${sale.id}` : `PED-${sale.id}`,
            operator: sale.scheduledBy || 'Administrador',
            createdAt: sale.createdAt,
            isPaid: sale.isPaid,
            typeLabel: sale.isPaid ? 'VENTA' : 'PEDIDO',
            statusLabel: sale.isPaid ? 'Vendido' : 'Pedido'
          });
        }
      } else {
        rows.push({
          saleId: sale.id,
          detailId: 0,
          productId: '',
          sku: `ORD-${sale.id}`,
          productName: `Orden #${sale.id}`,
          quantity: sale.quantity,
          unitPrice: sale.quantity > 0 ? sale.totalAmount / sale.quantity : sale.totalAmount,
          subtotal: sale.totalAmount,
          totalSaleAmount: sale.totalAmount,
          location: 'Almacén Central',
          clientId: sale.clientId,
          clientName: sale.clientName,
          paymentMethod: sale.paymentMethod,
          referenceDoc: sale.isPaid ? `VTA-${sale.id}` : `PED-${sale.id}`,
          operator: sale.scheduledBy || 'Administrador',
          createdAt: sale.createdAt,
          isPaid: sale.isPaid,
          typeLabel: sale.isPaid ? 'VENTA' : 'PEDIDO',
          statusLabel: sale.isPaid ? 'Vendido' : 'Pedido'
        });
      }
    }
    return rows;
  }

  get totalSalesCount(): number {
    return this.sales.filter(s => s.isPaid).length;
  }

  get totalSalesRevenue(): number {
    return this.sales.filter(s => s.isPaid).reduce((sum, s) => sum + (s.totalAmount || 0), 0);
  }

  get totalOrdersCount(): number {
    return this.sales.filter(s => !s.isPaid).length;
  }

  get totalOrdersPendingAmount(): number {
    return this.sales.filter(s => !s.isPaid).reduce((sum, s) => sum + (s.totalAmount || 0), 0);
  }

  get totalUnitsMoved(): number {
    return this.sales.reduce((sum, s) => sum + (s.quantity || 0), 0);
  }

  get filteredMovements(): MovementRow[] {
    return this.movementRows.filter(m => {
      const matchesTab =
        this.activeTab === 'Todos' ||
        (this.activeTab === 'Pedidos (Rojo)' && !m.isPaid) ||
        (this.activeTab === 'Ventas (Verde)' && m.isPaid);

      const q = this.searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        m.productName.toLowerCase().includes(q) ||
        m.sku.toLowerCase().includes(q) ||
        m.clientName.toLowerCase().includes(q) ||
        m.referenceDoc.toLowerCase().includes(q);

      return matchesTab && matchesSearch;
    });
  }

  formatPayMethod(method: string): string {
    switch (method) {
      case 'Cash': return 'Efectivo';
      case 'BankTransfer': return 'Transferencia';
      case 'CreditCard': return 'T. Crédito';
      case 'DebitCard': return 'T. Débito';
      default: return method || 'Efectivo';
    }
  }

  openOrderModal(isPaid: boolean): void {
    this.orderForm = {
      clientId: this.clients.length > 0 ? this.clients[0].id : 0,
      productId: this.products.length > 0 ? this.products[0].id : '',
      quantity: 1,
      paymentMethod: 'Cash',
      isPaid
    };
    this.showOrderModal = true;
  }

  closeModals(): void {
    this.showOrderModal = false;
  }

  openClientModal(): void {
    this.clientForm = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: ''
    };
    this.showClientModal = true;
  }

  closeClientModal(): void {
    this.showClientModal = false;
  }

  onProductSelectChange(): void {
    this.cdr.detectChanges();
  }

  saveNewClient(): void {
    if (!this.clientForm.firstName.trim() || !this.clientForm.lastName.trim() || !this.clientForm.email.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Datos incompletos',
        text: 'Complete nombre, apellido y correo del cliente.'
      });
      return;
    }

    this.isCreatingClient = true;
    this.clientService.createClient({
      firstName: this.clientForm.firstName.trim(),
      lastName: this.clientForm.lastName.trim(),
      email: this.clientForm.email.trim(),
      phone: this.clientForm.phone.trim() || '0000000000',
      password: this.clientForm.password.trim() || 'Cliente123*'
    }).subscribe({
      next: (created) => {
        this.isCreatingClient = false;
        this.orderForm.clientId = created.id;
        this.closeClientModal();
        this.showNotification(`Cliente "${created.fullName}" registrado en la base de datos.`);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isCreatingClient = false;
        Swal.fire({
          icon: 'error',
          title: 'Error al crear cliente',
          text: err?.error?.message || 'No se pudo registrar el cliente en la base de datos.'
        });
      }
    });
  }

  saveOrderOrSale(): void {
    if (!this.orderForm.clientId) {
      Swal.fire({
        icon: 'warning',
        title: 'Seleccione un cliente',
        text: 'Debe seleccionar o crear un cliente antes de registrar el movimiento.'
      });
      return;
    }

    if (!this.orderForm.productId) {
      Swal.fire({
        icon: 'warning',
        title: 'Seleccione un producto',
        text: 'Debe seleccionar un producto real del inventario.'
      });
      return;
    }

    if (!this.orderForm.quantity || this.orderForm.quantity < 1) {
      Swal.fire({
        icon: 'warning',
        title: 'Cantidad inválida',
        text: 'La cantidad debe ser al menos 1 unidad.'
      });
      return;
    }

    const payload: CreateSaleDto = {
      clientId: Number(this.orderForm.clientId),
      items: [
        {
          productId: this.orderForm.productId,
          quantity: Number(this.orderForm.quantity)
        }
      ],
      paymentMethod: this.orderForm.paymentMethod,
      isPaid: this.orderForm.isPaid
    };

    this.isSubmitting = true;
    this.saleService.createSale(payload).subscribe({
      next: (created) => {
        this.isSubmitting = false;
        this.closeModals();
        const label = created.isPaid ? 'Venta (Verde - Vendido)' : 'Pedido (Rojo - Pendiente)';
        this.showNotification(`${label} #${created.id} registrado en la base de datos.`);

        if (created.stockAlerts && created.stockAlerts.length > 0) {
          Swal.fire({
            icon: 'warning',
            title: 'Alerta Dinámica de Inventario',
            html: created.stockAlerts.map(a => `<div style="margin-bottom:6px;">${a}</div>`).join(''),
            confirmButtonColor: '#dc2626'
          });
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isSubmitting = false;
        Swal.fire({
          icon: 'error',
          title: 'No se pudo registrar',
          text: err?.error?.message || 'Verifique el stock disponible del producto en la base de datos.'
        });
      }
    });
  }

  /**
   * Cambia un Pedido en ROJO a Vendido en VERDE (o viceversa) en la base de datos.
   */
  onToggleSaleStatus(row: MovementRow): void {
    this.togglingSaleId = row.saleId;
    this.saleService.togglePaid(row.saleId).subscribe({
      next: (updated) => {
        this.togglingSaleId = null;
        if (updated.isPaid) {
          this.showNotification(`¡El Pedido #${updated.id} (${row.productName}) cambió a VENDIDO (Verde)!`);
        } else {
          this.showNotification(`La Venta #${updated.id} cambió nuevamente a PEDIDO pendiente (Rojo).`);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.togglingSaleId = null;
        Swal.fire({
          icon: 'error',
          title: 'Error al actualizar estado',
          text: err?.error?.message || 'No se pudo cambiar el estado en la base de datos.'
        });
      }
    });
  }

  async onDeleteSale(row: MovementRow): Promise<void> {
    const confirm = await Swal.fire({
      title: `¿Eliminar ${row.isPaid ? 'Venta' : 'Pedido'} #${row.saleId}?`,
      text: `Se devolverán ${row.quantity} unidades de "${row.productName}" al stock del inventario.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, eliminar y restaurar stock',
      cancelButtonText: 'Cancelar'
    });

    if (!confirm.isConfirmed) return;

    this.saleService.deleteSale(row.saleId).subscribe({
      next: () => {
        this.showNotification(`Registro #${row.saleId} eliminado y stock restaurado en la base de datos.`);
        this.cdr.detectChanges();
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error al eliminar',
          text: err?.error?.message || 'No se pudo eliminar el registro.'
        });
      }
    });
  }

  private showNotification(msg: string): void {
    this.successMessage = msg;
    setTimeout(() => {
      this.successMessage = '';
      this.cdr.detectChanges();
    }, 4500);
  }
}
