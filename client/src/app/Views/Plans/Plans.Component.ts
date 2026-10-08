import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fz-viewport">
      <!-- Top Navigation Bar -->
      <header class="top-nav">
        <div class="nav-left">
          <button class="menu-btn" type="button" aria-label="Menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          <div class="brand">
            <span class="brand-name">Firmeza</span>
            <span class="brand-sub">INVENTORY PLATFORM</span>
          </div>
        </div>

        <div class="nav-right">
          <div class="user-menu">
            <span class="user-avatar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="8" r="4"></circle>
                <path d="M20 21a8 8 0 0 0-16 0"></path>
              </svg>
            </span>
            <span class="user-name">Usen</span>
            <svg class="chevron-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>
      </header>

      <!-- Stepper / Breadcrumbs -->
      <nav class="steps-nav">
        <span class="step-item">Crear Empresa</span>
        <span class="step-separator">&gt;</span>
        <span class="step-item active">Planes</span>
        <span class="step-separator">&gt;</span>
        <span class="step-item">Configuración</span>
      </nav>

      <!-- Main Content -->
      <main class="main-content">
        <h1 class="page-title">Selecciona el plan para tu nueva empresa</h1>

        <!-- Billing Period Toggle -->
        <div class="toggle-container">
          <span class="toggle-label" [class.active]="!isAnnual" (click)="isAnnual = false">Mensual</span>
          <label class="switch">
            <input type="checkbox" [(ngModel)]="isAnnual" />
            <span class="slider"></span>
          </label>
          <span class="toggle-label" [class.active]="isAnnual" (click)="isAnnual = true">
            Anual
            <span class="save-badge" *ngIf="isAnnual">-10% Ahorro</span>
          </span>
        </div>

        <!-- Plans Cards Grid -->
        <div class="plans-grid">
          <!-- Card: Plan Base -->
          <div class="plan-card base-card">
            <div class="card-header base-header">
              <h3>Plan Base</h3>
            </div>
            
            <div class="card-body">
              <ul class="features-list">
                <li><span class="bullet">•</span> Gestión básica de inventario</li>
                <li><span class="bullet">•</span> 1 Almacén</li>
                <li><span class="bullet">•</span> Próximamente</li>
                <li><span class="bullet">•</span> etc.</li>
              </ul>

              <button class="btn-select btn-base" (click)="selectPlan('base')">
                Elegir
              </button>

              <div class="pricing-info">
                <div class="main-price">
                  <span class="amount">\${{ isAnnual ? '9' : '10' }}</span>
                  <span class="period">/ mensual</span>
                </div>
                <div class="sub-price">
                  \${{ isAnnual ? '108' : '120' }} / anual
                </div>
              </div>
            </div>
          </div>

          <!-- Card: Plan Avanzado / Superior -->
          <div class="plan-card advanced-card">
            <div class="card-header advanced-header">
              <h3>Plan Avanzado</h3>
            </div>
            
            <div class="card-body">
              <ul class="features-list">
                <li><span class="bullet">•</span> Gestión básica de inventario</li>
                <li><span class="bullet">•</span> 1 Almacén</li>
                <li><span class="bullet">•</span> Próximamente</li>
                <li><span class="bullet">•</span> etc.</li>
              </ul>

              <button class="btn-select btn-advanced" (click)="selectPlan('avanzado')">
                Elegir
              </button>

              <div class="pricing-info">
                <div class="main-price">
                  <span class="amount">\${{ isAnnual ? '45' : '50' }}</span>
                  <span class="period">/ mensual</span>
                </div>
                <div class="sub-price">
                  \${{ isAnnual ? '540' : '600' }} / anual
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Trust Badges / Guarantees -->
        <div class="guarantees-bar">
          <div class="guarantee-item">
            <svg class="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Sin tarjeta requerida</span>
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
            <span>Integración nativa AI</span>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    /* Top Navigation */
    .top-nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.85rem 2.5rem;
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
    }

    .nav-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .menu-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      color: #475569;
      cursor: pointer;
      transition: all 0.2s;
    }

    .menu-btn:hover {
      background: #e2e8f0;
      color: #0f172a;
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
    }

    .user-menu {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 0.75rem;
      border-radius: 20px;
      cursor: pointer;
      color: #475569;
      transition: background 0.2s;
    }

    .user-menu:hover {
      background: #f1f5f9;
    }

    .user-avatar {
      display: flex;
      align-items: center;
      color: #64748b;
    }

    .user-name {
      font-size: 0.88rem;
      font-weight: 500;
      color: #334155;
    }

    .chevron-icon {
      color: #94a3b8;
    }

    /* Steps Breadcrumbs */
    .steps-nav {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      padding: 1.75rem 1rem 0.5rem;
      font-size: 0.84rem;
      color: #64748b;
    }

    .step-item {
      font-weight: 500;
    }

    .step-item.active {
      font-weight: 700;
      color: #0f172a;
      text-decoration: underline;
      text-underline-offset: 4px;
      text-decoration-thickness: 2px;
    }

    .step-separator {
      color: #cbd5e1;
      font-size: 0.75rem;
    }

    /* Main Container */
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1rem 1.5rem 4rem;
      max-width: 1000px;
      margin: 0 auto;
      width: 100%;
    }

    .page-title {
      font-size: 1.75rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.03em;
      margin: 1rem 0 1.5rem;
      text-align: center;
    }

    /* Toggle Switch */
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

    /* Plans Grid */
    .plans-grid {
      display: grid;
      grid-template-columns: repeat(2, 280px);
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
      padding: 0.85rem 1rem;
      text-align: center;
    }

    .card-header h3 {
      font-size: 1.05rem;
      font-weight: 700;
      margin: 0;
      color: #0f172a;
    }

    .base-header {
      background-color: #cbd5e1;
    }

    .advanced-header {
      background-color: #bbf7d0;
      background: #b6ebe4;
    }

    .card-body {
      padding: 1.75rem 1.5rem;
      display: flex;
      flex-direction: column;
      flex: 1;
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
      color: #334155;
      font-size: 1.1rem;
      line-height: 0;
    }

    .btn-select {
      width: 100%;
      padding: 0.65rem 1rem;
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

    /* Guarantees Bar */
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
        max-width: 320px;
      }

      .guarantees-bar {
        flex-direction: column;
        gap: 0.75rem;
      }
    }
  `]
})
export class PlansComponent {
  isAnnual = false;

  selectPlan(plan: 'base' | 'avanzado'): void {
    console.log(`Plan seleccionado: ${plan}, modalidad: ${this.isAnnual ? 'Anual' : 'Mensual'}`);
  }
}
