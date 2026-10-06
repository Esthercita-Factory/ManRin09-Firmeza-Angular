import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../Services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './Register.Component.html',
  styles: [`
    :host { 
      display: block; 
      color: #0f172a; 
      background-color: #f8fafc; 
      min-height: 100vh; 
    }

    .register-wrapper { 
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

    .register-container { 
      flex: 1; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      padding: 3rem 1.5rem; 
    }

    .register-card { 
      display: grid; 
      grid-template-columns: 420px 1fr; 
      width: 100%; 
      max-width: 1080px; 
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
      margin-bottom: 1.25rem; 
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
      margin-bottom: 1.25rem; 
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

    .register-form { 
      display: flex; 
      flex-direction: column; 
      gap: 1rem; 
    }

    .form-row-2 { 
      display: grid; 
      grid-template-columns: 1fr 1fr; 
      gap: 1rem; 
    }

    .form-group { 
      display: flex; 
      flex-direction: column; 
      gap: 0.4rem; 
    }

    label { 
      font-size: 0.8rem; 
      font-weight: 600; 
      color: #334155; 
    }

    .input-wrapper, .input-select-wrapper { 
      display: flex; 
      align-items: center; 
      background: #f8fafc; 
      border: 1px solid #cbd5e1; 
      border-radius: 10px; 
      padding: 0.68rem 0.85rem; 
      gap: 0.65rem; 
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

    select { 
      cursor: pointer; 
    }

    .checkbox-group { 
      display: flex; 
      align-items: center; 
      gap: 0.6rem; 
    }

    .checkbox-group label { 
      font-size: 0.78rem; 
      color: #64748b; 
      font-weight: 500; 
    }

    .checkbox-group a { 
      color: #1d4ed8; 
      text-decoration: none; 
      font-weight: 600; 
    }
    .checkbox-group a:hover { text-decoration: underline; }

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
      margin-top: 0.25rem; 
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

    .login-link { 
      text-align: center; 
      font-size: 0.84rem; 
      color: #64748b; 
      margin-top: 0.25rem; 
    }

    .login-link a { 
      color: #1d4ed8; 
      text-decoration: none; 
      font-weight: 700; 
      margin-left: 0.35rem; 
    }
    .login-link a:hover { text-decoration: underline; }

    .right-footer { 
      display: flex; 
      justify-content: space-between; 
      margin-top: 1.5rem; 
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
      .register-card { grid-template-columns: 1fr; }
      .left-panel { display: none; }
      .right-panel { padding: 2rem 1.5rem; }
      .form-row-2 { grid-template-columns: 1fr; gap: 0.75rem; }
      .bottom-footer { padding: 1rem 1.5rem; flex-direction: column; gap: 0.5rem; }
    }
  `]
})
export class RegisterComponent implements OnInit {
  accountType: 'empresa' | 'persona' = 'empresa';

  // Datos Persona Natural
  firstName = '';
  lastName = '';

  // Datos Empresa
  companyName = '';
  taxId = '';

  // Datos Comunes
  name = '';
  email = '';
  phone = '';
  password = '';
  confirmPassword = '';

  loading = false;
  get isLoading(): boolean {
    return this.loading;
  }
  set isLoading(value: boolean) {
    this.loading = value;
  }

  registerMessage: string | null = null;
  registerError: string | null = null;

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit(): void {}

  onSubmit(event?: Event): void {
    event?.preventDefault();
    this.registerError = null;
    this.registerMessage = null;

    if (this.password !== this.confirmPassword) {
      this.registerError = 'Las contraseñas no coinciden.';
      return;
    }

    this.loading = true;

    const payload = this.accountType === 'persona'
      ? {
          accountType: 'persona',
          firstName: this.firstName,
          lastName: this.lastName,
          name: `${this.firstName} ${this.lastName}`.trim(),
          fullName: `${this.firstName} ${this.lastName}`.trim(),
          email: this.email,
          phone: this.phone,
          password: this.password
        }
      : {
          accountType: 'empresa',
          companyName: this.companyName,
          taxId: this.taxId,
          name: this.name,
          fullName: this.name,
          email: this.email,
          phone: this.phone,
          password: this.password
        };

    this.authService.register(payload).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.registerMessage = typeof response === 'string'
          ? response
          : (response?.message || 'Registro exitoso');
        if (response?.token) {
          this.router.navigate(['/app/dashboard']);
        } else {
          setTimeout(() => this.router.navigate(['/login']), 1200);
        }
      },
      error: (err: any) => {
        this.loading = false;
        this.registerError = err?.error?.message || err?.error || err?.message || 'Error al registrar';
      }
    });
  }

  onRegisterSubmit(event?: Event): void {
    this.onSubmit(event);
  }
}
