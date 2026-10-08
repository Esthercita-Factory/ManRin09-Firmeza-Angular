import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface MovementItem {
  id: string;
  sku: string;
  product: string;
  type: 'ENTRADA' | 'SALIDA' | 'TRASPASO';
  quantity: number;
  unit: string;
  location: string;
  targetOrSource: string;
  referenceDoc: string;
  operator: string;
  date: string;
  status: 'Completado' | 'En Tránsito' | 'En Verificación';
}

@Component({
  selector: 'app-enterprises',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="movements-view">
      <!-- 1. Encabezado Principal de Movimientos -->
      <header class="header-section">
        <div class="header-titles">
          <div class="title-with-badge">
            <h1 class="page-title">Movimientos y Pedidos</h1>
            <span class="live-badge">
              <span class="pulse-dot"></span>
              GESTIÓN OPERATIVA
            </span>
          </div>
          <p class="page-subtitle">Registro centralizado de entradas, salidas y despachos de almacén.</p>
        </div>

        <div class="header-actions">
          <!-- Botón Nueva Salida -->
          <button class="btn-action-dark" (click)="openExitModal()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="7" y1="17" x2="17" y2="7"></line>
              <polyline points="7 7 17 7 17 17"></polyline>
            </svg>
            <span>Nueva Salida</span>
          </button>

          <!-- Botón Registrar Entrada -->
          <button class="btn-action-blue" (click)="openEntryModal()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Registrar Entrada</span>
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

      <!-- 3. Tarjetas Resumen (KPIs) -->
      <section class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon entry-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.2">
              <polyline points="12 19 12 5 5 12"></polyline>
              <polyline points="19 12 12 5 5 12"></polyline>
            </svg>
          </div>
          <div class="metric-data">
            <span class="metric-label">Total Entradas</span>
            <span class="metric-value">{{ totalEntries }}</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon exit-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2.2">
              <polyline points="12 5 12 19 19 12"></polyline>
              <polyline points="5 12 12 19 19 12"></polyline>
            </svg>
          </div>
          <div class="metric-data">
            <span class="metric-label">Total Salidas</span>
            <span class="metric-value">{{ totalExits }}</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon pending-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2.2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div class="metric-data">
            <span class="metric-label">En Verificación</span>
            <span class="metric-value">{{ totalPending }}</span>
          </div>
        </div>
      </section>

      <!-- 4. Filtros y Búsqueda -->
      <section class="filter-bar">
        <div class="tabs-container">
          <button 
            *ngFor="let tab of tabs" 
            [class.active]="activeTab === tab" 
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
            placeholder="Buscar por SKU, producto o documento..." 
            class="search-input"
          />
        </div>
      </section>

      <!-- 5. Tabla de Movimientos -->
      <div class="table-card">
        <table class="movements-table">
          <thead>
            <tr>
              <th>TIPO</th>
              <th>CÓDIGO / PRODUCTO</th>
              <th>CANTIDAD</th>
              <th>ALMACÉN / UBICACIÓN</th>
              <th>PROVEEDOR / CLIENTE</th>
              <th>DOCUMENTO</th>
              <th>FECHA Y HORA</th>
              <th>ESTADO</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of filteredMovements">
              <td>
                <span class="type-badge" [ngClass]="item.type.toLowerCase()">
                  {{ item.type }}
                </span>
              </td>
              <td>
                <div class="product-cell">
                  <span class="product-name">{{ item.product }}</span>
                  <span class="product-sku">SKU: {{ item.sku }}</span>
                </div>
              </td>
              <td>
                <span class="quantity-tag" [class.positive]="item.type === 'ENTRADA'" [class.negative]="item.type === 'SALIDA'">
                  {{ item.type === 'ENTRADA' ? '+' : '-' }}{{ item.quantity }} {{ item.unit }}
                </span>
              </td>
              <td>
                <span class="location-chip">{{ item.location }}</span>
              </td>
              <td>
                <span class="entity-text">{{ item.targetOrSource }}</span>
              </td>
              <td>
                <span class="doc-code">{{ item.referenceDoc }}</span>
              </td>
              <td>
                <span class="date-text">{{ item.date }}</span>
              </td>
              <td>
                <span class="status-badge" [ngClass]="item.status.toLowerCase().replace(' ', '-')">
                  {{ item.status }}
                </span>
              </td>
            </tr>
            <tr *ngIf="filteredMovements.length === 0">
              <td colspan="8" class="empty-cell">
                No se encontraron movimientos registrados con el filtro actual.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 6. MODAL: Registrar Entrada -->
      <div *ngIf="showEntryModal" class="modal-overlay" (click)="closeModals()">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <div class="modal-header entry-header">
            <h2>Registrar Entrada de Material</h2>
            <button class="btn-close" (click)="closeModals()">×</button>
          </div>

          <form (ngSubmit)="saveEntry()" class="modal-body">
            <div class="form-group">
              <label>Producto / SKU *</label>
              <input type="text" [(ngModel)]="entryForm.product" name="entryProduct" required placeholder="Ej: SEN-IR-5001 Sensor Infrarrojo" class="form-control" />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Cantidad *</label>
                <input type="number" [(ngModel)]="entryForm.quantity" name="entryQty" required min="1" class="form-control" />
              </div>
              <div class="form-group">
                <label>Unidad</label>

                <select [(ngModel)]="entryForm.unit" name="entryUnit" class="form-control">
                  <option value="uds">Unidades (uds)</option>
                  <option value="cajas">Cajas</option>
                  <option value="kg">Kilogramos (kg)</option>
                  <option value="lts">Litros (lts)</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Almacén / Pasillo Destino *</label>
                <input type="text" [(ngModel)]="entryForm.location" name="entryLocation" required placeholder="Ej: Nave A - Pasillo B-02" class="form-control" />
              </div>
              <div class="form-group">
                <label>Proveedor / Origen *</label>
                <input type="text" [(ngModel)]="entryForm.provider" name="entryProvider" required placeholder="Ej: Logística Global S.A." class="form-control" />
              </div>
            </div>

            <div class="form-group">
              <label>Número de Lote / Guía de Recepción</label>
              <input type="text" [(ngModel)]="entryForm.doc" name="entryDoc" placeholder="Ej: REC-2026-881" class="form-control" />
            </div>

            <div class="modal-footer">
              <button type="button" class="btn-secondary" (click)="closeModals()">Cancelar</button>
              <button type="submit" class="btn-primary-blue">Guardar Entrada</button>
            </div>
          </form>
        </div>
      </div>

      <!-- 7. MODAL: Nueva Salida -->
      <div *ngIf="showExitModal" class="modal-overlay" (click)="closeModals()">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <div class="modal-header exit-header">
            <h2>Registrar Salida de Material</h2>
            <button class="btn-close" (click)="closeModals()">×</button>
          </div>

          <form (ngSubmit)="saveExit()" class="modal-body">
            <div class="form-group">
              <label>Producto / SKU *</label>
              <input type="text" [(ngModel)]="exitForm.product" name="exitProduct" required placeholder="Ej: PWR-24V-10A Fuente de Alimentación" class="form-control" />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Cantidad a Despachar *</label>
                <input type="number" [(ngModel)]="exitForm.quantity" name="exitQty" required min="1" class="form-control" />
              </div>
              <div class="form-group">
                <label>Unidad</label>
                <select [(ngModel)]="exitForm.unit" name="exitUnit" class="form-control">
                  <option value="uds">Unidades (uds)</option>
                  <option value="cajas">Cajas</option>
                  <option value="kg">Kilogramos (kg)</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Almacén Origen *</label>
                <input type="text" [(ngModel)]="exitForm.location" name="exitLocation" required placeholder="Ej: Nave A - Pasillo D-09" class="form-control" />
              </div>
              <div class="form-group">
                <label>Cliente / Destino *</label>
                <input type="text" [(ngModel)]="exitForm.client" name="exitClient" required placeholder="Ej: Distribuidora Andina S.A.S." class="form-control" />
              </div>
            </div>

            <div class="form-group">
              <label>Orden de Despacho / Pedido</label>
              <input type="text" [(ngModel)]="exitForm.doc" name="exitDoc" placeholder="Ej: ORD-4412" class="form-control" />
            </div>

            <div class="modal-footer">
              <button type="button" class="btn-secondary" (click)="closeModals()">Cancelar</button>
              <button type="submit" class="btn-primary-dark">Registrar Salida</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .movements-view {
      padding: 1.75rem 2rem;
      max-width: 1400px;
      margin: 0 auto;
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
    }

    .btn-action-dark {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      background: #0f172a;
      color: #ffffff;
      border: none;
      padding: 0.55rem 1.05rem;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(15, 23, 42, 0.15);
      transition: all 0.18s ease;
    }

    .btn-action-dark:hover {
      background: #1e293b;
      transform: translateY(-1px);
    }

    .btn-action-blue {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      color: #ffffff;
      border: none;
      padding: 0.55rem 1.05rem;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 3px 10px rgba(37, 99, 235, 0.3);
      transition: all 0.18s ease;
    }

    .btn-action-blue:hover {
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
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

    .metric-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .entry-icon { background: #f0fdf4; }
    .exit-icon { background: #fef2f2; }
    .pending-icon { background: #fffbeb; }

    .metric-data {
      display: flex;
      flex-direction: column;
    }

    .metric-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .metric-value {
      font-size: 1.45rem;
      font-weight: 800;
      color: #0f172a;
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
      padding: 0.4rem 0.9rem;
      font-size: 0.78rem;
      font-weight: 600;
      color: #64748b;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .tab-btn.active {
      background: #2563eb;
      color: #ffffff;
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
      padding: 0.95rem 1rem;
      border-bottom: 1px solid #f1f5f9;
      font-size: 0.82rem;
    }

    .type-badge {
      display: inline-block;
      font-size: 0.68rem;
      font-weight: 800;
      padding: 0.2rem 0.55rem;
      border-radius: 6px;
      letter-spacing: 0.04em;
    }

    .type-badge.entrada { background: #dcfce7; color: #15803d; }
    .type-badge.salida { background: #fee2e2; color: #b91c1c; }
    .type-badge.traspaso { background: #e0f2fe; color: #0369a1; }

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

    .quantity-tag {
      font-weight: 700;
    }
    .quantity-tag.positive { color: #16a34a; }
    .quantity-tag.negative { color: #dc2626; }

    .location-chip {
      background: #f1f5f9;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      color: #334155;
    }

    .entity-text { font-weight: 500; color: #334155; }
    .doc-code { font-family: monospace; font-size: 0.76rem; color: #64748b; }
    .date-text { color: #64748b; font-size: 0.76rem; }

    .status-badge {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.2rem 0.55rem;
      border-radius: 9999px;
    }
    .status-badge.completado { background: #ecfdf5; color: #059669; }
    .status-badge.en-tránsito { background: #fffbeb; color: #d97706; }
    .status-badge.en-verificación { background: #f1f5f9; color: #475569; }

    .empty-cell {
      text-align: center;
      padding: 3rem;
      color: #94a3b8;
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

    .entry-header { background: linear-gradient(135deg, #2563eb, #1d4ed8); }
    .exit-header { background: linear-gradient(135deg, #1e293b, #0f172a); }

    .modal-header h2 {
      font-size: 1.1rem;
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

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1rem;
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

    .btn-primary-blue {
      background: #2563eb;
      color: #ffffff;
      border: none;
      padding: 0.55rem 1.1rem;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
    }

    .btn-primary-dark {
      background: #0f172a;
      color: #ffffff;
      border: none;
      padding: 0.55rem 1.1rem;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
    }
  `]
})
export class EnterprisesComponent implements OnInit {
  tabs = ['Todos', 'Entradas', 'Salidas', 'Traspasos'];
  activeTab = 'Todos';
  searchQuery = '';
  successMessage = '';

  showEntryModal = false;
  showExitModal = false;

  entryForm = {
    product: '',
    quantity: 100,
    unit: 'uds',
    location: 'Nave A - Pasillo A-01',
    provider: 'Logística Global S.A.',
    doc: 'REC-2026-901'
  };

  exitForm = {
    product: '',
    quantity: 25,
    unit: 'uds',
    location: 'Nave A - Pasillo D-09',
    client: 'Distribuidora Andina S.A.S.',
    doc: 'ORD-2026-4412'
  };

  movements: MovementItem[] = [
    {
      id: '1',
      sku: 'SEN-IR-5001',
      product: 'Sensor Infrarrojo Proximidad',
      type: 'ENTRADA',
      quantity: 450,
      unit: 'uds',
      location: 'Nave A (A-02-N1)',
      targetOrSource: 'Logística Global S.A.',
      referenceDoc: 'REC-2026-9822',
      operator: 'Marcos Rivas',
      date: 'Hoy, 10:42 AM',
      status: 'Completado'
    },
    {
      id: '2',
      sku: 'PWR-24V-10A',
      product: 'Fuente de Alimentación 24V 10A',
      type: 'SALIDA',
      quantity: 35,
      unit: 'uds',
      location: 'Nave A (D-09-N3)',
      targetOrSource: 'Distribuidora Andina S.A.S.',
      referenceDoc: 'ORD-4410',
      operator: 'Lucía Castro',
      date: 'Hoy, 09:58 AM',
      status: 'Completado'
    },
    {
      id: '3',
      sku: 'MOD-BLE-05',
      product: 'Módulo Bluetooth 5.0 Low Energy',
      type: 'TRASPASO',
      quantity: 120,
      unit: 'uds',
      location: 'B-01 -> C-04',
      targetOrSource: 'Transferencia Interna',
      referenceDoc: 'TRP-1092',
      operator: 'Esteban Gil',
      date: 'Hoy, 09:15 AM',
      status: 'En Tránsito'
    },
    {
      id: '4',
      sku: 'ALU-4040-2M',
      product: 'Perfil Aluminio Estructural 40x40',
      type: 'SALIDA',
      quantity: 80,
      unit: 'barras',
      location: 'Nave B (F-01-N0)',
      targetOrSource: 'Industrias Metalmecánicas',
      referenceDoc: 'ORD-4409',
      operator: 'Lucía Castro',
      date: 'Hoy, 08:30 AM',
      status: 'Completado'
    },
    {
      id: '5',
      sku: 'CON-M12-5P',
      product: 'Conector Industrial M12 5-Pines',
      type: 'ENTRADA',
      quantity: 600,
      unit: 'uds',
      location: 'Nave C (Z-CUAR-01)',
      targetOrSource: 'Electrónica Central S.A.',
      referenceDoc: 'REC-2026-9780',
      operator: 'Marcos Rivas',
      date: 'Ayer, 18:20 PM',
      status: 'En Verificación'
    }
  ];

  ngOnInit(): void {}

  get totalEntries(): number {
    return this.movements.filter(m => m.type === 'ENTRADA').length;
  }

  get totalExits(): number {
    return this.movements.filter(m => m.type === 'SALIDA').length;
  }

  get totalPending(): number {
    return this.movements.filter(m => m.status === 'En Verificación' || m.status === 'En Tránsito').length;
  }

  get filteredMovements(): MovementItem[] {
    return this.movements.filter(m => {
      const matchesTab = 
        this.activeTab === 'Todos' ||
        (this.activeTab === 'Entradas' && m.type === 'ENTRADA') ||
        (this.activeTab === 'Salidas' && m.type === 'SALIDA') ||
        (this.activeTab === 'Traspasos' && m.type === 'TRASPASO');

      const q = this.searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        m.product.toLowerCase().includes(q) ||
        m.sku.toLowerCase().includes(q) ||
        m.targetOrSource.toLowerCase().includes(q) ||
        m.referenceDoc.toLowerCase().includes(q);

      return matchesTab && matchesSearch;
    });
  }

  openEntryModal(): void {
    this.showEntryModal = true;
  }

  openExitModal(): void {
    this.showExitModal = true;
  }

  closeModals(): void {
    this.showEntryModal = false;
    this.showExitModal = false;
  }

  saveEntry(): void {
    if (!this.entryForm.product) return;

    const newMovement: MovementItem = {
      id: Date.now().toString(),
      sku: 'SKU-' + Math.floor(1000 + Math.random() * 9000),
      product: this.entryForm.product,
      type: 'ENTRADA',
      quantity: this.entryForm.quantity || 1,
      unit: this.entryForm.unit,
      location: this.entryForm.location || 'Nave Central',
      targetOrSource: this.entryForm.provider || 'Proveedor Registrado',
      referenceDoc: this.entryForm.doc || 'REC-' + Math.floor(1000 + Math.random() * 9000),
      operator: 'Administrador Actual',
      date: 'Hace un momento',
      status: 'Completado'
    };

    this.movements.unshift(newMovement);
    this.closeModals();
    this.showNotification(`Entrada de "${this.entryForm.product}" registrada correctamente.`);
    this.entryForm.product = '';
  }

  saveExit(): void {
    if (!this.exitForm.product) return;

    const newMovement: MovementItem = {
      id: Date.now().toString(),
      sku: 'SKU-' + Math.floor(1000 + Math.random() * 9000),
      product: this.exitForm.product,
      type: 'SALIDA',
      quantity: this.exitForm.quantity || 1,
      unit: this.exitForm.unit,
      location: this.exitForm.location || 'Nave Central',
      targetOrSource: this.exitForm.client || 'Cliente Corporativo',
      referenceDoc: this.exitForm.doc || 'ORD-' + Math.floor(1000 + Math.random() * 9000),
      operator: 'Administrador Actual',
      date: 'Hace un momento',
      status: 'Completado'
    };

    this.movements.unshift(newMovement);
    this.closeModals();
    this.showNotification(`Salida de "${this.exitForm.product}" registrada con éxito.`);
    this.exitForm.product = '';
  }

  private showNotification(msg: string): void {
    this.successMessage = msg;
    setTimeout(() => {
      this.successMessage = '';
    }, 4000);
  }
}
