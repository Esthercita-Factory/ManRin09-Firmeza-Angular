import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ClientService, ClientDto } from '../../Services/client.service';
import { SaleService, SaleDto } from '../../Services/sale.service';
import { ProductsService, ProductItem } from '../../Services/products.service';

export type ClientItem = ClientDto;

interface ProductCatalogItem {
  id: string;
  sku: string;
  brand: string;
  name: string;
  price: number;
  priceUnit: string;
  bulkInfo: string;
  stockText: string;
  badge?: string;
  badgeType?: 'frequent' | 'express' | 'new';
  quantity: number;
  category: string;
  svgType: string;
}

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="fz-viewport">
      <!-- 1. Barra Superior del Portal Omnicanal -->
      <header class="portal-topbar">
        <div class="topbar-left">
          <div class="portal-brand">
            <span class="portal-logo-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
            </span>
            <div class="brand-titles">
              <span class="brand-name">FIRMEZA</span>
              <span class="brand-tag">PORTAL CLIENTES & OMNICANAL</span>
            </div>
          </div>

          <div class="store-selector">
            <svg class="icon-store" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <div class="store-info">
              <span class="store-lbl">Base de Datos Activa:</span>
              <span class="store-val">{{ clients.length }} Clientes Registrados</span>
            </div>
          </div>
        </div>

        <div class="topbar-center">
          <div class="portal-search-bar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              [(ngModel)]="globalSearchQuery" 
              placeholder="Buscar por cliente, folio, SKU..." 
              class="portal-search-input"
            />
          </div>
        </div>

        <div class="topbar-right">
          <div class="corporate-badge">
            <svg class="corp-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
              <circle cx="12" cy="8" r="7"></circle>
              <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
            </svg>
            <div class="corp-details">
              <div class="corp-header-row">
                <span class="corp-name">{{ activeClient ? activeClient.fullName : 'Sin clientes registrados' }}</span>
                <span class="corp-tag">BD</span>
              </div>
              <span class="corp-rut">{{ activeClient ? activeClient.email : '0 clientes en base de datos' }}</span>
            </div>
          </div>
        </div>
      </header>

      <!-- Sub-navegación de Pestañas -->
      <nav class="portal-subnav">
        <button 
          *ngFor="let tab of navTabs" 
          [class.active]="activeNavTab === tab" 
          (click)="activeNavTab = tab" 
          class="subnav-tab">
          {{ tab }}
        </button>
      </nav>

      <!-- 2. Tarjeta Principal de Bienvenida y Métricas de Cuenta (Datos Reales o 0) -->
      <section class="welcome-card">
        <div class="welcome-top">
          <div class="client-identity">
            <div class="auth-pill">
              <span class="dot-green"></span>
              <span>CONECTADO A /api/clients Y /api/sale • {{ clients.length }} CLIENTES</span>
            </div>
            <h1 class="client-greeting">
              {{ activeClient ? ('Cliente: ' + activeClient.fullName) : 'Clientes Registrados: 0' }}
            </h1>
            <div class="client-enterprise-info">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2">
                <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
              </svg>
              <span *ngIf="activeClient">Correo: <strong>{{ activeClient.email }}</strong> • Teléfono: <strong>{{ activeClient.phone || 'N/A' }}</strong></span>
              <span *ngIf="!activeClient">No hay clientes registrados aún en la base de datos.</span>
            </div>
          </div>

          <div class="welcome-quick-actions">
            <a routerLink="/app/enterprises" class="btn-welcome-primary" style="text-decoration: none;">
              <span>Ir a Movimientos y Pedidos →</span>
            </a>
          </div>
        </div>

        <!-- 4 Métricas de Resumen del Cliente (0 si no hay datos en BD) -->
        <div class="metrics-grid">
          <!-- Métrica 1: Facturación Total -->
          <div class="metric-card">
            <div class="metric-header">
              <span class="metric-title">Facturación Ventas (Verde)</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2">
                <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                <line x1="2" y1="10" x2="22" y2="10"></line>
              </svg>
            </div>
            <div class="metric-value">
              <span style="color: #16a34a;">\${{ totalPaidRevenue | number:'1.2-2' }}</span>
            </div>
            <div class="metric-caption text-green">
              <span>{{ paidSalesCount }} ventas cobradas en BD</span>
            </div>
          </div>

          <!-- Métrica 2: Pedidos Pendientes (Rojo) -->
          <div class="metric-card">
            <div class="metric-header">
              <span class="metric-title">Pedidos Pendientes (Rojo)</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div class="metric-value">
              <span style="color: #dc2626;">{{ pendingOrdersCount }} Pedidos</span>
            </div>
            <div class="metric-caption" style="color: #dc2626; font-weight: 600;">
              <span>\${{ totalPendingAmount | number:'1.2-2' }} pendientes de pago</span>
            </div>
          </div>

          <!-- Métrica 3: Total Clientes en BD -->
          <div class="metric-card">
            <div class="metric-header">
              <span class="metric-title">Clientes en Base de Datos</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
                <circle cx="12" cy="8" r="7"></circle>
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
              </svg>
            </div>
            <div class="metric-value">
              <span>{{ clients.length }} Clientes</span>
            </div>
            <div class="metric-caption text-blue">
              <span>{{ activeClientsCount }} clientes activos</span>
            </div>
          </div>

          <!-- Métrica 4: Unidades Adquiridas -->
          <div class="metric-card">
            <div class="metric-header">
              <span class="metric-title">Total Unidades Movilizadas</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </div>
            <div class="metric-value">
              <span>{{ totalUnitsPurchased | number }}</span>
              <span class="metric-unit">UDS</span>
            </div>
            <div class="metric-caption text-muted">
              <span>En {{ sales.length }} órdenes registradas</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. Sección: Mis Compras y Pedidos Reales en Base de Datos -->
      <section class="purchases-section">
        <div class="section-header-row">
          <div>
            <div class="section-tag">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.5">
                <path d="m7 16-4-4 4-4"></path>
                <path d="M3 12h18"></path>
                <path d="m17 8 4 4-4 4"></path>
              </svg>
              <span>HISTORIAL REAL DESDE /api/sale</span>
            </div>
            <h2 class="section-title">Pedidos (Rojo) y Ventas (Verde) Registrados</h2>
          </div>

          <div class="purchases-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              [(ngModel)]="purchaseFilterText" 
              placeholder="Filtrar por cliente, folio, SKU..." 
              class="table-search-input"
            />
          </div>
        </div>

        <!-- Filtros de Compra -->
        <div class="purchases-filter-tabs">
          <button 
            [class.active]="selectedPurchaseTab === 'all'"
            (click)="selectedPurchaseTab = 'all'" 
            class="purchase-tab-btn">
            Todos ({{ sales.length }})
          </button>
          <button 
            [class.active]="selectedPurchaseTab === 'orders'"
            (click)="selectedPurchaseTab = 'orders'" 
            class="purchase-tab-btn">
            Pedidos en Rojo ({{ pendingOrdersCount }})
          </button>
          <button 
            [class.active]="selectedPurchaseTab === 'sales'"
            (click)="selectedPurchaseTab = 'sales'" 
            class="purchase-tab-btn">
            Ventas en Verde ({{ paidSalesCount }})
          </button>
        </div>

        <!-- Tarjetas de Órdenes Reales desde Base de Datos -->
        <div class="orders-list">
          <div *ngIf="filteredSalesList.length === 0" style="padding: 2rem; text-align: center; color: #64748b; border: 1px dashed #cbd5e1; border-radius: 8px;">
            0 pedidos o ventas registrados en la base de datos.
          </div>

          <div
            class="order-card"
            *ngFor="let s of filteredSalesList"
            [style.border-left]="s.isPaid ? '4px solid #16a34a' : '4px solid #dc2626'"
          >
            <div class="order-card-header">
              <div class="order-type-badge">
                <span [style.background]="s.isPaid ? '#16a34a' : '#dc2626'" style="width: 8px; height: 8px; border-radius: 50%; display: inline-block;"></span>
                <strong [style.color]="s.isPaid ? '#15803d' : '#dc2626'">
                  {{ s.isPaid ? 'VENTA COMPLETADA (VENDIDO)' : 'PEDIDO PENDIENTE' }}
                </strong>
                <span class="order-code">#{{ s.isPaid ? 'VTA' : 'PED' }}-{{ s.id }}</span>
                <span class="order-date">• {{ s.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
              <div class="order-location-tag">
                <span>Cliente: <strong>{{ s.clientName }}</strong> • Registrado por: {{ s.scheduledBy }}</span>
              </div>
            </div>

            <div class="order-items-row" *ngIf="s.details && s.details.length > 0">
              <div class="mini-product-card" *ngFor="let det of s.details">
                <div class="mini-product-details">
                  <span class="mp-title">{{ det.productName }}</span>
                  <span class="mp-sku">SKU: {{ det.productSku }} • {{ det.quantity }} uds x \${{ det.unitPrice | number:'1.2-2' }}</span>
                  <span class="mp-price" [style.color]="s.isPaid ? '#15803d' : '#dc2626'">\${{ det.subtotal | number:'1.2-2' }}</span>
                </div>
              </div>
            </div>

            <div class="order-card-footer">
              <div class="order-payment-info">
                <span class="pay-lbl">Monto Total ({{ s.quantity }} uds):</span>
                <span class="pay-amount" [style.color]="s.isPaid ? '#15803d' : '#dc2626'">\${{ s.totalAmount | number:'1.2-2' }}</span>
                <span class="pay-method">| Método: {{ s.paymentMethod }}</span>
              </div>
              <div class="order-footer-actions">
                <a routerLink="/app/enterprises" class="btn-repurchase-blue" style="text-decoration: none;">
                  <span>Gestionar en Movimientos y Pedidos</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 4. Sección: Catálogo de Suministros Industriales y Reposición Inmediata -->
      <section class="catalog-section">
        <div class="catalog-header-banner">
          <div>
            <div class="catalog-badge">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.5">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              <span>ABASTECIMIENTO RÁPIDO CORPORATIVO</span>
            </div>
            <h2 class="catalog-title">Catálogo de Suministros Industriales y Reposición Inmediata</h2>
            <p class="catalog-subtitle">Precios con convenio activo aplicados para Logística Altiplano & Roberto Gómez.</p>
          </div>

          <div class="catalog-header-pills">
            <div class="stock-location-pill">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              </svg>
              <span>En Stock Naucalpan</span>
            </div>
            <div class="stock-shipping-pill">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
              <span>Envío 24h México</span>
            </div>
          </div>
        </div>

        <!-- Categorías del Catálogo -->
        <div class="catalog-categories-tabs">
          <button 
            *ngFor="let cat of catalogCategories"
            [class.active]="selectedCategory === cat"
            (click)="selectedCategory = cat"
            class="cat-tab-btn">
            {{ cat }}
          </button>
        </div>

        <!-- Cuadrícula de Productos -->
        <div class="products-grid">
          <div *ngIf="filteredProducts.length === 0" style="grid-column: 1 / -1; padding: 2.5rem; text-align: center; color: #64748b; background: #ffffff; border-radius: 12px; border: 1px dashed #cbd5e1;">
            No hay productos cargados en el catálogo actualmente.
          </div>
          <div *ngFor="let prod of filteredProducts" class="product-grid-card">
            <!-- Badges superiores -->
            <div class="card-badges-row">
              <span *ngIf="prod.badge" [class]="'badge-prod ' + prod.badgeType">
                <svg *ngIf="prod.badgeType === 'frequent'" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <svg *ngIf="prod.badgeType === 'express'" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
                <svg *ngIf="prod.badgeType === 'new'" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                {{ prod.badge }}
              </span>
              <span class="stock-badge">{{ prod.stockText }}</span>
            </div>

            <!-- Visual del Producto -->
            <div class="product-illustration-box">
              <!-- Sensor -->
              <svg *ngIf="prod.svgType === 'sensor'" width="75" height="75" viewBox="0 0 100 100" fill="none">
                <rect x="25" y="35" width="45" height="30" rx="4" fill="#334155"/>
                <rect x="70" y="42" width="16" height="16" rx="2" fill="#e2e8f0"/>
                <circle cx="85" cy="50" r="3" fill="#dc2626"/>
                <line x1="12" y1="50" x2="25" y2="50" stroke="#0284c7" stroke-width="4"/>
                <circle cx="12" cy="50" r="4" fill="#0284c7"/>
              </svg>

              <!-- Fuente de poder -->
              <svg *ngIf="prod.svgType === 'power'" width="75" height="75" viewBox="0 0 100 100" fill="none">
                <rect x="25" y="20" width="50" height="60" rx="4" fill="#475569"/>
                <rect x="32" y="28" width="36" height="15" rx="2" fill="#0f172a"/>
                <line x1="38" y1="35" x2="62" y2="35" stroke="#10b981" stroke-width="2"/>
                <circle cx="60" cy="65" r="4" fill="#10b981"/>
                <circle cx="40" cy="65" r="4" fill="#eab308"/>
              </svg>

              <!-- Rodamiento -->
              <svg *ngIf="prod.svgType === 'bearing'" width="75" height="75" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="35" stroke="#475569" stroke-width="10"/>
                <circle cx="50" cy="50" r="18" fill="#e2e8f0" stroke="#334155" stroke-width="4"/>
                <circle cx="50" cy="24" r="5" fill="#94a3b8"/>
                <circle cx="50" cy="76" r="5" fill="#94a3b8"/>
                <circle cx="24" cy="50" r="5" fill="#94a3b8"/>
                <circle cx="76" cy="50" r="5" fill="#94a3b8"/>
              </svg>

              <!-- Módulo PLC -->
              <svg *ngIf="prod.svgType === 'plc'" width="75" height="75" viewBox="0 0 100 100" fill="none">
                <rect x="25" y="22" width="50" height="56" rx="4" fill="#1e293b"/>
                <rect x="30" y="30" width="40" height="12" rx="2" fill="#10b981" fill-opacity="0.2"/>
                <circle cx="36" cy="36" r="2" fill="#10b981"/>
                <circle cx="44" cy="36" r="2" fill="#10b981"/>
                <circle cx="52" cy="36" r="2" fill="#10b981"/>
                <rect x="32" y="52" width="36" height="18" rx="2" fill="#334155"/>
              </svg>

              <!-- Tornillos -->
              <svg *ngIf="prod.svgType === 'screws'" width="75" height="75" viewBox="0 0 100 100" fill="none">
                <rect x="20" y="25" width="60" height="50" rx="4" fill="#0284c7" fill-opacity="0.2"/>
                <polygon points="35,35 45,35 40,65" fill="#475569"/>
                <polygon points="50,35 60,35 55,65" fill="#475569"/>
                <polygon points="65,35 75,35 70,65" fill="#475569"/>
              </svg>

              <!-- Llave impacto -->
              <svg *ngIf="prod.svgType === 'wrench'" width="75" height="75" viewBox="0 0 100 100" fill="none">
                <rect x="30" y="30" width="38" height="22" rx="3" fill="#1e293b"/>
                <rect x="68" y="36" width="14" height="10" rx="2" fill="#94a3b8"/>
                <rect x="38" y="52" width="15" height="28" rx="2" fill="#0284c7"/>
              </svg>

              <!-- Cilindro neumático -->
              <svg *ngIf="prod.svgType === 'cylinder'" width="75" height="75" viewBox="0 0 100 100" fill="none">
                <rect x="25" y="35" width="45" height="30" rx="3" fill="#cbd5e1" stroke="#475569" stroke-width="2"/>
                <rect x="70" y="45" width="20" height="10" rx="1" fill="#64748b"/>
                <circle cx="35" cy="42" r="3" fill="#2563eb"/>
                <circle cx="60" cy="42" r="3" fill="#2563eb"/>
              </svg>

              <!-- Guantes -->
              <svg *ngIf="prod.svgType === 'gloves'" width="75" height="75" viewBox="0 0 100 100" fill="none">
                <path d="M35 75 L35 45 Q35 35 42 35 Q48 35 48 45 L48 75 Z" fill="#eab308"/>
                <path d="M65 75 L65 45 Q65 35 58 35 Q52 35 52 45 L52 75 Z" fill="#eab308"/>
                <rect x="30" y="60" width="40" height="20" rx="4" fill="#1e293b"/>
              </svg>
            </div>

            <!-- Metadata del producto -->
            <div class="product-card-body">
              <div class="prod-sku-row">
                <span class="prod-sku">{{ prod.sku }}</span>
                <span class="prod-brand">{{ prod.brand }}</span>
              </div>
              <h3 class="prod-name">{{ prod.name }}</h3>
              <div class="prod-pricing">
                <span class="prod-price">\${{ prod.price.toFixed(2) }} <small>{{ prod.priceUnit }}</small></span>
                <span class="prod-bulk">{{ prod.bulkInfo }}</span>
              </div>
            </div>

            <!-- Selector de Cantidad y Botón Añadir -->
            <div class="product-card-actions">
              <div class="qty-control">
                <button (click)="decreaseQty(prod)" class="btn-qty">-</button>
                <span class="qty-num">{{ prod.quantity }}</span>
                <button (click)="increaseQty(prod)" class="btn-qty">+</button>
              </div>
              <button class="btn-add-cart" (click)="addToCart(prod)">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <span>Añadir</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 5. Sección: Garantías y Asistencia de Compras Firmeza -->
      <section class="guarantees-section">
        <div class="guarantees-header-row">
          <div>
            <span class="guarantees-tag">INTEGRACIÓN TOTAL TIENDA-ALMACÉN-PLATAFORMA</span>
            <h2 class="guarantees-title">Garantías y Asistencia de Compras Firmeza</h2>
          </div>
          <span class="support-status-live">
            <span class="live-dot"></span>
            MESA TÉCNICA OPERATIVA EN LÍNEA
          </span>
        </div>

        <div class="guarantees-grid">
          <!-- Card 1 -->
          <div class="guarantee-card">
            <div class="guarantee-icon-box">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                <polyline points="9 12 11 14 15 10"></polyline>
              </svg>
            </div>
            <h3 class="guarantee-title">Garantía Omnicanal de 30 Días</h3>
            <p class="guarantee-text">
              Aplica sin importar si compraste en mostrador, casillero o en la tienda web. Presenta únicamente tu código de ticket digital en cualquier sucursal del país.
            </p>
          </div>

          <!-- Card 2 -->
          <div class="guarantee-card">
            <div class="guarantee-icon-box">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
            </div>
            <h3 class="guarantee-title">Devoluciones en Ventanilla o Recolección</h3>
            <p class="guarantee-text">
              ¿Sobró material en tu proyecto? Deposítalo en la ventanilla de Naucalpan o solicita que nuestra unidad logística pase a recolectarlo a tu obra con nota de crédito inmediata.
            </p>
          </div>

          <!-- Card 3 -->
          <div class="guarantee-card">
            <div class="guarantee-icon-box">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </div>
            <h3 class="guarantee-title">Asesor Técnico Corporativo Asignado</h3>
            <div class="advisor-info-row">
              <div class="advisor-avatar">MS</div>
              <div>
                <span class="advisor-name">Ing. Mariana Salas</span>
                <span class="advisor-role">Especialista en Automatización Naucalpan</span>
              </div>
            </div>
            <div class="advisor-actions">
              <button class="btn-advisor-whatsapp">WhatsApp Directo</button>
              <button class="btn-advisor-call">Llamar Asesor</button>
            </div>
          </div>
        </div>
      </section>

      <!-- 6. Footer Corporativo -->
      <footer class="portal-footer">
        <div class="footer-grid">
          <div class="footer-brand-col">
            <div class="footer-logo">
              <span class="f-brand-title">FIRMEZA</span>
            </div>
            <p class="footer-desc">
              Infraestructura de abastecimiento técnico, suministros industriales y gestión omnicanal para flotas y corporaciones.
            </p>
            <span class="footer-iso-badge">VERIFICADO CERTIFICADA ISO 9001</span>
          </div>

          <div class="footer-col">
            <h4 class="footer-col-title">DESPACHO OMNICANAL</h4>
            <ul class="footer-links">
              <li><a href="javascript:void(0)">Tiempos y Rangos de Entrega</a></li>
              <li><a href="javascript:void(0)">Click & Collect / Retiro Inmediato</a></li>
              <li><a href="javascript:void(0)">Consolidación de Carga Paletizada</a></li>
              <li><a href="javascript:void(0)">Monitoreo de Envíos en Ruta</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4 class="footer-col-title">FACTURACIÓN Y REEMBOLSOS</h4>
            <ul class="footer-links">
              <li><a href="javascript:void(0)">Canje de Tickets Físicos a Factura</a></li>
              <li><a href="javascript:void(0)">Descarga Masiva XML / PDF DTE</a></li>
              <li><a href="javascript:void(0)">RMA y Garantía Técnica Directa</a></li>
              <li><a href="javascript:void(0)">Notas de Crédito y Reembolso Ágil</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4 class="footer-col-title">SOPORTE OPERATIVO</h4>
            <div class="footer-contact-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <span>+56 (2) 2890-4000</span>
            </div>
            <div class="footer-contact-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <span>soporte&#64;firmeza.com</span>
            </div>
            <div class="footer-contact-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>Lun - Vie: 07:30 - 18:30 hrs</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    /* 1. Portal Topbar */
    .portal-topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 0.6rem 1.1rem;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.02);
      flex-wrap: wrap;
    }

    .topbar-left {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }

    .portal-brand {
      display: flex;
      align-items: center;
      gap: 0.55rem;
    }

    .portal-logo-box {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .brand-titles {
      display: flex;
      flex-direction: column;
    }

    .brand-name {
      font-weight: 800;
      font-size: 0.92rem;
      color: #1e3a8a;
      letter-spacing: -0.01em;
      line-height: 1.1;
    }

    .brand-tag {
      font-size: 0.56rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: #64748b;
    }

    .store-selector {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 0.35rem 0.65rem;
      cursor: pointer;
    }

    .store-info {
      display: flex;
      flex-direction: column;
    }

    .store-lbl {
      font-size: 0.58rem;
      color: #64748b;
    }

    .store-val {
      font-size: 0.72rem;
      font-weight: 700;
      color: #1e293b;
    }

    .topbar-center {
      flex: 1;
      max-width: 320px;
    }

    .portal-search-bar {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 0.38rem 0.65rem;
    }

    .portal-search-input {
      border: none;
      outline: none;
      background: transparent;
      font-size: 0.74rem;
      color: #0f172a;
      width: 100%;
    }

    .portal-search-input::placeholder {
      color: #94a3b8;
    }

    .corporate-badge {
      display: flex;
      align-items: center;
      gap: 0.55rem;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 0.35rem 0.65rem;
      background: #f8fafc;
    }

    .corp-details {
      display: flex;
      flex-direction: column;
    }

    .corp-header-row {
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    .corp-name {
      font-size: 0.74rem;
      font-weight: 700;
      color: #0f172a;
    }

    .corp-tag {
      background: #eff6ff;
      color: #2563eb;
      font-size: 0.56rem;
      font-weight: 800;
      padding: 0.05rem 0.3rem;
      border-radius: 3px;
    }

    .corp-rut {
      font-size: 0.6rem;
      color: #64748b;
    }

    /* Subnav Tabs */
    .portal-subnav {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      overflow-x: auto;
      padding-bottom: 0.2rem;
    }

    .subnav-tab {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 0.4rem 0.85rem;
      font-size: 0.73rem;
      font-weight: 600;
      color: #475569;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s ease;
    }

    .subnav-tab:hover {
      background: #f1f5f9;
      color: #0f172a;
    }

    .subnav-tab.active {
      background: #2563eb;
      border-color: #2563eb;
      color: #ffffff;
      font-weight: 700;
    }

    /* 2. Welcome Card */
    .welcome-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 1.25rem 1.4rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.02);
    }

    .welcome-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .auth-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 0.15rem 0.55rem;
      font-size: 0.62rem;
      font-weight: 700;
      color: #475569;
      letter-spacing: 0.03em;
    }

    .dot-green {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #10b981;
    }

    .client-greeting {
      font-size: 1.45rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
      margin: 0.35rem 0 0.2rem;
    }

    .client-enterprise-info {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.74rem;
      color: #64748b;
    }

    .welcome-quick-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .btn-welcome-outline {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 0.45rem 0.85rem;
      font-size: 0.74rem;
      font-weight: 600;
      color: #334155;
      cursor: pointer;
      transition: all 0.15s;
    }

    .btn-welcome-outline:hover {
      background: #f8fafc;
      border-color: #94a3b8;
    }

    .btn-welcome-primary {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      background: #2563eb;
      border: 1px solid #1d4ed8;
      border-radius: 6px;
      padding: 0.45rem 0.95rem;
      font-size: 0.74rem;
      font-weight: 700;
      color: #ffffff;
      cursor: pointer;
      transition: all 0.15s;
      box-shadow: 0 1px 3px rgba(37, 99, 235, 0.2);
    }

    .btn-welcome-primary:hover {
      background: #1d4ed8;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.85rem;
    }

    .metric-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 0.85rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }

    .metric-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .metric-title {
      font-size: 0.72rem;
      font-weight: 600;
      color: #64748b;
    }

    .metric-value {
      font-size: 1.25rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
      display: flex;
      align-items: baseline;
      gap: 0.3rem;
    }

    .metric-unit {
      font-size: 0.68rem;
      font-weight: 600;
      color: #64748b;
    }

    .metric-caption {
      font-size: 0.68rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .text-green {
      color: #16a34a;
      font-weight: 600;
    }

    .text-blue {
      color: #2563eb;
      font-weight: 600;
    }

    .text-muted {
      color: #64748b;
    }

    .link-pts {
      color: #2563eb;
      font-weight: 600;
      text-decoration: none;
    }

    .link-pts:hover {
      text-decoration: underline;
    }

    /* 3. Compras Omnicanal */
    .purchases-section {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 1.25rem 1.4rem;
      display: flex;
      flex-direction: column;
      gap: 0.9rem;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.02);
    }

    .section-header-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .section-tag {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.62rem;
      font-weight: 700;
      color: #2563eb;
      letter-spacing: 0.05em;
      margin-bottom: 0.2rem;
    }

    .section-title {
      font-size: 1.05rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.01em;
      margin: 0;
    }

    .purchases-search {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 0.35rem 0.65rem;
      width: 240px;
    }

    .table-search-input {
      border: none;
      outline: none;
      background: transparent;
      font-size: 0.74rem;
      color: #0f172a;
      width: 100%;
    }

    .purchases-filter-tabs {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      overflow-x: auto;
      padding-bottom: 0.25rem;
    }

    .purchase-tab-btn {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 0.38rem 0.75rem;
      font-size: 0.72rem;
      font-weight: 600;
      color: #475569;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s;
    }

    .purchase-tab-btn.active {
      background: #2563eb;
      border-color: #2563eb;
      color: #ffffff;
    }

    .orders-list {
      display: flex;
      flex-direction: column;
      gap: 0.9rem;
    }

    .order-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 0.95rem 1.15rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .order-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 0.6rem;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .order-type-badge {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.72rem;
      color: #0f172a;
    }

    .badge-dot-blue {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #2563eb;
    }

    .badge-dot-purple {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #9333ea;
    }

    .order-code {
      font-family: monospace;
      font-weight: 700;
      color: #2563eb;
    }

    .order-date {
      color: #64748b;
      font-size: 0.68rem;
    }

    .order-location-tag {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.68rem;
      color: #64748b;
    }

    .order-items-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
    }

    .mini-product-card {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 0.55rem 0.75rem;
    }

    .mini-product-thumb {
      width: 38px;
      height: 38px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .aluminum-box {
      background: #f1f5f9;
    }

    .connector-box {
      background: #eff6ff;
    }

    .cable-box {
      background: #e0f2fe;
    }

    .vfd-box {
      background: #f1f5f9;
    }

    .tool-box {
      background: #ffedd5;
    }

    .mini-product-details {
      display: flex;
      flex-direction: column;
    }

    .mp-title {
      font-size: 0.74rem;
      font-weight: 700;
      color: #0f172a;
    }

    .mp-sku {
      font-size: 0.66rem;
      color: #64748b;
    }

    .mp-price {
      font-size: 0.74rem;
      font-weight: 800;
      color: #0f172a;
      margin-top: 0.1rem;
    }

    .order-card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid #f1f5f9;
      padding-top: 0.6rem;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .order-payment-info {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.72rem;
    }

    .pay-lbl {
      color: #64748b;
    }

    .pay-amount {
      font-weight: 800;
      color: #0f172a;
    }

    .pay-method {
      color: #64748b;
      font-size: 0.68rem;
    }

    .order-footer-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-ticket-link {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 5px;
      padding: 0.35rem 0.65rem;
      font-size: 0.7rem;
      font-weight: 600;
      color: #475569;
      cursor: pointer;
    }

    .btn-repurchase-blue {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background: #2563eb;
      border: 1px solid #1d4ed8;
      border-radius: 5px;
      padding: 0.35rem 0.75rem;
      font-size: 0.7rem;
      font-weight: 700;
      color: #ffffff;
      cursor: pointer;
    }

    /* Tracking Progress */
    .tracking-progress-bar {
      display: flex;
      align-items: center;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 0.75rem 1rem;
      gap: 0.4rem;
    }

    .track-step {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .step-point {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #e2e8f0;
      color: #64748b;
      font-size: 0.68rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .track-step.done .step-point {
      background: #dcfce7;
      color: #16a34a;
    }

    .track-step.active .step-point {
      background: #2563eb;
      color: #ffffff;
    }

    .step-texts {
      display: flex;
      flex-direction: column;
    }

    .step-title {
      font-size: 0.68rem;
      font-weight: 700;
      color: #0f172a;
    }

    .step-sub {
      font-size: 0.62rem;
      color: #64748b;
    }

    .track-connector {
      flex: 1;
      height: 2px;
      background: #e2e8f0;
    }

    .track-connector.done {
      background: #16a34a;
    }

    .track-connector.active {
      background: #2563eb;
    }

    .order-items-delivery {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .delivery-item-info {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }

    .delivery-item-name {
      font-size: 0.78rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    .delivery-item-sku {
      font-size: 0.68rem;
      color: #64748b;
    }

    .delivery-item-price {
      font-size: 0.82rem;
      font-weight: 800;
      color: #0f172a;
      margin-left: 0.5rem;
    }

    .delivery-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-delivery-outline {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 5px;
      padding: 0.35rem 0.65rem;
      font-size: 0.7rem;
      font-weight: 600;
      color: #475569;
      cursor: pointer;
    }

    /* Locker Layout */
    .locker-layout {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.25rem;
      align-items: center;
    }

    .locker-hub-title {
      font-size: 0.85rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    .locker-instruction {
      font-size: 0.73rem;
      color: #64748b;
      margin: 0.3rem 0 0.6rem;
      line-height: 1.35;
    }

    .locker-item-card {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 0.55rem 0.75rem;
    }

    .lic-name {
      font-size: 0.74rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    .lic-sub {
      font-size: 0.68rem;
      color: #64748b;
    }

    .qr-code-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 0.75rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 0.3rem;
    }

    .qr-heading {
      font-size: 0.6rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: #64748b;
    }

    .qr-visual {
      background: #ffffff;
      padding: 0.25rem;
    }

    .pin-display {
      display: flex;
      align-items: baseline;
      gap: 0.3rem;
    }

    .pin-lbl {
      font-size: 0.7rem;
      font-weight: 700;
      color: #475569;
    }

    .pin-code {
      font-size: 1.15rem;
      font-weight: 900;
      color: #2563eb;
      letter-spacing: 0.05em;
    }

    .qr-validity {
      font-size: 0.62rem;
      color: #94a3b8;
    }

    /* 4. Catálogo */
    .catalog-section {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 1.25rem 1.4rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.02);
    }

    .catalog-header-banner {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .catalog-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.62rem;
      font-weight: 700;
      color: #2563eb;
      letter-spacing: 0.05em;
      margin-bottom: 0.2rem;
    }

    .catalog-title {
      font-size: 1.1rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.01em;
      margin: 0;
    }

    .catalog-subtitle {
      font-size: 0.73rem;
      color: #64748b;
      margin: 0.15rem 0 0;
    }

    .catalog-header-pills {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .stock-location-pill, .stock-shipping-pill {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 0.3rem 0.65rem;
      font-size: 0.7rem;
      font-weight: 600;
      background: #f8fafc;
      color: #334155;
    }

    .catalog-categories-tabs {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      overflow-x: auto;
      padding-bottom: 0.25rem;
    }

    .cat-tab-btn {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 0.38rem 0.75rem;
      font-size: 0.72rem;
      font-weight: 600;
      color: #475569;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s;
    }

    .cat-tab-btn.active {
      background: #2563eb;
      border-color: #2563eb;
      color: #ffffff;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.95rem;
    }

    .product-grid-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 0.85rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      transition: all 0.15s;
    }

    .product-grid-card:hover {
      border-color: #cbd5e1;
      box-shadow: 0 2px 8px rgba(15, 23, 42, 0.05);
    }

    .card-badges-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: 18px;
    }

    .badge-prod {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.58rem;
      font-weight: 700;
      padding: 0.12rem 0.38rem;
      border-radius: 3px;
    }

    .badge-prod.frequent {
      background: #eff6ff;
      color: #2563eb;
    }

    .badge-prod.express {
      background: #f0fdf4;
      color: #16a34a;
    }

    .badge-prod.new {
      background: #fef3c7;
      color: #b45309;
    }

    .stock-badge {
      font-size: 0.62rem;
      color: #64748b;
      margin-left: auto;
    }

    .product-illustration-box {
      height: 85px;
      background: #f8fafc;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .product-card-body {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .prod-sku-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.64rem;
      color: #64748b;
    }

    .prod-sku {
      font-family: monospace;
    }

    .prod-brand {
      font-weight: 600;
      color: #0284c7;
    }

    .prod-name {
      font-size: 0.74rem;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.25;
      margin: 0.25rem 0 0.35rem;
      min-height: 32px;
    }

    .prod-pricing {
      display: flex;
      flex-direction: column;
      margin-top: auto;
    }

    .prod-price {
      font-size: 0.95rem;
      font-weight: 800;
      color: #0f172a;
    }

    .prod-price small {
      font-size: 0.65rem;
      font-weight: 500;
      color: #64748b;
    }

    .prod-bulk {
      font-size: 0.62rem;
      color: #64748b;
    }

    .product-card-actions {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      margin-top: 0.35rem;
    }

    .qty-control {
      display: flex;
      align-items: center;
      border: 1px solid #e2e8f0;
      border-radius: 5px;
      background: #ffffff;
      overflow: hidden;
    }

    .btn-qty {
      border: none;
      background: transparent;
      padding: 0.25rem 0.45rem;
      font-size: 0.72rem;
      font-weight: 700;
      cursor: pointer;
      color: #475569;
    }

    .btn-qty:hover {
      background: #f1f5f9;
    }

    .qty-num {
      padding: 0 0.35rem;
      font-size: 0.74rem;
      font-weight: 700;
      color: #0f172a;
    }

    .btn-add-cart {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.35rem;
      background: #2563eb;
      border: 1px solid #1d4ed8;
      border-radius: 5px;
      padding: 0.35rem;
      font-size: 0.72rem;
      font-weight: 700;
      color: #ffffff;
      cursor: pointer;
      transition: all 0.15s;
    }

    .btn-add-cart:hover {
      background: #1d4ed8;
    }

    /* 5. Garantías */
    .guarantees-section {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 1.25rem 1.4rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.02);
    }

    .guarantees-header-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .guarantees-tag {
      font-size: 0.62rem;
      font-weight: 700;
      color: #2563eb;
      letter-spacing: 0.05em;
    }

    .guarantees-title {
      font-size: 1.05rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.01em;
      margin: 0.15rem 0 0;
    }

    .support-status-live {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.62rem;
      font-weight: 700;
      color: #16a34a;
      letter-spacing: 0.04em;
    }

    .live-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #16a34a;
    }

    .guarantees-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }

    .guarantee-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 1rem 1.15rem;
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }

    .guarantee-icon-box {
      width: 36px;
      height: 36px;
      border-radius: 7px;
      background: #eff6ff;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .guarantee-title {
      font-size: 0.82rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    .guarantee-text {
      font-size: 0.72rem;
      color: #64748b;
      margin: 0;
      line-height: 1.35;
    }

    .advisor-info-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.15rem;
    }

    .advisor-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #dbeafe;
      color: #1d4ed8;
      font-size: 0.7rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .advisor-name {
      display: block;
      font-size: 0.74rem;
      font-weight: 700;
      color: #0f172a;
    }

    .advisor-role {
      display: block;
      font-size: 0.64rem;
      color: #64748b;
    }

    .advisor-actions {
      display: flex;
      gap: 0.45rem;
      margin-top: 0.4rem;
    }

    .btn-advisor-whatsapp {
      flex: 1;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 5px;
      padding: 0.35rem;
      font-size: 0.68rem;
      font-weight: 600;
      color: #334155;
      cursor: pointer;
    }

    .btn-advisor-call {
      flex: 1;
      background: #2563eb;
      border: 1px solid #1d4ed8;
      border-radius: 5px;
      padding: 0.35rem;
      font-size: 0.68rem;
      font-weight: 700;
      color: #ffffff;
      cursor: pointer;
    }

    /* 6. Footer */
    .portal-footer {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 1.5rem 1.4rem;
      margin-top: 0.5rem;
    }

    .footer-grid {
      display: grid;
      grid-template-columns: 1.3fr 1fr 1fr 1fr;
      gap: 1.5rem;
    }

    .f-brand-title {
      font-size: 0.95rem;
      font-weight: 900;
      color: #1e3a8a;
      letter-spacing: -0.01em;
    }

    .footer-desc {
      font-size: 0.72rem;
      color: #64748b;
      margin: 0.4rem 0 0.6rem;
      line-height: 1.35;
    }

    .footer-iso-badge {
      display: inline-block;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 0.15rem 0.45rem;
      font-size: 0.58rem;
      font-weight: 700;
      color: #475569;
    }

    .footer-col-title {
      font-size: 0.68rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: 0.05em;
      margin: 0 0 0.65rem;
    }

    .footer-links {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .footer-links a {
      font-size: 0.72rem;
      color: #64748b;
      text-decoration: none;
    }

    .footer-links a:hover {
      color: #2563eb;
    }

    .footer-contact-item {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.72rem;
      color: #475569;
      margin-bottom: 0.45rem;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .metrics-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .order-items-row {
        grid-template-columns: 1fr;
      }
      .products-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .guarantees-grid {
        grid-template-columns: 1fr;
      }
      .footer-grid {
        grid-template-columns: 1fr 1fr;
      }
    }
  `]
})
export class ClientsComponent implements OnInit, OnDestroy {
  private readonly clientService = inject(ClientService);
  private readonly saleService = inject(SaleService);
  private readonly productsService = inject(ProductsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly ngZone = inject(NgZone);

  private clientsSub?: Subscription;
  private salesSub?: Subscription;
  private productsSub?: Subscription;

  globalSearchQuery = '';
  purchaseFilterText = '';

  navTabs = [
    'Catálogo Online',
    'Mis Compras (Tienda & Online)',
    'Garantías y Devoluciones',
    'Facturación de Tickets Físicos',
    'Sucursales & Centros de Recojo',
    'Canales de Soporte'
  ];
  activeNavTab = 'Mis Compras (Tienda & Online)';

  selectedPurchaseTab = 'all';

  catalogCategories = [
    'Todos los Suministros',
    'Construcción',
    'Fijaciones',
    'Químicos',
    'Herramientas'
  ];
  selectedCategory = 'Todos los Suministros';

  clients: ClientDto[] = [];
  sales: SaleDto[] = [];
  products: ProductCatalogItem[] = [];
  loading = false;

  get activeClient(): ClientDto | null {
    return this.clients.length > 0 ? this.clients[0] : null;
  }

  get activeClientsCount(): number {
    return this.clients.filter(c => c.isActive).length;
  }

  get paidSalesCount(): number {
    return this.sales.filter(s => s.isPaid).length;
  }

  get pendingOrdersCount(): number {
    return this.sales.filter(s => !s.isPaid).length;
  }

  get totalPaidRevenue(): number {
    return this.sales.filter(s => s.isPaid).reduce((acc, s) => acc + (s.totalAmount || 0), 0);
  }

  get totalPendingAmount(): number {
    return this.sales.filter(s => !s.isPaid).reduce((acc, s) => acc + (s.totalAmount || 0), 0);
  }

  get totalUnitsPurchased(): number {
    return this.sales.reduce((acc, s) => acc + (s.quantity || 0), 0);
  }

  get filteredSalesList(): SaleDto[] {
    return this.sales.filter(s => {
      const matchTab =
        this.selectedPurchaseTab === 'all' ||
        (this.selectedPurchaseTab === 'orders' && !s.isPaid) ||
        (this.selectedPurchaseTab === 'sales' && s.isPaid);

      const q = (this.purchaseFilterText || this.globalSearchQuery).toLowerCase().trim();
      const matchSearch =
        !q ||
        s.clientName.toLowerCase().includes(q) ||
        String(s.id).includes(q) ||
        (s.details && s.details.some(d => d.productName.toLowerCase().includes(q) || d.productSku.toLowerCase().includes(q)));

      return matchTab && matchSearch;
    });
  }

  get filteredProducts(): ProductCatalogItem[] {
    return this.products.filter(p => {
      const matchCat = this.selectedCategory === 'Todos los Suministros' || p.category.toLowerCase().includes(this.selectedCategory.toLowerCase());
      const matchSearch = !this.globalSearchQuery.trim() || 
        p.name.toLowerCase().includes(this.globalSearchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(this.globalSearchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }

  ngOnInit(): void {
    this.clientsSub = this.clientService.clients$.subscribe(list => {
      this.ngZone.run(() => {
        this.clients = [...(list || [])];
        this.cdr.detectChanges();
      });
    });

    this.salesSub = this.saleService.sales$.subscribe(list => {
      this.ngZone.run(() => {
        this.sales = [...(list || [])];
        this.cdr.detectChanges();
      });
    });

    this.productsSub = this.productsService.products$.subscribe(list => {
      this.ngZone.run(() => {
        this.products = (list || []).map(p => this.mapProductToCatalog(p));
        this.cdr.detectChanges();
      });
    });

    this.clientService.getClients().subscribe();
    this.saleService.getSales().subscribe();
    this.productsService.getProducts().subscribe();
  }

  ngOnDestroy(): void {
    this.clientsSub?.unsubscribe();
    this.salesSub?.unsubscribe();
    this.productsSub?.unsubscribe();
  }

  private mapProductToCatalog(p: ProductItem): ProductCatalogItem {
    const rawPrice = parseFloat(String(p.salePrice || '0').replace(/[^0-9.]/g, '')) || 0;
    return {
      id: p.id,
      sku: p.sku,
      brand: p.category,
      name: p.name,
      price: rawPrice,
      priceUnit: 'c/u',
      bulkInfo: `Ubicación: ${p.location}`,
      stockText: `${p.stockAvailable} disp.`,
      quantity: 1,
      category: p.category,
      svgType: 'sensor'
    };
  }

  increaseQty(prod: ProductCatalogItem): void {
    prod.quantity++;
  }

  decreaseQty(prod: ProductCatalogItem): void {
    if (prod.quantity > 1) prod.quantity--;
  }

  addToCart(prod: ProductCatalogItem): void {}
}
