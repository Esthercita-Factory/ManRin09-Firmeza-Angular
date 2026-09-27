import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../Services/Api.Service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-wrapper">
      <header class="top-navbar">
        <a href="/" class="brand">
          <span class="brand-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </span>
          <div class="brand-text">
            <span class="brand-name">FIRMEZA</span>
            <span class="brand-sub">INVENTORY PLATFORM</span>
          </div>
        </a>
        <div class="nav-links">
          <a href="/">Inicio</a>
          <a href="/register">Crear Cuenta</a>
        </div>
      </header>

      <main class="login-container">
        <div class="login-card">
          <!-- Left Presentation Panel -->
          <div class="left-panel">
            <div class="left-header">
              <span class="nodo-tag">PLATAFORMA EMPRESARIAL</span>
              <span class="version-tag">VERSIÓN ESTABLE</span>
            </div>

            <div class="left-content">
              <span class="section-tag">GESTIÓN OPERATIVA</span>
              <h1>Control de existencias y operaciones en tiempo real</h1>
              <p>Monitoreo continuo de stock, movimientos de almacén y trazabilidad precisa en cada estación de trabajo.</p>
              
              <div class="sync-card">
                <div class="sync-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </div>
                <div class="sync-details">
                  <div class="sync-title">
                    <span>Seguridad y Protección</span>
                    <strong class="sync-percent">TLS 1.3</strong>
                  </div>
                  <span class="sync-sub">Canal de comunicación seguro</span>
                </div>
              </div>

              <div class="stats-grid">
                <div class="stat-box">
                  <span class="stat-label">DISPONIBILIDAD</span>
                  <div class="stat-value">99.9%</div>
                  <span class="stat-trend">Servicio activo</span>
                </div>
                <div class="stat-box">
                  <span class="stat-label">RESPUESTA</span>
                  <div class="stat-value-text">Inmediata</div>
                  <span class="stat-subtext">Sincronización continua</span>
                </div>
              </div>
            </div>

            <div class="left-footer">
              Acceso seguro para personal y operadores autorizados.
            </div>
          </div>

          <!-- Right Form Panel -->
          <div class="right-panel">
            <div class="right-header">
              <span class="console-tag">ACCESO A TERMINAL</span>
              <span class="tls-badge">Conexión Segura</span>
            </div>
            
            <div class="form-intro">
              <h2 class="form-title">Bienvenido a Firmeza</h2>
              <p class="form-subtitle">Ingresa tus credenciales autorizadas para acceder a la plataforma.</p>
            </div>

            <form (submit)="onLoginSubmit($event)" class="login-form">
              <div class="form-group">
                <label>Centro de Operaciones</label>
                <div class="input-select-wrapper">
                  <span class="input-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                    </svg>
                  </span>
                  <select>
                    <option>Almacén Principal — Sede Central</option>
                    <option>Centro Logístico Norte</option>
                    <option>Hub Logístico Occidente</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label>Correo Electrónico</label>
                <div class="input-wrapper">
                  <span class="input-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </span>
                  <input type="email" name="email" [(ngModel)]="email" placeholder="operador@firmeza.com" required />
                </div>
              </div>

              <div class="form-group">
                <div class="label-row">
                  <label>Contraseña</label>
                  <a href="#" class="forgot-link">¿Olvidaste tu contraseña?</a>
                </div>
                <div class="input-wrapper">
                  <span class="input-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </span>
                  <input [type]="showPassword ? 'text' : 'password'" name="password" [(ngModel)]="password" placeholder="Introduce tu contraseña" required />
                  <span class="toggle-eye" (click)="showPassword = !showPassword" title="Mostrar/Ocultar contraseña">
                    <svg *ngIf="!showPassword" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    <svg *ngIf="showPassword" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  </span>
                </div>
              </div>

              <div class="checkbox-group">
                <input type="checkbox" id="keep-session" />
                <label for="keep-session">Recordar esta sesión</label>
              </div>

              <div *ngIf="loginMessage" class="feedback-msg success-box">
                <strong>Éxito:</strong> {{ loginMessage }}
              </div>
              
              <div *ngIf="loginError" class="feedback-msg error-box">
                <strong>Error:</strong> {{ loginError }}
              </div>

              <button type="submit" class="btn-submit" [disabled]="isLoading">
                <span *ngIf="!isLoading">Iniciar Sesión</span>
                <span *ngIf="isLoading">Accediendo al sistema...</span>
              </button>

              <div class="register-link">
                <span>¿No tienes una cuenta aún?</span>
                <a href="/register">Registrar organización</a>
              </div>
            </form>

            <div class="right-footer">
              <span>Plataforma Firmeza</span>
              <span>Protección activa</span>
            </div>
          </div>
        </div>
      </main>

      <footer class="bottom-footer">
        <div class="footer-left">
          <span>© 2026 Firmeza Technologies. Todos los derechos reservados.</span>
        </div>
        <div class="footer-right">
          <a href="#">Privacidad</a>
          <a href="#">Términos</a>
          <a href="#">Soporte</a>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    :host { 
      display: block; 
      color: #0f172a; 
      background-color: #f8fafc; 
      min-height: 100vh; 
    }

    .login-wrapper { 
      display: flex; 
      flex-direction: column; 
      min-height: 100vh; 
      animation: fadeIn 0.35s ease-out;
    }

    .top-navbar { 
      display: flex; 
      align-items: center; 
      justify-content: space-between; 
      padding: 1rem 3rem; 
      background: #ffffff; 
      border-bottom: 1px solid #e2e8f0; 
    }

    .brand { 
      display: flex; 
      align-items: center; 
      gap: 0.75rem; 
      text-decoration: none;
    }

    .brand-icon { 
      display: flex;
      align-items: center;
      justify-content: center;
      color: #1d4ed8; 
      background: #eff6ff; 
      border: 1px solid #dbeafe;
      padding: 0.35rem 0.55rem; 
      border-radius: 8px; 
    }

    .brand-text { 
      display: flex; 
      flex-direction: column; 
    }

    .brand-name { 
      font-weight: 800; 
      font-size: 1.05rem; 
      letter-spacing: -0.025em; 
      color: #0f172a; 
      line-height: 1.1;
    }

    .brand-sub { 
      font-size: 0.62rem; 
      font-weight: 700; 
      letter-spacing: 0.06em; 
      color: #64748b; 
    }

    .nav-links { 
      display: flex; 
      gap: 1.5rem; 
    }

    .nav-links a { 
      text-decoration: none; 
      color: #475569; 
      font-size: 0.88rem; 
      font-weight: 600; 
      padding: 0.4rem 0.75rem;
      border-radius: 6px;
      transition: all 0.2s ease;
    }

    .nav-links a:hover { 
      color: #1d4ed8; 
      background: #f1f5f9;
    }

    .login-container { 
      flex: 1; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      padding: 3rem 1.5rem; 
    }

    .login-card { 
      display: grid; 
      grid-template-columns: 420px 1fr; 
      width: 100%; 
      max-width: 1040px; 
      background: #ffffff; 
      border-radius: 20px; 
      box-shadow: 0 20px 30px -10px rgba(15, 23, 42, 0.08); 
      overflow: hidden; 
      border: 1px solid #e2e8f0; 
    }

    .left-panel { 
      background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%); 
      color: #ffffff; 
      padding: 2.75rem; 
      display: flex; 
      flex-direction: column; 
      justify-content: space-between; 
    }

    .left-header { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      margin-bottom: 2rem; 
    }

    .nodo-tag { 
      font-size: 0.68rem; 
      font-weight: 700; 
      color: #38bdf8; 
      background: rgba(56, 189, 248, 0.12); 
      border: 1px solid rgba(56, 189, 248, 0.25);
      padding: 0.3rem 0.75rem; 
      border-radius: 20px; 
      letter-spacing: 0.04em;
    }

    .version-tag { 
      font-size: 0.68rem; 
      color: #94a3b8; 
      font-weight: 600;
      letter-spacing: 0.04em;
    }

    .section-tag { 
      font-size: 0.7rem; 
      font-weight: 800; 
      letter-spacing: 0.06em; 
      color: #60a5fa; 
      display: block; 
      margin-bottom: 0.6rem; 
    }

    .left-content h1 { 
      font-size: 1.85rem; 
      font-weight: 800; 
      line-height: 1.25; 
      margin-bottom: 0.85rem; 
      color: #f8fafc; 
      letter-spacing: -0.025em;
    }

    .left-content p { 
      font-size: 0.86rem; 
      color: #94a3b8; 
      line-height: 1.6; 
      margin-bottom: 1.75rem; 
    }

    .sync-card { 
      background: rgba(255, 255, 255, 0.04); 
      border: 1px solid rgba(255, 255, 255, 0.08); 
      border-radius: 12px; 
      padding: 1rem; 
      display: flex; 
      gap: 0.9rem; 
      align-items: center; 
      margin-bottom: 1.5rem; 
    }

    .sync-icon { 
      background: #2563eb; 
      color: white; 
      width: 38px; 
      height: 38px; 
      border-radius: 8px; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      flex-shrink: 0;
    }

    .sync-details { flex: 1; }
    .sync-title { display: flex; justify-content: space-between; font-size: 0.78rem; font-weight: 600; color: #f1f5f9; }
    .sync-percent { color: #60a5fa; font-weight: 800; }
    .sync-sub { font-size: 0.7rem; color: #94a3b8; }

    .stats-grid { 
      display: grid; 
      grid-template-columns: 1fr 1fr; 
      gap: 0.85rem; 
      margin-bottom: 1.5rem; 
    }

    .stat-box { 
      background: rgba(255, 255, 255, 0.04); 
      border: 1px solid rgba(255, 255, 255, 0.08); 
      border-radius: 12px; 
      padding: 0.95rem; 
    }

    .stat-label { 
      font-size: 0.65rem; 
      font-weight: 700; 
      color: #94a3b8; 
      display: block; 
      margin-bottom: 0.35rem; 
      letter-spacing: 0.05em;
    }

    .stat-value { 
      font-size: 1.35rem; 
      font-weight: 800; 
      color: #ffffff; 
      line-height: 1.1;
    }

    .stat-trend { 
      font-size: 0.68rem; 
      color: #38bdf8; 
      font-weight: 700; 
    }

    .stat-value-text { 
      font-size: 0.9rem; 
      font-weight: 700; 
      color: #ffffff; 
    }

    .stat-subtext { 
      font-size: 0.68rem; 
      color: #94a3b8; 
    }

    .left-footer { 
      font-size: 0.72rem; 
      color: #64748b; 
      line-height: 1.5;
    }

    .right-panel { 
      padding: 3rem 3.5rem; 
      display: flex; 
      flex-direction: column; 
      justify-content: space-between; 
    }

    .right-header { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      margin-bottom: 1.5rem; 
    }

    .console-tag { 
      font-size: 0.68rem; 
      font-weight: 800; 
      letter-spacing: 0.06em; 
      color: #1d4ed8; 
    }

    .tls-badge { 
      font-size: 0.7rem; 
      font-weight: 700; 
      color: #16a34a; 
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      padding: 0.2rem 0.55rem;
      border-radius: 6px;
    }

    .form-intro {
      margin-bottom: 1.75rem;
    }

    .form-title { 
      font-size: 1.85rem; 
      font-weight: 800; 
      color: #0f172a; 
      letter-spacing: -0.03em;
      margin-bottom: 0.35rem; 
    }

    .form-subtitle { 
      font-size: 0.88rem; 
      color: #64748b; 
    }

    .login-form { 
      display: flex; 
      flex-direction: column; 
      gap: 1.25rem; 
    }

    .form-group { 
      display: flex; 
      flex-direction: column; 
      gap: 0.45rem; 
    }

    .label-row { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
    }

    label { 
      font-size: 0.82rem; 
      font-weight: 600; 
      color: #334155; 
    }

    .forgot-link { 
      font-size: 0.78rem; 
      color: #1d4ed8; 
      text-decoration: none; 
      font-weight: 600; 
      transition: color 0.2s ease;
    }
    .forgot-link:hover { text-decoration: underline; }

    .input-wrapper, .input-select-wrapper { 
      display: flex; 
      align-items: center; 
      background: #f8fafc; 
      border: 1px solid #cbd5e1; 
      border-radius: 10px; 
      padding: 0.75rem 0.95rem; 
      gap: 0.75rem; 
      transition: all 0.2s ease;
      box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.02);
    }

    .input-wrapper:focus-within, .input-select-wrapper:focus-within {
      border-color: #2563eb;
      background: #ffffff;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
    }

    .input-icon { 
      display: flex;
      align-items: center;
      color: #64748b; 
    }

    input, select { 
      border: none; 
      background: transparent; 
      outline: none; 
      width: 100%; 
      font-size: 0.88rem; 
      color: #0f172a; 
      font-family: inherit;
    }

    .toggle-eye { 
      display: flex;
      align-items: center;
      color: #64748b; 
      cursor: pointer; 
      user-select: none;
      transition: color 0.2s;
    }
    .toggle-eye:hover { color: #1d4ed8; }

    .checkbox-group { 
      display: flex; 
      align-items: center; 
      gap: 0.6rem; 
    }

    .checkbox-group label { 
      font-size: 0.8rem; 
      color: #64748b; 
      font-weight: 500; 
      cursor: pointer;
    }

    .feedback-msg {
      padding: 0.85rem 1.1rem;
      border-radius: 8px;
      font-size: 0.85rem;
      animation: fadeIn 0.3s ease-out;
    }
    .success-box {
      background: #f0fdf4;
      border: 1px solid #86efac;
      color: #166534;
    }
    .error-box {
      background: #fef2f2;
      border: 1px solid #fca5a5;
      color: #991b1b;
    }

    .btn-submit { 
      background: #1d4ed8; 
      color: #ffffff; 
      border: 1px solid #1e40af; 
      padding: 0.9rem; 
      border-radius: 10px; 
      font-weight: 700; 
      font-size: 0.92rem; 
      cursor: pointer; 
      margin-top: 0.5rem; 
      box-shadow: 0 4px 12px -2px rgba(29, 78, 216, 0.35); 
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .btn-submit:hover:not(:disabled) { 
      background: #1e40af; 
      transform: translateY(-1px);
      box-shadow: 0 8px 16px -2px rgba(29, 78, 216, 0.45);
    }

    .btn-submit:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .register-link { 
      text-align: center; 
      font-size: 0.84rem; 
      color: #64748b; 
      margin-top: 0.5rem; 
    }

    .register-link a { 
      color: #1d4ed8; 
      text-decoration: none; 
      font-weight: 700; 
      margin-left: 0.35rem; 
    }
    .register-link a:hover { text-decoration: underline; }

    .right-footer { 
      display: flex; 
      justify-content: space-between; 
      margin-top: 2rem; 
      padding-top: 1rem; 
      border-top: 1px solid #f1f5f9; 
      font-size: 0.72rem; 
      color: #64748b; 
      font-weight: 600; 
    }

    .bottom-footer { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      padding: 1.25rem 3rem; 
      background: #ffffff; 
      border-top: 1px solid #e2e8f0; 
      font-size: 0.8rem; 
      color: #64748b; 
    }

    .footer-left { display: flex; gap: 0.5rem; align-items: center; }
    .footer-right { display: flex; gap: 1.5rem; }
    .footer-right a { color: #64748b; text-decoration: none; transition: color 0.2s; }
    .footer-right a:hover { color: #1d4ed8; }

    @media (max-width: 850px) {
      .top-navbar { padding: 1rem 1.5rem; }
      .login-card { grid-template-columns: 1fr; }
      .left-panel { display: none; }
      .right-panel { padding: 2rem 1.5rem; }
      .bottom-footer { padding: 1rem 1.5rem; flex-direction: column; gap: 0.5rem; }
    }
  `]
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  showPassword = false;
  isLoading = false;
  loginMessage: string | null = null;
  loginError: string | null = null;

  private readonly apiService = inject(ApiService);

  ngOnInit(): void {}

  onLoginSubmit(event: Event): void {
    event.preventDefault();
    this.loginError = null;
    this.loginMessage = null;
    this.isLoading = true;

    const credentials = {
      email: this.email,
      password: this.password
    };

    this.apiService.login(credentials).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.loginMessage = typeof response === 'string'
          ? response
          : (response?.message || 'Inicio de sesión exitoso');
      },
      error: (err: any) => {
        this.isLoading = false;
        this.loginError = err?.error?.message || err?.error || err?.message || 'Error al iniciar sesión';
      }
    });
  }
}
