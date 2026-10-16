import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../Services/auth.service';
import { EmployeeService, EmployeeDto, CreateEmployeeDto, UpdateEmployeeDto } from '../../Services/Employee.Service';
import Swal from 'sweetalert2';

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
  location?: string;
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
        <!-- 1. Total de Empleados -->
        <div class="kpi-card">
          <div class="kpi-content">
            <span class="kpi-label">Total de Empleados</span>
            <span class="kpi-val">{{ totalEmployeesCount }}</span>
            <span class="kpi-sub positive"><span class="trend">Registrados</span> en la empresa</span>
          </div>
          <div class="kpi-icon-box blue-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
        </div>

        <!-- 2. Empleados Activos -->
        <div class="kpi-card">
          <div class="kpi-content">
            <span class="kpi-label">Empleados Activos</span>
            <span class="kpi-val" style="color: #059669;">{{ activeEmployeesCount }}</span>
            <span class="kpi-sub">
              <span class="sub-dot green"></span>
              <strong style="color: #059669;">Habilitados</strong> para operar
            </span>
          </div>
          <div class="kpi-icon-box green-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
        </div>

        <!-- 3. Empleados Inactivos -->
        <div class="kpi-card">
          <div class="kpi-content">
            <span class="kpi-label">Empleados Inactivos</span>
            <span class="kpi-val" style="color: #dc2626;">{{ inactiveEmployeesCount }}</span>
            <span class="kpi-sub">
              <span class="sub-dot red"></span>
              <strong style="color: #dc2626;">Suspendidos</strong> o no vigentes
            </span>
          </div>
          <div class="kpi-icon-box red-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
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

          <!-- Cuadro de Validación Oficial / Búsqueda por Cédula (GET) -->
          <div class="validation-callout-box">
            <label class="callout-label">NÚMERO DE IDENTIFICACIÓN / DOCUMENTO *</label>
            <div class="callout-inputs-row">
              <input 
                type="text" 
                [(ngModel)]="searchDocumentInput" 
                (keydown.enter)="onSearchEmployeeByDocument()"
                placeholder="Ej. 18.492.301-4 o 1098765432" 
                class="input-doc-number"
              />
              <button class="btn-validate" (click)="onSearchEmployeeByDocument()" [disabled]="isSearching">
                <svg *ngIf="!isSearching" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <span>{{ isSearching ? 'Consultando...' : 'Buscar / Validar' }}</span>
              </button>
            </div>
            <div class="callout-footer-note">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Consulta por Cédula en tiempo real mediante GET hacia la base de datos corporativa.</span>
            </div>
          </div>

          <!-- Campos del Formulario de Registro (POST) -->
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
                <label>Número de Identificación / Cédula *</label>
                <input type="text" [(ngModel)]="formDocumentNumber" name="formDocumentNumber" placeholder="Ej. 18.492.301-4 o 1098765432" class="form-input" required />
                <span class="field-hint">Cédula o documento de identidad registrado (único).</span>
              </div>

              <div class="input-field-group creatable-role-group">
                <label>Rol / Cargo Asignado *</label>
                <div class="combobox-wrapper">
                  <input 
                    type="text" 
                    [(ngModel)]="formRole" 
                    name="formRole" 
                    (focus)="openRoleDropdown()" 
                    (click)="openRoleDropdown()" 
                    (blur)="closeRoleDropdownDelayed()"
                    placeholder="Escribe o selecciona un rol..." 
                    class="form-input combobox-input" 
                    autocomplete="off"
                    required 
                  />
                  <button type="button" class="combobox-arrow-btn" (click)="toggleRoleDropdown()" tabindex="-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                </div>

                <!-- Menú Desplegable de Roles -->
                <div *ngIf="isRoleDropdownOpen" class="role-dropdown-menu">
                  <div class="role-dropdown-header">Roles sugeridos y existentes</div>
                  
                  <div class="role-dropdown-list">
                    <div 
                      *ngFor="let r of filteredFormRoles" 
                      class="role-dropdown-item" 
                      [class.selected]="formRole.toLowerCase() === r.toLowerCase()"
                      (mousedown)="selectRole(r)">
                      <span class="role-item-name">{{ r }}</span>
                      <svg *ngIf="formRole.toLowerCase() === r.toLowerCase()" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.5">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>

                    <div *ngIf="filteredFormRoles.length === 0 && !isFormRoleNew" class="role-dropdown-empty">
                      No hay roles que coincidan
                    </div>
                  </div>

                  <!-- Opción de Crear Nuevo Rol si lo escrito no existe -->
                  <div 
                    *ngIf="isFormRoleNew" 
                    class="role-dropdown-create-btn" 
                    (mousedown)="createAndSelectRole(formRole)">
                    <div class="create-icon-circle">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </div>
                    <div class="create-text-group">
                      <span class="create-title">+ Crear nuevo rol:</span>
                      <span class="create-val">"{{ formRole.trim() }}"</span>
                    </div>
                  </div>
                </div>

                <span class="field-hint">Puedes escribir un nuevo rol o elegir uno existente de la lista.</span>
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
          <!-- Card: Empleado Consultado / Reciente -->
          <div class="profile-card">
            <!-- Caso 0: Animación de Carga mientras se consulta por Cédula (isSearching = true) -->
            <div *ngIf="isSearching" class="searching-spinner-box">
              <div class="spinner-ring"></div>
              <h3 class="searching-title">Consultando Empleado...</h3>
              <p class="searching-desc">Verificando número de documento en la base de datos corporativa.</p>
            </div>

            <!-- Caso A: Estado Inicial sin empleado buscado o seleccionado -->
            <div *ngIf="!isSearching && !activeEmployee" class="no-employee-empty-state">
              <div class="empty-icon-box">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <circle cx="19" cy="11" r="2"></circle>
                  <line x1="19" y1="15" x2="19.01" y2="15"></line>
                </svg>
              </div>
              <h3 class="empty-title">No has buscado empleados</h3>
              <p class="empty-desc">Ingresa un número de cédula en la casilla de búsqueda superior para consultar la información de un colaborador registrado o completa el formulario para dar de alta uno nuevo.</p>
            </div>

            <!-- Caso B: Empleado consultado por GET o registrado por POST (activeEmployee != null) -->
            <ng-container *ngIf="!isSearching && activeEmployee">
              <div class="profile-card-header">
                <span class="card-caption">COLABORADOR CONSULTADO / ENCONTRADO</span>
                <div class="header-status-controls">
                  <span class="status-badge" [ngClass]="activeEmployee.isActive ? 'green-badge' : 'gray-badge'">
                    <span class="badge-dot" [ngClass]="activeEmployee.isActive ? 'green-dot' : 'gray-dot'"></span>
                    {{ activeEmployee.isActive ? 'Activo' : 'Inactivo' }}
                  </span>
                  <button 
                    type="button" 
                    class="btn-toggle-badge" 
                    [ngClass]="activeEmployee.isActive ? 'btn-deactivate' : 'btn-activate'"
                    (click)="onToggleActiveStatus()"
                    [disabled]="isUpdatingStatus">
                    <span *ngIf="isUpdatingStatus">Guardando...</span>
                    <span *ngIf="!isUpdatingStatus && activeEmployee.isActive">Desactivar</span>
                    <span *ngIf="!isUpdatingStatus && !activeEmployee.isActive">Activar</span>
                  </button>
                </div>
              </div>

              <!-- Vista Normal (cuando no se está editando) -->
              <ng-container *ngIf="!isEditingActive">
                <div class="profile-main-block">
                  <div class="profile-avatar-box">
                    <span class="profile-avatar-initials">{{ activeEmployeeInitials }}</span>
                  </div>
                  <div class="profile-info-content">
                    <div class="name-id-row">
                      <h3 class="profile-name">{{ activeEmployee.fullName }}</h3>
                      <span class="id-tag">EMP-{{ activeEmployee.id }}</span>
                    </div>
                    <p class="profile-job">{{ activeEmployee.role || 'Colaborador Registrado' }}</p>
                  </div>
                </div>

                <!-- Ficha Técnica Dinámica con los datos del empleado en BD -->
                <div class="tech-specs-grid">
                  <div class="tech-spec-item">
                    <span class="spec-lbl">DOCUMENTO / CÉDULA</span>
                    <span class="spec-val">{{ activeEmployee.documentNumber }}</span>
                  </div>
                  <div class="tech-spec-item">
                    <span class="spec-lbl">TELÉFONO DE CONTACTO</span>
                    <span class="spec-val">{{ activeEmployee.phone || 'Sin teléfono' }}</span>
                  </div>
                  <div class="tech-spec-item">
                    <span class="spec-lbl">ESTADO OPERACIONAL</span>
                    <span class="spec-val" [style.color]="activeEmployee.isActive ? '#059669' : '#dc2626'">
                      {{ activeEmployee.isActive ? 'Habilitado / Activo' : 'Desactivado / Inactivo' }}
                    </span>
                  </div>
                  <div class="tech-spec-item">
                    <span class="spec-lbl">REGISTRADO EN BD</span>
                    <span class="spec-val">{{ activeEmployee.createdAt ? (activeEmployee.createdAt | date:'shortDate') : 'Hoy' }}</span>
                  </div>
                </div>

                <div class="profile-card-actions">
                  <button class="btn-profile-primary" (click)="onStartEditActive()">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 20h9"></path>
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                    </svg>
                    <span>Editar Empleado</span>
                  </button>
                  <button 
                    class="btn-profile-outline" 
                    [ngClass]="activeEmployee.isActive ? 'btn-outline-danger' : 'btn-outline-success'"
                    (click)="onToggleActiveStatus()" 
                    [disabled]="isUpdatingStatus">
                    <svg *ngIf="activeEmployee.isActive" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="15" y1="9" x2="9" y2="15"></line>
                      <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                    <svg *ngIf="!activeEmployee.isActive" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <span>{{ activeEmployee.isActive ? 'Marcar Inactivo' : 'Marcar Activo' }}</span>
                  </button>
                  <button class="btn-profile-outline" (click)="onUseActiveInForm()" title="Cargar este empleado en el formulario">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    <span>Copiar a Form</span>
                  </button>
                </div>
              </ng-container>

              <!-- Vista Formulario de Edición Directa -->
              <div *ngIf="isEditingActive" class="edit-active-card-form">
                <div class="edit-header-row">
                  <h4 class="edit-form-title">Editar Datos del Colaborador</h4>
                  <span class="edit-id-badge">EMP-{{ activeEmployee.id }}</span>
                </div>

                <div class="edit-fields-stack">
                  <div class="edit-input-group">
                    <label class="edit-label">Nombre Completo *</label>
                    <input type="text" [(ngModel)]="editName" class="edit-input" placeholder="Nombre del empleado" />
                  </div>

                  <div class="edit-input-group">
                    <label class="edit-label">Teléfono de Contacto</label>
                    <input type="text" [(ngModel)]="editPhone" class="edit-input" placeholder="Ej. +57 300 123 4567" />
                  </div>

                  <div class="edit-input-group creatable-role-group">
                    <label class="edit-label">Cargo / Rol *</label>
                    <div class="combobox-wrapper">
                      <input 
                        type="text" 
                        [(ngModel)]="editRole" 
                        (focus)="openEditRoleDropdown()" 
                        (click)="openEditRoleDropdown()" 
                        (blur)="closeEditRoleDropdownDelayed()"
                        class="edit-input combobox-input" 
                        placeholder="Escribe o selecciona un rol..." 
                        autocomplete="off"
                      />
                      <button type="button" class="combobox-arrow-btn" (click)="toggleEditRoleDropdown()" tabindex="-1">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </button>
                    </div>

                    <!-- Menú Desplegable en Edición -->
                    <div *ngIf="isEditRoleDropdownOpen" class="role-dropdown-menu">
                      <div class="role-dropdown-header">Roles sugeridos y existentes</div>
                      
                      <div class="role-dropdown-list">
                        <div 
                          *ngFor="let r of filteredEditRoles" 
                          class="role-dropdown-item" 
                          [class.selected]="editRole.toLowerCase() === r.toLowerCase()"
                          (mousedown)="selectEditRole(r)">
                          <span class="role-item-name">{{ r }}</span>
                          <svg *ngIf="editRole.toLowerCase() === r.toLowerCase()" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.5">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>

                        <div *ngIf="filteredEditRoles.length === 0 && !isEditRoleNew" class="role-dropdown-empty">
                          No hay roles que coincidan
                        </div>
                      </div>

                      <!-- Opción de Crear Nuevo Rol en Edición -->
                      <div 
                        *ngIf="isEditRoleNew" 
                        class="role-dropdown-create-btn" 
                        (mousedown)="createAndSelectEditRole(editRole)">
                        <div class="create-icon-circle">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                        </div>
                        <div class="create-text-group">
                          <span class="create-title">+ Crear nuevo rol:</span>
                          <span class="create-val">"{{ editRole.trim() }}"</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="edit-input-group">
                    <label class="edit-label">Estado Operacional</label>
                    <select [(ngModel)]="editIsActive" class="edit-select">
                      <option [ngValue]="true">Activo / Habilitado</option>
                      <option [ngValue]="false">Inactivo / Desactivado</option>
                    </select>
                  </div>
                </div>

                <div class="edit-form-actions">
                  <button type="button" class="btn-cancel" (click)="onCancelEditActive()" [disabled]="isUpdatingStatus">
                    Cancelar
                  </button>
                  <button type="button" class="btn-primary-register" (click)="onSaveActiveEmployeeEdit()" [disabled]="isUpdatingStatus">
                    <span>{{ isUpdatingStatus ? 'Guardando...' : 'Guardar Cambios' }}</span>
                  </button>
                </div>
              </div>
            </ng-container>
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
                <th>ESTADO CREDENCIAL</th>
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
                  <span class="status-cell-badge" [ngClass]="emp.statusClass">
                    <span class="status-cell-dot"></span>
                    {{ emp.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="table-footer">
          <span class="showing-count">Mostrando {{ filteredEmployees.length }} de {{ employeesList.length }} colaboradores registrados</span>
          <div class="pagination-buttons">
            <button class="btn-page-nav">Anterior</button>
            <button class="btn-page-num active">1</button>
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

    .sub-dot.green {
      background: #10b981;
    }

    .sub-dot.red {
      background: #ef4444;
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

    .green-box {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
    }

    .red-box {
      background: #fef2f2;
      border: 1px solid #fecaca;
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

    .no-employee-empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 2.2rem 1.5rem;
      gap: 0.75rem;
    }

    .empty-icon-box {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.2rem;
    }

    .empty-title {
      font-size: 1.02rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
    }

    .empty-desc {
      font-size: 0.8rem;
      color: #64748b;
      margin: 0;
      line-height: 1.45;
      max-width: 320px;
    }

    .profile-avatar-initials {
      font-size: 1.1rem;
      font-weight: 800;
      color: #1d4ed8;
      letter-spacing: 0.05em;
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

    /* Header Status Controls & Toggle Badge */
    .header-status-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-toggle-badge {
      border: none;
      padding: 0.22rem 0.6rem;
      border-radius: 4px;
      font-size: 0.65rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s ease;
      font-family: inherit;
    }

    .btn-deactivate {
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fecaca;
    }

    .btn-deactivate:hover {
      background: #fee2e2;
    }

    .btn-activate {
      background: #ecfdf5;
      color: #059669;
      border: 1px solid #a7f3d0;
    }

    .btn-activate:hover {
      background: #d1fae5;
    }

    .btn-profile-primary {
      flex: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.35rem;
      background: #2563eb;
      border: 1px solid #1d4ed8;
      color: #ffffff;
      font-size: 0.72rem;
      font-weight: 600;
      padding: 0.45rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s ease;
      font-family: inherit;
    }

    .btn-profile-primary:hover {
      background: #1d4ed8;
    }

    .btn-outline-danger {
      border-color: #fecaca !important;
      color: #dc2626 !important;
    }

    .btn-outline-danger:hover {
      background: #fef2f2 !important;
    }

    .btn-outline-success {
      border-color: #a7f3d0 !important;
      color: #059669 !important;
    }

    .btn-outline-success:hover {
      background: #ecfdf5 !important;
    }

    /* Formulario de Edición dentro de la Tarjeta */
    .edit-active-card-form {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 1rem;
    }

    .edit-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .edit-form-title {
      font-size: 0.85rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    .edit-id-badge {
      font-size: 0.68rem;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      color: #2563eb;
      background: #eff6ff;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
      border: 1px solid #dbeafe;
    }

    .edit-fields-stack {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }

    .edit-input-group {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .edit-label {
      font-size: 0.68rem;
      font-weight: 600;
      color: #475569;
    }

    .edit-input, .edit-select {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 0.42rem 0.65rem;
      font-size: 0.78rem;
      color: #0f172a;
      outline: none;
      font-family: inherit;
    }

    .edit-input:focus, .edit-select:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
    }

    .edit-form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 0.3rem;
    }

    /* Creatable Role Combobox */
    .creatable-role-group {
      position: relative;
    }

    .combobox-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
    }

    .combobox-input {
      width: 100%;
      padding-right: 2.2rem !important;
    }

    .combobox-arrow-btn {
      position: absolute;
      right: 0.5rem;
      top: 50%;
      transform: translateY(-50%);
      background: transparent;
      border: none;
      color: #64748b;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.25rem;
      border-radius: 4px;
      transition: all 0.15s ease;
    }

    .combobox-arrow-btn:hover {
      color: #0f172a;
      background: #f1f5f9;
    }

    .role-dropdown-menu {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      right: 0;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.08);
      z-index: 60;
      max-height: 230px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: fz-fadeIn 0.15s ease-out;
    }

    .role-dropdown-header {
      padding: 0.45rem 0.75rem;
      font-size: 0.65rem;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: #f8fafc;
      border-bottom: 1px solid #f1f5f9;
    }

    .role-dropdown-list {
      overflow-y: auto;
      max-height: 140px;
    }

    .role-dropdown-item {
      padding: 0.5rem 0.75rem;
      font-size: 0.78rem;
      color: #1e293b;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      transition: background 0.12s ease;
    }

    .role-dropdown-item:hover {
      background: #eff6ff;
      color: #2563eb;
    }

    .role-dropdown-item.selected {
      background: #f0fdf4;
      font-weight: 600;
      color: #16a34a;
    }

    .role-dropdown-empty {
      padding: 0.65rem 0.75rem;
      font-size: 0.74rem;
      color: #94a3b8;
      font-style: italic;
    }

    .role-dropdown-create-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 0.75rem;
      background: #eff6ff;
      border-top: 1px solid #dbeafe;
      color: #1d4ed8;
      cursor: pointer;
      font-size: 0.78rem;
      transition: background 0.15s ease;
    }

    .role-dropdown-create-btn:hover {
      background: #dbeafe;
    }

    .create-icon-circle {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #2563eb;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .create-text-group {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      flex-wrap: wrap;
    }

    .create-title {
      font-weight: 600;
    }

    .create-val {
      font-weight: 700;
      color: #1e40af;
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

    .searching-spinner-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 1.5rem;
      text-align: center;
    }

    .spinner-ring {
      width: 44px;
      height: 44px;
      border: 4px solid #e2e8f0;
      border-top-color: #2563eb;
      border-radius: 50%;
      animation: fz-spin 0.8s linear infinite;
      margin-bottom: 1.25rem;
    }

    @keyframes fz-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .searching-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 0.35rem;
    }

    .searching-desc {
      font-size: 0.84rem;
      color: #64748b;
      max-width: 320px;
      line-height: 1.4;
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
  private readonly employeeService = inject(EmployeeService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  // Búsqueda por cédula (GET)
  searchDocumentInput = '';
  isSearching = false;

  // Formulario de creación (POST)
  formName = '';
  formPhone = '';
  formDocumentNumber = '';
  formRole = '';

  // Combobox de roles con autocompletado y creación de nuevo rol
  customRoles: string[] = ['Caja', 'Supervisor de Bodega', 'Operadora de Montacargas', 'Auditor de Calidad', 'Operario de Despacho'];
  isRoleDropdownOpen = false;
  isEditRoleDropdownOpen = false;

  get availableRoles(): string[] {
    const fromEmployees = this.employeesList
      .map(e => e.role)
      .filter((r): r is string => !!r && r.trim().length > 0);
    const combined = [...this.customRoles, ...fromEmployees];
    const unique: string[] = [];
    for (const r of combined) {
      const clean = r.trim();
      if (!unique.some(u => u.toLowerCase() === clean.toLowerCase())) {
        unique.push(clean);
      }
    }
    return unique;
  }

  get filteredFormRoles(): string[] {
    const q = this.formRole.trim().toLowerCase();
    if (!q) return this.availableRoles;
    return this.availableRoles.filter(r => r.toLowerCase().includes(q));
  }

  get isFormRoleNew(): boolean {
    const q = this.formRole.trim().toLowerCase();
    if (!q) return false;
    return !this.availableRoles.some(r => r.toLowerCase() === q);
  }

  get filteredEditRoles(): string[] {
    const q = this.editRole.trim().toLowerCase();
    if (!q) return this.availableRoles;
    return this.availableRoles.filter(r => r.toLowerCase().includes(q));
  }

  get isEditRoleNew(): boolean {
    const q = this.editRole.trim().toLowerCase();
    if (!q) return false;
    return !this.availableRoles.some(r => r.toLowerCase() === q);
  }

  openRoleDropdown(): void {
    this.isRoleDropdownOpen = true;
    this.cdr.detectChanges();
  }

  toggleRoleDropdown(): void {
    this.isRoleDropdownOpen = !this.isRoleDropdownOpen;
    this.cdr.detectChanges();
  }

  closeRoleDropdownDelayed(): void {
    setTimeout(() => {
      this.isRoleDropdownOpen = false;
      this.cdr.detectChanges();
    }, 200);
  }

  selectRole(role: string): void {
    this.formRole = role;
    this.isRoleDropdownOpen = false;
    this.cdr.detectChanges();
  }

  createAndSelectRole(newRole: string): void {
    const clean = newRole.trim();
    if (clean && !this.customRoles.some(r => r.toLowerCase() === clean.toLowerCase())) {
      this.customRoles.push(clean);
    }
    this.formRole = clean;
    this.isRoleDropdownOpen = false;
    this.cdr.detectChanges();
  }

  openEditRoleDropdown(): void {
    this.isEditRoleDropdownOpen = true;
    this.cdr.detectChanges();
  }

  toggleEditRoleDropdown(): void {
    this.isEditRoleDropdownOpen = !this.isEditRoleDropdownOpen;
    this.cdr.detectChanges();
  }

  closeEditRoleDropdownDelayed(): void {
    setTimeout(() => {
      this.isEditRoleDropdownOpen = false;
      this.cdr.detectChanges();
    }, 200);
  }

  selectEditRole(role: string): void {
    this.editRole = role;
    this.isEditRoleDropdownOpen = false;
    this.cdr.detectChanges();
  }

  createAndSelectEditRole(newRole: string): void {
    const clean = newRole.trim();
    if (clean && !this.customRoles.some(r => r.toLowerCase() === clean.toLowerCase())) {
      this.customRoles.push(clean);
    }
    this.editRole = clean;
    this.isEditRoleDropdownOpen = false;
    this.cdr.detectChanges();
  }

  // Empleado activo mostrado en la tarjeta derecha
  activeEmployee: EmployeeDto | null = null;
  isEditingActive = false;
  editName = '';
  editPhone = '';
  editRole = '';
  editIsActive = true;
  isUpdatingStatus = false;

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  searchQuery = '';

  employeesList: RecentEmployee[] = [];

  constructor() {}

  ngOnInit(): void {
    if (this.authService.isEmployee()) {
      this.router.navigate(['/app/employee-dashboard']);
      return;
    }
    this.fetchEmployeesFromApi();
  }

  get totalEmployeesCount(): number {
    return this.employeesList.length;
  }

  get activeEmployeesCount(): number {
    return this.employeesList.filter(e => e.statusClass === 'active').length;
  }

  get inactiveEmployeesCount(): number {
    return this.employeesList.filter(e => e.statusClass === 'pending').length;
  }

  get activeEmployeeInitials(): string {
    if (!this.activeEmployee?.fullName) return 'EM';
    return this.activeEmployee.fullName
      .split(' ')
      .filter((w: string) => !!w)
      .map((w: string) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  fetchEmployeesFromApi(): void {
    console.log('[Colaboradores] Obteniendo empleados desde la base de datos...');
    this.employeeService.getEmployees().subscribe({
      next: (data) => {
        console.log('[Colaboradores] Registros obtenidos desde BD:', data);
        if (Array.isArray(data)) {
          const mapped: RecentEmployee[] = data.map(item => ({
            id: `EMP-${item.id}`,
            name: item.fullName,
            phone: item.phone,
            email: item.phone ? `Tel: ${item.phone}` : 'Sin teléfono',
            initials: item.fullName.split(' ').filter((w: string) => !!w).map((w: string) => w[0]).slice(0, 2).join('').toUpperCase(),
            initialsBg: '#2563eb',
            documentType: 'Doc',
            documentNumber: item.documentNumber,
            role: item.role || 'Colaborador',
            status: item.isActive ? 'Activo / Registrado' : 'Inactivo',
            statusClass: item.isActive ? 'active' : 'pending'
          }));
          this.employeesList = mapped;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.warn('[Colaboradores] Error consultando API de empleados:', err);
        this.cdr.detectChanges();
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

  /**
   * Búsqueda por Cédula mediante GET al servicio EmployeeService.
   * Si es encontrado, lo muestra en el recuadro derecho.
   */
  onSearchEmployeeByDocument(): void {
    const cleanDoc = this.searchDocumentInput.trim();
    if (!cleanDoc) {
      this.errorMessage = 'Por favor ingrese un número de cédula o documento para buscar.';
      this.successMessage = '';
      this.cdr.detectChanges();
      return;
    }

    this.isSearching = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();

    this.employeeService.getEmployeeByDocument(cleanDoc).subscribe({
      next: (employee: EmployeeDto) => {
        this.isSearching = false;
        this.activeEmployee = employee;
        this.successMessage = `Colaborador "${employee.fullName}" encontrado con éxito y cargado en el panel derecho.`;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isSearching = false;
        const msg = err?.error?.message || err?.message || 'No se encontró ningún empleado registrado con ese documento.';
        this.errorMessage = `${msg} Puede registrarlo en el formulario de abajo.`;
        this.formDocumentNumber = cleanDoc;
        this.cdr.detectChanges();
      }
    });
  }

  onResetForm(): void {
    this.formName = '';
    this.formPhone = '';
    this.formDocumentNumber = '';
    this.formRole = '';
    this.errorMessage = '';
    this.successMessage = '';
  }

  onSaveDraft(): void {
    alert('Borrador guardado localmente.');
  }

  onUseActiveInForm(): void {
    if (this.activeEmployee) {
      this.formName = this.activeEmployee.fullName;
      this.formPhone = this.activeEmployee.phone || '';
      this.formDocumentNumber = this.activeEmployee.documentNumber;
      this.formRole = this.activeEmployee.role;
      this.successMessage = `Datos de "${this.activeEmployee.fullName}" cargados en el formulario.`;
    }
  }

  /**
   * Registro de empleado mediante POST hacia la base de datos a través de EmployeeService.
   * Al registrarse con éxito, actualiza inmediatamente el recuadro derecho.
   */
  onRegisterEmployee(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const cleanName = this.formName.trim();
    const cleanDoc = this.formDocumentNumber.trim();
    const cleanRole = this.formRole.trim();

    if (!cleanName) {
      this.errorMessage = 'Por favor ingrese el nombre completo del empleado.';
      Swal.fire({
        position: 'top-end',
        icon: 'warning',
        title: this.errorMessage,
        showConfirmButton: false,
        timer: 2000
      });
      return;
    }
    if (!cleanDoc) {
      this.errorMessage = 'Por favor ingrese el número de identificación del empleado.';
      Swal.fire({
        position: 'top-end',
        icon: 'warning',
        title: this.errorMessage,
        showConfirmButton: false,
        timer: 2000
      });
      return;
    }
    if (!cleanRole) {
      this.errorMessage = 'Por favor escriba el rol o cargo asignado para el colaborador.';
      Swal.fire({
        position: 'top-end',
        icon: 'warning',
        title: this.errorMessage,
        showConfirmButton: false,
        timer: 2000
      });
      return;
    }

    const payload: CreateEmployeeDto = {
      documentNumber: cleanDoc,
      fullName: cleanName,
      phone: this.formPhone.trim(),
      role: cleanRole,
      isActive: true
    };

    this.isLoading = true;

    // Realizar POST mediante el servicio EmployeeService
    this.employeeService.createEmployee(payload).subscribe({
      next: (response: EmployeeDto) => {
        this.isLoading = false;
        this.activeEmployee = response; // Mostrar inmediatamente el nuevo empleado en el recuadro derecho
        this.successMessage = `Empleado "${response.fullName}" registrado con éxito en la base de datos.`;

        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Empleado registrado exitosamente',
          showConfirmButton: false,
          timer: 1500
        });

        const newEmp: RecentEmployee = {
          id: `EMP-${response.id || Math.floor(Math.random() * 900 + 100)}`,
          name: response.fullName,
          phone: response.phone,
          email: response.phone ? `Tel: ${response.phone}` : 'Sin teléfono',
          initials: response.fullName.split(' ').filter((w: string) => !!w).map((w: string) => w[0]).slice(0, 2).join('').toUpperCase(),
          initialsBg: '#1e40af',
          documentType: 'Doc',
          documentNumber: response.documentNumber,
          role: response.role,
          status: response.isActive ? 'Activo / Registrado' : 'Inactivo',
          statusClass: response.isActive ? 'active' : 'pending'
        };

        this.employeesList.unshift(newEmp);
        this.onResetForm();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isLoading = false;
        if (err.status === 401 || err.status === 403) {
          this.errorMessage = 'Acceso denegado: Solo los usuarios logueados con perfil de Empresa pueden registrar empleados.';
        } else if (err.error?.message) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = 'Ocurrió un error al procesar el registro del empleado en la base de datos.';
        }

        Swal.fire({
          position: 'top-end',
          icon: 'warning',
          title: this.errorMessage,
          showConfirmButton: false,
          timer: 2000
        });

        this.cdr.detectChanges();
      }
    });
  }

  onStartEditActive(): void {
    if (!this.activeEmployee) return;
    this.editName = this.activeEmployee.fullName;
    this.editPhone = this.activeEmployee.phone || '';
    this.editRole = this.activeEmployee.role || '';
    this.editIsActive = this.activeEmployee.isActive;
    this.isEditingActive = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();
  }

  onCancelEditActive(): void {
    this.isEditingActive = false;
    this.cdr.detectChanges();
  }

  onSaveActiveEmployeeEdit(): void {
    if (!this.activeEmployee) return;
    const cleanName = this.editName.trim();
    if (!cleanName) {
      this.errorMessage = 'El nombre completo del empleado no puede estar vacío.';
      this.cdr.detectChanges();
      return;
    }

    this.isUpdatingStatus = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();

    const payload: UpdateEmployeeDto = {
      fullName: cleanName,
      phone: this.editPhone.trim(),
      role: this.editRole.trim() || 'Colaborador',
      isActive: this.editIsActive
    };

    this.employeeService.updateEmployee(this.activeEmployee.id, payload).subscribe({
      next: () => {
        this.isUpdatingStatus = false;
        this.isEditingActive = false;
        if (this.activeEmployee) {
          this.activeEmployee.fullName = payload.fullName;
          this.activeEmployee.phone = payload.phone;
          this.activeEmployee.role = payload.role || 'Colaborador';
          this.activeEmployee.isActive = payload.isActive;
        }

        const idx = this.employeesList.findIndex(e => e.id === `EMP-${this.activeEmployee?.id}`);
        if (idx !== -1 && this.activeEmployee) {
          this.employeesList[idx].name = this.activeEmployee.fullName;
          this.employeesList[idx].phone = this.activeEmployee.phone;
          this.employeesList[idx].email = this.activeEmployee.phone ? `Tel: ${this.activeEmployee.phone}` : 'Sin teléfono';
          this.employeesList[idx].role = this.activeEmployee.role;
          this.employeesList[idx].status = this.activeEmployee.isActive ? 'Activo / Registrado' : 'Inactivo';
          this.employeesList[idx].statusClass = this.activeEmployee.isActive ? 'active' : 'pending';
        }
        this.successMessage = `Colaborador "${payload.fullName}" actualizado correctamente en la base de datos.`;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isUpdatingStatus = false;
        this.errorMessage = err?.error?.message || 'Error al actualizar el empleado en la base de datos.';
        this.cdr.detectChanges();
      }
    });
  }

  onToggleActiveStatus(): void {
    if (!this.activeEmployee) return;
    this.isUpdatingStatus = true;
    this.errorMessage = '';
    this.successMessage = '';
    const newStatus = !this.activeEmployee.isActive;
    this.cdr.detectChanges();

    const payload: UpdateEmployeeDto = {
      fullName: this.activeEmployee.fullName,
      phone: this.activeEmployee.phone || '',
      role: this.activeEmployee.role || 'Colaborador',
      isActive: newStatus
    };

    this.employeeService.updateEmployee(this.activeEmployee.id, payload).subscribe({
      next: () => {
        this.isUpdatingStatus = false;
        if (this.activeEmployee) {
          this.activeEmployee.isActive = newStatus;
        }

        const idx = this.employeesList.findIndex(e => e.id === `EMP-${this.activeEmployee?.id}`);
        if (idx !== -1 && this.activeEmployee) {
          this.employeesList[idx].status = newStatus ? 'Activo / Registrado' : 'Inactivo';
          this.employeesList[idx].statusClass = newStatus ? 'active' : 'pending';
        }
        this.successMessage = `Estado de "${this.activeEmployee?.fullName}" cambiado a ${newStatus ? 'ACTIVO' : 'INACTIVO'} exitosamente.`;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isUpdatingStatus = false;
        this.errorMessage = err?.error?.message || 'Error al actualizar el estado del colaborador.';
        this.cdr.detectChanges();
      }
    });
  }
}
