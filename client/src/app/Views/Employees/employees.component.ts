import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../Services/auth.service';

interface RecentEmployee {
  id: string;
  name: string;
  phone?: string;
  email: string;
  initials: string;
  initialsBg: string;
  documentType: string;
  documentNumber: string;
  role: string;
  location: string;
  status: string;
  statusClass: 'active' | 'pending';
}

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fz-viewport">
      <!-- 1. Encabezado (formato Dashboard / Inicio) -->
      <header class="fz-header">
        <div class="fz-header-left">
          <div class="fz-header-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div class="fz-header-titles">
            <div class="fz-title-row">
              <h1 class="fz-page-title">Gestión y Alta de Personal / Empleados</h1>
              <span class="fz-live-pill">
                <span class="fz-pulse-dot"></span>
                Módulo de identidad activo
              </span>
            </div>
            <div class="fz-subtitle">
              <span>RRHH &amp; Operaciones de Almacén</span>
              <span class="fz-sep">•</span>
              <span>Validación RENAPO/RUT en línea</span>
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
            <span>Descargar Plantilla</span>
          </button>

          <button class="fz-btn fz-btn-dark">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="12" y1="18" x2="12" y2="12"></line>
              <line x1="9" y1="15" x2="15" y2="15"></line>
            </svg>
            <span>Importar Nómina Masiva</span>
          </button>
        </div>
      </header>

      <!-- 2. Tarjetas de Métricas (KPIs) -->
      <section class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-content">
            <span class="kpi-label">Total Empleados Activos</span>
            <span class="kpi-val">142</span>
            <span class="kpi-sub positive"><span class="trend">+4.2%</span> vs. mes anterior (Naves A, B & C)</span>
          </div>
          <div class="kpi-icon-box blue-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
              <rect x="3" y="4" width="18" height="16" rx="2"></rect>
              <circle cx="9" cy="10" r="2"></circle>
              <line x1="15" y1="8" x2="17" y2="8"></line>
              <line x1="15" y1="12" x2="17" y2="12"></line>
              <line x1="7" y1="16" x2="17" y2="16"></line>
            </svg>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-content">
            <span class="kpi-label">Altas Este Mes</span>
            <span class="kpi-val">+12</span>
            <span class="kpi-sub">
              <span class="sub-dot blue"></span>
              8 Operadores / 4 Auditores
            </span>
          </div>
          <div class="kpi-icon-box blue-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-content">
            <span class="kpi-label">Turno en Operación Hoy</span>
            <span class="kpi-val">38</span>
            <span class="kpi-sub">Turno Diurno (06:00 - 15:30) <strong class="attendance-rate">97.4% Asistencia</strong></span>
          </div>
          <div class="kpi-icon-box blue-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
        </div>
      </section>

      <!-- 3. Sección Media: Formulario de Alta + Resumen de Colaboradores -->
      <section class="main-split-grid">
        <!-- Formulario: Alta Rápida por Cédula / Documento -->
        <div class="form-card">
          <div class="form-card-header">
            <div class="card-title-group">
              <div class="icon-indicator">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <polyline points="17 11 19 13 23 9"></polyline>
                </svg>
              </div>
              <div>
                <h2 class="card-title">Alta Rápida por Cédula / Documento</h2>
                <p class="card-subtitle">Verificación automática con registros gubernamentales y perfiles de bodega</p>
              </div>
            </div>
            <span class="step-badge">Paso 1 de 2</span>
          </div>

          <!-- Cuadro de Validación Oficial -->
          <div class="validation-callout-box">
            <label class="callout-label">NÚMERO DE IDENTIFICACIÓN / DOCUMENTO *</label>
            <div class="callout-inputs-row">
              <input 
                type="text" 
                [(ngModel)]="documentIdInput" 
                placeholder="Ej. 18.492.301-4 o 1098765432" 
                class="input-doc-number"
              />
              <button class="btn-validate" (click)="onValidateDocument()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <span>Validar</span>
              </button>
            </div>
            <div class="callout-footer-note">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Canal de consulta oficial en línea: Servicio Nacional de Registros sincronizado.</span>
            </div>
          </div>

          <!-- Campos del Formulario de Registro -->
          <form class="employee-entry-form" (ngSubmit)="onRegisterEmployee()">
            <div class="form-row two-cols">
              <div class="input-field-group">
                <label>Nombre Completo *</label>
                <div class="input-with-end-icon">
                  <input type="text" [(ngModel)]="formName" name="formName" placeholder="Ej. Carlos Mendoza Silva" class="form-input" required />
                  <svg class="end-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                  </svg>
                </div>
                <span class="field-hint">Nombre y apellidos del colaborador.</span>
              </div>

              <div class="input-field-group">
                <label>Teléfono de Contacto *</label>
                <div class="input-with-end-icon">
                  <input type="tel" [(ngModel)]="formPhone" name="formPhone" placeholder="Ej. +57 300 123 4567" class="form-input" required />
                  <svg class="end-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </div>
                <span class="field-hint">Número de teléfono móvil directo.</span>
              </div>
            </div>

            <div class="form-row two-cols">
              <div class="input-field-group">
                <label>Número de Identificación *</label>
                <input type="text" [(ngModel)]="documentIdInput" name="documentIdInput" placeholder="Ej. 18.492.301-4" class="form-input" required />
                <span class="field-hint">Cédula o documento de identidad registrado (único).</span>
              </div>

              <div class="input-field-group">
                <label>Rol / Cargo Asignado *</label>
                <input 
                  type="text" 
                  [(ngModel)]="formRole" 
                  name="formRole" 
                  placeholder="Ej. Operador de Montacargas, Supervisor, Auditor..." 
                  class="form-input" 
                  required 
                />
                <span class="field-hint">Escribe el rol o cargo específico para este colaborador.</span>
              </div>
            </div>

            <div class="form-row">
              <div class="input-field-group">
                <label>Sucursal y Sector Asignado</label>
                <select [(ngModel)]="formWarehouse" name="formWarehouse" class="form-select">
                  <option value="Almacén Central - Nave A (Sector 04)">Almacén Central - Nave A (Sector 04)</option>
                  <option value="Bodega Norte - Nave B (Andén 08)">Bodega Norte - Nave B (Andén 08)</option>
                  <option value="Centro Occidente - Nave C (Sector 01)">Centro Occidente - Nave C (Sector 01)</option>
                </select>
              </div>
            </div>

            <div *ngIf="errorMessage" class="error-banner" style="margin-top: 0.5rem; padding: 0.75rem 1rem; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; color: #dc2626; font-size: 0.82rem; font-weight: 500;">
              {{ errorMessage }}
            </div>

            <div *ngIf="successMessage" class="success-banner" style="margin-top: 0.5rem; padding: 0.75rem 1rem; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; color: #16a34a; font-size: 0.82rem; font-weight: 500;">
              {{ successMessage }}
            </div>

            <div class="form-actions-row">
              <div class="left-actions">
                <button type="button" class="btn-cancel" (click)="onResetForm()" [disabled]="isLoading">Limpiar Formulario</button>
                <button type="button" class="btn-draft" (click)="onSaveDraft()" [disabled]="isLoading">Guardar Borrador</button>
              </div>
              <button type="submit" class="btn-primary-register" [disabled]="isLoading">
                <svg *ngIf="!isLoading" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <line x1="20" y1="8" x2="20" y2="14"></line>
                  <line x1="23" y1="11" x2="17" y2="11"></line>
                </svg>
                <span>{{ isLoading ? 'Registrando en Servidor...' : 'Registrar Empleado' }}</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Columna Derecha: Tarjeta de Empleado Reciente & Distribución -->
        <div class="right-column-stack">
          <!-- Card: Empleado Registrado Recientemente -->
          <div class="profile-card">
            <div class="profile-card-header">
              <span class="card-caption">EMPLEADO REGISTRADO RECIENTEMENTE</span>
              <span class="status-badge green-badge">
                <span class="badge-dot green-dot"></span>
                Activo / Credencial Emitida
              </span>
            </div>

            <div class="profile-main-block">
              <div class="profile-avatar-box">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="#3b82f6">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <div class="profile-info-content">
                <div class="name-id-row">
                  <h3 class="profile-name">Carlos Mendoza Silva</h3>
                  <span class="id-tag">EMP-2024-089</span>
                </div>
                <p class="profile-job">Supervisor de Bahía & Auditor de Lotes</p>
                <p class="profile-wh">Almacén Central - Nave A (Sector 04)</p>
              </div>
            </div>

            <!-- Ficha Técnica 2x2 -->
            <div class="tech-specs-grid">
              <div class="tech-spec-item">
                <span class="spec-lbl">DOCUMENTO RUT</span>
                <span class="spec-val">18.492.301-4</span>
              </div>
              <div class="tech-spec-item">
                <span class="spec-lbl">CÉDULA ALTERNA / DNI</span>
                <span class="spec-val">DNI-84920184-B</span>
              </div>
              <div class="tech-spec-item">
                <span class="spec-lbl">CREDENCIAL RFID / NFC</span>
                <span class="spec-val">HEX-77A9:OPERADOR</span>
              </div>
              <div class="tech-spec-item">
                <span class="spec-lbl">CERTIFICACIÓN MAQUINARIA</span>
                <span class="spec-val link-val">ISO-9001 / Montacargas C-3</span>
              </div>
            </div>

            <div class="progress-section">
              <div class="progress-meta-row">
                <span class="progress-title">Cumplimiento Inducción de Seguridad</span>
                <span class="progress-percent">100% Completado</span>
              </div>
              <div class="bar-container">
                <div class="bar-fill full-fill"></div>
              </div>
            </div>

            <div class="profile-card-actions">
              <button class="btn-profile-outline">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <span>Ver Ficha Completa</span>
              </button>
              <button class="btn-profile-outline">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>Reasignar Turno</span>
              </button>
              <button class="btn-icon-danger" title="Dar de baja / Bloquear">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                </svg>
              </button>
            </div>
          </div>

          <!-- Card: Distribución de Personal por Nave -->
          <div class="distribution-card">
            <div class="distribution-header">
              <div class="distrib-title-group">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <h4 class="distrib-title">Distribución de Personal por Nave</h4>
              </div>
              <span class="realtime-lbl">Tiempo Real</span>
            </div>

            <div class="distribution-list">
              <div class="distrib-item">
                <div class="distrib-left">
                  <span class="dot-indicator blue-indicator"></span>
                  <span class="nave-name">Nave A - Recepción & Racks Altos</span>
                </div>
                <div class="distrib-right">
                  <strong class="count-assigned">18 / 20</strong>
                  <span class="count-label">Asignados</span>
                </div>
              </div>

              <div class="distrib-item">
                <div class="distrib-left">
                  <span class="dot-indicator blue-indicator"></span>
                  <span class="nave-name">Nave B - Despacho & Crossdock</span>
                </div>
                <div class="distrib-right">
                  <strong class="count-assigned">14 / 15</strong>
                  <span class="count-label">Asignados</span>
                </div>
              </div>

              <div class="distrib-item">
                <div class="distrib-left">
                  <span class="dot-indicator grey-indicator"></span>
                  <span class="nave-name">Bahía C - Control de Calidad y Devoluciones</span>
                </div>
                <div class="distrib-right">
                  <strong class="count-assigned">6 / 8</strong>
                  <span class="count-label">Asignados</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 4. Tabla de Registro Histórico de Altas Recientes -->
      <section class="table-card">
        <div class="table-card-header">
          <div class="table-titles">
            <div class="table-icon-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <h3 class="table-heading">Registro Histórico de Altas Recientes</h3>
            </div>
            <p class="table-subheading">Listado de operarios y personal técnico incorporados en las últimas 72 horas</p>
          </div>

          <div class="table-controls">
            <div class="search-input-box">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
              <input 
                type="text" 
                [(ngModel)]="searchQuery" 
                placeholder="Filtrar por nombre o c..." 
                class="filter-input" 
              />
            </div>
            <button class="btn-export-table">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>Exportar</span>
            </button>
          </div>
        </div>

        <div class="table-wrapper">
          <table class="employees-table">
            <thead>
              <tr>
                <th>ID PERSONAL</th>
                <th>COLABORADOR</th>
                <th>DOCUMENTO OFICIAL</th>
                <th>CARGO ASIGNADO</th>
                <th>UBICACIÓN / NAVE</th>
                <th>ESTADO CREDENCIAL</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let emp of filteredEmployees">
                <td>
                  <span class="id-mono-badge">{{ emp.id }}</span>
                </td>
                <td>
                  <div class="collab-cell">
                    <span class="avatar-circle" [style.background-color]="emp.initialsBg">{{ emp.initials }}</span>
                    <div class="collab-info">
                      <span class="collab-name">{{ emp.name }}</span>
                      <span class="collab-email">{{ emp.email }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="doc-text">{{ emp.documentNumber }}</span>
                </td>
                <td>
                  <span class="role-text">{{ emp.role }}</span>
                </td>
                <td>
                  <span class="location-text">{{ emp.location }}</span>
                </td>
                <td>
                  <span class="status-cell-badge" [ngClass]="emp.statusClass">
                    <span class="status-cell-dot"></span>
                    {{ emp.status }}
                  </span>
                </td>
                <td>
                  <div class="actions-group">
                    <button class="table-action-btn" title="Editar">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 20h9"></path>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                      </svg>
                    </button>
                    <button class="table-action-btn" title="Imprimir Credencial">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6 9 6 2 18 2 18 9"></polyline>
                        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                        <rect x="6" y="14" width="12" height="8"></rect>
                      </svg>
                    </button>
                    <button class="table-action-btn" title="Código de barras">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 5v14M8 5v14M12 5v14M17 5v14M21 5v14"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="table-footer">
          <span class="showing-count">Mostrando 3 de 142 colaboradores registrados</span>
          <div class="pagination-buttons">
            <button class="btn-page-nav">Anterior</button>
            <button class="btn-page-num active">1</button>
            <button class="btn-page-num">2</button>
            <button class="btn-page-num">3</button>
            <button class="btn-page-nav">Siguiente</button>
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

    /* 1. Header */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 1.25rem;
    }

    .header-titles {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.72rem;
      color: #64748b;
      font-family: 'JetBrains Mono', monospace;
    }

    .breadcrumb .sep {
      color: #cbd5e1;
    }

    .breadcrumb .active-crumb {
      color: #2563eb;
      font-weight: 600;
    }

    .title-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .page-title {
      font-size: 1.35rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.03em;
      margin: 0;
    }

    .status-pills-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.22rem 0.65rem;
      border-radius: 20px;
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.04em;
    }

    .blue-pill {
      background: #eff6ff;
      border: 1px solid #dbeafe;
      color: #1e40af;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
    }

    .pill-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }

    .blue-dot {
      background: #2563eb;
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
      border: 1px solid #cbd5e1;
      color: #334155;
      font-size: 0.78rem;
      font-weight: 600;
      padding: 0.5rem 0.95rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
      font-family: inherit;
    }

    .btn-action-outline:hover {
      background: #f8fafc;
      border-color: #94a3b8;
      box-shadow: 0 2px 6px rgba(15, 23, 42, 0.08);
      transform: translateY(-1px);
    }

    /* 2. KPIs Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.15rem;
    }

    .kpi-card {
      background: #ffffff;
      border: 1px solid rgba(226, 232, 240, 0.85);
      border-radius: 12px;
      padding: 1.15rem 1.3rem;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 4px 12px -2px rgba(15, 23, 42, 0.04);
      transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .kpi-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px -4px rgba(15, 23, 42, 0.08);
      border-color: rgba(203, 213, 225, 0.9);
    }

    .kpi-content {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .kpi-label {
      font-size: 0.78rem;
      font-weight: 600;
      color: #64748b;
    }

    .kpi-val {
      font-size: 1.8rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.04em;
      line-height: 1.15;
    }

    .kpi-sub {
      font-size: 0.72rem;
      color: #64748b;
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    .kpi-sub .trend {
      font-weight: 700;
      color: #2563eb;
    }

    .sub-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }

    .sub-dot.blue {
      background: #2563eb;
    }

    .attendance-rate {
      color: #2563eb;
    }

    .kpi-icon-box {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
    }

    .blue-box {
      background: #eff6ff;
      border: 1px solid #dbeafe;
    }

    /* 3. Main Split Grid */
    .main-split-grid {
      display: grid;
      grid-template-columns: 1.55fr 1fr;
      gap: 1.15rem;
    }

    /* Formulario */
    .form-card {
      background: #ffffff;
      border: 1px solid rgba(226, 232, 240, 0.85);
      border-radius: 12px;
      padding: 1.35rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.15rem;
      box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 6px 16px -2px rgba(15, 23, 42, 0.04);
    }

    .form-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .card-title-group {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .icon-indicator {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: #eff6ff;
      border: 1px solid #dbeafe;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .card-title {
      font-size: 0.98rem;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.02em;
      margin: 0;
    }

    .card-subtitle {
      font-size: 0.72rem;
      color: #64748b;
      margin: 0.15rem 0 0;
    }

    .step-badge {
      font-size: 0.68rem;
      font-weight: 700;
      color: #64748b;
      background: #f1f5f9;
      padding: 0.2rem 0.55rem;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
      font-family: 'JetBrains Mono', monospace;
    }

    .validation-callout-box {
      background: #f0f7ff;
      border: 1px solid #bfdbfe;
      border-radius: 8px;
      padding: 0.95rem 1.1rem;
      display: flex;
      flex-direction: column;
      gap: 0.55rem;
      box-shadow: 0 1px 2px rgba(37, 99, 235, 0.04);
    }

    .callout-label {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: #1e40af;
      text-transform: uppercase;
    }

    .callout-inputs-row {
      display: flex;
      gap: 0.6rem;
    }

    .select-doc-type {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 0.45rem 0.65rem;
      font-size: 0.78rem;
      color: #1e293b;
      font-weight: 600;
      outline: none;
      font-family: inherit;
    }

    .input-doc-number {
      flex: 1;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 0.45rem 0.75rem;
      font-size: 0.78rem;
      color: #0f172a;
      outline: none;
      font-family: inherit;
      box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.03);
    }

    .input-doc-number:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
    }

    .btn-validate {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: #2563eb;
      border: 1px solid #1d4ed8;
      color: #ffffff;
      font-size: 0.78rem;
      font-weight: 600;
      padding: 0.45rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      box-shadow: 0 1px 3px rgba(37, 99, 235, 0.25);
      transition: all 0.18s ease;
      font-family: inherit;
    }

    .btn-validate:hover {
      background: #1d4ed8;
      box-shadow: 0 2px 6px rgba(37, 99, 235, 0.35);
    }

    .callout-footer-note {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.7rem;
      color: #1e40af;
      font-family: 'JetBrains Mono', monospace;
    }

    .employee-entry-form {
      display: flex;
      flex-direction: column;
      gap: 0.95rem;
    }

    .form-row {
      display: grid;
      gap: 1rem;
    }

    .two-cols {
      grid-template-columns: 1fr 1fr;
    }

    .three-cols {
      grid-template-columns: 1fr 1fr 1fr;
    }

    .input-field-group {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }

    .input-field-group label {
      font-size: 0.74rem;
      font-weight: 600;
      color: #334155;
    }

    .form-input, .form-select {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 0.45rem 0.75rem;
      font-size: 0.78rem;
      color: #0f172a;
      outline: none;
      font-family: inherit;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.02);
      transition: all 0.18s ease;
    }

    .form-input:focus, .form-select:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
    }

    .input-with-end-icon {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-with-end-icon input {
      width: 100%;
      padding-right: 2rem;
    }

    .end-icon {
      position: absolute;
      right: 0.65rem;
    }

    .field-hint {
      font-size: 0.68rem;
      color: #64748b;
    }

    .checkbox-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.25rem 0;
    }

    .checkbox-input {
      width: 16px;
      height: 16px;
      accent-color: #2563eb;
      cursor: pointer;
    }

    .checkbox-row label {
      font-size: 0.74rem;
      color: #334155;
      cursor: pointer;
    }

    .form-actions-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 0.6rem;
      border-top: 1px solid #f1f5f9;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .left-actions {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .btn-cancel, .btn-draft {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      color: #475569;
      font-size: 0.76rem;
      font-weight: 600;
      padding: 0.45rem 0.85rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s ease;
      font-family: inherit;
    }

    .btn-cancel:hover, .btn-draft:hover {
      background: #f8fafc;
      border-color: #94a3b8;
    }

    .btn-primary-register {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      border: 1px solid #1d4ed8;
      color: #ffffff;
      font-size: 0.78rem;
      font-weight: 600;
      padding: 0.5rem 1.1rem;
      border-radius: 6px;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
      transition: all 0.18s ease;
      font-family: inherit;
    }

    .btn-primary-register:hover {
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.42);
      transform: translateY(-1px);
    }

    /* Columna Derecha */
    .right-column-stack {
      display: flex;
      flex-direction: column;
      gap: 1.15rem;
    }

    .profile-card, .distribution-card {
      background: #ffffff;
      border: 1px solid rgba(226, 232, 240, 0.85);
      border-radius: 12px;
      padding: 1.25rem 1.3rem;
      display: flex;
      flex-direction: column;
      gap: 0.95rem;
      box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 4px 12px -2px rgba(15, 23, 42, 0.04);
    }

    .profile-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .card-caption {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: #64748b;
      font-family: 'JetBrains Mono', monospace;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.18rem 0.55rem;
      border-radius: 4px;
      font-size: 0.64rem;
      font-weight: 700;
    }

    .green-badge {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      color: #059669;
    }

    .green-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: #10b981;
    }

    .profile-main-block {
      display: flex;
      align-items: center;
      gap: 0.95rem;
    }

    .profile-avatar-box {
      width: 54px;
      height: 54px;
      border-radius: 10px;
      background: #eff6ff;
      border: 1px solid #dbeafe;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 2px 6px rgba(37, 99, 235, 0.1);
    }

    .profile-info-content {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .name-id-row {
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
    }

    .profile-name {
      font-size: 0.92rem;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.015em;
      margin: 0;
    }

    .id-tag {
      font-size: 0.68rem;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      color: #2563eb;
    }

    .profile-job {
      font-size: 0.74rem;
      font-weight: 600;
      color: #334155;
      margin: 0;
    }

    .profile-wh {
      font-size: 0.68rem;
      color: #64748b;
      margin: 0;
    }

    .tech-specs-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.65rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 0.75rem 0.85rem;
    }

    .tech-spec-item {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .spec-lbl {
      font-size: 0.6rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: #64748b;
      font-family: 'JetBrains Mono', monospace;
    }

    .spec-val {
      font-size: 0.72rem;
      font-weight: 700;
      color: #1e293b;
      font-family: 'JetBrains Mono', monospace;
    }

    .link-val {
      color: #2563eb;
      text-decoration: underline;
      cursor: pointer;
    }

    .progress-section {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .progress-meta-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.68rem;
      font-family: 'JetBrains Mono', monospace;
    }

    .progress-title {
      color: #64748b;
      font-weight: 600;
    }

    .progress-percent {
      color: #0f172a;
      font-weight: 700;
    }

    .bar-container {
      height: 6px;
      background: #e2e8f0;
      border-radius: 6px;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #3b82f6, #2563eb);
      border-radius: 6px;
    }

    .full-fill {
      width: 100%;
    }

    .profile-card-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-profile-outline {
      flex: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.35rem;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      color: #334155;
      font-size: 0.72rem;
      font-weight: 600;
      padding: 0.45rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s ease;
      font-family: inherit;
    }

    .btn-profile-outline:hover {
      background: #f8fafc;
      border-color: #94a3b8;
    }

    .btn-icon-danger {
      background: #ffffff;
      border: 1px solid #fecaca;
      border-radius: 6px;
      padding: 0.45rem 0.55rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
    }

    .btn-icon-danger:hover {
      background: #fee2e2;
    }

    /* Distribution Card */
    .distribution-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .distrib-title-group {
      display: flex;
      align-items: center;
      gap: 0.45rem;
    }

    .distrib-title {
      font-size: 0.85rem;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.015em;
      margin: 0;
    }

    .realtime-lbl {
      font-size: 0.65rem;
      font-family: 'JetBrains Mono', monospace;
      color: #64748b;
      font-weight: 600;
    }

    .distribution-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .distrib-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8fafc;
      border: 1px solid #f1f5f9;
      border-radius: 6px;
      padding: 0.55rem 0.75rem;
    }

    .distrib-left {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .dot-indicator {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }

    .blue-indicator {
      background: #2563eb;
    }

    .grey-indicator {
      background: #64748b;
    }

    .nave-name {
      font-size: 0.74rem;
      font-weight: 500;
      color: #334155;
    }

    .distrib-right {
      display: flex;
      align-items: baseline;
      gap: 0.3rem;
    }

    .count-assigned {
      font-size: 0.78rem;
      font-weight: 700;
      color: #0f172a;
    }

    .count-label {
      font-size: 0.66rem;
      color: #64748b;
    }

    /* 4. Tabla de Registros Recientes */
    .table-card {
      background: #ffffff;
      border: 1px solid rgba(226, 232, 240, 0.85);
      border-radius: 12px;
      padding: 1.25rem 1.4rem 1rem;
      display: flex;
      flex-direction: column;
      box-shadow: 0 1px 4px 0 rgba(15, 23, 42, 0.04), 0 8px 24px -4px rgba(15, 23, 42, 0.04);
    }

    .table-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.85rem;
      margin-bottom: 1rem;
    }

    .table-icon-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .table-heading {
      font-size: 0.98rem;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.02em;
      margin: 0;
    }

    .table-subheading {
      font-size: 0.72rem;
      color: #64748b;
      margin: 0.15rem 0 0;
    }

    .table-controls {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }

    .search-input-box {
      display: flex;
      align-items: center;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 0.4rem 0.75rem;
      gap: 0.45rem;
      width: 220px;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
    }

    .filter-input {
      border: none;
      background: transparent;
      outline: none;
      font-size: 0.76rem;
      color: #0f172a;
      width: 100%;
      font-family: inherit;
    }

    .btn-export-table {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 0.45rem 0.85rem;
      font-size: 0.76rem;
      font-weight: 600;
      color: #334155;
      cursor: pointer;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
      transition: all 0.15s ease;
      font-family: inherit;
    }

    .btn-export-table:hover {
      background: #f8fafc;
      border-color: #94a3b8;
    }

    .table-wrapper {
      overflow-x: auto;
    }

    .employees-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.76rem;
    }

    .employees-table th {
      text-align: left;
      padding: 0.75rem 0.85rem;
      font-size: 0.66rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: #64748b;
      border-bottom: 1px solid #e2e8f0;
      text-transform: uppercase;
      background: #ffffff;
      font-family: 'JetBrains Mono', monospace;
    }

    .employees-table td {
      padding: 0.85rem 0.85rem;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: middle;
      transition: background-color 0.15s ease;
    }

    .employees-table tbody tr:hover td {
      background-color: #f8fafc;
    }

    .id-mono-badge {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      color: #2563eb;
      font-size: 0.72rem;
    }

    .collab-cell {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }

    .avatar-circle {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.65rem;
      font-weight: 700;
    }

    .collab-info {
      display: flex;
      flex-direction: column;
    }

    .collab-name {
      font-weight: 700;
      color: #0f172a;
      font-size: 0.78rem;
    }

    .collab-email {
      font-size: 0.68rem;
      color: #64748b;
    }

    .doc-text {
      font-size: 0.72rem;
      color: #334155;
      font-family: 'JetBrains Mono', monospace;
    }

    .role-text {
      font-size: 0.75rem;
      font-weight: 500;
      color: #1e293b;
    }

    .location-text {
      font-size: 0.74rem;
      color: #475569;
    }

    .status-cell-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.2rem 0.55rem;
      border-radius: 4px;
      font-size: 0.66rem;
      font-weight: 700;
    }

    .status-cell-badge.active {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      color: #059669;
    }

    .status-cell-badge.pending {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      color: #475569;
    }

    .status-cell-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: currentColor;
    }

    .actions-group {
      display: flex;
      align-items: center;
      gap: 0.45rem;
    }

    .table-action-btn {
      background: transparent;
      border: 1px solid transparent;
      padding: 0.35rem;
      border-radius: 4px;
      color: #64748b;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
    }

    .table-action-btn:hover {
      background: #f1f5f9;
      color: #0f172a;
      border-color: #e2e8f0;
    }

    .table-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1rem;
      border-top: 1px solid #f1f5f9;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .showing-count {
      font-size: 0.73rem;
      color: #64748b;
      font-family: 'JetBrains Mono', monospace;
    }

    .pagination-buttons {
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    .btn-page-nav {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 0.32rem 0.7rem;
      font-size: 0.74rem;
      color: #64748b;
      cursor: pointer;
      font-family: inherit;
    }

    .btn-page-nav:hover {
      background: #f8fafc;
      color: #0f172a;
    }

    .btn-page-num {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #cbd5e1;
      background: #ffffff;
      border-radius: 6px;
      font-size: 0.74rem;
      color: #64748b;
      cursor: pointer;
      font-family: inherit;
    }

    .btn-page-num.active {
      background: #2563eb;
      border-color: #2563eb;
      color: #ffffff;
      font-weight: 700;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .kpi-grid {
        grid-template-columns: 1fr;
      }
      .main-split-grid {
        grid-template-columns: 1fr;
      }
      .two-cols, .three-cols {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class EmployeesComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = 'http://localhost:5235/api/employees';

  documentIdInput = '';
  formName = '';
  formPhone = '';
  formRole = '';
  formWarehouse = 'Almacén Central - Nave A (Sector 04)';

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  searchQuery = '';

  employeesList: RecentEmployee[] = [
    {
      id: 'EMP-2024-089',
      name: 'Carlos Mendoza Silva',
      phone: '+57 310 445 8899',
      email: 'c.mendoza@firmeza-logistics.com',
      initials: 'CM',
      initialsBg: '#2563eb',
      documentType: 'Doc',
      documentNumber: '18.492.301-4',
      role: 'Supervisor de Bahía & Auditor',
      location: 'Nave A - Sector 04',
      status: 'Activo / Registrado',
      statusClass: 'active'
    },
    {
      id: 'EMP-2024-088',
      name: 'Lorena Toledo Rivas',
      phone: '+57 320 892 1144',
      email: 'l.toledo@firmeza-logistics.com',
      initials: 'LT',
      initialsBg: '#0f766e',
      documentType: 'Doc',
      documentNumber: '72.849.102-K',
      role: 'Operador de Montacargas',
      location: 'Nave B - Andén 08',
      status: 'Activo / Registrado',
      statusClass: 'active'
    },
    {
      id: 'EMP-2024-087',
      name: 'Matías Alarcón Soto',
      phone: '+57 315 776 2233',
      email: 'm.alarcon@firmeza-logistics.com',
      initials: 'MA',
      initialsBg: '#64748b',
      documentType: 'Doc',
      documentNumber: '1098765432',
      role: 'Operador de Picking & Radiofrecuencia',
      location: 'Bahía C - Control',
      status: 'Pendiente Validación',
      statusClass: 'pending'
    }
  ];

  ngOnInit(): void {
    this.fetchEmployeesFromApi();
  }

  fetchEmployeesFromApi(): void {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: RecentEmployee[] = data.map(item => ({
            id: `EMP-${item.id}`,
            name: item.fullName,
            phone: item.phone,
            email: item.phone ? `Tel: ${item.phone}` : 'Sin teléfono',
            initials: item.fullName.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase(),
            initialsBg: '#2563eb',
            documentType: 'Doc',
            documentNumber: item.documentNumber,
            role: item.role || 'Colaborador',
            location: this.formWarehouse,
            status: item.isActive ? 'Activo / Registrado' : 'Inactivo',
            statusClass: item.isActive ? 'active' : 'pending'
          }));
          this.employeesList = mapped;
        }
      },
      error: () => {
        // En caso de que no haya sesión o conexión, se preserva la lista local previa
      }
    });
  }

  get filteredEmployees(): RecentEmployee[] {
    if (!this.searchQuery.trim()) {
      return this.employeesList;
    }
    const q = this.searchQuery.toLowerCase();
    return this.employeesList.filter(e => 
      e.name.toLowerCase().includes(q) || 
      e.id.toLowerCase().includes(q) ||
      e.documentNumber.toLowerCase().includes(q) ||
      e.role.toLowerCase().includes(q) ||
      (e.phone && e.phone.toLowerCase().includes(q))
    );
  }

  onValidateDocument(): void {
    if (this.documentIdInput.trim()) {
      this.errorMessage = '';
      this.successMessage = `Documento ${this.documentIdInput} listo para registrar.`;
    }
  }

  onResetForm(): void {
    this.formName = '';
    this.formPhone = '';
    this.documentIdInput = '';
    this.formRole = '';
    this.errorMessage = '';
    this.successMessage = '';
  }

  onSaveDraft(): void {
    alert('Borrador guardado localmente.');
  }

  onRegisterEmployee(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.formName.trim()) {
      this.errorMessage = 'Por favor ingrese el nombre completo del empleado.';
      return;
    }
    if (!this.documentIdInput.trim()) {
      this.errorMessage = 'Por favor ingrese el número de identificación del empleado.';
      return;
    }
    if (!this.formRole.trim()) {
      this.errorMessage = 'Por favor escriba el rol o cargo asignado para el colaborador.';
      return;
    }

    const payload = {
      documentNumber: this.documentIdInput.trim(),
      fullName: this.formName.trim(),
      phone: this.formPhone.trim(),
      role: this.formRole.trim(),
      isActive: true
    };

    this.isLoading = true;

    // Realizar POST al endpoint /api/employees del backend
    this.http.post<any>(this.apiUrl, payload).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = `Empleado ${response.fullName || payload.fullName} registrado con éxito en el servidor.`;

        const newEmp: RecentEmployee = {
          id: `EMP-${response.id || Math.floor(Math.random() * 900 + 100)}`,
          name: response.fullName || payload.fullName,
          phone: response.phone || payload.phone,
          email: payload.phone ? `Tel: ${payload.phone}` : 'Sin teléfono',
          initials: payload.fullName.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase(),
          initialsBg: '#1e40af',
          documentType: 'Doc',
          documentNumber: response.documentNumber || payload.documentNumber,
          role: response.role || payload.role,
          location: this.formWarehouse,
          status: 'Activo / Registrado',
          statusClass: 'active'
        };

        this.employeesList.unshift(newEmp);
        this.onResetForm();
        this.successMessage = `Empleado ${newEmp.name} dado de alta exitosamente.`;
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401 || err.status === 403) {
          this.errorMessage = 'Acceso denegado: Solo los usuarios logueados con perfil de Empresa pueden registrar empleados.';
        } else if (err.error?.message) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = 'Ocurrió un error al procesar el registro del empleado. Verifique su conexión y permisos.';
        }
      }
    });
  }
}
