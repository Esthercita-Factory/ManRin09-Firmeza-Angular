import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService, PlanDto } from '../../Services/Api.Service';
import { AuthService } from '../../Services/auth.service';

@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="fz-viewport">
      <!-- Top Navigation Bar -->
      <header class="top-nav">
        <a routerLink="/" class="nav-left" style="text-decoration: none;">
          <div class="brand">
            <span class="brand-name">Firmeza</span>
            <span class="brand-sub">INVENTORY PLATFORM</span>
          </div>
        </a>

        <div class="nav-right">
          <a routerLink="/" class="nav-link">Inicio</a>
          <ng-container *ngIf="!isLoggedIn">
            <a routerLink="/login" class="nav-link">Iniciar Sesión</a>
            <a routerLink="/register" class="btn-nav-primary">Crear Cuenta</a>
          </ng-container>
          <ng-container *ngIf="isLoggedIn">
            <a routerLink="/app/dashboard" class="btn-nav-primary">Ir al Panel</a>
          </ng-container>
        </div>
      </header>

      <!-- Main Content -->
      <main class="main-content">
        <h1 class="page-title">Planes para tu empresa</h1>
        <p class="page-subtitle">Elige la modalidad que mejor se adapte al volumen operativo de tu negocio.</p>

        <!-- Billing Period Toggle -->
        <div class="toggle-container">
          <span class="toggle-label" [class.active]="!isAnnual" (click)="isAnnual = false">Mensual</span>
          <label class="switch">
            <input type="checkbox" [(ngModel)]="isAnnual" />
            <span class="slider"></span>
          </label>
          <span class="toggle-label" [class.active]="isAnnual" (click)="isAnnual = true">
            Anual
            <span class="save-badge" *ngIf="isAnnual">Ahorro Anual</span>
          </span>
        </div>

        <!-- Plans Cards Grid -->
        <div class="plans-grid">
          <div
            *ngFor="let plan of plans"
            class="plan-card"
            [class.advanced-card]="plan.esRecomendado"
            [class.base-card]="!plan.esRecomendado"
          >
            <div class="card-header" [class.advanced-header]="plan.esRecomendado" [class.base-header]="!plan.esRecomendado">
              <h3>{{ plan.nombre }}</h3>
              <span *ngIf="plan.esRecomendado" class="recommended-tag">Recomendado</span>
            </div>

            <div class="card-body">
              <p class="plan-desc">{{ plan.descripcion }}</p>

              <ul class="features-list">
                <li *ngFor="let feature of plan.caracteristicas">
                  <span class="bullet">✓</span> {{ feature }}
                </li>
              </ul>

              <button
                class="btn-select"
                [class.btn-advanced]="plan.esRecomendado"
                [class.btn-base]="!plan.esRecomendado"
                (click)="selectPlan(plan)"
              >
                Comenzar con {{ plan.nombre }}
              </button>

              <div class="pricing-info">
                <div class="main-price">
                  <span class="amount">\${{ isAnnual ? (plan.precioAnual / 12 | number:'1.2-2') : (plan.precioMensual | number:'1.2-2') }}</span>
                  <span class="period">/ mes</span>
                </div>
                <div class="sub-price">
                  Facturación {{ isAnnual ? ('anual de $' + (plan.precioAnual | number:'1.2-2')) : ('mensual de $' + (plan.precioMensual | number:'1.2-2')) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Guarantees -->
        <div class="guarantees-bar">
          <div class="guarantee-item">
            <svg class="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Configuración inmediata</span>
          </div>
          <div class="guarantee-item">
            <svg class="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Cancelación flexible</span>
          </div>
          <div class="guarantee-item">
            <svg class="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Soporte técnico incluido</span>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: #f8fafc;
      color: #0f172a;
    }

    .top-nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2.5rem;
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
    }

    .nav-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .brand {
      display: flex;
      flex-direction: column;
    }

    .brand-name {
      font-size: 1.15rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
      line-height: 1.1;
    }

    .brand-sub {
      font-size: 0.58rem;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 0.08em;
    }

    .nav-right {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }

    .nav-link {
      text-decoration: none;
      color: #475569;
      font-size: 0.88rem;
      font-weight: 600;
      transition: color 0.2s;
    }

    .nav-link:hover {
      color: #1d4ed8;
    }

    .btn-nav-primary {
      text-decoration: none;
      background: #1d4ed8;
      color: #ffffff;
      font-size: 0.85rem;
      font-weight: 600;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      transition: background 0.2s;
    }

    .btn-nav-primary:hover {
      background: #1e40af;
    }

    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2.5rem 1.5rem 4rem;
      max-width: 1000px;
      margin: 0 auto;
      width: 100%;
    }

    .page-title {
      font-size: 1.85rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.03em;
      margin: 0 0 0.5rem;
      text-align: center;
    }

    .page-subtitle {
      font-size: 0.95rem;
      color: #64748b;
      margin: 0 0 2rem;
      text-align: center;
    }

    .toggle-container {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      margin-bottom: 2.5rem;
    }

    .toggle-label {
      font-size: 0.92rem;
      font-weight: 600;
      color: #64748b;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      transition: color 0.2s;
    }

    .toggle-label.active {
      color: #0f172a;
    }

    .save-badge {
      background: #dcfce7;
      color: #15803d;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.15rem 0.45rem;
      border-radius: 12px;
      border: 1px solid #bbf7d0;
    }

    .switch {
      position: relative;
      display: inline-block;
      width: 46px;
      height: 24px;
    }

    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #64748b;
      transition: 0.3s;
      border-radius: 24px;
    }

    .slider:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: 0.3s;
      border-radius: 50%;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }

    input:checked + .slider {
      background-color: #0d9488;
    }

    input:checked + .slider:before {
      transform: translateX(22px);
    }

    .plans-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 340px));
      gap: 2rem;
      justify-content: center;
      width: 100%;
      margin-bottom: 2.5rem;
    }

    .plan-card {
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.06);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .plan-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 28px -4px rgba(15, 23, 42, 0.1);
    }

    .base-card {
      border: 1px solid #e2e8f0;
    }

    .advanced-card {
      border: 2px solid #5eead4;
      box-shadow: 0 4px 24px -2px rgba(13, 148, 136, 0.15);
    }

    .card-header {
      padding: 1rem 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .card-header h3 {
      font-size: 1.05rem;
      font-weight: 700;
      margin: 0;
      color: #0f172a;
    }

    .recommended-tag {
      font-size: 0.68rem;
      font-weight: 700;
      background: #0f766e;
      color: #ffffff;
      padding: 0.2rem 0.55rem;
      border-radius: 999px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .base-header {
      background-color: #e2e8f0;
    }

    .advanced-header {
      background: #b6ebe4;
    }

    .card-body {
      padding: 1.75rem 1.5rem;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .plan-desc {
      font-size: 0.84rem;
      color: #64748b;
      margin: 0 0 1.25rem;
      line-height: 1.45;
    }

    .features-list {
      list-style: none;
      padding: 0;
      margin: 0 0 2rem 0;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .features-list li {
      font-size: 0.86rem;
      color: #334155;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .bullet {
      color: #0d9488;
      font-weight: 800;
      font-size: 0.9rem;
    }

    .btn-select {
      width: 100%;
      padding: 0.7rem 1rem;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-bottom: 1.5rem;
    }

    .btn-base {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      color: #0f172a;
    }

    .btn-base:hover {
      background: #f8fafc;
      border-color: #94a3b8;
    }

    .btn-advanced {
      background: #14726e;
      border: 1px solid #115e59;
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(20, 114, 110, 0.25);
    }

    .btn-advanced:hover {
      background: #0f5b58;
      box-shadow: 0 6px 16px rgba(20, 114, 110, 0.35);
    }

    .pricing-info {
      text-align: center;
      margin-top: auto;
    }

    .main-price {
      display: flex;
      align-items: baseline;
      justify-content: center;
      gap: 0.25rem;
      margin-bottom: 0.25rem;
    }

    .amount {
      font-size: 1.6rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.03em;
    }

    .period {
      font-size: 0.82rem;
      color: #64748b;
      font-weight: 500;
    }

    .sub-price {
      font-size: 0.8rem;
      color: #64748b;
      font-weight: 500;
    }

    .guarantees-bar {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2rem;
      margin-top: 0.5rem;
      flex-wrap: wrap;
    }

    .guarantee-item {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.82rem;
      color: #475569;
      font-weight: 500;
    }

    .check-icon {
      color: #0d9488;
    }

    @media (max-width: 680px) {
      .top-nav {
        padding: 0.85rem 1.25rem;
      }

      .plans-grid {
        grid-template-columns: 1fr;
        max-width: 340px;
      }

      .guarantees-bar {
        flex-direction: column;
        gap: 0.75rem;
      }
    }
  `]
})
export class PlansComponent implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  isAnnual = false;
  isLoggedIn = false;

  plans: PlanDto[] = [
    {
      id: 1,
      nombre: 'Plan Base',
      descripcion: 'Ideal para pequeños negocios que inician su gestión de inventario.',
      precioMensual: 29.99,
      precioAnual: 299.99,
      caracteristicas: [
        'Gestión de hasta 500 productos',
        '1 bodega o almacén principal',
        'Alertas básicas de stock mínimo',
        'Soporte estándar por correo'
      ],
      esRecomendado: false
    },
    {
      id: 2,
      nombre: 'Plan Avanzado',
      descripcion: 'Para empresas en expansión con múltiples sedes y mayor volumen.',
      precioMensual: 59.99,
      precioAnual: 599.99,
      caracteristicas: [
        'Productos y categorías ilimitadas',
        'Múltiples bodegas y transferencias internas',
        'Alertas automáticas y reportes avanzados',
        'Soporte prioritario 24/7'
      ],
      esRecomendado: true
    }
  ];

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isAuthenticated();
    this.apiService.getPlans().subscribe({
      next: (data) => {
        if (Array.isArray(data) && data.length > 0) {
          this.plans = data;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        // Fallback plans already loaded
      }
    });
  }

  selectPlan(_plan: PlanDto): void {
    if (this.isLoggedIn) {
      this.router.navigate(['/app/dashboard']);
    } else {
      this.router.navigate(['/register']);
    }
  }
}
