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

// Clase exportada para compatibilidad
export class AuthGuard {
  canActivate = authGuard;
}
