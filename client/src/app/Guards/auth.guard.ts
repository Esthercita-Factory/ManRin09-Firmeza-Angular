import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../Services/auth.service';

export const authGuard: CanActivateFn = (
  route?: ActivatedRouteSnapshot,
  state?: RouterStateSnapshot
): boolean | UrlTree => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const token = authService.getToken() || localStorage.getItem('firmeza_token') || localStorage.getItem('token');

  if (token) {
    return true;
  }

  return router.createUrlTree(['/login']);
};

// Guardia exclusivo para acceso de Empleados
export const employeeOnlyGuard: CanActivateFn = (
  route?: ActivatedRouteSnapshot,
  state?: RouterStateSnapshot
): boolean | UrlTree => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const token = authService.getToken() || localStorage.getItem('firmeza_token') || localStorage.getItem('token');

  if (!token) {
    return router.createUrlTree(['/login']);
  }

  if (!authService.isEmployee()) {
    return router.createUrlTree(['/app/dashboard']);
  }

  return true;
};

// Guardia exclusivo para acceso de Empresas / Administradores
export const enterpriseOnlyGuard: CanActivateFn = (
  route?: ActivatedRouteSnapshot,
  state?: RouterStateSnapshot
): boolean | UrlTree => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const token = authService.getToken() || localStorage.getItem('firmeza_token') || localStorage.getItem('token');

  if (!token) {
    return router.createUrlTree(['/login']);
  }

  if (authService.isEmployee()) {
    return router.createUrlTree(['/app/employee-dashboard']);
  }

  return true;
};

// Clase exportada para compatibilidad
export class AuthGuard {
  canActivate = authGuard;
}
