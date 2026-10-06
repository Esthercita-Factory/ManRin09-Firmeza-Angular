import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface EnterpriseItem {
  id: number;
  businessName: string;
  taxId: string;
  contactName: string;
  corporateEmail: string;
  corporatePhone: string;
  isActive: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-enterprises',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="enterprises-view">
      <div class="header-section">
        <div>
          <h1 class="page-title">Directorio de Empresas</h1>
          <p class="page-subtitle">Organizaciones y cuentas corporativas dadas de alta en la plataforma Firmeza.</p>
        </div>
      </div>

      <div class="enterprises-grid">
        <div class="enterprise-card">
          <div class="card-top">
            <div class="company-badge">CORP</div>
            <span class="status-indicator active">Activa</span>
          </div>
          <h3 class="company-name">Logística Global S.A.</h3>
          <p class="tax-code">RFC / NIT: LGL240101-XX1</p>

          <div class="contact-info">
            <div class="info-row">
              <span class="info-label">Contacto:</span>
              <span class="info-val">Carlos Mendoza</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email:</span>
              <span class="info-val">contacto&#64;logisticaglobal.com</span>
            </div>
            <div class="info-row">
              <span class="info-label">Teléfono:</span>
              <span class="info-val">+57 601 234 5678</span>
            </div>
          </div>
        </div>

        <div class="enterprise-card">
          <div class="card-top">
            <div class="company-badge">IND</div>
            <span class="status-indicator active">Activa</span>
          </div>
          <h3 class="company-name">Distribuidora Andina S.A.S.</h3>
          <p class="tax-code">RFC / NIT: DAN980315-YY2</p>

          <div class="contact-info">
            <div class="info-row">
              <span class="info-label">Contacto:</span>
              <span class="info-val">María Fernanda Gómez</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email:</span>
              <span class="info-val">operaciones&#64;andina.com</span>
            </div>
            <div class="info-row">
              <span class="info-label">Teléfono:</span>
              <span class="info-val">+57 604 555 1234</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .enterprises-view {
      padding: 2rem;
      max-width: 1300px;
      margin: 0 auto;
    }

    .header-section {
      margin-bottom: 2rem;
    }

    .page-title {
      font-size: 1.65rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 0.25rem 0;
    }

    .page-subtitle {
      color: #64748b;
      font-size: 0.9rem;
      margin: 0;
    }

    .enterprises-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 1.5rem;
    }

    .enterprise-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .enterprise-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
    }

    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .company-badge {
      font-size: 0.7rem;
      font-weight: 800;
      background: #eff6ff;
      color: #2563eb;
      padding: 0.2rem 0.55rem;
      border-radius: 6px;
      letter-spacing: 0.05em;
    }

    .status-indicator {
      font-size: 0.75rem;
      font-weight: 600;
      color: #15803d;
      background: #dcfce7;
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
    }

    .company-name {
      font-size: 1.15rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 0.25rem 0;
    }

    .tax-code {
      font-size: 0.8rem;
      font-weight: 600;
      color: #64748b;
      margin: 0 0 1.25rem 0;
    }

    .contact-info {
      border-top: 1px solid #f1f5f9;
      padding-top: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
    }

    .info-label {
      color: #64748b;
    }

    .info-val {
      color: #1e293b;
      font-weight: 500;
    }
  `]
})
export class EnterprisesComponent implements OnInit {
  ngOnInit(): void {}
}
