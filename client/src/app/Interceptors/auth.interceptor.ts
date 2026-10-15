import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../Services/auth.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  let clonedReq = req;
  if (token && req.url.includes('/api/')) {
    clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const isLoginRequest = req.url.toLowerCase().includes('login') || req.url.toLowerCase().includes('/auth');

      // 1. Manejo universal de error 401 (No autorizado) en cualquier petición
      if (error.status === 401) {
        // Extraer mensaje devuelto por el backend si existe, o usar el mensaje predeterminado
        const serverMessage =
          error.error?.message ||
          (typeof error.error === 'string' && error.error.trim().length > 0 ? error.error.trim() : null) ||
          error.error?.error ||
          error.error?.title;

        const customMessage = serverMessage || (isLoginRequest ? 'Los datos son invalidos' : 'Su sesión ha expirado o no está autorizado. Inicie sesión nuevamente.');

        const customError = new HttpErrorResponse({
          error: { message: customMessage, error: customMessage },
          status: 401,
          statusText: 'Unauthorized',
          headers: error.headers,
          url: error.url ?? undefined
        });

        return throwError(() => customError);
      }

      // 2. Errores de inicio de sesión (404 o 400 con credenciales o empleado inexistente)
      if (isLoginRequest && (error.status === 404 || error.status === 400)) {
        const serverMessage =
          error.error?.message ||
          (typeof error.error === 'string' && error.error.trim().length > 0 ? error.error.trim() : null) ||
          error.error?.error;

        const customMessage = serverMessage || 'Los datos son invalidos';

        const customError = new HttpErrorResponse({
          error: { message: customMessage, error: customMessage },
          status: error.status,
          statusText: error.statusText || 'Bad Request',
          headers: error.headers,
          url: error.url ?? undefined
        });

        return throwError(() => customError);
      }

      return throwError(() => error);
    })
  );
};
