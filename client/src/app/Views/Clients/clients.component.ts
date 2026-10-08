import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

export interface ClientItem {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
}

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
  imports: [CommonModule, FormsModule],
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
              <span class="store-lbl">Sucursal Activa:</span>
              <span class="store-val">Sucursal Central - Bodega Naucalpan</span>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2.5">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
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
              placeholder="Buscar por ticket, folio, SKU..." 
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
                <span class="corp-name">Logística Altiplano S.A.</span>
                <span class="corp-tag">CORP</span>
              </div>
              <span class="corp-rut">CLIENTE VIP TOP 1 • RUT: 76.432.890-K</span>
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

      <!-- 2. Tarjeta Principal de Bienvenida y Métricas de Cuenta -->
      <section class="welcome-card">
        <div class="welcome-top">
          <div class="client-identity">
            <div class="auth-pill">
              <span class="dot-green"></span>
              <span>CUENTA CORPORATIVA AUTENTICADA • ID #CL-98420-MX</span>
            </div>
            <h1 class="client-greeting">Hola, Arq. Roberto Gómez</h1>
            <div class="client-enterprise-info">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2">
                <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                <line x1="9" y1="22" x2="9" y2="22.01"></line>
                <line x1="15" y1="22" x2="15" y2="22.01"></line>
                <line x1="9" y1="6" x2="9" y2="6.01"></line>
                <line x1="15" y1="6" x2="15" y2="6.01"></line>
                <line x1="9" y1="10" x2="9" y2="10.01"></line>
                <line x1="15" y1="10" x2="15" y2="10.01"></line>
                <line x1="9" y1="14" x2="9" y2="14.01"></line>
                <line x1="15" y1="14" x2="15" y2="14.01"></line>
                <line x1="9" y1="18" x2="9" y2="18.01"></line>
                <line x1="15" y1="18" x2="15" y2="18.01"></line>
              </svg>
              <span>Ferretería & Construcción Del Norte S.A. de C.V. • Sucursal Vinculada: <strong>Naucalpan Industrial</strong></span>
            </div>
          </div>

          <div class="welcome-quick-actions">
            <button class="btn-welcome-outline">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <span>Tickets de Caja Físicos</span>
            </button>

            <button class="btn-welcome-outline">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
              <span>Rastrear Envíos</span>
            </button>

            <button class="btn-welcome-primary">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
              <span>Reordenar 1-Clic</span>
            </button>
          </div>
        </div>

        <!-- 4 Métricas de Resumen del Cliente -->
        <div class="metrics-grid">
          <!-- Métrica 1: Facturación Este Mes -->
          <div class="metric-card">
            <div class="metric-header">
              <span class="metric-title">Facturación Este Mes</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
                <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                <line x1="2" y1="10" x2="22" y2="10"></line>
              </svg>
            </div>
            <div class="metric-value">
              <span>$42,650.00</span>
              <span class="metric-unit">MXN</span>
            </div>
            <div class="metric-caption text-green">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="18 15 12 9 6 15"></polyline>
              </svg>
              <span>+14.8% vs mes previo</span>
            </div>
          </div>

          <!-- Métrica 2: En Tienda Física (POS) -->
          <div class="metric-card">
            <div class="metric-header">
              <span class="metric-title">En Tienda Física (POS)</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <div class="metric-value">
              <span>8 Tickets</span>
            </div>
            <div class="metric-caption text-muted">
              <span>Sincronizados en Naucalpan y Tlalnepantla</span>
            </div>
          </div>

          <!-- Métrica 3: Pedidos Online Activos -->
          <div class="metric-card">
            <div class="metric-header">
              <span class="metric-title">Pedidos Online Activos</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </div>
            <div class="metric-value">
              <span>3 En Tránsito / Hub</span>
            </div>
            <div class="metric-caption text-blue">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>1 Entrega programada hoy</span>
            </div>
          </div>

          <!-- Métrica 4: Puntos Firmeza Pro -->
          <div class="metric-card">
            <div class="metric-header">
              <span class="metric-title">Puntos Firmeza Pro</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </div>
            <div class="metric-value">
              <span>3,420</span>
              <span class="metric-unit">PTS DISPONIBLES</span>
            </div>
            <div class="metric-caption">
              <a href="javascript:void(0)" class="link-pts">Canjear $1,250 MXN de crédito →</a>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. Sección: Mis Compras Omnicanal -->
      <section class="purchases-section">
        <div class="section-header-row">
          <div>
            <div class="section-tag">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.5">
                <path d="m7 16-4-4 4-4"></path>
                <path d="M3 12h18"></path>
                <path d="m17 8 4 4-4 4"></path>
              </svg>
              <span>FLUJO UNIFICADO DE SUMINISTROS</span>
            </div>
            <h2 class="section-title">Mis Compras Omnicanal (Tienda Física y Online)</h2>
          </div>

          <div class="purchases-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              [(ngModel)]="purchaseFilterText" 
              placeholder="Filtrar por ticket, folio, SKU..." 
              class="table-search-input"
            />
          </div>
        </div>

        <!-- Filtros de Compra -->
        <div class="purchases-filter-tabs">
          <button 
            *ngFor="let tab of purchaseTabs" 
            [class.active]="selectedPurchaseTab === tab.id"
            (click)="selectedPurchaseTab = tab.id" 
            class="purchase-tab-btn">
            {{ tab.label }}
          </button>
        </div>

        <!-- Tarjetas de Órdenes Omnicanal -->
        <div class="orders-list">
          <!-- ORDEN 1: Tienda Física / Mostrador -->
          <div class="order-card" *ngIf="selectedPurchaseTab === 'all' || selectedPurchaseTab === 'pos'">
            <div class="order-card-header">
              <div class="order-type-badge">
                <span class="badge-dot-blue"></span>
                <strong>ADQUIRIDO EN MOSTRADOR / TIENDA FÍSICA</strong>
                <span class="order-code">Ticket #TCK-89211</span>
                <span class="order-date">• Hace 2 días (24 Oct 2024, 11:26 hrs)</span>
              </div>
              <div class="order-location-tag">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                </svg>
                <span>Sucursal Naucalpan Industrial • Terminal Caja 04 • Cajero: L. Mendoza</span>
              </div>
            </div>

            <div class="order-items-row">
              <div class="mini-product-card">
                <div class="mini-product-thumb aluminum-box">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="1.8">
                    <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <line x1="3" y1="15" x2="21" y2="15"></line>
                    <line x1="9" y1="3" x2="9" y2="21"></line>
                    <line x1="15" y1="3" x2="15" y2="21"></line>
                  </svg>
                </div>
                <div class="mini-product-details">
                  <span class="mp-title">Perfil Aluminio 40x40 T-Slot</span>
                  <span class="mp-sku">SKU: ALU-4040-6M • 8 Barras (6m)</span>
                  <span class="mp-price">$3,920.00 MXN</span>
                </div>
              </div>

              <div class="mini-product-card">
                <div class="mini-product-thumb connector-box">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="1.8">
                    <circle cx="12" cy="12" r="7"></circle>
                    <circle cx="12" cy="12" r="3"></circle>
                    <line x1="12" y1="2" x2="12" y2="5"></line>
                    <line x1="12" y1="19" x2="12" y2="22"></line>
                  </svg>
                </div>
                <div class="mini-product-details">
                  <span class="mp-title">Conector Industrial M12 Macho IP67</span>
                  <span class="mp-sku">SKU: CN-M12-5P • 50 piezas</span>
                  <span class="mp-price">$2,450.00 MXN</span>
                </div>
              </div>

              <div class="mini-product-card">
                <div class="mini-product-thumb cable-box">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="1.8">
                    <circle cx="12" cy="12" r="9"></circle>
                    <circle cx="12" cy="12" r="5"></circle>
                    <circle cx="12" cy="12" r="2"></circle>
                  </svg>
                </div>
                <div class="mini-product-details">
                  <span class="mp-title">Cable Blindado Apantallado 4x0.75</span>
                  <span class="mp-sku">SKU: CBL-SH-4075 • 1 Bobina (100m)</span>
                  <span class="mp-price">$1,890.00 MXN</span>
                </div>
              </div>
            </div>

            <div class="order-card-footer">
              <div class="order-payment-info">
                <span class="pay-lbl">Total Abonado en Caja:</span>
                <span class="pay-amount">$8,260.00 MXN</span>
                <span class="pay-method">| Pago con Tarjeta Santander Corp. ****4502</span>
              </div>
              <div class="order-footer-actions">
                <button class="btn-ticket-link">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                  <span>Ver Ticket Digital / CFDI 4.0</span>
                </button>
                <button class="btn-repurchase-blue">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                  <span>Volver a Comprar Online</span>
                </button>
              </div>
            </div>
          </div>

          <!-- ORDEN 2: Pedido Web En Ruta -->
          <div class="order-card" *ngIf="selectedPurchaseTab === 'all' || selectedPurchaseTab === 'online'">
            <div class="order-card-header">
              <div class="order-type-badge">
                <span class="badge-dot-blue"></span>
                <strong>PEDIDO WEB • EN RUTA DE ENTREGA</strong>
                <span class="order-code">Folio #FMZ-98421</span>
                <span class="order-date">• Generado hoy 08:15 hrs</span>
              </div>
              <div class="order-location-tag">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
                  <rect x="1" y="3" width="15" height="13"></rect>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                  <circle cx="5.5" cy="18.5" r="2.5"></circle>
                  <circle cx="18.5" cy="18.5" r="2.5"></circle>
                </svg>
                <span>ETA Estimada: Hoy 16:30 hrs • Unidad Móvil #F-14</span>
              </div>
            </div>

            <!-- Línea de Progreso de Envío -->
            <div class="tracking-progress-bar">
              <div class="track-step done">
                <div class="step-point">✓</div>
                <div class="step-texts">
                  <span class="step-title">1. CONFIRMADO</span>
                  <span class="step-sub">08:15 hrs</span>
                </div>
              </div>
              <div class="track-connector done"></div>
              <div class="track-step done">
                <div class="step-point">✓</div>
                <div class="step-texts">
                  <span class="step-title">2. PREPARADO</span>
                  <span class="step-sub">Almacén Central 11:00</span>
                </div>
              </div>
              <div class="track-connector active"></div>
              <div class="track-step active">
                <div class="step-point pulse">3</div>
                <div class="step-texts">
                  <span class="step-title">3. EN REPARTO</span>
                  <span class="step-sub">Circuito Periférico Norte</span>
                </div>
              </div>
              <div class="track-connector"></div>
              <div class="track-step upcoming">
                <div class="step-point">4</div>
                <div class="step-texts">
                  <span class="step-title">4. ENTREGA EN OBRA</span>
                  <span class="step-sub">Parque Industrial Barrientos</span>
                </div>
              </div>
            </div>

            <!-- Producto y Acciones -->
            <div class="order-items-delivery">
              <div class="delivery-item-info">
                <div class="mini-product-thumb vfd-box">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="1.8">
                    <rect x="4" y="2" width="16" height="20" rx="2"></rect>
                    <rect x="7" y="5" width="10" height="4"></rect>
                    <circle cx="12" cy="15" r="3"></circle>
                  </svg>
                </div>
                <div>
                  <h3 class="delivery-item-name">Variador de Frecuencia 9.5 HP 380V Trifásico</h3>
                  <span class="delivery-item-sku">SKU: VFD-IND-55HP • 2 Unidades</span>
                  <span class="delivery-item-price">$21,800.00 MXN</span>
                </div>
              </div>

              <div class="delivery-actions">
                <button class="btn-delivery-outline">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                    <line x1="8" y1="2" x2="8" y2="18"></line>
                    <line x1="16" y1="6" x2="16" y2="22"></line>
                  </svg>
                  <span>Rastrear en Vivo</span>
                </button>
                <button class="btn-delivery-outline">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                  <span>Detalle y Guía</span>
                </button>
              </div>
            </div>
          </div>

          <!-- ORDEN 3: Click & Collect (Casillero Inteligente) -->
          <div class="order-card" *ngIf="selectedPurchaseTab === 'all' || selectedPurchaseTab === 'lockers'">
            <div class="order-card-header">
              <div class="order-type-badge">
                <span class="badge-dot-purple"></span>
                <strong>CLICK & COLLECT • LISTO PARA RECOJO</strong>
                <span class="order-code">Retiro #RST-4412</span>
              </div>
            </div>

            <div class="locker-layout">
              <div class="locker-details">
                <h3 class="locker-hub-title">Sucursal Tlalnepantla Hub • Casillero Automatizado #12</h3>
                <p class="locker-instruction">
                  Tu paquete ya fue depositado en el locker inteligente de la sucursal. Puedes retirar las 24 horas del día sin hacer fila en el mostrador mostrando el código QR adjunto.
                </p>
                <div class="locker-item-card">
                  <div class="mini-product-thumb tool-box">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="1.8">
                      <polygon points="6 2 18 2 18 6 6 6"></polygon>
                      <polygon points="8 6 16 6 12 22"></polygon>
                    </svg>
                  </div>
                  <div>
                    <h4 class="lic-name">Juego Brocas Titanio Escalonadas M35 HSS (Pack x3)</h4>
                    <span class="lic-sub">SKU: BRO-HSS-03 • $1,190.00 MXN</span>
                  </div>
                </div>
              </div>

              <!-- Tarjeta de Código QR y PIN -->
              <div class="qr-code-card">
                <span class="qr-heading">ESCANEAR EN CASILLERO</span>
                <div class="qr-visual">
                  <svg width="105" height="105" viewBox="0 0 100 100" fill="#0f172a">
                    <!-- Cuadros esquinas QR -->
                    <rect x="5" y="5" width="30" height="30" rx="3" fill="#0f172a"></rect>
                    <rect x="10" y="10" width="20" height="20" rx="2" fill="#ffffff"></rect>
                    <rect x="15" y="15" width="10" height="10" rx="1" fill="#0f172a"></rect>

                    <rect x="65" y="5" width="30" height="30" rx="3" fill="#0f172a"></rect>
                    <rect x="70" y="10" width="20" height="20" rx="2" fill="#ffffff"></rect>
                    <rect x="75" y="15" width="10" height="10" rx="1" fill="#0f172a"></rect>

                    <rect x="5" y="65" width="30" height="30" rx="3" fill="#0f172a"></rect>
                    <rect x="10" y="70" width="20" height="20" rx="2" fill="#ffffff"></rect>
                    <rect x="15" y="75" width="10" height="10" rx="1" fill="#0f172a"></rect>

                    <!-- Patrón interno QR -->
                    <rect x="42" y="10" width="8" height="8"></rect>
                    <rect x="48" y="24" width="8" height="8"></rect>
                    <rect x="10" y="44" width="8" height="8"></rect>
                    <rect x="25" y="44" width="8" height="8"></rect>
                    <rect x="42" y="42" width="16" height="16"></rect>
                    <rect x="68" y="44" width="8" height="8"></rect>
                    <rect x="82" y="50" width="8" height="8"></rect>
                    <rect x="42" y="70" width="8" height="18"></rect>
                    <rect x="56" y="70" width="8" height="8"></rect>
                    <rect x="74" y="74" width="16" height="8"></rect>
                  </svg>
                </div>
                <div class="pin-display">
                  <span class="pin-lbl">PIN:</span>
                  <span class="pin-code">840-291</span>
                </div>
                <span class="qr-validity">Vigencia: 72 horas restantes</span>
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

        <!-- Cuadrícula de 8 Productos -->
        <div class="products-grid">
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
export class ClientsComponent implements OnInit {
  private readonly http = inject(HttpClient);

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

  purchaseTabs = [
    { id: 'all', label: 'Todas las compras (11)' },
    { id: 'pos', label: 'En Tienda Física / Mostrador (6)' },
    { id: 'online', label: 'Pedidos Online / Reparto a Obra (2)' },
    { id: 'lockers', label: 'Retiro en Casillero / Click & Collect (1)' }
  ];
  selectedPurchaseTab = 'all';

  catalogCategories = [
    'Todos los Suministros',
    'Sensores y Automatización',
    'Perfiles de Aluminio Modulares',
    'Herramientas Neumáticas',
    'Fuentes & Control 24V',
    'Transmisión y Rodamientos'
  ];
  selectedCategory = 'Todos los Suministros';

  products: ProductCatalogItem[] = [
    {
      id: 'P1',
      sku: 'SKU: SNS-IR-P01',
      brand: 'Omron Tech',
      name: 'Sensor Fotoeléctrico Infrarrojo M18 PNP N.A. 24VDC',
      price: 890.00,
      priceUnit: '/ pza',
      bulkInfo: 'Mayoreo (10+): $795.00 MXN',
      stockText: 'Naucalpan: 48 uds',
      badge: 'RECOMPRA FRECUENTE',
      badgeType: 'frequent',
      quantity: 2,
      category: 'Sensores y Automatización',
      svgType: 'sensor'
    },
    {
      id: 'P2',
      sku: 'SKU: PWR-24V-10A',
      brand: 'Mean Well Ind',
      name: 'Fuente de Poder Conmutada Riel DIN 24V DC 240W 10A',
      price: 1480.00,
      priceUnit: '/ pza',
      bulkInfo: 'Mayoreo (5+): $1,320.00 MXN',
      stockText: 'Naucalpan: 19 uds',
      badge: 'RECOMPRA FRECUENTE',
      badgeType: 'frequent',
      quantity: 1,
      category: 'Fuentes & Control 24V',
      svgType: 'power'
    },
    {
      id: 'P3',
      sku: 'SKU: RDM-SKF-6205',
      brand: 'SKF Explore',
      name: 'Rodamiento Rígido de Bolas 6205-2RSH/C3 25x52x15mm',
      price: 245.00,
      priceUnit: '/ pza',
      bulkInfo: 'Caja x20: $4,100.00 MXN',
      stockText: 'Hub Central: 120 uds',
      badge: 'EXPRESS 24H',
      badgeType: 'express',
      quantity: 4,
      category: 'Transmisión y Rodamientos',
      svgType: 'bearing'
    },
    {
      id: 'P4',
      sku: 'SKU: PLC-MOD-IO',
      brand: 'Firmeza Core',
      name: 'Módulo Controlador I/O Ethernet Modbus TCP/IP Industrial',
      price: 3120.00,
      priceUnit: '/ pza',
      bulkInfo: 'Soporte técnico directo incluido',
      stockText: 'Naucalpan: 14 uds',
      badge: 'NUEVO LOTE',
      badgeType: 'new',
      quantity: 1,
      category: 'Sensores y Automatización',
      svgType: 'plc'
    },
    {
      id: 'P5',
      sku: 'SKU: TRN-G8.8-KIT',
      brand: 'TorqMax Pro',
      name: 'Kit Tornillería Hexagonal Grado 8.8 Pavonada M8/M10 (500 pzas)',
      price: 1150.00,
      priceUnit: '/ kit',
      bulkInfo: 'Mayoreo (3+): $990.00 MXN',
      stockText: 'Naucalpan: 65 cajas',
      badge: 'RECOMPRA FRECUENTE',
      badgeType: 'frequent',
      quantity: 1,
      category: 'Perfiles de Aluminio Modulares',
      svgType: 'screws'
    },
    {
      id: 'P6',
      sku: 'SKU: PNE-IMP-12',
      brand: 'Chicago Pneumatic',
      name: 'Llave de Impacto Neumática 1/2" 1,350 Nm Ultra-Ligera',
      price: 4890.00,
      priceUnit: '/ pza',
      bulkInfo: 'Garantía extendida 24 meses',
      stockText: 'Naucalpan: 8 uds',
      quantity: 1,
      category: 'Herramientas Neumáticas',
      svgType: 'wrench'
    },
    {
      id: 'P7',
      sku: 'SKU: ACT-FNE-3250',
      brand: 'Festo System',
      name: 'Actuador Cilindro Neumático ISO 32mm Carrera 50mm Doble Efecto',
      price: 1630.00,
      priceUnit: '/ pza',
      bulkInfo: 'Incluye amortiguación neumática',
      stockText: 'Naucalpan: 22 uds',
      quantity: 2,
      category: 'Herramientas Neumáticas',
      svgType: 'cylinder'
    },
    {
      id: 'P8',
      sku: 'SKU: GNT-ANT-NVS',
      brand: 'Ansell Safework',
      name: 'Guante Anticorte Industrial Nivel F/5 Nitrilo Grip Talla L',
      price: 165.00,
      priceUnit: '/ pza',
      bulkInfo: 'Pack x12 pares: $1,680.00 MXN',
      stockText: 'Naucalpan: 110 pares',
      quantity: 6,
      category: 'Todos los Suministros',
      svgType: 'gloves'
    }
  ];

  get filteredProducts(): ProductCatalogItem[] {
    return this.products.filter(p => {
      const matchCat = this.selectedCategory === 'Todos los Suministros' || p.category === this.selectedCategory;
      const matchSearch = !this.globalSearchQuery.trim() || 
        p.name.toLowerCase().includes(this.globalSearchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(this.globalSearchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }

  // Mantenimiento de compatibilidad con backend de clientes
  clients: ClientItem[] = [];
  loading = false;

  ngOnInit(): void {
    this.http.get<ClientItem[]>('http://localhost:5235/api/Clients').subscribe({
      next: (data) => {
        if (data) this.clients = data;
      },
      error: () => {
        // Modo offline / standalone
      }
    });
  }

  increaseQty(prod: ProductCatalogItem): void {
    prod.quantity++;
  }

  decreaseQty(prod: ProductCatalogItem): void {
    if (prod.quantity > 1) prod.quantity--;
  }

  addToCart(prod: ProductCatalogItem): void {
    // Feedback de añadir al carrito
  }
}
